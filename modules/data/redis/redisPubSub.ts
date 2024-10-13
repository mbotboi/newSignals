import { config } from "../../config";
import { createClient } from "redis";

const getRedisUrl = () => {
  if (config.TEST) {
    return config.REDIS_LOCALHOST;
  } else {
    return config.REDIS_DOCKER_NETWORK;
  }
};

if (!config.REDIS_LOCALHOST || !config.REDIS_DOCKER_NETWORK) {
  throw new Error("REDIS_URL environment variable is not defined");
}

const pubClient = createClient({ url: getRedisUrl() });
const subClient = createClient({ url: getRedisUrl() });

pubClient.on("error", (err) => {
  console.error("Redis Pub Client Error", err);
});

subClient.on("error", (err) => {
  console.error("Redis Sub Client Error", err);
});

export async function publish(channel: string, message: string) {
  await pubClient.connect();
  await pubClient.publish(channel, message);
  await pubClient.disconnect();
}

export async function subscribe(
  channel: string,
  callback: (message: string) => void
): Promise<void> {
  await subClient.connect();
  await subClient.subscribe(channel, (message) => {
    callback(message);
  });
}

export async function read(channel: string) {}
