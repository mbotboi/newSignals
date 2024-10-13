import axios from "axios";
import { DEFINED_HEADERS, DEFINED_URL } from "../api";
import { ChartResolution } from "../../services/newLaunches/types";
import { CHAIN_IDS } from "../constants";

const chartOutput = `{
      t
      o
      h
      l
      c
      v
      volume
      buyVolume
      sellVolume
      buyers
      buys
      sellers
      sells
      liquidity
      transactions
      traders
  }`;

/**
 * @param pairAddress token address
 * @param chain chain name -> eg: base
 * @param resolution -> in minutes or 1D or 7D
 * @param quoteToken -> the quote token -> token1 or token0
 * @param numberBars -> defaulted to 1500 bars, change for specific needs
 * @returns
 */
export async function getChart(
  pairAddress: string,
  chain: string,
  resolution: ChartResolution,
  quoteToken: string = "token1",
  numberBars: number = 1499
) {
  const endTs = Math.floor(Date.now() / 1000);
  let resolutionInMinutes: number = 0;
  if (resolution == "1D") {
    resolutionInMinutes = 24 * 60;
  } else if (resolution == "7D") {
    resolutionInMinutes = 7 * 24 * 60;
  } else {
    resolutionInMinutes = Number(resolution);
  }

  const timespanForBars = Number(resolutionInMinutes) * 60 * numberBars; //get max 1500 bars
  const startTs = endTs - timespanForBars;

  const chainId = CHAIN_IDS[chain];
  const query = `query {
  getBars(
    symbol: "${pairAddress}:${chainId}"
    from: ${startTs}
    to: ${endTs}
    resolution: "${resolution}"
    quoteToken: ${quoteToken}
    removeLeadingNullValues: true
    currencyCode:"USD"
    statsType: UNFILTERED
  )${chartOutput}
}`;
  try {
    // console.log(query);
    const resp = await axios.post(
      DEFINED_URL,
      { query: query },
      DEFINED_HEADERS
    );
    const data = resp.data.data.getBars;
    return data;
  } catch (e) {
    console.error("COULD NOT CHART FOR", pairAddress);
    console.log(e);
    return null;
  }
}

export async function getChartFromTo(
  pairAddress: string,
  chain: string,
  from: string,
  to: string,
  resolution: 1 | 5 | 15 | 30 | 60 | 240 | 720 | "1D" | " 7D"
) {
  const chainId = CHAIN_IDS[chain];

  // const startTs = Math.floor(new Date(from).getTime() / 1000);
  // const endTs = Math.floor(new Date(to).getTime() / 1000);
  const query = `query {
  getBars(
    symbol: "${pairAddress}:${chainId}"
    from: ${from}
    to: ${to}
    resolution: "${resolution}"
    quoteToken: token1
    removeLeadingNullValues: true
    currencyCode:"USD"
    statsType: UNFILTERED
  )${chartOutput}
}`;
  try {
    const resp = await axios.post(
      DEFINED_URL,
      { query: query },
      DEFINED_HEADERS
    );
    const data = resp.data.data.getBars;
    return data;
  } catch (e) {
    console.error("COULD NOT CHART FOR", pairAddress);
    console.log(e);
    return null;
  }
}
