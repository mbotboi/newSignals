import {
  DataToScore,
  metrics,
  LabelCategory,
  LabelCategorySentiment,
} from "../types";

interface ROCPoint {
  threshold: number;
  tpr: number;
  fpr: number;
}

function calculateROCCurve(
  coins: DataToScore[],
  metricKey: keyof DataToScore
): ROCPoint[] {
  const allValues = coins
    .map((token) => Number(token[metricKey]))
    .sort((a, b) => a - b);
  const rocPoints: ROCPoint[] = [];

  // Define positive and negative classes
  const positiveClasses: LabelCategory[] = LabelCategorySentiment.positive;
  const negativeClasses: LabelCategory[] = LabelCategorySentiment.negative;

  for (const threshold of allValues) {
    const truePositives = coins.filter(
      (token) =>
        positiveClasses.includes(token.label as LabelCategory) &&
        Number(token[metricKey]) >= threshold
    ).length;
    const falsePositives = coins.filter(
      (token) =>
        negativeClasses.includes(token.label as LabelCategory) &&
        Number(token[metricKey]) >= threshold
    ).length;
    const totalPositives = coins.filter((token) =>
      positiveClasses.includes(token.label as LabelCategory)
    ).length;
    const totalNegatives = coins.filter((token) =>
      negativeClasses.includes(token.label as LabelCategory)
    ).length;

    const tpr = truePositives / totalPositives;
    const fpr = falsePositives / totalNegatives;
    rocPoints.push({ threshold, tpr, fpr });
  }
  return rocPoints;
}

function findOptimalThreshold(rocPoints: ROCPoint[]): number {
  let maxYoudenIndex = -Infinity;
  let optimalThreshold = 0;

  for (const point of rocPoints) {
    const youdenIndex = point.tpr - point.fpr;
    if (youdenIndex > maxYoudenIndex) {
      maxYoudenIndex = youdenIndex;
      optimalThreshold = point.threshold;
    }
  }
  return optimalThreshold;
}

export function getOptimalThresholds(
  coins: DataToScore[]
): Record<string, number> {
  const thresholds: Record<string, number> = {};

  for (const metric of metrics) {
    const rocPoints = calculateROCCurve(coins, metric as keyof DataToScore);
    thresholds[metric] = findOptimalThreshold(rocPoints);
  }

  return thresholds;
}

// Additional function to calculate AUC (Area Under the Curve)
function calculateAUC(rocPoints: ROCPoint[]): number {
  let auc = 0;
  for (let i = 1; i < rocPoints.length; i++) {
    const width = rocPoints[i].fpr - rocPoints[i - 1].fpr;
    const height = (rocPoints[i].tpr + rocPoints[i - 1].tpr) / 2;
    auc += width * height;
  }
  return auc;
}

export function evaluateMetrics(
  coins: DataToScore[]
): Record<string, { threshold: number; auc: number }> {
  const thresholds = getOptimalThresholds(coins);
  const results: Record<string, { threshold: number; auc: number }> = {};

  for (const metric of metrics) {
    const rocPoints = calculateROCCurve(coins, metric as keyof DataToScore);
    const auc = calculateAUC(rocPoints);
    results[metric] = { threshold: thresholds[metric], auc };
  }
  return results;
}
