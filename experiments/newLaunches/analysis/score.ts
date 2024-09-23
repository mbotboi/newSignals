import fs from "fs";

import {
  CoinData,
  ScoredCoinData,
  MetricPerformance,
  MetricCorrelation,
  metrics,
  labelCategoryArray,
} from "../types";
import { evaluateMetrics } from "./rocAnalysis";
import { analyzeMetrics } from "./correlationAnalysis";
import allCoins from "../data/transformedData.json";

function calculateScore(
  coin: CoinData,
  metricPerformance: Record<string, MetricPerformance>,
  metricCorrelations: MetricCorrelation[]
): ScoredCoinData {
  const liquidity = parseFloat(coin.liquidity);

  // Calculate liquidity tier
  let liquidityTier: number;
  if (liquidity < 10000) liquidityTier = 1;
  else if (liquidity < 50000) liquidityTier = 2;
  else if (liquidity < 100000) liquidityTier = 3;
  else liquidityTier = 4;

  // Calculate individual metric scores
  const metricScores = metrics.reduce((scores, metric) => {
    if (metric in metricPerformance && metric in coin) {
      scores[metric] = calculateMetricScore(
        coin[metric as keyof CoinData] as number,
        metricPerformance[metric].threshold,
        metric,
        metricCorrelations
      );
    }
    return scores;
  }, {} as Record<string, number>);

  // Calculate composite score
  const totalWeight = Object.keys(metricScores).reduce(
    (sum, metric) => sum + (metricPerformance[metric]?.auc || 0),
    0
  );

  const score =
    (Object.entries(metricScores).reduce(
      (total, [metric, score]) =>
        total + score * (metricPerformance[metric]?.auc || 0),
      0
    ) *
      100) /
    totalWeight;

  // Check for red flags
  const flags = checkRedFlags(coin, metricPerformance);

  return {
    ...coin,
    ...metricScores,
    liquidityTier,
    score,
    flags,
  };
}

function calculateMetricScore(
  value: number,
  threshold: number,
  metricName: string,
  metricCorrelations: MetricCorrelation[]
): number {
  const correlation = metricCorrelations.find((m) => m.metric === metricName);
  if (!correlation) return 0;

  const isPositive = correlation.isPositiveCorrelation;

  let score: number;
  if (isPositive) {
    if (value >= threshold * 2) score = 1;
    else if (value >= threshold * 1.5) score = 0.75;
    else if (value >= threshold) score = 0.5;
    else if (value >= threshold * 0.5) score = 0.25;
    else score = 0;
  } else {
    if (value <= threshold * 0.5) score = 1;
    else if (value <= threshold * 0.75) score = 0.75;
    else if (value <= threshold) score = 0.5;
    else if (value <= threshold * 1.5) score = 0.25;
    else score = 0;
  }

  return score;
}

function checkRedFlags(
  coin: CoinData,
  metricPerformance: Record<string, MetricPerformance>
): string[] {
  const flags: string[] = [];

  if (coin.volToLiq > metricPerformance.volToLiq.threshold * 3) {
    flags.push("Extremely high volume to liquidity ratio");
  }
  if (
    coin.volToLiq > metricPerformance.volToLiq.threshold * 3 &&
    coin.buysToSells > metricPerformance.buysToSells.threshold * 3
  ) {
    flags.push("High volume with extreme buy pressure");
  }
  if (
    coin.buyersToSellers < metricPerformance.buyersToSellers.threshold * 0.5 &&
    coin.volToLiq > metricPerformance.volToLiq.threshold * 2
  ) {
    flags.push("Low buyer/seller ratio with high volume");
  }
  if (parseFloat(coin.liquidity) < 5000) {
    flags.push("Very low liquidity");
  }
  return flags;
}

// Main execution function
export function scoreCoins(coins: CoinData[]): ScoredCoinData[] {
  const metricPerformance = evaluateMetrics(coins);
  const metricCorrelations = analyzeMetrics(coins);

  fs.writeFileSync(
    "./services/newLaunches/data/metricsROC.json",
    JSON.stringify(metricPerformance)
  );

  fs.writeFileSync(
    "./services/newLaunches/data/metricsSpearmanCorrelation.json",
    JSON.stringify(metricCorrelations)
  );

  return coins.map((coin) =>
    calculateScore(coin, metricPerformance, metricCorrelations)
  );
}

// Example usage
const scoredCoins = scoreCoins(allCoins);
// console.log(scoredCoins);
const obj: { [key: string]: any[] } = Object.fromEntries(
  labelCategoryArray.map((c) => [c, []])
);
scoredCoins.map((s) => {
  obj[s.label].push(s);
});

fs.writeFileSync(
  "./services/newLaunches/data/scored.json",
  JSON.stringify(obj)
);
