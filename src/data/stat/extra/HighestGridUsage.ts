import { format } from "../../../util/Date";
import Day from "../../Day";
import { Stat } from "../DayAccumulator";

export interface HighestGridUsageResult {
  day?: Day;
  value: number;
}

export const highestGridUsageKey = "highest-grid-usage";

export const highestGridUsage: Stat<HighestGridUsageResult> = {
  key: highestGridUsageKey,
  comparator: (day, value) => {
    if (!value) {
      value = {
        value: 0,
      };
    }

    const { gridPower, totalDischarged } = day.getStats();
    const sum = gridPower + totalDischarged;
    if (sum > value.value) {
      value.value = sum;
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
    title: "Highest grid & battery usage",
    day: value.day,
    description: `${format(
      value.day!.date
    )} was the day with the highest grid/battery usage`,
  }),
};
