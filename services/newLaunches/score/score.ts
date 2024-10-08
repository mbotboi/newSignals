import {
  ScoredTokenData,
  ScoringParams,
  FlagThresholds,
  CallData,
  Flag,
  determineLiquidityTier,
  LiquidityTier,
} from "../types";
import { config } from "../../../modules/config";
import { calculateWeightedAverageCPW } from "./tgScoring";
import { calculateCombinedWeights } from "./calculateScoringParams";

export function scoreToken(
  token: ScoredTokenData,
  params: ScoringParams,
  flagThresholds: FlagThresholds
): ScoredTokenData {
  const baseScore = calculateBaseScore(token, params);

  const weightedAvgCPW = calculateWeightedAverageCPW(token.callData);

  const finalScore = calculateFinalScore(
    baseScore,
    weightedAvgCPW,
    params.maxCPW
  );

  // Determine liquidity tier
  const liquidityTier = determineLiquidityTier(parseFloat(token.liquidity));

  // Check for flags
  const flags = checkFlags(token, flagThresholds, liquidityTier);
  // Add score from call data

  return {
    ...token,
    score: Math.round(finalScore),
    flags,
    liquidityTier,
    weightedAvgCPW: calculateWeightedAverageCPW(token.callData),
  };
}

function calculateBaseScore(
  token: ScoredTokenData,
  params: ScoringParams
): number {
  let score = 0;
  const combinedWeights = calculateCombinedWeights(
    params.rocThresholds,
    params.correlations
  );

  for (const metric of Object.keys(params.rocThresholds)) {
    const threshold = params.rocThresholds[metric].threshold;
    const correlation = params.correlations.find((c) => c.metric === metric);
    if (!correlation) continue;

    const value = token[metric as keyof ScoredTokenData] as number;

    let metricScore = value >= threshold ? 1 : 0;
    if (!correlation.isPositiveCorrelation) metricScore = 1 - metricScore;

    score += metricScore * combinedWeights[metric];
  }

  // Normalize score to 0-100 range
  return score * 100;
}
function calculateFinalScore(
  baseScore: number,
  weightedAvgCPW: number,
  maxCPW: number
): number {
  // Normalize WeightedAvgCPW to a 0-1 scale
  const normalizedCPW = weightedAvgCPW / maxCPW;

  // Adjust the base score using the normalized CPW
  const cpwInfluence = config.CPW_WEIGHT; // This determines how much CPW can affect the score
  const finalScore = baseScore * (1 + (normalizedCPW - 0.5) * cpwInfluence);

  // Ensure the final score is within 0-100 range
  return Math.max(0, Math.min(100, finalScore));
}

function checkFlags(
  token: ScoredTokenData,
  thresholds: FlagThresholds,
  liquidityTier: LiquidityTier
): Flag[] {
  const flags: Flag[] = [];
  if (token.volToLiq > thresholds.volToLiq)
    flags.push("Extremely high volume to liquidity ratio");
  if (
    token.buyVolToLiq > thresholds.buyVolToLiq &&
    token.sellVolToLiq < thresholds.sellVolToLiq
  )
    flags.push("High volume with extreme buy pressure");
  if (
    token.buyersToSellers < thresholds.buyersToSellers &&
    token.volumeToMc > thresholds.volumeToMc
  )
    flags.push("Low buyer/seller ratio with high volume");
  if (liquidityTier === 1) flags.push("Very low liquidity");
  return flags;
}

export function scoreTokens(
  tokens: ScoredTokenData[],
  params: ScoringParams,
  flagThresholds: FlagThresholds
): ScoredTokenData[] {
  return tokens.map((token) => scoreToken(token, params, flagThresholds));
}

// prompt
// I believe the appropriate next step is to work on points 1 and 3 in the next steps summary. I have already my own dataloading script written.

// But just in case, but just incase, lets clarify what attributes are most important to ensure that the quality of our outputs are high.

// For my data loading, i am uploading this kind of data (attached image) this is an example of a data that does not have any calls present. Other data have calls for example. Also, note that this data is already scored.

// TODO: ACTUALLY FIX MY DATASET THAT I UPLOAD TO DB. THE METRICS VALUES ARE ALL WRONG AND SCORED
