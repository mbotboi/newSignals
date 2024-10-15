import { AggregatedTokenData, CandleData, ChartData, PairData } from "../types";

export function aggregateCandleData(
  earlyData: CandleData,
  g: {
    name: string;
    circulatingSupply: string;
    actualMC: string;
  }
) {
  const { name, circulatingSupply, actualMC } = g;
  const calculatedMC = earlyData.c * parseInt(circulatingSupply);

  const obj: AggregatedTokenData = {
    name: name,
    ...earlyData,
    calculatedMC: calculatedMC,
    actualMC: parseFloat(actualMC),
    volumeToMc:
      calculatedMC !== 0 ? parseFloat(earlyData.volume) / calculatedMC : 0,
    liquidityToMC:
      calculatedMC !== 0 ? parseFloat(earlyData.liquidity) / calculatedMC : 0,
    volToLiq:
      parseFloat(earlyData.liquidity) !== 0
        ? parseFloat(earlyData.volume) / parseFloat(earlyData.liquidity)
        : 0,
    buyVolToLiq:
      parseFloat(earlyData.liquidity) !== 0
        ? parseFloat(earlyData.buyVolume) / parseFloat(earlyData.liquidity)
        : 0,
    sellVolToLiq:
      parseFloat(earlyData.liquidity) !== 0
        ? parseFloat(earlyData.sellVolume) / parseFloat(earlyData.liquidity)
        : 0,
    buysToSells: earlyData.sells !== 0 ? earlyData.buys / earlyData.sells : 0,
    pctCloseFromHigh:
      earlyData.h !== 0 ? (earlyData.c - earlyData.h) / earlyData.h : 0,
    pctCloseFromOpen:
      earlyData.o !== 0 ? (earlyData.c - earlyData.o) / earlyData.o : 0,
  };
  return obj;
}

export function aggregateChartData(chartData: ChartData): CandleData {
  // Ensure we have at least one data point
  if (chartData.t.length === 0) {
    throw new Error("Chart data is empty");
  }

  // Take the first 60 bars or all available if less than 60
  const barsToAggregate = Math.min(60, chartData.t.length);

  const aggregatedData: CandleData = {
    t: chartData.t[0],
    o: chartData.o[0],
    h: Math.max(...chartData.h.slice(0, barsToAggregate).map((v) => v || 0)),
    l: Math.min(
      ...chartData.l.slice(0, barsToAggregate).filter((v) => v !== null)
    ),
    c: chartData.c[barsToAggregate - 1] || chartData.c[chartData.c.length - 1],
    v: chartData.v
      .slice(0, barsToAggregate)
      .reduce((sum, v) => sum + (v || 0), 0),
    volume: aggregateStringValue(chartData.volume, barsToAggregate),
    buyVolume: aggregateStringValue(chartData.buyVolume, barsToAggregate),
    sellVolume: aggregateStringValue(chartData.sellVolume, barsToAggregate),
    buys: chartData.buys
      .slice(0, barsToAggregate)
      .reduce((sum, v) => sum + (v || 0), 0),
    sells: chartData.sells
      .slice(0, barsToAggregate)
      .reduce((sum, v) => sum + (v || 0), 0),
    liquidity:
      chartData.liquidity[barsToAggregate - 1] ||
      chartData.liquidity[chartData.liquidity.length - 1],
    transactions: chartData.transactions
      .slice(0, barsToAggregate)
      .reduce((sum, v) => sum + (v || 0), 0),
    // buyers: Math.max(...chartData.buyers.slice(0, barsToAggregate).map(v => v || 0)),
    // sellers: Math.max(...chartData.sellers.slice(0, barsToAggregate).map(v => v || 0)),
    // traders: Math.max(...chartData.traders.slice(0, barsToAggregate).map(v => v || 0)),
  };
  return aggregatedData;
}

function aggregateStringValue(values: string[], count: number): string {
  const sum = values
    .slice(0, count)
    .reduce((sum, v) => sum + (parseFloat(v) || 0), 0);
  return sum.toString();
}

export function processChartData(chartData: ChartData, pair: PairData) {
  // Check if chartData is empty or null
  if (!chartData || Object.keys(chartData).length === 0) {
    throw new Error("Chart data is empty or null");
  }
  const h1ChartData = aggregateChartData(chartData);
  const quoteToken = pair.quoteToken;

  const aggregatedCandleData = aggregateCandleData(h1ChartData, {
    name: pair[quoteToken].name,
    circulatingSupply: pair[quoteToken].info.circulatingSupply,
    actualMC: pair.marketCap,
  });
  return aggregatedCandleData;
}
