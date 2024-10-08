import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import prompt from "prompt";
import { config } from "../../config";

// Your Telegram API ID and hash
const apiId = parseInt(config.TG_API_ID || "0");
const apiHash = config.TG_API_HASH || "";
//if no session string exists, an empty string will be used to symbolise a new session
const stringSession = new StringSession(config.TG_SESSION_STRING);

async function main() {
  console.log("Loading interactive example...");

  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  prompt.start();

  const getPhoneNumber = (): Promise<string> =>
    new Promise((resolve, reject) => {
      prompt.get(["phoneNumber"], (err, result) => {
        if (err) reject(err);
        resolve(result.phoneNumber as string);
      });
    });

  const getPassword = (): Promise<string> =>
    new Promise((resolve, reject) => {
      prompt.get(["password"], (err, result) => {
        if (err) reject(err);
        resolve(result.password as string);
      });
    });

  const getPhoneCode = (): Promise<string> =>
    new Promise((resolve, reject) => {
      prompt.get(["phoneCode"], (err, result) => {
        if (err) reject(err);
        resolve(result.phoneCode as string);
      });
    });

  await client.start({
    phoneNumber: async () => await getPhoneNumber(),
    password: async () => await getPassword(),
    phoneCode: async () => await getPhoneCode(),
    onError: (err) => console.log(err),
  });

  console.log("You are now connected.");
  console.log("session string:", client.session.save());
}

main();
