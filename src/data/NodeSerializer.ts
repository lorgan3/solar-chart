import Day from "./Day";
import fs from "fs";
import { format } from "../util/Date";
import DayAccumulator from "./stat/DayAccumulator";

export function getFilename(date: Date) {
  return format(date).replace(/\//g, "-");
}

export function serializeDay(day: Day, filename?: string) {
  const data = day.serialize();

  fs.writeFileSync(
    `./cache/${filename || getFilename(day.date)}.json`,
    JSON.stringify(data, undefined, 2)
  );
}

export function deserializeDay(date: Date, filename?: string) {
  const data = JSON.parse(
    fs.readFileSync(`./cache/${filename || getFilename(date)}.json`).toString()
  );

  return Day.deserialize(data);
}

export function serializeDayAccumulator(accumulator: DayAccumulator) {
  fs.writeFileSync(
    "./cache/result.json",
    JSON.stringify(accumulator.serialize(), undefined, 2)
  );
}

export function deserializeDayAccumulator(dayAccumulator: DayAccumulator) {
  const data = JSON.parse(fs.readFileSync("./cache/result.json").toString());

  return dayAccumulator.deserialize(data);
}
