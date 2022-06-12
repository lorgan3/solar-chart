import { formatMonthYear } from "../../../util/Date";
import Accumulator from "../../Accumulator";
import { Stat } from "../DayAccumulator";

export interface YearSelfSufficiencyResult {
  value: Record<string, Accumulator>;
}

export const yearSelfSufficiencyKey = "year-self-sufficiency";

export const yearSelfSufficiency: Stat<YearSelfSufficiencyResult> = {
  key: yearSelfSufficiencyKey,
  comparator: (day, value) => {
    if (!value) {
      value = { value: {} };
    }

    const { totalCharged, gridPower } = day.getStats();
    const month = formatMonthYear(day.date);
    const accumulator = value.value[month] || new Accumulator();
    value.value[month] = accumulator.add(totalCharged > gridPower ? 1 : 0);

    return value;
  },
  serialize: (value) => {
    return {
      value: Object.entries(value.value).reduce((obj, [key, accumulator]) => {
        obj[key] = accumulator.finalize().serialize(true);
        return obj;
      }, {} as Record<string, any>),
    };
  },
  deserialize: (value) => {
    return {
      value: Object.entries<any>(value.value).reduce((obj, [key, data]) => {
        obj[key] = Accumulator.deserialize(data);
        return obj;
      }, {} as Record<string, Accumulator>),
    };
  },
};
