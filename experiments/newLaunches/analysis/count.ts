import fs from "fs";
import data from "../tgData/removedNoCalls.json";

function main() {
  interface Counts {
    good: {
      [key: string]: number;
    };
    bad: {
      [key: string]: number;
    };
  }
  const counts: Counts = {
    good: {
      okay: 0,
      decent: 0,
      good: 0,
      great: 0,
    },
    bad: {
      bad: 0,
      rug: 0,
      snipedDumped: 0,
    },
  };

  const straight: any[] = [];
  for (const [category, tokens] of Object.entries(data)) {
    tokens.forEach((token) => straight.push(token));
  }
  // console.log(straight.length);
  const scores: number[] = straight.map((token) => token.score);
  const greatScores: number[] = data.great.map((token) => token.score);
  // console.log(scores);
  const max = Math.max(...greatScores);
  console.log(max);
  // const tg = good.map((g: any) => {
  //   const obj = transform(g);
  //   return obj;
  // });
  // const tb = bad.map((g: any) => {
  //   const obj = transform(g);
  //   return obj;
  // });

  // fs.writeFileSync(
  //   `./study/newLaunches/data/transformedGood.json`,
  //   JSON.stringify(tg)
  // );
  // fs.writeFileSync(
  //   `./study/newLaunches/data/transformedBad.json`,
  //   JSON.stringify(tb)
  // );
}
main();
