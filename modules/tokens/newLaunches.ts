import axios from "axios";
import { DEFINED_HEADERS, DEFINED_URL } from "../api";
import { CHAIN_IDS } from "../constants";
import fs from "fs";
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
) {
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
    results {
      lastTransaction
      createdAt
      uniqueBuys24
      uniqueSells24
      uniqueTransactions24
      volumeUSD24
      priceChange24
      highPrice24
      lowPrice24
      price
      liquidity
      marketCap
      pair{
        address
      }
      quoteToken
      token0{
        address
        decimals
        symbol
        name
        info{
          circulatingSupply
        }
      }
      token1{
        address
        decimals
        symbol
        name
        info{
          circulatingSupply
        }
      }
    }
  }
}`;
  try {
    const resp = await axios.post(
      DEFINED_URL,
      { query: query },
      DEFINED_HEADERS
    );
    // fs.writeFileSync("./pairs.json", JSON.stringify(resp.data));
    const data = resp.data.data.filterPairs.results;
    return data;
  } catch (e) {
    console.error("COULD NOT FETCH FILTERED TOKENS DEFINED");
    console.log(e);
    return null;
  }
}
