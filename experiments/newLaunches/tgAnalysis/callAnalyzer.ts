import all from "../tgData/allCalls.json";
import { searchMessage } from "../../../modules/tg/api/messages";
import { getChannelName } from "../../../modules/tg/api/channels";
import { TgClient } from "../../../modules/tg/api/client";
import { config } from "../../../modules/config";
import { TelegramClient, Api } from "telegram";
import fs from "fs";

async function getMessages(client: TelegramClient, tokenAddress: string) {
  const allFolders = await client.invoke(new Api.messages.GetDialogFilters());
  const folder = allFolders.filters.find(
    (f: any) =>
      f.title?.toLocaleLowerCase() === config.TG_FOLDER_NAME.toLocaleLowerCase()
  );
  const folderPeers = (folder as any).includePeers;
  const channelId = folderPeers[0].channelId.toString();
  const channelName = await getChannelName(client, channelId);
  const messages = searchMessage(client, channelName!, tokenAddress);
  return messages;
}

function analyse() {
  const called = all.filter((a) => a.call.length > 0);
  console.log(called.length);
}
analyse();
// async function main() {
//   const tgClient = new TgClient();
//   await tgClient.connect();
//   const client = tgClient.getClient();
//   const allList = [];
//   for (let i in all) {
//     const curr = all[i];
//     const msg = await getMessages(client, curr.address);
//     const obj = { ...curr, call: msg };
//     allList.push(obj);
//     fs.writeFileSync(
//       "./services/newLaunches/tgData/allCalls.json",
//       JSON.stringify(allList)
//     );
//   }
//   await client.disconnect();
// }
// main();

// async function getCA() {
//   const all = [...good, ...bad];
//   const cas = [];
//   for (let i in all) {
//     const curr = all[i];
//     const pairDeets = await getDetailedPairData(curr.pair, "ethereum");
//     const obj = {
//       name: curr.name,
//       pair: curr.pair,
//       address: pairDeets.pair[pairDeets.quoteToken],
//     };
//     cas.push(obj);
//     fs.writeFileSync(
//       "./services/newLaunches/data/allAddresses.json",
//       JSON.stringify(cas)
//     );
//   }
//   console.log(cas);
// }
// getCA();
