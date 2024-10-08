import TelegramBot from "node-telegram-bot-api";
import { config } from "../../modules/config";
import { updateLabel, getToken } from "../../modules/tg/bot/commands";
import { checkArgs } from "../../modules/tg/bot/helpers";

const TG_BOT_ID = config.TG_BOT_ID;

async function tgBot(): Promise<TelegramBot> {
  const bot = new TelegramBot(TG_BOT_ID, { polling: true });

  bot.on("error", (e) => {
    if (e.code === "EFATAL" || e.code === "ETIMEDOUT") {
      console.error(e);
      process.exit(1);
    }
  });

  bot.on("polling_error", (e) => {
    console.error(e);
    process.exit(1);
  });

  bot.onText(/\/updateLabel/, async (msg) => {
    const args = msg.text!.split(" ").filter((arg) => arg.trim() !== "");
    if (args.length !== 3) {
      await bot.sendMessage(
        msg.chat.id,
        "Please provide a token name/address and a new label"
      );
    } else {
      try {
        const result = await updateLabel(args[1], args[2]);
        await bot.sendMessage(msg.chat.id, result, {
          parse_mode: "MarkdownV2",
          disable_web_page_preview: true,
        });
      } catch (e) {
        await bot.sendMessage(
          msg.chat.id,
          "There was an error. Please try again"
        );
      }
    }
  });

  bot.onText(/\/getToken/, async (msg) => {
    const hasArgs = checkArgs(msg);
    if (hasArgs) {
      const args = msg.text!.split(" ");
      try {
        const result = await getToken(args[1]);
        console.log(result);
        await bot.sendMessage(msg.chat.id, result, {
          parse_mode: "MarkdownV2",
          disable_web_page_preview: true,
        });
      } catch (e) {
        await bot.sendMessage(
          msg.chat.id,
          "There was an error. Please try again"
        );
        console.log(e);
      }
    } else {
      await bot.sendMessage(msg.chat.id, "Please provide a token address");
    }
  });

  return bot;
}

// Main entry point
export async function startBot(): Promise<TelegramBot> {
  console.log("Starting tg bot");
  try {
    return await tgBot();
  } catch (e: any) {
    console.error(e.message);
    const bot = new TelegramBot(TG_BOT_ID);
    await bot.sendMessage(
      config.DEV_CHAT_ID,
      `Issue with tgBot. Stopping...\nERROR:${e.message}`
    );
    process.exit(1);
  }
}
