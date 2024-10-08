import axios from "axios";
import { DEFINED_HEADERS, DEFINED_URL } from "../api";
import { CHAIN_IDS } from "../constants";

export async function getPair(pairAddress: string) {
  const query = `query {
  filterPairs(
    phrase: "${pairAddress}"
    rankings: { attribute: liquidity, direction: DESC }
  ) {
    results {
      quoteToken
      pair {
        token0
        token1
      }
      token0{
        totalSupply
      }
      token1{
        totalSupply
      }
    }
  }
}`;
  let data;
  try {
    const resp = await axios.post(
      DEFINED_URL,
      { query: query },
      DEFINED_HEADERS
    );
    data = resp.data.data.filterPairs.results;
    return data;
  } catch (e) {
    console.error("COULD NOT FETCH PAIR INFO DEFINED");
    console.log(e);
    return null;
  }
}

export async function getDetailedPairData(pairAddress: string, chain: string) {
  const query = `query {
  filterPairs(
    phrase: "${pairAddress}:${CHAIN_IDS[chain]}"
    rankings: { attribute: liquidity, direction: DESC }
  ) {
    count
    offset
    results {
      quoteToken
      pair {
        token0
        token1
      }
      createdAt
      volumeUSD1
      volumeUSD4
      volumeUSD24
      buyCount1
      buyCount4
      buyCount24
      sellCount1
      sellCount4
      sellCount24
      lowPrice24
      highPrice24
      liquidity
      marketCap
      price
      priceChange1
      priceChange4
      priceChange24
    }
  }
}`;
  // console.log(query);
  let data;
  try {
    const resp = await axios.post(
      DEFINED_URL,
      { query: query },
      DEFINED_HEADERS
    );

    data = resp.data.data.filterPairs.results;
    return data[0];
  } catch (e) {
    console.error("COULD NOT FETCH PAIR INFO DEFINED");
    console.log(e);
    return null;
  }
}
