import fs from "fs";
import { getChart } from "../../modules/charts/getCharts";
import { getPair } from "../../modules/tokens/getPairInfo";
import { good, bad } from "./analysis/export";
// I have now updated my datasets for both good and bad. And each of the coins in the dataset also have an extra categorical value which I have arbitrarily assigned based on the performance of the coin after the first 1hr closes (since we are only checking data based on the first hour

// good

const goodFlag = false;
const labels = {
  //okay < 5x, decent < 10x, good < 20x, great >= 20x
  positive: ["okay", "decent", "good", "great"],
  //bad is just 1x /2x or loss
  negative: ["bad", "rug", "snipedDumped"],
};

async function main() {
  const str = goodFlag ? "good" : "bad";
  const allData = JSON.parse(
    fs.readFileSync(`./services/newLaunches/data/${str}.json`, "utf-8")
  );
  const curr = goodFlag ? good : bad;
  for (let i in curr) {
    const g = curr[i];
    const data = await getFirstHourData(g);
    allData.push(data);
  }
  fs.writeFileSync(
    `./services/newLaunches/data/${str}.json`,
    JSON.stringify(allData)
  );
}
main();

async function getFirstHourData(g: {
  name: string;
  pair: string;
  idx: number;
  label: string;
}) {
  const pairDataResponse = await getPair(g.pair);
  const pairData = pairDataResponse[0];
  const chartData = await getChart(g.pair, "ethereum", 60, pairData.quoteToken);
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(chartData)) {
    if (Array.isArray(value) && value.length > 0) {
      result[key] = value[g.idx];
    }
  }
  const earlyData = result;
  const mc = earlyData.c * parseInt(pairData[pairData.quoteToken].totalSupply);
  const obj = {
    name: g.name,
    label: g.label,
    ...earlyData,
    mc: mc,
    volumeToMc: earlyData.volume / mc,
    liquidityToMC: earlyData.liquidity / mc,
    volToLiq: parseFloat(earlyData.volume) / parseFloat(earlyData.liquidity),
    buyVolToLiq:
      parseFloat(earlyData.buyVolume) / parseFloat(earlyData.liquidity),
    sellVolToLiq:
      parseFloat(earlyData.sellVolume) / parseFloat(earlyData.liquidity),
    participantEngagement: earlyData.traders / earlyData.transactions,
    buysToSells: earlyData.buys / earlyData.sells,
    buyersToSellers: earlyData.buyers / earlyData.sellers,
  };
  return obj;
}

/**
 * Potential next steps
 *
 * - Different bracket thresholds (good, great, decent etc)
 * Implement a dynamic threshold system for red flags, as what
 * constitutes an extreme value might differ based on the overall performance category.
 *
 * - Scoring system
 * Consider creating a composite score that weights these metrics differently based on
 * the performance category, as their importance seems to shift across categories.
 *
 * Ask claude to provide me the threshold values based on the analysed data
 * ask claude to provide liquidity analysis and have that be considered in the analysis/scoring
 */
