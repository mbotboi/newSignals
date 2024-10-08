import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { config } from "../../config";

export class TgClient {
  private client: TelegramClient;
  private connectionState: "disconnected" | "connecting" | "connected" =
    "disconnected";
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 10;
  private readonly reconnectDelay = 5000; // 5 seconds

  constructor() {
    const apiId = parseInt(config.TG_API_ID || "0");
    const apiHash = config.TG_API_HASH || "";
    const stringSession = new StringSession(config.TG_SESSION_STRING);

    this.client = new TelegramClient(stringSession, apiId, apiHash, {
      connectionRetries: 5,
      retryDelay: 1000,
    });
  }

  async connect() {
    try {
      this.connectionState = "connecting";
      await this.client.connect();

      this.connectionState = "connected";
      console.info("Connected to Telegram");
      this.reconnectAttempts = 0;
    } catch (error) {
      console.error("Failed to connect to Telegram", error);
      this.handleReconnection();
    }
  }

  private handleError(error: Error) {
    console.error("Telegram client error", error);
    this.connectionState = "disconnected";
    this.handleReconnection();
  }

  private async handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.error(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );
      setTimeout(() => this.connect(), this.reconnectDelay);
    } else {
      console.error("Max reconnection attempts reached");
    }
  }

  getConnectionState() {
    return this.connectionState;
  }

  getClient() {
    return this.client;
  }
}
