import yargs from "yargs";

import { hideBin } from "yargs/helpers";

import { format } from "../src/util/Date";
import fusionSolar from "./scrapeSolarFusion";

const SOURCES = {
  fusionSolar,
};

export interface BaseOptions {
  time: string;
  period: number;
  source: keyof typeof SOURCES;
}

const defaultDate = new Date();
defaultDate.setDate(defaultDate.getDate() - 1);
defaultDate.setHours(0, 0, 0, 0);

export const withBaseOptions = (reader: yargs.Argv) => {
  return reader
    .option("s", {
      alias: "source",
      describe: `Which platform to scrape. Valid sources are [${Object.keys(
        SOURCES
      ).join(", ")}]`,
      type: "string",
      default: "fusionSolar",
    })
    .option("t", {
      alias: "time",
      describe: "Most recent day to scrape.",
      type: "string",
      default: format(defaultDate),
    })
    .option("p", {
      alias: "period",
      describe: "Amount of days to scrape.",
      type: "number",
      default: 365,
    });
};

export const getTimestamp = (time: string) => {
  const timestamp = new Date(time);
  if (isNaN(timestamp.getTime())) {
    throw new Error(`${time} is an invalid date`);
  }

  return timestamp;
};

const { source } = withBaseOptions(yargs(hideBin(process.argv)))
  .argv as unknown as BaseOptions;

if (SOURCES[source]) {
  SOURCES[source]();
} else {
  throw new Error(
    `${source} is an invalid source. Valid sources are [${Object.keys(
      SOURCES
    ).join(", ")}]`
  );
}
