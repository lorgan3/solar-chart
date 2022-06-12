import Day from "./Day";
import { format } from "../util/Date";
import DayAccumulator from "./stat/DayAccumulator";

export function getFilename(date: Date) {
  return format(date).replace(/\//g, "-");
}

export async function deserializeDay(date: Date, filename?: string) {
  const data = (
    await import(`../../cache/${filename || getFilename(date)}.json`)
  ).default;

  return Day.deserialize(data);
}

export async function deserializeDayAccumulator(
  dayAccumulator: DayAccumulator
) {
  const data = (await import("../../cache/result.json")).default;
  dayAccumulator.deserialize(data);
}
