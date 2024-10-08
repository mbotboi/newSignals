import { searchMessage } from "../../modules/tg/api/messages";
import { getChannelName } from "../../modules/tg/api/channels";
import { CallData, Call, DataToScore } from "./types";

import { config } from "../../modules/config";

import { TelegramClient, Api } from "telegram";
import moment from "moment";

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
