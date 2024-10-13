import { dbConnection } from "../modules/data/mongodb";
import TelegramBot from "node-telegram-bot-api";
import { redisClientManager } from "../modules/data/redis/redisClient";
import { TgClient } from "../modules/tg/api/client";
import { startBot } from "../services/tgBot/main";
import {
  startNewLaunchesService,
  stopNewLaunchesService,
} from "../services/newLaunches/main";
import { RedisClientType } from "redis";
import { config } from "../modules/config";

let bot: TelegramBot | null = null;
let tgClient: TgClient | null = null;
let redisClient: RedisClientType | null = null;

async function start() {
  try {
    console.log("Connecting to database...");
    await dbConnection.connect();
    console.log("Database connected successfully");

    // console.log("Connecting to Redis...");
    await redisClientManager.connect();
    redisClient = redisClientManager.getClient();
    // console.log("Redis connected successfully");

    console.log("Starting Telegram bot...");
    bot = await startBot();
    console.log("Telegram bot started successfully");

    console.log("Initializing Telegram client...");
    tgClient = new TgClient();
    await tgClient.connect();
    console.log("Telegram client connected successfully");

    // console.log("Starting New Launches Service...");
    await startNewLaunchesService(tgClient.getClient(), redisClient);
    // console.log("New Launches Service started successfully");

    // Set up graceful shutdown
    process.on("SIGINT", gracefulShutdown);
    process.on("SIGTERM", gracefulShutdown);
  } catch (error) {
    console.error("Error during startup:", error);
    await gracefulShutdown();
  }
}

async function gracefulShutdown() {
  console.log("Initiating graceful shutdown...");

  if (bot) {
    console.log("Stopping Telegram bot...");
    bot.stopPolling();
    console.log("Telegram bot stopped");
  }

  if (tgClient) {
    console.log("Disconnecting Telegram client...");
    await tgClient.disconnect();
    console.log("Telegram client disconnected");
  }

  console.log("Stopping New Launches Service...");
  await stopNewLaunchesService();
  console.log("New Launches Service stopped");

  await redisClientManager.disconnect();
  console.log("Disconnecting from database...");

  await dbConnection.disconnect();
  console.log("Database disconnected");

  console.log("Graceful shutdown complete");
  process.exit(0);
}

start();
