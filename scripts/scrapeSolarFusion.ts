import yargs from "yargs";
import fetch from "node-fetch";
import { hideBin } from "yargs/helpers";
import fs from "fs";

import Day from "../src/data/Day";
import { format } from "../src/util/Date";
import {
  deserializeDay,
  serializeDay,
  serializeDayAccumulator,
} from "../src/data/NodeSerializer";
import DayAccumulator from "../src/data/stat/DayAccumulator";
import EXTENSIONS from "../src/data/stat/extra";

interface Options {
  bspSession: string;
  stationDn: string;
  region: string;
  time: string;
  period: number;
}

const defaultDate = new Date();
defaultDate.setDate(defaultDate.getDate() - 1);
defaultDate.setHours(0, 0, 0, 0);

const options = yargs(hideBin(process.argv))
  .usage("Usage: -n <name>")
  .options("b", {
    alias: "bspSession",
    describe: "Fusion solar bspsession cookie",
    type: "string",
    demandOption: true,
  })
  .options("s", {
    alias: "stationDn",
    describe: "Fusion solar station DN",
    type: "string",
    demandOption: true,
    description: "test",
  })
  .options("r", {
    alias: "region",
    describe: "Fusion solar region",
    type: "string",
    default: "region01eu5",
  })
  .options("t", {
    alias: "time",
    describe: "Most recent day to scrape. Default yesterday",
    type: "string",
    default: format(defaultDate),
  })
  .options("p", {
    alias: "period",
    describe: "amount of days to scrape. Default 10",
    type: "number",
    default: 4,
  }).argv as unknown as Options;

const { bspSession, stationDn, region, time, period } = options;

const timestamp = new Date(time);
if (isNaN(timestamp.getTime())) {
  throw new Error(`${time} is an invalid date`);
}

const createUrl = (params: URLSearchParams) => {
  return `https://${region}.fusionsolar.huawei.com/rest/pvms/web/station/v1/overview/energy-balance?${params.toString()}`;
};

const accumulator = new DayAccumulator(EXTENSIONS);

const clone = new Date(timestamp);
clone.setDate(clone.getDate() - period + 1);
console.log(`Fetching ${period} days, starting from ${format(clone)}`);

for (let i = 0; i < period; i++) {
  const clone = new Date(timestamp);
  clone.setDate(clone.getDate() - period + i + 1);

  let day: Day;
  if (fs.existsSync(`./cache/${format(clone).replace(/\//g, "-")}.json`)) {
    console.log(`skipping cached day ${format(clone)}`);
    day = deserializeDay(clone);
  } else {
    // Intentionally done in series to not hit rate limits and so on.
    process.stdout.write(".");

    const response = await fetch(
      createUrl(
        new URLSearchParams({
          stationDn,
          timeDim: "2",
          queryTime: clone.getTime().toString(),
          timeZone: "2",
        })
      ),
      {
        headers: {
          cookie: `bspsession=${bspSession};`,
        },
      }
    );

    const result = (await response.json()) as any;
    day = Day.createFromSolarFusion(
      result.data.xAxis,
      result.data.usePower,
      result.data.dischargePower,
      result.data.selfUsePower,
      result.data.chargePower,
      result.data.productPower
    );

    serializeDay(day);
  }

  accumulator.add(day);
}

process.stdout.write("\n");
console.log("finalize");
serializeDayAccumulator(accumulator);
