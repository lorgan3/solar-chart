import { formatMonthYear } from "../../util/Date";
import Accumulator from "../Accumulator";
import Day, { DataKeys, StatKeys } from "../Day";

export interface Option {
  day?: Day;
  title: string;
  description?: string;
  focus?: "input" | "output";
}

export interface Stat<T, O = any> {
  key: string;
  comparator: (day: Day, previousResult: T | null) => T;
  serialize(result: T): O;
  deserialize(obj: O): T;
  getOption?: (result: T) => Option;
}

interface StatWithMemory<T> extends Stat<T> {
  value: T | null;
}

type Stats<T> = Record<StatKeys, T>;
type StatsByMonth<T> = Stats<T> & { byMonth: Record<string, Stats<T>> };

class DayAccumulator {
  private startDate?: Date;
  private endDate?: Date;

  private day?: Day;
  private stats: StatsByMonth<Accumulator>;
  private extraStats: Record<string, StatWithMemory<unknown>>;

  constructor(extraStats?: Array<Stat<any>>) {
    const stats = Object.values(StatKeys).reduce((obj, key) => {
      obj[key] = new Accumulator();
      return obj;
    }, {} as Stats<Accumulator>);
    this.stats = { ...stats, byMonth: {} };

    this.extraStats = (extraStats || []).reduce((obj, stat) => {
      obj[stat.key] = { ...stat, value: null };
      return obj;
    }, {} as Record<string, StatWithMemory<unknown>>);
  }

  add(day: Day) {
    if (!this.day) {
      this.startDate = day.date;
      const now = new Date();
      this.day = new Day(
        now,
        day.data.map(() => Day.createEmptyData(now))
      );
    } else {
      this.endDate = day.date;
    }

    Object.values(DataKeys).forEach((key) =>
      this.day!.data.forEach((data, index) => {
        data[key].add(
          day.data[index][key].average,
          day.data[index][key].minimum,
          day.data[index][key].maximum
        );
      })
    );

    const stats = day.getStats();
    Object.entries(stats).forEach(([key, value]) => {
      this.stats[key as StatKeys].add(value, value, value, day);

      const month = formatMonthYear(day.date);
      if (!this.stats.byMonth[month]) {
        this.stats.byMonth[month] = Object.values(StatKeys).reduce(
          (obj, key) => {
            obj[key] = new Accumulator();
            return obj;
          },
          {} as Stats<Accumulator>
        );
      }

      this.stats.byMonth[month][key as StatKeys].add(value, value, value);
    });

    Object.values(this.extraStats).forEach((stat) => {
      stat.value = stat.comparator(day, stat.value);
    });
  }

  getAccumulatedDay() {
    if (!this.day) {
      throw new Error("Add at least 1 day first");
    }

    return this.day;
  }

  getStats() {
    return this.stats;
  }

  getExtraStat<T = unknown>(key: string): T {
    const stat = this.extraStats[key] as StatWithMemory<T>;
    if (!stat) {
      throw new Error("Stat does not exist");
    }

    return stat.value!;
  }

  getStartDate() {
    return this.startDate!;
  }

  getEndDate() {
    return this.endDate!;
  }

  serialize() {
    return {
      startDate: this.startDate!.toJSON(),
      endDate: this.endDate!.toJSON(),
      day: this.day!.serialize(),
      stats: Object.entries(this.stats).reduce((obj, [key, stat]) => {
        if (key === "byMonth") {
          obj.byMonth = Object.entries(
            stat as Record<string, Stats<Accumulator>>
          ).reduce((byMonth, [month, stats]) => {
            byMonth[month] = Object.entries(stats as Stats<Accumulator>).reduce(
              (innerObj, [innerKey, innerStat]) => {
                innerObj[innerKey as StatKeys] = innerStat
                  .finalize()
                  .serialize();
                return innerObj;
              },
              {} as Stats<any>
            );

            return byMonth;
          }, {} as Record<string, Stats<any>>);
          return obj;
        }

        obj[key as StatKeys] = (stat as Accumulator).finalize().serialize();
        return obj;
      }, {} as StatsByMonth<any>),
      extraStats: Object.entries(this.extraStats).reduce((obj, [key, stat]) => {
        obj[key as StatKeys] = stat.serialize(stat.value);
        return obj;
      }, {} as Record<string, any>),
    };
  }

  deserialize(obj: ReturnType<DayAccumulator["serialize"]>) {
    this.startDate = new Date(obj.startDate);
    this.endDate = new Date(obj.endDate);
    this.day = Day.deserialize(obj.day);
    this.stats = Object.entries<any>(obj.stats).reduce((obj, [key, stat]) => {
      if (key === "byMonth") {
        obj.byMonth = Object.entries(stat).reduce((byMonth, [month, stats]) => {
          byMonth[month] = Object.entries(stats as Stats<any>).reduce(
            (innerObj, [innerKey, innerStat]) => {
              innerObj[innerKey as StatKeys] =
                Accumulator.deserialize(innerStat);
              return innerObj;
            },
            {} as Stats<Accumulator>
          );

          return byMonth;
        }, {} as Record<string, Stats<any>>);
        return obj;
      }

      obj[key as StatKeys] = Accumulator.deserialize(stat);
      return obj;
    }, {} as StatsByMonth<Accumulator>);

    Object.entries(this.extraStats).forEach(([key, stat]) => {
      stat.value = stat.deserialize(obj.extraStats[key]);
    });
  }
}

export default DayAccumulator;
