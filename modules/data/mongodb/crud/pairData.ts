import mongoose, { Schema, Model, Document } from "mongoose";
import { PairData } from "../../../../services/newLaunches/types";

const PairDataSchema: Schema = new Schema({
  lastTransaction: { type: Number, required: true },
  createdAt: { type: Number, required: true },
  uniqueBuys24: { type: Number, required: true },
  uniqueSells24: { type: Number, required: true },
  uniqueTransactions24: { type: Number, required: true },
  volumeUSD24: { type: String, required: true },
  priceChange24: { type: String, required: true },
  highPrice24: { type: String, required: true },
  lowPrice24: { type: String, required: true },
  price: { type: String, required: true },
  liquidity: { type: String, required: true },
  marketCap: { type: String, required: true },
  pair: {
    address: { type: String, required: true, unique: true },
  },
  quoteToken: { type: String, required: true },
  token0: {
    address: { type: String, required: true },
    decimals: { type: Number, required: true },
    symbol: { type: String, required: true },
    name: { type: String, required: true },
    info: {
      circulatingSupply: { type: String, required: true },
    },
  },
  token1: {
    address: { type: String, required: true },
    decimals: { type: Number, required: true },
    symbol: { type: String, required: true },
    name: { type: String, required: true },
    info: {
      circulatingSupply: { type: String, required: true },
    },
  },
  scoringError: { type: String },
  retryCount: { type: Number, default: 0 },
});

const PairDataModel: Model<PairData> = mongoose.model<PairData>(
  "PairData",
  PairDataSchema
);

const pairDataMetrics = {
  create: async (pairData: PairData): Promise<PairData> => {
    try {
      const newPairData = new PairDataModel(pairData);
      return await newPairData.save();
    } catch (e) {
      if (e instanceof mongoose.Error.ValidationError) {
        if (e.errors["pair.address"]) {
          throw new Error(
            `PairData with address ${pairData.pair.address} already exists`
          );
        }
      }
      throw e;
    }
  },

  createMany: async (
    pairDataList: PairData[]
  ): Promise<{ success: PairData[]; errors: any[] }> => {
    try {
      const result = await PairDataModel.insertMany(pairDataList, {
        ordered: false,
      });
      return {
        success: result,
        errors: [],
      };
    } catch (error) {
      if (
        error instanceof Error &&
        "writeErrors" in error &&
        Array.isArray((error as any).writeErrors)
      ) {
        const successfulInserts = (error as any).insertedDocs || [];
        const failedInserts = (error as any).writeErrors.map((err: any) => ({
          pairData: err.err.op,
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

  getByPairAddress: async (pairAddress: string): Promise<PairData | null> => {
    return await PairDataModel.findOne({ "pair.address": pairAddress });
  },

  getAll: async (): Promise<PairData[]> => {
    return await PairDataModel.find();
  },

  update: async (
    pairAddress: string,
    pairData: Partial<PairData>
  ): Promise<PairData | null> => {
    return await PairDataModel.findOneAndUpdate(
      { "pair.address": pairAddress },
      pairData,
      { new: true }
    );
  },

  delete: async (pairAddress: string): Promise<PairData | null> => {
    return await PairDataModel.findOneAndDelete({
      "pair.address": pairAddress,
    });
  },

  getFailedScorings: async (): Promise<PairData[]> => {
    return await PairDataModel.find({
      scoringError: { $exists: true, $ne: null },
    });
  },

  incrementRetryCount: async (pairAddress: string): Promise<number> => {
    const result = await PairDataModel.findOneAndUpdate(
      { "pair.address": pairAddress },
      { $inc: { retryCount: 1 } },
      { new: true }
    );
    return result?.retryCount || 0;
  },

  getByRetryCount: async (count: number): Promise<PairData[]> => {
    return await PairDataModel.find({ retryCount: count });
  },
};

export { pairDataMetrics };
