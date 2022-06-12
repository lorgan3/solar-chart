import Day from "../../Day";
import { Stat } from "../DayAccumulator";

export interface HighestUsageResult {
  day?: Day;
  value: number;
}

export const highestUsageKey = "highest-usage";

export const highestUsage: Stat<HighestUsageResult> = {
  key: highestUsageKey,
  comparator: (day, value) => {
    if (!value) {
      value = {
        value: 0,
      };
    }

    const { totalUsed } = day.getStats();
    if (totalUsed > value.value) {
      value.value = totalUsed;
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
};
