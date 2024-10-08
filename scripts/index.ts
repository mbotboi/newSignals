import { dbConnection } from "../modules/data/mongodb";
import { startBot } from "../services/tgBot/main";
import TelegramBot from "node-telegram-bot-api";
import { config } from "../modules/config";

let bot: TelegramBot | null = null;

async function start() {
  try {
    console.log("Connecting to database...");
    await dbConnection.connect();
    console.log("Database connected successfully");

    console.log("Starting Telegram bot...");
    bot = await startBot();
    console.log("Telegram bot started successfully");

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

  console.log("Disconnecting from database...");
  await dbConnection.disconnect();
  console.log("Database disconnected");

  console.log("Graceful shutdown complete");
  process.exit(0);
}

start();
