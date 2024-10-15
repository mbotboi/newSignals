import axios from "axios";

interface Website {
  url: string;
}

interface Social {
  platform: string;
  handle: string;
}

interface PairInfo {
  imageUrl: string;
  websites: Website[];
  socials: Social[];
}

interface Pair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  labels: string[];
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  liquidity: {
    usd: number;
    base: number;
    quote: number;
  };
  fdv: number;
  marketCap: number;
  info: PairInfo;
  boosts: Record<string, unknown>;
}

interface PairResponse {
  schemaVersion: string;
  pairs: Pair[];
}

export async function getPairSocials(
  pairAddress: string,
  chain: string
): Promise<Pair | null> {
  try {
    const chainId = chain;
    if (!chainId) {
      throw new Error(`Invalid chain: ${chain}`);
    }

    const url = `https://api.dexscreener.com/latest/dex/pairs/${chainId}/${pairAddress}`;

    const response = await axios.get<PairResponse>(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (response.data.pairs && response.data.pairs.length > 0) {
      return response.data.pairs[0];
    } else {
      console.log(
        `No pair data found for address ${pairAddress} on chain ${chain}`
      );
      return null;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Error fetching pair data: ${error.message}`);
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error(`Data: ${JSON.stringify(error.response.data)}`);
      }
    } else {
      console.error(`Unexpected error: ${error}`);
    }
    return null;
  }
}