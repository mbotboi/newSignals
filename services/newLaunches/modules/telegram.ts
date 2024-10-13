import { searchMessage } from "../../../modules/tg/api/messages";
import { getChannelName } from "../../../modules/tg/api/channels";
import { CallData, Call, DataToScore, ScoredTokenData, Flag } from "../types";
import {
  createHyperlink,
  escapeMarkdown,
  formatNumber,
} from "../../../modules/tg/bot/helpers";

import { config } from "../../../modules/config";

import { TelegramClient, Api } from "telegram";
import moment from "moment";
import TelegramBot from "node-telegram-bot-api";

//TELEGRAM API
export async function getMessages(
  client: TelegramClient,
  tokenAddress: string
) {
  const allFolders = await client.invoke(new Api.messages.GetDialogFilters());
  const folder = allFolders.filters.find(
    (f: any) =>
      f.title?.toLocaleLowerCase() === config.TG_FOLDER_NAME.toLocaleLowerCase()
  );
  const folderPeers = (folder as any).includePeers;
  const channelId = folderPeers[0].channelId.toString();
  const channelName = await getChannelName(client, channelId);
  const messages = searchMessage(client, channelName!, tokenAddress);
  return messages;
}

export function formatCallAnalyzerMsg(message: string): CallData {
  const lines = message.split("\n");
  const symbolMatch = lines[0].match(/\$([A-Z]+)/);
  const symbol = symbolMatch ? symbolMatch[1] : "";
  const numberCallsMatch = lines[0].match(/(\d+) callers?/);
  const numberCalls = numberCallsMatch ? parseInt(numberCallsMatch[1]) : 0;
  const calls: Call[] = [];

  let currentCaller = "";

  for (let i = 2; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.match(/^\d+\./)) {
      // This line contains the caller name
      currentCaller = line.split(".")[1].trim();
    } else if (line.includes("Caller Stats")) {
      const [timestampStr, statsInfo] = line.split("|");
      const mcMatch = statsInfo.match(/MC: \$([0-9.]+[KMB]?)/);
      const cpwMatch = statsInfo.match(/CPW: ([0-9.]+)/);

      if (mcMatch) {
        const timestamp = moment
          .utc(timestampStr.trim(), "HH:mm MM/DD/YY")
          .unix();
        const call: Call = {
          caller: currentCaller,
          timestamp,
          marketcap: mcMatch[1],
        };

        if (cpwMatch) {
          call.cpw = parseFloat(cpwMatch[1]);
        }

        calls.push(call);
      }
    }

    if (line.startsWith("0x")) {
      break;
    }
  }

  return {
    symbol,
    numberCalls,
    calls,
  };
}

export function getTokensWithFirstHourCalls(token: DataToScore) {
  if (!token.callData) {
    return token; // Return the original data if there's no calls attribute
  }

  const filteredCalls = token.callData.calls.filter(
    (call: Call) => call.timestamp <= token.t + 60 * 60
  );
  if (filteredCalls.length === 0) {
    // If all calls are filtered out, remove the calls property
    const { callData, ...restData } = token;
    return restData;
  }
  const { callData, ...restData } = token;
  const updatedCallData = {
    ...token.callData,
    calls: filteredCalls,
    numberCalls: filteredCalls.length,
  };
  return {
    ...restData,
    callData: updatedCallData,
  };
}

export async function processTelegramData(
  tgClient: TelegramClient,
  tokenAddress: string
): Promise<CallData | undefined> {
  const tokenCallTGData = await getMessages(tgClient, tokenAddress);

  if (tokenCallTGData && tokenCallTGData.length > 0) {
    const formattedCall = formatCallAnalyzerMsg(tokenCallTGData[0].message);
    return formattedCall;
  }
  return undefined;
}

//TELEGRAM BOT
let bot: TelegramBot | null = null;

function initializeBot() {
  if (!bot) {
    bot = new TelegramBot(config.TG_BOT_ID, { polling: false });
  }
  return bot;
}

export async function sendTelegramAlert(
  scoredToken: ScoredTokenData
): Promise<void> {
  try {
    const message = formatAlertMessage(scoredToken);
    const bot = initializeBot();
    await bot.sendMessage(config.DEV_CHAT_ID, message, {
      parse_mode: "MarkdownV2",
    });
    console.log(`Sent Telegram alert for token ${scoredToken.address}`);
  } catch (error) {
    console.error(
      `Error sending Telegram alert for token ${scoredToken.address}:`,
      error
    );
    throw error;
  }
}

function formatAlertMessage(token: ScoredTokenData): string {
  const tokenLink = createHyperlink(
    token.name,
    `https://example.com/token/${token.address}`
  );
  const scoreEmoji = getScoreEmoji(token.score || 0);

  let message = `🚨 New Token Alert 🚨\n\n`;
  message += `Token: ${tokenLink}\n`;
  message += `Score: ${scoreEmoji} ${token.score}/100\n\n`;

  message += `📊 Key Metrics:\n`;
  message += `• Price: $${formatNumber(token.c)}\n`;
  message += `• Market Cap: $${formatNumber(token.actualMC)}\n`;
  message += `• Liquidity: $${formatNumber(parseFloat(token.liquidity))}\n`;
  message += `• Volume: $${formatNumber(parseFloat(token.volume))}\n`;
  message += `• Volume/MC: ${formatNumber(token.volumeToMc)}\n`;
  message += `• Buy/Sell Ratio: ${formatNumber(token.buysToSells)}\n`;

  if (token.callData) {
    message += `\n📞 Call Data:\n`;
    message += `• Number of Calls: ${token.callData.numberCalls}\n`;
    message += `• Weighted Avg CPW: ${formatNumber(token.weightedAvgCPW)}\n`;
  }

  if (token.flags.length > 0) {
    message += `\n🚩 Flags:\n`;
    token.flags.forEach((flag: Flag) => {
      message += `• ${flag}\n`;
    });
  }

  message += `\nLiquidity Tier: ${token.liquidityTier}\n`;

  return escapeMarkdown(message);
}

function getScoreEmoji(score: number): string {
  if (score >= 80) return "🟢";
  if (score >= 60) return "🟡";
  if (score >= 40) return "🟠";
  return "🔴";
}
