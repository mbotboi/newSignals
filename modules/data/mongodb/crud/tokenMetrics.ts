import {
  LabelCategory,
  FlagOptions,
  LabelCategoryArray,
  ScoredTokenData,
} from "../../../../services/newLaunches/types";

import mongoose, { Schema, Model, Document } from "mongoose";

// Define the interface for the document
const TokenSchema: Schema = new Schema({
  name: { type: String, required: true },
  pair: { type: String, required: true, unique: true },
  address: { type: String, required: true, unique: true },
  label: {
    type: String,
    enum: LabelCategoryArray,
    required: true,
  },
  t: { type: Number, required: true },
  o: { type: Number, required: true },
  h: { type: Number, required: true },
  l: { type: Number, required: true },
  c: { type: Number, required: true },
  v: { type: Number, required: true },
  volume: { type: String, required: true },
  buyVolume: { type: String, required: true },
  sellVolume: { type: String, required: true },
  buyers: { type: Number, required: true },
  buys: { type: Number, required: true },
  sellers: { type: Number, required: true },
  sells: { type: Number, required: true },
  liquidity: { type: String, required: true },
  transactions: { type: Number, required: true },
  traders: { type: Number, required: true },
  mc: { type: Number, required: true },
  volumeToMc: { type: Number, required: true },
  liquidityToMC: { type: Number, required: true },
  volToLiq: { type: Number, required: true },
  buyVolToLiq: { type: Number, required: true },
  sellVolToLiq: { type: Number, required: true },
  participantEngagement: { type: Number, required: true },
  buysToSells: { type: Number, required: true },
  buyersToSellers: { type: Number, required: true },
  pctCloseFromHigh: { type: Number, required: true },
  pctCloseFromOpen: { type: Number, required: true },
  liquidityTier: { type: Number, required: true },
  score: { type: Number },
  flags: [{ type: String, enum: FlagOptions }],
  weightedAvgCPW: { type: Number, required: true },
  callData: {
    symbol: { type: String },
    numberCalls: { type: Number },
    calls: [
      {
        caller: { type: String },
        timestamp: { type: Number },
        marketcap: { type: String },
        cpw: { type: Number },
      },
    ],
  },
});

const Token: Model<ScoredTokenData> = mongoose.model<ScoredTokenData>(
  "Token",
  TokenSchema
);

const tokenMetrics = {
  create: async (tokenData: ScoredTokenData): Promise<ScoredTokenData> => {
    try {
      const token = new Token(tokenData);
      return await token.save();
    } catch (e) {
      if (e instanceof mongoose.Error.ValidationError) {
        // Handle validation errors (e.g., unique constraint violations)
        if (e.errors.address) {
          throw new Error(
            `Token with address ${tokenData.address} already exists`
          );
        }
        if (e.errors.pair) {
          throw new Error(`Token with pair ${tokenData.pair} already exists`);
        }
      }
      throw e;
    }
  },

  createMany: async (
    tokenDataList: ScoredTokenData[]
  ): Promise<{ success: ScoredTokenData[]; errors: any[] }> => {
    try {
      const result = await Token.insertMany(tokenDataList, { ordered: false });
      return {
        success: result,
        errors: [],
      };
    } catch (error) {
      if (
        error instanceof Error &&
        "writeErrors" in error &&
        Array.isArray(error.writeErrors)
      ) {
        const successfulInserts = (error as any).insertedDocs || [];
        const failedInserts = error.writeErrors.map((err: any) => ({
          tokenData: err.err.op,
          error: err.err.errmsg,
        }));
        return {
          success: successfulInserts,
          errors: failedInserts,
        };
      } else {
        console.error("Unexpected error during bulk insert:", error);
        return {
          success: [],
          errors: [{ error: "Unexpected error during bulk insert" }],
        };
      }
    }
  },

  // Read
  getTokenByAddress: async (
    address: string
  ): Promise<ScoredTokenData | null> => {
    return await Token.findOne({ address });
  },

  getByName: async (name: string): Promise<ScoredTokenData | null> => {
    return await Token.findOne({ name });
  },

  getAll: async (): Promise<ScoredTokenData[]> => {
    return await Token.find();
  },

  update: async (
    id: string,
    tokenData: Partial<ScoredTokenData>
  ): Promise<ScoredTokenData | null> => {
    return await Token.findByIdAndUpdate(id, tokenData, { new: true });
  },

  updateMany: async (
    tokens: ScoredTokenData[]
  ): Promise<{ nModified: number }> => {
    const bulkOps = tokens.map((token, idx) => {
      const obj = {
        updateOne: {
          filter: { address: token.address }, // Using address as the matcher
          update: {
            $set: {
              score: token.score,
              flags: token.flags,
              liquidityTier: token.liquidityTier,
              weightedAvgCPW: token.weightedAvgCPW,
              // Add any other fields that might have changed
            },
          },
        },
      };
      return obj;
    });

    try {
      const result = await Token.bulkWrite(bulkOps);
      return { nModified: result.modifiedCount };
    } catch (error) {
      console.error("Error in bulk update operation:", error);
      throw error;
    }
  },

  delete: async (id: string): Promise<ScoredTokenData | null> => {
    return await Token.findByIdAndDelete(id);
  },

  getUnlabelledTokens: async (): Promise<ScoredTokenData[]> => {
    return await Token.find({ label: "none" });
  },

  getLabelledTokens: async (): Promise<ScoredTokenData[]> => {
    return await Token.find({ label: { $ne: "none" } });
  },

  getByLabel: async (label: LabelCategory): Promise<ScoredTokenData[]> => {
    return await Token.find({ label });
  },

  getWithFlag: async (flag: string): Promise<ScoredTokenData[]> => {
    return await Token.find({ flags: flag });
  },

  getWithScore: async (minScore: number): Promise<ScoredTokenData[]> => {
    return await Token.find({ score: { $gte: minScore } });
  },

  getWithCallData: async (): Promise<ScoredTokenData[]> => {
    return await Token.find({ callData: { $exists: true } });
  },

  updateLabel: async (
    nameOrAddress: string,
    newLabel: LabelCategory
  ): Promise<ScoredTokenData | null> => {
    let token = await Token.findOne({ name: nameOrAddress });
    if (!token) {
      token = await Token.findOne({ address: nameOrAddress });
    }
    if (token) {
      token.label = newLabel;
      return await token.save();
    }
    return null;
  },
};

export { tokenMetrics };
