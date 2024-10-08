export function createHyperlink(text: string, url: string) {
  const hyperlink = `__[${text}](${url})__`;
  return hyperlink;
}

export function escapeMarkdown(text: string): string {
  const markdownRegex =
    /(\[.*?\]\(.*?\)|`.*?`|(\*\*|__)(.*?)\2|(\*|_)(.*?)\4)/gs;
  let result = "";
  let lastIndex = 0;

  text.replace(markdownRegex, (match, p1, p2, p3, p4, p5, offset) => {
    // Escape the text between the last match and this one
    result += escapeNonMarkdown(text.slice(lastIndex, offset));
    // For bold and italic constructs, we need to escape their content
    if (p2 || p4) {
      const content = p3 || p5;
      const delimiter = p2 || p4;
      result += delimiter + escapeNonMarkdown(content) + delimiter;
    } else {
      // For links and code, add them without escaping
      result += match;
    }
    lastIndex = offset + match.length;
    return match;
  });

  // Escape any remaining text after the last match
  result += escapeNonMarkdown(text.slice(lastIndex));
  return result;
}

function escapeNonMarkdown(text: string): string {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, "\\$1");
}

export function formatNumber(num: number) {
  let isNegative = num < 0;
  num = Math.abs(num);

  if (num < 1000 && num > 1) {
    return num.toFixed(2);
  } else if (num < 1 && num > -1) {
    return num.toPrecision(3);
  }

  const symbols = ["", "K", "M", "B", "T"];
  const tier = (Math.log10(num) / 3) | 0;

  if (tier == 0) return num.toString();

  const scale = Math.pow(10, tier * 3);
  const scaled = num / scale;
  const finalNum = scaled.toFixed(1) + symbols[tier];
  return isNegative ? "-" + finalNum : finalNum;
}

//HELPER FUNCTIONS ----------------------------------
export const checkArgs = (msg: any) => {
  const numArgs = msg.text.split(" ");
  if (numArgs.length === 1) {
    return false;
  } else if (numArgs.length > 1) {
    return true;
  }
};

export function splitMessage(message: string) {
  const messages = [];
  let currentMessage = "";
  const MAX_LENGTH = 4096; // Telegram's max message length

  const words = message.split(" "); // Splitting by space to ensure URLs or markdown entities aren't broken
  for (const word of words) {
    if (currentMessage.length + word.length + 1 > MAX_LENGTH) {
      messages.push(currentMessage);
      currentMessage = "";
    }
    currentMessage += word + " ";
  }
  if (currentMessage.trim() !== "") {
    messages.push(currentMessage.trim());
  }
  return messages;
}
