// scoringService.ts

import { RedisClientType } from "redis";
import { publish } from "../../../modules/data/redis/redisPubSub";
import { ChartData, CachedPairData } from "../types";
import { getChart } from "../../../modules/charts/getCharts";

import { config } from "../../../modules/config";

//main poller to check for whether scoring is to be done or not
export async function startProcessingService(redisClient: RedisClientType) {
  // Start the periodic polling
  setInterval(
    () => pollAndProcessTokens(redisClient),
    config.PROCESS_TOKENS_INTERVAL * 60 * 1000
  ); // Run every 5 minutes
}

export async function cacheTokenData(
  pairAddress: string,
  cachedData: CachedPairData,
  redisClient: RedisClientType
) {
  try {
    // Store the entire CachedPairData object as a JSON string
    await redisClient.hSet(`pair:${pairAddress}`, {
      cachedData: JSON.stringify(cachedData),
    });
    console.log(`Cached data for pair: ${pairAddress}`);
  } catch (error) {
    console.error(`Error caching data for token ${pairAddress}:`, error);
  }
}

async function pollAndProcessTokens(redisClient: RedisClientType) {
  const now = Date.now();
  const tokensToProcess = await redisClient.zRangeByScore(
    "token_processing_schedule",
    0,
    now
  );

  for (const pairAddress of tokensToProcess) {
    const cachedTokenData = await redisClient.hGetAll(`pair:${pairAddress}`);

    if (!cachedTokenData.cachedData) {
      console.error(`No cached data found for pair: ${pairAddress}`);
      continue;
    }

    const tokenData: CachedPairData = JSON.parse(cachedTokenData.cachedData);
    const chartData: ChartData = await getChart(
      tokenData.pairData.pair.address,
      tokenData.chain,
      config.CHART_RESOLUTION,
      tokenData.pairData.quoteToken,
      100
    );

    if (chartData.t.length >= 60) {
      // Publish message for scoring
      await publish(
        "token_ready_for_scoring",
        JSON.stringify({
          address: pairAddress,
          timestamp: now,
          chartData: chartData,
          cachedData: tokenData,
        })
      );
    } else {
      await redisClient.zAdd("token_processing_schedule", {
        score: now + 5 * 60 * 1000, // Check again in 5 minutes
        value: pairAddress,
      });
    }
  }
}
