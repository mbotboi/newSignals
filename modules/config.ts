import * as dotenv from "dotenv";

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

  //SCORING PARAMS
  CPW_WEIGHT: getEnvVariableAsNumber("CPW_WEIGHT"),
};
