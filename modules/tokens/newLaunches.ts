import axios from "axios";
import { DEFINED_HEADERS, DEFINED_URL } from "../api";
import { CHAIN_IDS } from "../constants";
import fs from "fs";
import { pairOutput, DetailedPairInfo } from "./getPairInfo";
import { PairData } from "../../services/newLaunches/types";

/**
 * @param minLiquidity -> minimum liquidity for token
 * @param chain -> chain name
 * @param hoursAgo -> token launch in a period of 1 hour, X hours ago
 * eg: if 0, last hour, if 1, between 1 to 2 hours ago etc
 * @returns
 */
export async function getTokensLaunchedXHoursAgo(
  minLiquidity: number,
  chain: string,
  hoursAgo: number
): Promise<PairData[] | null> {
  const oneHour = 3600;
  const now = Math.floor(Date.now() / 1000);
  //to is always X hours before now. Eg: if 0, to = now, if 1, to is now - 1hr
  const to = now - oneHour * hoursAgo;
  const from = to - oneHour;

  const query = `{
  filterPairs(
    filters: {
      network: [${CHAIN_IDS[chain]}]
      createdAt: { gte: ${from}, lt: ${to} }
      liquidity: {gt: ${minLiquidity}}
    }
    rankings: { attribute: volumeUSD24, direction: DESC }
    limit: 200
  ) {
    ${pairOutput}
  }
}`;
  try {
    const resp = await axios.post(
      DEFINED_URL,
      { query: query },
      DEFINED_HEADERS
    );
    // fs.writeFileSync("./pairs.json", JSON.stringify(resp.data));
    const data: DetailedPairInfo[] = resp.data.data.filterPairs.results;
    const pairDatas: PairData[] = data.map((info) => {
      const pairDatas = convertDetailedPairDataToPairDataForScoring(info);
      return pairDatas;
    });

    return pairDatas;

    // return data as ;
  } catch (e) {
    console.error("COULD NOT FETCH FILTERED TOKENS DEFINED");
    console.log(e);
    return null;
  }
}
export function convertDetailedPairDataToPairDataForScoring(
  info: DetailedPairInfo
): PairData {
  const buyers = info.uniqueBuys1;
  const sellers = info.uniqueSells1;
  const traders = info.uniqueTransactions1;

  return {
    lastTransaction: info.lastTransaction,
    createdAt: info.createdAt,
    uniqueBuys24: info.uniqueBuys24,
    uniqueSells24: info.uniqueSells24,
    uniqueTransactions24: info.uniqueTransactions24,
    volumeUSD24: info.volumeUSD24,
    priceChange24: info.priceChange24,
    highPrice24: info.highPrice24,
    lowPrice24: info.lowPrice24,
    price: info.price,
    liquidity: info.liquidity,
    marketCap: info.marketCap,
    pair: {
      address: info.pair.address,
    },
    quoteToken: info.quoteToken,
    token0: info.token0,
    token1: info.token1,
    buyers,
    sellers,
    traders,
    participantEngagement:
      traders > 0 ? traders / info.uniqueTransactions24 : 0,
    buyersToSellers: sellers > 0 ? buyers / sellers : 0,
  };
}
