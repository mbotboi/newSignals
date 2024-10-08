// import allCalls from "../tgData/allCalls.json";
import scoredData from "../data/scored.json";
import allCalls from "../tgData/allCallsFormatted.json";
import transformed from "../data/transformedData.json";
import filtered from "../tgData/filteredSet.json";
import callsAndScores from "../tgData/callsAndScores.json";
import { ScoredTokenData, Call, CallData } from "../types";
import fs from "fs";
import moment from "moment";

interface ParsedMessage {
  symbol: string;
  numberCalls: number;
  calls: Call[];
}

interface MergedToken extends ScoredTokenData {
  pair?: string;
  address?: string;
  callData?: CallData;
}

function formatCallAnalyzerMsg(message: string): ParsedMessage {
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

function getTokensWithCalls() {
  const tokensWithCalls = allCalls.filter((a) => a.calls);
  const tokensWithoutCalls = allCalls.filter((a) => !a.calls);

  const mergedData: Record<string, MergedToken[]> = {};

  for (const [label, tokens] of Object.entries(scoredData)) {
    mergedData[label] = tokens.map((token) => {
      const matchingCall = allCalls.find(
        (call) => call.name.toLowerCase() === token.name.toLowerCase()
      );
      return {
        ...token,
        callData: matchingCall?.calls,
        ca: matchingCall?.address,
        pair: matchingCall?.pair,
      };
    });
  }
  console.log(JSON.stringify(mergedData, null, 2));
  fs.writeFileSync(
    "./services/newLaunches/tgData/callsAndScores.json",
    JSON.stringify(mergedData)
  );
}

// function getTokensWithFirstHourCalls() {
//   type CategoryData = Record<string, ScoredTokenData[]>;
  // const filteredData: CategoryData = {};

//   for (const [category, tokens] of Object.entries(callsAndScores)) {
//     filteredData[category] = tokens.map((token) => {
//       if (token.callData && Array.isArray(token.callData.calls)) {
//         const cutoffTime = token.t + 3600; // 60 minutes = 3600 seconds
//         const filteredCalls = token.callData.calls.filter(
//           (call) => call.timestamp < cutoffTime
//         );

//         return {
//           ...token,
//           callData: {
//             ...token.callData,
//             calls: filteredCalls,
//             numberCalls: filteredCalls.length,
//           },
//         };
//       }
//       // If callData doesn't exist or is not in the expected format, return the token as is
//       return token;
//     });
//   }

//   return filteredData;
// }
// getTokensWithFirstHourCalls();
// const msg =
//   "❇️(Total Call)🚀 $BOLTAI received calls from 1 callers \n\n🏵 Main Calls: (UTC time)\n1. PEYO'S DEGEN HUB🔥 \n16:08 09/11/24 | MC: $152.7K | Caller Stats \n\n‎0xc8420fF1FF3474f262a0737548c51fF41335E3a3‎\n\n🎯BUY: Maestro | Maestro Pro | Photon\n\n🔎Scan: DexS | DexT | PIRB Scan\n🔰Chain: #ETHEREUM | 🔰Name: Bolt AI\n📞Caller: CallAnalyserBot\n📈Trending: KOL Trending 🔥\n\nListen to qualified calls in real time @CallAnalyser\n➖️➖️➖️➖️➖️➖️➖️➖\nAd: 👑TRX trading bots: NFD bot | Maestro 🍎 Scanner: Tronks";
// console.log(formatCallAnalyzerMsg(msg))
// function analyse() {
//   const called = allCalls.filter((a) => a.call.length > 0);
// }
// analyse();
