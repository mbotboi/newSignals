import axios from "axios";
import { DEFINED_HEADERS, DEFINED_URL } from "../api";
import { CHAIN_IDS } from "../constants";
import { TokenInfo } from "../../services/newLaunches/types";

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

export async function getDetailedPairData(
  pairAddress: string,
  chain: string
): Promise<DetailedPairInfo | null> {
  const query = `query {
  filterPairs(
    phrase: "${pairAddress}:${CHAIN_IDS[chain]}"
    rankings: { attribute: liquidity, direction: DESC }
  ) {
    count
    offset
    ${pairOutput}
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
    return data[0] as DetailedPairInfo;;
  } catch (e) {
    console.error("COULD NOT FETCH PAIR INFO DEFINED");
    console.log(e);
    return null;
  }
}

export const pairOutput = `results {
      lastTransaction
      createdAt
      uniqueBuys24
      uniqueSells24
      uniqueTransactions24
      uniqueBuys4
      uniqueSells4
      uniqueTransactions4
      uniqueBuys1
      uniqueSells1
      uniqueTransactions1
      volumeUSD24
      volumeUSD4
      volumeUSD1
      priceChange24
      priceChange4
      priceChange1
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
`;

export interface DetailedPairInfo {
  lastTransaction: number;
  createdAt: number;
  uniqueBuys24: number;
  uniqueSells24: number;
  uniqueTransactions24: number;
  uniqueBuys4: number;
  uniqueSells4: number;
  uniqueTransactions4: number;
  uniqueBuys1: number;
  uniqueSells1: number;
  uniqueTransactions1: number;
  volumeUSD24: string;
  volumeUSD4: string;
  volumeUSD1: string;
  priceChange24: string;
  priceChange4: string;
  priceChange1: string;
  highPrice24: string;
  lowPrice24: string;
  price: string;
  liquidity: string;
  marketCap: string;
  pair: {
    address: string;
  };
  quoteToken: string;
  token0: TokenInfo;
  token1: TokenInfo;
  [key: string]: any;
}
