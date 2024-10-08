export interface AggregatedTokenData extends ChartData {
  name: string;
  calculatedMC: number;
  actualMC: number;
  liquidityToMC: number;
  volumeToMc: number;
  volToLiq: number;
  buyVolToLiq: number;
  sellVolToLiq: number;
  participantEngagement: number;
  buysToSells: number;
  buyersToSellers: number;
  pctCloseFromHigh: number;
  pctCloseFromOpen: number;
  [key: string]: any;
}

export interface DataToScore extends AggregatedTokenData {
  pair: string;
  address: string;
  callData?: CallData;
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

export interface ScoredTokenData extends DataToScore {
  score?: number;
  flags: Flag[];
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

export interface ScoringParams {
  rocThresholds: Record<string, MetricPerformance>;
  correlations: MetricCorrelation[];
  maxCPW: number;
}

export interface FlagThresholds {
  volToLiq: number;
  buyVolToLiq: number;
  sellVolToLiq: number;
  buyersToSellers: number;
  volumeToMc: number;
}

//Potentially will be updated by user based on requirements and new information
export const LabelCategorySentiment: Record<string, LabelCategory[]> = {
  positive: ["okay", "decent", "good", "great"],
  negative: ["snipedDumped", "bad", "rug"],
  neutral: ["none"],
};

export const LabelCategoryArray = Object.values(LabelCategorySentiment).flat();

export type LabelCategory =
  | "okay"
  | "decent"
  | "good"
  | "great"
  | "snipedDumped"
  | "bad"
  | "rug"
  | "none";

export const LabelCategoryScores: Record<LabelCategory, number> = {
  great: 4,
  good: 3,
  decent: 2,
  okay: 1,
  snipedDumped: -2,
  bad: -3,
  rug: -4,
  none: 0,
};

// Define the Flag options
export const FlagOptions = [
  "Extremely high volume to liquidity ratio",
  "High volume with extreme buy pressure",
  "Low buyer/seller ratio with high volume",
  "Very low liquidity",
] as const;

export type Flag = (typeof FlagOptions)[number];

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

export const LiquidityTierThresholds = [10000, 50000, 100000] as const;

export type LiquidityTier = 1 | 2 | 3 | 4;

export function determineLiquidityTier(liquidity: number): LiquidityTier {
  for (let i = 0; i < LiquidityTierThresholds.length; i++) {
    if (liquidity < LiquidityTierThresholds[i]) {
      return (i + 1) as LiquidityTier;
    }
  }
  return 4;
}

// TYPES FOR DEFINED OBJECTS
export interface TokenInfo {
  address: string;
  decimals: number;
  symbol: string;
  name: string;
  info: {
    circulatingSupply: string;
  };
}

export interface PairData {
  lastTransaction: number;
  createdAt: number;
  uniqueBuys24: number;
  uniqueSells24: number;
  uniqueTransactions24: number;
  volumeUSD24: string;
  priceChange24: string;
  highPrice24: string;
  lowPrice24: string;
  price: string;
  liquidity: string;
  marketCap: string;
  pair: {
    address: string;
  };
  quoteToken: string;
  token0: TokenInfo;
  token1: TokenInfo;
  [key: string]: any;
}

export interface ChartData {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  volume: string;
  buyVolume: string;
  sellVolume: string;
  buyers: number;
  buys: number;
  sellers: number;
  sells: number;
  liquidity: string;
  transactions: number;
  traders: number;
}
