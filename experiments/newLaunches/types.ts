export interface TokenData {
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
  callData?: CallData;
}

export interface TokenDataWithOHLCT extends TokenData {
  o: number;
  h: number;
  l: number;
  c: number;
  t: number;
}

export interface ScoredTokenData extends TokenData {
  score: number;
  flags: string[];
  liquidityTier: number;
  weightedAvgCPW: number;
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

export interface Call {
  caller: string;
  timestamp: number;
  marketcap: string;
  cpw?: number; // Make CPW optional
}

export interface CallData {
  symbol: string;
  numberCalls: number;
  calls: Call[];
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
  "rug",
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
