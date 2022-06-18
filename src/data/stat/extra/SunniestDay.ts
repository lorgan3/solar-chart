import { format } from "../../../util/Date";
import Day from "../../Day";
import { Stat } from "../DayAccumulator";

export interface SunniestDayResult {
  day?: Day;
  value: number;
}

export const sunniestDayKey = "sunniest-day";

export const sunniestDay: Stat<SunniestDayResult> = {
  key: sunniestDayKey,
  comparator: (day, value) => {
    if (!value) {
      value = {
        value: 0,
      };
    }

    const { totalProduced } = day.getStats();
    if (totalProduced > value.value) {
      value.value = totalProduced;
      value.day = day;
    }

    return value;
  },
  serialize: (value) => ({
    value: value.value,
    day: value.day?.serialize(),
  }),
  deserialize: (value) => ({
    value: value.value,
    day: value.day ? Day.deserialize(value.day) : undefined,
  }),
  getOption: (value) => ({
    title: "Sunniest day",
    day: value.day,
    description: `${format(
      value.day!.date
    )} was the day with the highest production`,
    focus: "input",
  }),
};
