export interface CoinData {
  name: string;
  label: string;
  mc: number;
  liquidityToMC: number;
  volumeToMc: number;
  volume: string;
  buyVolume: string;
  sellVolume: string;
  buyers: number;
  buys: number;
  sellers: number;
  sells: number;
  liquidity: string;
  volToLiq: number;
  buyVolToLiq: number;
  sellVolToLiq: number;
  participantEngagement: number;
  buysToSells: number;
  buyersToSellers: number;
  pctCloseFromHigh: number;
  pctCloseFromOpen: number;
}

export interface ScoredCoinData extends CoinData {
  score: number;
  flags: string[];
  liquidityTier: number;
}

export interface MetricCorrelation {
  metric: string;
  correlation: number;
  isPositiveCorrelation: boolean;
}

export interface MetricPerformance {
  threshold: number;
  auc: number;
}

export type LabelCategory =
  | "okay"
  | "decent"
  | "good"
  | "great"
  | "snipedDumped"
  | "bad"
  | "rug";

export const labelCategoryArray = [
  "okay",
  "decent",
  "good",
  "great",
  "snipedDumped",
  "bad",
  "rug"
];

export const metrics = [
  "volumeToMc",
  "liquidityToMC",
  "volToLiq",
  "buyVolToLiq",
  "sellVolToLiq",
  "participantEngagement",
  "buysToSells",
  "buyersToSellers",
  "pctCloseFromHigh",
  "pctCloseFromOpen",
];
