// src/modules/database/DatabaseHandler.ts

import { Schema, Model } from "mongoose";
import { dbConnection } from "../connection";

export interface ITokenCall {
  contractAddress: string;
  tokenName: string;
  numberOfCalls: number;
  callerName: string;
  timestamp: Date;
}

const TokenCallSchema: Schema = new Schema({
  contractAddress: { type: String, required: true },
  tokenName: { type: String, required: true },
  numberOfCalls: { type: Number, required: true },
  callerName: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, expires: "24h" },
});

export class CallAnalyserDB {
  private TokenCallModel: Model<ITokenCall>;

  constructor() {
    const connection = dbConnection.getConnection();
    this.TokenCallModel = connection.model<ITokenCall>(
      "TokenCall",
      TokenCallSchema
    );
  }

  async upsertTokenCall(
    tokenCall: Omit<ITokenCall, "timestamp">
  ): Promise<ITokenCall> {
    try {
      const { contractAddress, tokenName, numberOfCalls, callerName } =
        tokenCall;
      return await this.TokenCallModel.findOneAndUpdate(
        { contractAddress, tokenName },
        {
          contractAddress,
          tokenName,
          numberOfCalls,
          callerName,
          timestamp: new Date(),
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error("Error upserting token call:", error);
      throw error;
    }
  }

  async getTokenCallsAboveThreshold(threshold: number): Promise<ITokenCall[]> {
    try {
      return await this.TokenCallModel.find({
        numberOfCalls: { $gte: threshold },
      });
    } catch (error) {
      console.error("Error getting token calls above threshold:", error);
      throw error;
    }
  }
}
