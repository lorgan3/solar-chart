import { format } from "../../../util/Date";
import { formatPower } from "../../../util/Formatter";
import Day from "../../Day";
import { Stat } from "../DayAccumulator";

export interface EarliestSunshineResult {
  day?: Day;
  hour: number;
  amount: number;
}

export const earliestSunshineKey = "earliest-sunshine-day";

export const earliestSunshine: Stat<EarliestSunshineResult> = {
  key: earliestSunshineKey,
  comparator: (day, value) => {
    if (!value) {
      value = {
        hour: 23,
        amount: 0,
      };
    }

    for (let i = value.hour; i > 0; i--) {
      const produced = day.data[i].productPower.average;
      if (produced < Number.EPSILON) {
        continue;
      }

      if (produced > value.amount || i < value.hour) {
        value.hour = i;
        value.amount = produced;
        value.day = day;
      }
    }

    return value;
  },
  serialize: (value) => ({
    hour: value.hour,
    amount: value.amount,
    day: value.day?.serialize(),
  }),
  deserialize: (value) => ({
    hour: value.hour,
    amount: value.amount,
    day: value.day ? Day.deserialize(value.day) : undefined,
  }),
  getOption: (value) => ({
    title: "Earliest sunshine",
    day: value.day,
    description: `${format(
      value.day!.date
    )} was the day with the earliest sunshine, producing ${formatPower(
      value.amount
    )} between ${value.hour}-${value.hour + 1}h.`,
  }),
};
