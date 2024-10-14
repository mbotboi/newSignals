import { subscribe } from "../../../modules/data/redis/redisPubSub";
import { tokenMetrics, pairDataMetrics } from "../../../modules/data/mongodb";
import { scoreToken } from "../score/score";
import { processChartData } from "./token";
import {
  CachedPairData,
  ChartData,
  DataToScore,
  ScoredTokenData,
} from "../types";
import {
  processTelegramData,
  sendTelegramAlert,
  getTokensWithFirstHourCalls,
} from "./telegram";
import { CHAIN_IDS } from "../../../modules/constants";
import { honeypotIs } from "../../../modules/safety/honeypot";
import { TelegramClient } from "telegram";
import { updateScoringParams } from "../score/calculateScoringParams";
import { RedisClientType } from "redis";
import fs from "fs";

interface RedisData {
  address: string;
  timestamp: number;
  chartData: ChartData;
  cachedData: CachedPairData;
}

//-------------
async function startScoringService(
  tgClient: TelegramClient,
  redisClient: RedisClientType
) {
  // Fetch initial scoring parameters
  let { scoringParams, flagThresholds } = await updateScoringParams();

  await subscribe("token_ready_for_scoring", async (message) => {
    const dataToScore: RedisData = JSON.parse(message);
    const { address, timestamp, chartData, cachedData } = dataToScore;
    const pair = cachedData.pairData;
    const quoteToken = pair.quoteToken;

    try {
      //0. Check for honeypot
      let isHP = false;
      if (cachedData.chain != "solana") {
        const hpData = await honeypotIs(
          pair.pair.address,
          CHAIN_IDS[cachedData.chain]
        );
        isHP = hpData.honeypotResult.isHoneypot;
      }
      if (isHP) {
        console.log(
          `Token ${pair.pair.address} is a honeypot. Skipping evaluation.`
        );
        await redisClient.zRem("token_processing_schedule", address);
        await redisClient.del(`pair:${address}`);
        return; // Exit the function early
      }
      // 1. Process chart data
      const aggregatedCandleData = processChartData(chartData, pair);

      // 2. Process Telegram messages
      const tokenAddress = pair[quoteToken].address;
      const callData = await processTelegramData(tgClient, tokenAddress);

      let dataToScore: DataToScore = {
        ...aggregatedCandleData,
        pair: pair.pair.address,
        address: tokenAddress,
        name: pair[quoteToken].name,
        label: "none",
        callData: callData,
      };
      dataToScore = getTokensWithFirstHourCalls(dataToScore);

      const finalDataToScore = dataToScore as ScoredTokenData;
      finalDataToScore.weightedAvgCPW = 0;
      finalDataToScore.liquidityTier = 0;
      finalDataToScore.flags = [];
      finalDataToScore.chain = cachedData.chain;

      // 3. Score the token
      const scoredToken: ScoredTokenData = scoreToken(
        finalDataToScore,
        scoringParams,
        flagThresholds
      );
      // fs.writeFileSync(`${pair[quoteToken].name}.json`, JSON.stringify(scoredToken));
      await Promise.all([
        saveToDB(scoredToken), // 4. Save to database
        sendTelegramAlert(scoredToken), // 5. Send Telegram alert
      ]);

      // 6. Remove from processing schedule and clean up cached data
      await redisClient.zRem("token_processing_schedule", address);
      await redisClient.del(`pair:${address}`);

      console.log(`Successfully processed and scored token: ${address}`);
    } catch (error: any) {
      console.error(`Error processing token ${address}:`, error);
      await handleScoringFailure(address, error, redisClient);
    }
  });

  // Periodically update scoring parameters
  setInterval(async () => {
    try {
      const updatedParams = await updateScoringParams();
      scoringParams = updatedParams.scoringParams;
      flagThresholds = updatedParams.flagThresholds;
      console.log("Scoring parameters updated successfully");
    } catch (error) {
      console.error("Error updating scoring parameters:", error);
    }
  }, 60 * 60 * 1000); // Update every hour
}

async function handleScoringFailure(
  address: string,
  error: Error,
  redisClient: RedisClientType
) {
  try {
    const retryCount = await incrementRetryCount(address, redisClient);

    if (retryCount < 3) {
      console.log(
        `Rescheduling token ${address} for retry. Attempt ${retryCount + 1}`
      );
      await rescheduleTokenForScoring(address, redisClient);
    } else {
      console.log(
        `Moving token ${address} to failed tokens after 3 retry attempts`
      );
      await moveToFailedTokens(address, error, redisClient);
    }
  } catch (retryError) {
    console.error(
      `Error handling scoring failure for token ${address}:`,
      retryError
    );
  }
}

async function incrementRetryCount(
  address: string,
  redisClient: RedisClientType
): Promise<number> {
  const key = `retry:${address}`;
  const retryCount = await redisClient.incr(key);
  await redisClient.expire(key, 60 * 60); // Expire in 1 hour
  return retryCount;
}

async function rescheduleTokenForScoring(
  address: string,
  redisClient: RedisClientType
): Promise<void> {
  const rescheduleTime = Date.now() + 5 * 60 * 1000; // Reschedule for 5 minutes later
  await redisClient.zAdd("token_processing_schedule", {
    score: rescheduleTime,
    value: address,
  });
}

async function moveToFailedTokens(
  address: string,
  error: Error,
  redisClient: RedisClientType
): Promise<void> {
  try {
    const cachedTokenData = await redisClient.hGetAll(`pair:${address}`);

    if (!cachedTokenData.cachedData) {
      console.error(`No cached data found for failed token: ${address}`);
      return;
    }

    const tokenData: CachedPairData = JSON.parse(cachedTokenData.cachedData);

    const updatedPairData = {
      ...tokenData.pairData,
      scoringError: error.message,
      retryCount: 3,
    };

    await pairDataMetrics.create(updatedPairData);

    console.log(`Moved token ${address} to failed tokens in database`);

    await redisClient.zRem("token_processing_schedule", address);
    await redisClient.del(`pair:${address}`);
  } catch (dbError) {
    console.error(`Error moving token ${address} to failed tokens:`, dbError);
  }
}

async function saveToDB(scoredToken: ScoredTokenData): Promise<void> {
  try {
    await tokenMetrics.create(scoredToken);
    console.log(
      `Successfully saved new token ${scoredToken.address} to the database`
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("already exists")) {
      console.warn(
        `Token ${scoredToken.address} already exists in the database. Skipping insertion.`
      );
    } else {
      console.error(
        `Error saving token ${scoredToken.address} to database:`,
        error
      );
      throw error;
    }
  }
}

export { startScoringService };
