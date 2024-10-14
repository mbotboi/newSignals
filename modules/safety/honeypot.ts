import axios from "axios";
import { CHAIN_IDS } from "../constants";

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
