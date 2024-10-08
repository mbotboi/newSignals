import axios from "axios";
import { DEFINED_HEADERS, DEFINED_URL } from "../api";
import { CHAIN_IDS } from "../constants";

/**
 * @param age -> age in minutes of the token
 * @param minLiquidity -> minimum liquidity for token
 * @param chain -> chain name
 * @returns
 */
export async function getTokensLaunchedPrevHour(
  minLiquidity: number,
  chain: string
) {
  const now = Math.floor(Date.now() / 1000);
  const currentHour = Math.floor(now / 3600) * 3600;
  const previousHourStart = currentHour - 3600;
  const twoHoursAgo = currentHour - 7200;

  const query = `{
  filterPairs(
    filters: {
      network: [${CHAIN_IDS[chain]}]
      createdAt: { gte: ${twoHoursAgo}, lt: ${previousHourStart} }
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
    const data = resp.data.data.filterPairs.results;
    return data;
  } catch (e) {
    console.error("COULD NOT FETCH FILTERED TOKENS DEFINED");
    console.log(e);
    return null;
  }
}
