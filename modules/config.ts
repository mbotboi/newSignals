import * as dotenv from "dotenv";
import { ChartResolution } from "../services/newLaunches/types";

dotenv.config();

function getEnvVariable(key: string): string {
  const value = process.env[key];
  if (!value) {
    if (key == "TG_SESSION_STRING") {
      return "";
    }
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value;
}

function getEnvVariableAsBool(key: string): boolean {
  const value = process.env[key];
  let bool = false;
  if (value == "true") bool = true;
  return bool;
}

function getEnvVariableAsNumber(key: string): number {
  const valueStr = getEnvVariable(key);
  const valueNum = Number(valueStr);
  if (isNaN(valueNum)) {
    throw new Error(`Environment variable ${key} is not a valid number`);
  }
  return valueNum;
}

function getEnvVariableAsArray(key: string): string[] {
  const valueStr = getEnvVariable(key);
  try {
    return JSON.parse(valueStr);
  } catch (error) {
    throw new Error(`Environment variable ${key} is not a valid array`);
  }
}

export const config = {
  //CONNECTION URLS
  MONGO_LOCALHOST: getEnvVariable("LOCAL_MONGO"),
  MONGO_DOCKER_NETWORK: getEnvVariable("DOCKER_MONGO"),
  REDIS_LOCALHOST: getEnvVariable("REDIS_LOCALHOST"),
  REDIS_DOCKER_NETWORK: getEnvVariable("REDIS_DOCKER_NETWORK"),

  //OTHER_KEYS
  ANTHROPIC_API: getEnvVariable("ANTHROPIC_API"),

  //TG KEYS
  TG_BOT_ID: getEnvVariable("TG_BOT_ID"),
  TG_SENTIMENT_BOT_ID: getEnvVariable("TG_SENTIMENT_BOT_ID"),
  TG_CHAT_ID: getEnvVariable("TG_CHAT_ID"),
  TG_API_ID: getEnvVariable("TG_API_ID"),
  TG_API_HASH: getEnvVariable("TG_API_HASH"),
  TG_SESSION_STRING: getEnvVariable("TG_SESSION_STRING"),
  DEV_CHAT_ID: getEnvVariable("DEV_CHAT_ID"),

  //TG SIGNALS SETTINGS
  TG_FOLDER_NAME: getEnvVariable("TG_FOLDER_NAME"),
  NUM_CALLERS: getEnvVariableAsNumber("NUM_CALLERS"),

  //SETTINGS FOR NEW LAUNCH SIGNALS / SCORING
  NEW_LAUNCH_MIN_LIQ: getEnvVariableAsNumber("NEW_LAUNCH_MIN_LIQ"),

  //RUN TIME SETTINGS
  INITIAL_WAIT: getEnvVariableAsNumber("INITIAL_WAIT"),
  SCHEDULED_HOURS: getEnvVariableAsArray("SCHEDULED_HOURS"),
  TRENDING_INTERVAL: getEnvVariableAsNumber("TRENDING_INTERVAL"),
  FIRE_AT_START: getEnvVariableAsBool("FIRE_AT_START"),
  TEST: getEnvVariableAsBool("TEST"),

  //RUN TIME CONFIGS FOR SCORING
  CPW_WEIGHT: getEnvVariableAsNumber("CPW_WEIGHT"),
  CHAINS: getEnvVariableAsArray("CHAINS"),
  GATHERING_INTERVAL_IN_HOURS: getEnvVariableAsNumber(
    "GATHERING_INTERVAL_IN_HOURS"
  ),
  CHART_RESOLUTION: getEnvVariableAsNumber(
    "CHART_RESOLUTION"
  ) as ChartResolution,
  LAUNCHED_HOURS_AGO: getEnvVariableAsNumber("LAUNCHED_HOURS_AGO"),
  PROCESS_TOKENS_INTERVAL: getEnvVariableAsNumber("PROCESS_TOKENS_INTERVAL"),
};
