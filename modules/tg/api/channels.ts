import { Api, TelegramClient, helpers } from "telegram";

export async function getChannelName(
  client: TelegramClient,
  peerId: Api.TypePeer | string
) {
  try {
    // If peerId is a string (channel ID), convert it to a proper Peer object
    const peer =
      typeof peerId === "string"
        ? new Api.PeerChannel({ channelId: helpers.returnBigInt(peerId) })
        : peerId;

    // Fetch the entity (channel) information
    const entity = await client.getEntity(peer);

    // Check if the entity is a channel
    if (entity instanceof Api.Channel) {
      return entity.title;
    } else {
      console.log("The provided peer is not a channel");
      return null;
    }
  } catch (error) {
    console.error("Error fetching channel name:", error);
    return null;
  }
}
