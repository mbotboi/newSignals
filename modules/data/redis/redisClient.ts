import { createClient, RedisClientType } from "redis";
import { config } from "../../config";

class RedisClientManager {
  private static instance: RedisClientManager;
  private client: RedisClientType | null = null;

  private constructor() {}

  public static getInstance(): RedisClientManager {
    if (!RedisClientManager.instance) {
      RedisClientManager.instance = new RedisClientManager();
    }
    return RedisClientManager.instance;
  }

  public async connect(): Promise<void> {
    if (this.client) {
      console.log("Redis client already connected");
      return;
    }
    console.log("Connecting to Redis...");

    if (config.TEST) {
      this.client = createClient({ url: process.env.REDIS_LOCALHOST });
    } else {
      this.client = createClient({ url: process.env.REDIS_DOCKER_NETWORK });
    }

    this.client.on("error", (err) => console.error("Redis Client Error", err));
    await this.client.connect();
    console.log("Redis connected successfully");
  }

  public getClient(): RedisClientType {
    if (!this.client) {
      throw new Error("Redis client not initialized. Call connect() first.");
    }
    return this.client;
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      console.log("Disconnecting from Redis...");
      await this.client.quit();
      this.client = null;
      console.log("Redis disconnected");
    }
  }
}

export const redisClientManager = RedisClientManager.getInstance();
