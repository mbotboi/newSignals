import {
  ScoredTokenData,
  ScoringParams,
  FlagThresholds,
  MetricPerformance,
  MetricCorrelation,
} from "../types";
import { evaluateMetrics } from "./rocAnalysis";
import { analyzeMetrics } from "./correlationAnalysis";
import { tokenMetrics } from "../../../modules/data/mongodb";
import { scoreToken } from "./score";

export async function updateScoringParams(): Promise<{
  scoringParams: ScoringParams;
  flagThresholds: FlagThresholds;
  updatedCount: number;
  scoredTokens: ScoredTokenData[];
}> {
  try {
    console.log("Starting updateScoringParams");

    const allTokens = await tokenMetrics.getLabelledTokens();
    console.log(`Fetched ${allTokens.length} tokens from database`);

    const rocThresholds = evaluateMetrics(allTokens);
    const correlations = analyzeMetrics(allTokens);
    const maxCPW = Math.max(
      ...allTokens.flatMap(
        (token) => token.callData?.calls.map((call) => call.cpw || 0) || []
      )
    );
    const scoringParams: ScoringParams = {
      rocThresholds,
      correlations,
      maxCPW,
    };
    const flagThresholds = await calculateDynamicFlagThresholds(allTokens);

    console.log("Calculated new scoring parameters and flag thresholds");

    const scoredTokens: ScoredTokenData[] = allTokens.map((token) =>
      scoreToken({ ...token._doc }, scoringParams, flagThresholds)
    );
    const updateResult = await tokenMetrics.updateMany(scoredTokens);
    console.log(
      `Updated ${updateResult.nModified} out of ${allTokens.length} tokens`
    );

    return {
      scoringParams,
      flagThresholds,
      updatedCount: updateResult.nModified,
      scoredTokens,
    };
  } catch (error) {
    console.error("Error in updateScoringParams:", error);
    throw error;
  }
}

export async function calculateDynamicFlagThresholds(
  tokens: ScoredTokenData[]
): Promise<FlagThresholds> {
  const calculateMetricStats = (metric: keyof ScoredTokenData) => {
    const values = tokens.map((t) => Number(t[metric])).sort((a, b) => a - b);
    const median = values[Math.floor(values.length / 2)];
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
        values.length
    );
    return { median, mean, stdDev };
  };

  const volToLiqStats = calculateMetricStats("volToLiq");
  const buyVolToLiqStats = calculateMetricStats("buyVolToLiq");
  const sellVolToLiqStats = calculateMetricStats("sellVolToLiq");
  const buyersToSellersStats = calculateMetricStats("buyersToSellers");
  const volumeToMcStats = calculateMetricStats("volumeToMc");

  return {
    volToLiq: volToLiqStats.median + 2 * volToLiqStats.stdDev,
    buyVolToLiq: buyVolToLiqStats.median + 2 * buyVolToLiqStats.stdDev,
    sellVolToLiq: sellVolToLiqStats.median - 2 * sellVolToLiqStats.stdDev,
    buyersToSellers:
      buyersToSellersStats.median - 2 * buyersToSellersStats.stdDev,
    volumeToMc: volumeToMcStats.median + 2 * volumeToMcStats.stdDev,
  };
}

export function calculateCombinedWeights(
  rocThresholds: Record<string, MetricPerformance>,
  correlations: MetricCorrelation[]
): Record<string, number> {
  const weights: Record<string, number> = {};
  let totalWeight = 0;

  for (const metric of Object.keys(rocThresholds)) {
    const auc = rocThresholds[metric].auc;
    const correlation = correlations.find((c) => c.metric === metric);
    if (!correlation) continue;

    const combinedWeight = auc * Math.abs(correlation.correlation);
    weights[metric] = combinedWeight;
    totalWeight += combinedWeight;
  }

  // Normalize weights
  for (const metric of Object.keys(weights)) {
    weights[metric] /= totalWeight;
  }

  return weights;
}
