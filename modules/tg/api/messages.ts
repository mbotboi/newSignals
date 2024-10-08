import { Api, helpers } from "telegram";
import { TelegramClient } from "telegram";

export async function getRepliedMessage(
  replyToMsgId: number,
  channelId: string,
  client: TelegramClient
) {
  try {
    const messages = await client.getMessages(
      new Api.PeerChannel({ channelId: helpers.returnBigInt(channelId) }),
      {
        ids: [replyToMsgId],
      }
    );

    if (messages && messages.length > 0) {
      const replyMessage = messages[0];
      return replyMessage.message;
    } else {
      console.log("Reply message not found");
      return null;
    }
  } catch (error) {
    console.error("Error fetching reply message:", error);
    return null;
  }
}

export async function searchMessage(
  client: TelegramClient,
  channelName: string,
  searchString: string
) {
  try {
    const msgs = await client.getMessages(channelName as any, {
      search: searchString,
    });
    return msgs;
  } catch (e) {
    console.error(
      `ERROR: Issue with pulling searched message from ${channelName} channel`
    );
    console.error(e);
  }
}
