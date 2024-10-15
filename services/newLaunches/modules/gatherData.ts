// gatherData.ts

import { RedisClientType } from "redis";
import { config } from "../../../modules/config";
import { getTokensLaunchedXHoursAgo } from "../../../modules/tokens/newLaunches";
import { getChart } from "../../../modules/charts/getCharts";
import { PairData, ChartData, CachedPairData } from "../types";
import { cacheTokenData } from "./processData";
import { tokenMetrics } from "../../../modules/data/mongodb";

const PROCESSED_PAIRS_SET = "processed_pairs";

export async function startDataGatheringService(redisClient: RedisClientType) {
  if (config.FIRE_AT_START) {
    console.log("FIRE_AT_START is true. Gathering data immediately.");
    await gatherData(redisClient);
  }

  // Schedule the data gathering to run every GATHERING_INTERVAL_IN_HOURS on the hour
  const intervalMs = config.GATHERING_INTERVAL_IN_HOURS * 60 * 60 * 1000;
  const now = new Date();
  const nextHour = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours() + 1,
    0,
    0,
    0
  );
  const delay = nextHour.getTime() - now.getTime();

  setTimeout(() => {
    gatherData(redisClient);
    setInterval(() => gatherData(redisClient), intervalMs);
  }, delay);
}

async function gatherData(redisClient: RedisClientType) {
  for (const chain of config.CHAINS) {
    const newLaunches_ = await getTokensLaunchedXHoursAgo(
      config.NEW_LAUNCH_MIN_LIQ,
      chain,
      config.LAUNCHED_HOURS_AGO
    );
    const newLaunches = newLaunches_ as PairData[];

    for (const token of newLaunches) {
      const pairAddress = token.pair.address;
      const tokenAddress = token[token.quoteToken].address;

      // Check if the token already exists in MongoDB
      const existingToken = await tokenMetrics.getTokenByAddress(tokenAddress);
      if (existingToken) {
        console.log(
          `Token ${tokenAddress} already exists in MongoDB. Skipping.`
        );
        continue;
      }

      // Check if the pair has already been processed in Redis
      const isProcessed = await redisClient.sIsMember(
        PROCESSED_PAIRS_SET,
        pairAddress
      );
      if (isProcessed) {
        console.log(
          `Pair ${pairAddress} has already been processed. Skipping.`
        );
        continue;
      }

      const chartData: ChartData = await getChart(
        pairAddress,
        chain,
        config.CHART_RESOLUTION,
        token.quoteToken,
        100
      );

      const cachedData: CachedPairData = {
        pairData: token,
        firstCandleTS: chartData.t[0],
        chain: chain,
      };

      await cacheTokenData(pairAddress, cachedData, redisClient);

      // Schedule the token for processing
      await redisClient.zAdd("token_processing_schedule", {
        score: chartData.t[0] + 60 * 60 * 1000, // Schedule 1 hour after the first candle
        value: pairAddress,
      });
    }
  }
}

/**
 * TODO
 * check queue check interval
 * fix messaging
 * send messages to 2 channels,
 * 1 dev, full message
 * 1 dpg public truncated
 */
