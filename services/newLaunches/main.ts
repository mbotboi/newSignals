// main.ts

import { RedisClientType } from "redis";
import { TelegramClient } from "telegram";
import { startDataGatheringService } from "./modules//gatherData";
import { startProcessingService } from "./modules//processData";
import { startScoringService } from "./modules//scoreData";
import { config } from "../../modules/config";

export async function startNewLaunchesService(
  tgClient: TelegramClient,
  redisClient: RedisClientType
) {
  try {
    console.log("Starting New Launches Service...");

    // Start data gathering service
    await startDataGatheringService(redisClient);
    console.log("Data gathering service started");

    // Start processing service
    await startProcessingService(redisClient);
    console.log("Processing service started");

    // Start scoring service
    await startScoringService(tgClient, redisClient);
    console.log("Scoring service started");

    console.log("New Launches Service started successfully");
  } catch (error) {
    console.error("Error starting New Launches Service:", error);
    throw error;
  }
}

export async function stopNewLaunchesService() {
  // Implement any cleanup or shutdown logic here
  console.log("Stopping New Launches Service...");
  // For example:
  // await redisClientManager.disconnect();
  console.log("New Launches Service stopped");
}
