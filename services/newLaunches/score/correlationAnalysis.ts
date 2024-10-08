import {
  ScoredTokenData,
  metrics,
  MetricCorrelation,
  LabelCategory,
  LabelCategoryScores,
} from "../types";

export function analyzeMetrics(tokens: ScoredTokenData[]): MetricCorrelation[] {
  const correlations: MetricCorrelation[] = [];

  for (const metric of metrics) {
    const correlation = calculateSpearmanCorrelation(
      tokens,
      metric,
      (token) => LabelCategoryScores[token.label as LabelCategory]
    );
    correlations.push({
      metric,
      correlation,
      isPositiveCorrelation: correlation > 0,
    });
  }

  return correlations;
}

function calculateSpearmanCorrelation(
  tokens: ScoredTokenData[],
  metric: string,
  labelScoreFunc: (token: ScoredTokenData) => number
): number {
  const n = tokens.length;
  const ranks1 = calculateRanks(
    tokens.map((t) => t[metric as keyof ScoredTokenData] as number)
  );
  const ranks2 = calculateRanks(tokens.map(labelScoreFunc));

  let sumD2 = 0;
  for (let i = 0; i < n; i++) {
    const d = ranks1[i] - ranks2[i];
    sumD2 += d * d;
  }

  return 1 - (6 * sumD2) / (n * (n * n - 1));
}

function calculateRanks(values: number[]): number[] {
  const sorted = values
    .map((v, i) => ({ value: v, index: i }))
    .sort((a, b) => a.value - b.value);
  const ranks: number[] = new Array(values.length);

  let currentRank = 1;
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i].value !== sorted[i - 1].value) {
      currentRank = i + 1;
    }
    ranks[sorted[i].index] = currentRank;
  }

  return ranks;
}
