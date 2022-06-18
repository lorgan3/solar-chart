import { format } from "../../../util/Date";
import Day from "../../Day";
import { Stat } from "../DayAccumulator";

export interface DarkestPeriodResult {
  day?: Day;
  value: number;
  worstPeriod: Date[];
  currentPeriod: Date[];
}

export const darkestPeriodKey = "darkest-period";

export const darkestPeriod: Stat<DarkestPeriodResult> = {
  key: darkestPeriodKey,
  comparator: (day, value) => {
    if (!value) {
      value = {
        value: Number.MAX_VALUE,
        worstPeriod: [],
        currentPeriod: [],
      };
    }

    const { totalProduced } = day.getStats();
    if (value.value >= Number.EPSILON) {
      if (totalProduced < value.value) {
        value.value = totalProduced;
        value.day = day;
      }
    } else if (totalProduced < Number.EPSILON) {
      const previousDay = value.currentPeriod[value.currentPeriod.length - 1];
      if (
        !previousDay ||
        day.date.getTime() - previousDay.getTime() > 60 * 60 * 24 * 1000
      ) {
        value.currentPeriod.push(day.date);
      } else {
        if (value.worstPeriod.length < value.currentPeriod.length) {
          value.worstPeriod = value.currentPeriod;
          value.currentPeriod = [day.date];
        }
      }
    }

    return value;
  },
  serialize: (value) => ({
    value: value.value,
    worstPeriod: value.worstPeriod,
    currentPeriod: value.currentPeriod,
    day: value.day?.serialize(),
  }),
  deserialize: (value) => ({
    value: value.value,
    worstPeriod: value.worstPeriod,
    currentPeriod: value.currentPeriod,
    day: value.day ? Day.deserialize(value.day) : undefined,
  }),
  getOption: (value) => {
    const title = value.day ? "Darkest day" : "Darkest period";
    const description = value.day
      ? `${format(value.day.date)} was the darkest day`
      : `${format(value.worstPeriod[0])} - ${format(
          value.worstPeriod[value.worstPeriod.length - 1]
        )} was the darkest period`;

    return {
      title,
      day: value.day,
      description,
      focus: "input",
    };
  },
};
