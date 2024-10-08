import * as vega from "vega";
import * as vegaLite from "vega-lite";
import { createCanvas, loadImage } from "canvas";

export async function generateCandlestickChart(
  uncleanedData: any,
  keyLevels: number[]
) {
  // Process and cap the data
  const highValues = uncleanedData.h
    .filter((h: any) => h > 0)
    .sort((a: any, b: any) => b - a);
  const secondHighest = highValues[1] || highValues[0];
  const cap = secondHighest * 2;

  const ohlcData = uncleanedData.t.map((t: any, index: number) => ({
    t: new Date(uncleanedData.t[index] * 1000),
    o: uncleanedData.o[index],
    h: Math.min(uncleanedData.h[index], cap),
    l: uncleanedData.l[index],
    c: uncleanedData.c[index],
  }));

  const spec: vegaLite.TopLevelSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description: "Candlestick chart with support and resistance levels.",
    width: 600, // Adjusted width
    height: 400, // Adjusted height
    padding: { left: 50, right: 50, top: 20, bottom: 50 },
    background: "#131722",
    data: {
      name: "ohlcData",
      values: ohlcData,
    },
    layer: [
      {
        mark: { type: "rule", color: "#cccccc" },
        encoding: {
          x: {
            field: "t",
            type: "temporal",
            title: "Time",
            axis: { labelColor: "#cccccc", titleColor: "#cccccc" },
          },
          y: {
            field: "l",
            type: "quantitative",
            title: "Price",
            axis: { labelColor: "#cccccc", titleColor: "#cccccc" },
            scale: { zero: false },
          },
          y2: { field: "h" },
          color: {
            condition: {
              test: "datum.o < datum.c",
              value: "#26A69A", // Green for up candles
            },
            value: "#EF5350",
          },
        },
      },
      {
        mark: { type: "bar" as const },
        encoding: {
          x: { field: "t", type: "temporal" },
          y: { field: "o", type: "quantitative" },
          y2: { field: "c" },
          color: {
            condition: {
              test: "datum.o < datum.c",
              value: "#26A69A", // Green for up candles
            },
            value: "#EF5350",
          },
        },
      },
      {
        // New layer for key levels
        data: {
          values: keyLevels.map((level) => ({ price: level })),
        },
        mark: {
          type: "rule",
          color: "#00FFFF", // Blue color for key levels
          strokeWidth: 1.5,
          opacity: 1,
        },
        encoding: {
          y: {
            field: "price",
            type: "quantitative",
            scale: { zero: false },
          },
        },
      },
    ],
    config: {
      axis: {
        labelFontSize: 12,
        titleFontSize: 14,
        labelColor: "#cccccc", // White labels
        titleColor: "#cccccc", // White titles
        gridColor: "#444444", // Dark grid lines
      },
      legend: {
        labelColor: "#cccccc", // White legend labels
        titleColor: "#cccccc", // White legend title
      },
      title: {
        color: "#cccccc", // White title
      },
      view: {
        stroke: "#444444", // Dark border around the view
      },
    },
  };

  const view = new vega.View(vega.parse(vegaLite.compile(spec).spec), {
    renderer: "none",
  }).initialize();

  // Await the rendering of the view
  await view.runAsync();

  // Check if canvas is properly created
  const canvasElement = await view.toCanvas();
  if (!canvasElement) {
    throw new Error("Failed to create canvas from Vega view.");
  }

  const dataUrl = canvasElement.toDataURL();

  if (dataUrl === "data:,") {
    throw new Error(
      "Generated data URL is empty, check if the Vega specification is correct."
    );
  }

  const img = await loadImage(dataUrl);
  const canvas = createCanvas(canvasElement.width, canvasElement.height);
  const context = canvas.getContext("2d");
  context.drawImage(img, 0, 0);

  const chartBuffer = canvas.toBuffer("image/png");
  const base64Chart = chartBuffer.toString("base64");
  return base64Chart;
}
