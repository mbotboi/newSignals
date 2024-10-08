import { tokenMetrics } from "../../../data/mongodb";
import { escapeMarkdown, formatNumber } from "../helpers";
import {
  LabelCategory,
  LabelCategoryArray,
} from "../../../../services/newLaunches/types";

export async function updateLabel(
  nameOrAddress: string,
  newLabelString: string
): Promise<string> {
  try {
    if (!isValidLabelCategory(newLabelString)) {
      return escapeMarkdown("Invalid label category. Please use one of: okay, decent, good, great, snipedDumped, bad, rug, none");
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
      const tokenInfo = `
Token: ${token.name}
Address: ${token.address}
Label: ${token.label}
Score: ${token.score}
Market Cap: ${formatNumber(token.mc)}
Volume: ${token.volume}
Liquidity: ${token.liquidity}
Buyers: ${token.buyers}
Sellers: ${token.sellers}
Transactions: ${token.transactions}
      `;
      return escapeMarkdown(tokenInfo);
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
