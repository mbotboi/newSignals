import { dbConnection, tokenMetrics } from "../../../modules/data/mongodb";
import { ScoredTokenData, LabelCategory } from "../types";

interface AggregatedStats {
  count: number;
  totalScore: number;
  totalVolume: number;
  totalBuyersToSellers: number;
  totalCalls?: number;
  totalCPW?: number;
}

interface AggregatedData {
  withCalls: Record<LabelCategory, AggregatedStats>;
  withoutCalls: Record<LabelCategory, AggregatedStats>;
}

function aggregateCryptoData(coins: ScoredTokenData[]): AggregatedData {
  const result: AggregatedData = {
    withCalls: {} as Record<LabelCategory, AggregatedStats>,
    withoutCalls: {} as Record<LabelCategory, AggregatedStats>,
  };

  coins.forEach((coin) => {
    const category =
      coin.callData && coin.callData.numberCalls > 0
        ? "withCalls"
        : "withoutCalls";
    const label = coin.label as LabelCategory;

    if (!result[category][label]) {
      result[category][label] = {
        count: 0,
        totalScore: 0,
        totalVolume: 0,
        totalBuyersToSellers: 0,
      };
      if (category === "withCalls") {
        result[category][label].totalCalls = 0;
        result[category][label].totalCPW = 0;
      }
    }

    const data = result[category][label];
    data.count++;
    data.totalScore += coin.score || 0;
    data.totalVolume += parseFloat(coin.volume) || 0;
    data.totalBuyersToSellers += coin.buyersToSellers || 0;

    if (category === "withCalls" && coin.callData) {
      data.totalCalls! += coin.callData.numberCalls;
      data.totalCPW! += coin.weightedAvgCPW || 0;
    }
  });

  return result;
}

function formatResults(data: AggregatedData): string {
  let output = "Coins with Calls:\n\n";
  for (const [label, stats] of Object.entries(data.withCalls)) {
    const avgScore = (stats.totalScore / stats.count).toFixed(2);
    const avgCalls = stats.totalCalls
      ? (stats.totalCalls / stats.count).toFixed(2)
      : "N/A";
    const avgCPW = stats.totalCPW
      ? (stats.totalCPW / stats.count).toFixed(2)
      : "N/A";
    const avgBuyersToSellers = (
      stats.totalBuyersToSellers / stats.count
    ).toFixed(2);

    output += `• ${label}: Score ${avgScore} (${stats.count} coins)\n`;
    output += `  Avg Calls: ${avgCalls}, Avg CPW: ${avgCPW}\n`;
    output += `  Total Volume: ${stats.totalVolume.toFixed(
      2
    )}, Avg Buyers/Sellers: ${avgBuyersToSellers}\n\n`;
  }

  output += "\nCoins without Calls:\n\n";
  for (const [label, stats] of Object.entries(data.withoutCalls)) {
    const avgScore = (stats.totalScore / stats.count).toFixed(2);
    const avgBuyersToSellers = (
      stats.totalBuyersToSellers / stats.count
    ).toFixed(2);

    output += `• ${label}: Score ${avgScore} (${stats.count} coins)\n`;
    output += `  Total Volume: ${stats.totalVolume.toFixed(
      2
    )}, Avg Buyers/Sellers: ${avgBuyersToSellers}\n\n`;
  }

  return output;
}
async function main() {
  await dbConnection.connect();
  const all = await tokenMetrics.getAll();
  const tokens = all.map((t) => ({ ...t._doc }));

  const aggregatedData = aggregateCryptoData(tokens);
  console.log(formatResults(aggregatedData));
  await dbConnection.disconnect();
}
main();
// Example usage:
// const coins: ScoredTokenData[] = [ ... ]; // Your coin data here
