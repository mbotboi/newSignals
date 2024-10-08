import axios from "axios";
import { CHAIN_IDS } from "../constants";
import { cache } from "../data/cache";
import { getToken, saveToken } from "../data/mongo/crud/tokenList";

type HoneypotData = {
  chain: string;
  symbol: string;
  address: string;
  honeypot: boolean | null | undefined;
};

export async function honeypotIs(token: string, chainId: number) {
  try {
    const resp = await axios.get(
      `https://api.honeypot.is/v2/IsHoneypot?address=${token}&chainID=${chainId}`
    );
    return resp.data;
  } catch (e: any) {
    console.error(e.message);
    console.error("ERROR: could not get data for honeypot on base for", token);
    return null;
  }
}

export async function honeypotSol(token: string) {
  try {
    const resp = await axios.get(
      `https://api.rugcheck.xyz/v1/tokens/${token}/report/summary`
    );
    return resp && resp.data.score >= 500;
  } catch (e: any) {
    console.error(e.message);
    console.error(
      "ERROR: could not get data for honeypot on solana for",
      token
    );
    return null;
  }
}

export async function honeypotCheck(
  token: string,
  tokenSymbol: string,
  chain: string
) {
  let data: HoneypotData | undefined;
  let dataInDB = false;

  const tokenListInCache: any[] | undefined = cache.get(`${chain}TokensInDB`);
  if (tokenListInCache) {
    data = tokenListInCache!.find((t) => t.address == token);
    dataInDB = true;
  } else {
    const tData = await getToken(token);
    if (tData) {
      dataInDB = true;
      data = tData;
    }
  }

  if (!dataInDB) {
    data = {
      chain: chain,
      symbol: tokenSymbol,
      address: token,
      honeypot: null,
    };
    if (chain == "base" || chain == "ethereum") {
      const hpData = await honeypotIs(token, CHAIN_IDS[chain]);
      if (hpData) {
        if (hpData.honeypotResult)
          data.honeypot = hpData.honeypotResult.isHoneypot;
      }
    } else if (chain == "solana") {
      data.honeypot = await honeypotSol(token);
    }
    if (data) {
      await saveToken(data.address, data.symbol, data.address, data.honeypot);
    }
  }
  // console.log(data);
  return data ? data.honeypot : null;
}
