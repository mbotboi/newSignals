import { CoinData, LabelCategory, metrics } from "../types";

function calculateCorrelation(coins: CoinData[], metric: keyof CoinData) {
  const values = coins.map((coin) => Number(coin[metric]));
  const labels = coins.map((coin) => coin.label as LabelCategory);

  // Assign numerical scores to labels
  const labelScores: Record<LabelCategory, number> = {
    okay: 1,
    decent: 2,
    good: 3,
    great: 4,
    snipedDumped: -2,
    bad: -1,
    rug: -3,
  };

  const numericalLabels = labels.map((label) => labelScores[label]);

  return calculateSpearmanCorrelation(values, numericalLabels);
}

function calculateSpearmanCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  const xRank = rankData(x);
  const yRank = rankData(y);

  let sumD2 = 0;
  for (let i = 0; i < n; i++) {
    sumD2 += Math.pow(xRank[i] - yRank[i], 2);
  }

  return 1 - (6 * sumD2) / (n * (n * n - 1));
}

function rankData(data: number[]): number[] {
  const sorted = data.slice().sort((a, b) => a - b);
  return data.map((v) => sorted.indexOf(v) + 1);
}

export function analyzeMetrics(coins: CoinData[]) {
  return metrics.map((metric) => {
    const correlation = calculateCorrelation(coins, metric as keyof CoinData);
    return {
      metric,
      correlation,
      isPositiveCorrelation: correlation > 0,
    };
  });
}
