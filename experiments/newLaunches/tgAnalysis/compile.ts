import callsAndScores from "../tgData/callsAndScores.json";
import { TokenData } from "../types";
import fs from "fs";
// Define types
type Call = {
  timestamp: number;
  // Add other properties of Call if needed
};

type CallData = {
  calls: Call[];
  numberCalls: number;
  // Add other properties of CallData if needed
};

type TokenBase = {
  name: string;
  label: string;
  t: number;
  // Add other common properties here
};

type TokenWithCallData = TokenBase & {
  callData: CallData;
};

type TokenWithoutCallData = TokenBase & {
  callData?: undefined;
};

type Token = TokenWithCallData | TokenWithoutCallData;

type CategoryData = Record<string, Token[]>;

// Type guard
function isTokenWithCallData(token: Token): token is TokenWithCallData {
  return (
    token.callData !== undefined &&
    Array.isArray((token.callData as CallData).calls)
  );
}

function getTokensWithFirstHourCalls(
  callsAndScores: CategoryData
): CategoryData {
  const filteredData: CategoryData = {};

  for (const [category, tokens] of Object.entries(callsAndScores)) {
    filteredData[category] = tokens.map((token) => {
      if (isTokenWithCallData(token)) {
        const cutoffTime = token.t + 3600; // 60 minutes = 3600 seconds
        const filteredCalls = token.callData.calls.filter(
          (call) => call.timestamp < cutoffTime
        );

        return {
          ...token,
          callData: {
            ...token.callData,
            calls: filteredCalls,
            numberCalls: filteredCalls.length,
          },
        };
      }
      // If it's not a TokenWithCallData, return it unchanged
      return token;
    });
  }
  return filteredData;
}

function straightenArray(callsAndScores: CategoryData) {
  type TokenDataParse = Record<string, TokenData[]>;

  const straightenedData: TokenData[] = [];

  for (const [category, tokens] of Object.entries(callsAndScores)) {
    const obj: TokenDataParse = {};
    console.log(tokens);
    // Object.keys(tokens).map((k) => {
    //   console.log(k);
    //   if (k == "score" || k == "flags" || k == "ca" || k == "pair") {
    //     return;
    //   }
    //   // obj[k] = tokens[k];
    // });
  }
}

function removeNoCalls() {
  const filteredData: CategoryData = {};
  for (const [category, tokens] of Object.entries(callsAndScores)) {
    filteredData[category] = tokens.filter((token) =>
      isTokenWithCallData(token)
    );
  }

  fs.writeFileSync(
    "./services/newLaunches/tgData/removedNoCalls.json",
    JSON.stringify(filteredData)
  );
}

function reformatSet() {
  const allSetWithOnlyFirstHourCalls =
    getTokensWithFirstHourCalls(callsAndScores);
  const straightened = straightenArray(allSetWithOnlyFirstHourCalls);
}
reformatSet();
// Usage

// fs.writeFileSync(
//   "./services/newLaunches/tgData/filteredSet.json",
//   JSON.stringify(result)
// );
