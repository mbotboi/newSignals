import { tokenMetrics } from "../../../data/mongodb";
import { escapeMarkdown, formatNumber, getTokenLinks } from "../helpers";
import { getDetailedPairData } from "../../../tokens/getPairInfo";
import {
  LabelCategory,
  LabelCategoryArray,
  PairData,
} from "../../../../services/newLaunches/types";
import { RedisClientType } from "redis";

const PROCESSED_PAIRS_SET = "processed_pairs";

export async function updateLabel(
  nameOrAddress: string,
  newLabelString: string
): Promise<string> {
  try {
    if (!isValidLabelCategory(newLabelString)) {
      return escapeMarkdown(
        "Invalid label category. Please use one of: okay, decent, good, great, snipedDumped, bad, rug, none"
      );
    }

    const newLabel: LabelCategory = newLabelString;

    const updatedToken = await tokenMetrics.updateLabel(
      nameOrAddress,
      newLabel
    );
    if (updatedToken) {
      return escapeMarkdown(
        `Label updated for ${updatedToken.name} to ${updatedToken.label}`
      );
    } else {
      return escapeMarkdown("Token not found or label update failed.");
    }
  } catch (error) {
    console.error("Error updating token label:", error);
    throw new Error("An error occurred while updating the token label.");
  }
}

export async function getToken(address: string): Promise<string> {
  try {
    const token = await tokenMetrics.getTokenByAddress(address);
    if (token) {
      const currPairInfo: PairData = await getDetailedPairData(
        token.pair,
        token.chain
      );
      const pctChange = parseFloat(currPairInfo.priceChange24) * 100;
      console.log(pctChange);
      const pctChangeTxt =
        pctChange < 0
          ? `-${formatNumber(pctChange)}`
          : `${formatNumber(pctChange)}`;

      const { ds, defined } = getTokenLinks(address, token.chain);
      const header = `Token: ${escapeMarkdown(
        token.name
      )} \\| ${ds} \\| ${defined}`;
      const tokenInfo = `Address: \`${token.address}\`
Label: ${token.label}
Score: ${token.score}
MC in DB : ${formatNumber(token.mc)}
MC curr  : ${formatNumber(parseFloat(currPairInfo.marketCap))}
1D % chg: ${pctChangeTxt}
Volume 1D: ${formatNumber(parseFloat(currPairInfo.volumeUSD24))}
Liquidity: ${formatNumber(parseFloat(currPairInfo.liquidity))}
`;
      const msg = `${header}
${escapeMarkdown(tokenInfo)}
`;
      return msg;
    } else {
      return escapeMarkdown("Token not found.");
    }
  } catch (error) {
    console.error("Error fetching token:", error);
    throw new Error("An error occurred while fetching the token information.");
  }
}

function isValidLabelCategory(label: string): label is LabelCategory {
  const validLabel = [...LabelCategoryArray, "none"];
  return validLabel.includes(label);
}

export async function getTokenCount(): Promise<string> {
  try {
    const tokens = await tokenMetrics.getAll();
    const count = tokens.length;
    return escapeMarkdown(`Total number of tokens: ${count}`);
  } catch (error) {
    console.error("Error fetching token count:", error);
    throw new Error("An error occurred while fetching the token count.");
  }
}

export async function getUnlabeledTokens(): Promise<string> {
  try {
    const tokens = await tokenMetrics.getUnlabelledTokens();
    const count = tokens.length;

    let message = `Total number of unlabeled tokens: ${count}\n\n`;

    tokens.forEach((token) => {
      const { ds, defined } = getTokenLinks(token.address, token.chain);
      const tokenInfo = `\\- ${escapeMarkdown(
        token.name
      )} on ${token.chain.toLocaleUpperCase()}\\| ${ds} \\| ${defined}\n`;
      message += tokenInfo;
    });

    return message;
  } catch (error) {
    console.error("Error fetching unlabeled tokens:", error);
    throw new Error("An error occurred while fetching unlabeled tokens.");
  }
}

// Function to clear the processed pairs set (use cautiously, e.g., for maintenance or resets)
export async function clearProcessedPairsSet(redisClient: RedisClientType) {
  await redisClient.del(PROCESSED_PAIRS_SET);
  console.log("Processed pairs set has been cleared.");
}
