import good from "../data/good.json";
import bad from "../data/bad.json";
import fs from "fs";

function transform() {
  const data = [...good, ...bad];
  const transformedData = data.map((d) => {
    const pctCloseFromHigh = (d.c - d.h) / d.h;
    const pctCloseFromOpen = (d.c - d.o) / d.o;
    const obj = { ...d, pctCloseFromHigh, pctCloseFromOpen };
    return obj;
  });
  fs.writeFileSync(
    "./services/newLaunches/data/transformedData.json",
    JSON.stringify(transformedData)
  );
}
transform();
