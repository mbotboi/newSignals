// src/modules/database/connection.ts

import mongoose from "mongoose";

import { config } from "../../config";

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async connect(): Promise<void> {
    if (config.TEST) {
      await this._connect(config.MONGO_LOCALHOST);
    } else {
      await this._connect(config.MONGO_DOCKER_NETWORK);
    }
  }
  private async _connect(uri: string): Promise<void> {
    if (this.isConnected) {
      console.log("Using existing database connection");
      return;
    }

    try {
      await mongoose.connect(uri);

      this.isConnected = true;
      console.log("New database connection established");

      mongoose.connection.on("error", this.handleConnectionError);
      mongoose.connection.on("disconnected", this.handleDisconnect);
    } catch (error) {
      console.error("Database connection error:", error);
      throw error;
    }
  }

  private handleConnectionError(error: Error): void {
    console.error("MongoDB connection error:", error);
    // Implement any additional error handling logic here
  }

  private handleDisconnect(): void {
    console.log("MongoDB disconnected. Attempting to reconnect...");
    this.isConnected = false;
    // Implement reconnection logic here if needed
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }
    await mongoose.disconnect();
    this.isConnected = false;
    console.log("Database connection closed");
  }

  public getConnection(): mongoose.Connection {
    return mongoose.connection;
  }
}

export const dbConnection = DatabaseConnection.getInstance();
