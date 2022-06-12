import Accumulator from "./Accumulator";

export enum DataKeys {
  UsePower = "usePower",
  DischargePower = "dischargePower",
  SelfUsePower = "selfUsePower",
  ChargePower = "chargePower",
  ProductPower = "productPower",
}

export enum StatKeys {
  TotalProduced = "totalProduced",
  TotalCharged = "totalCharged",
  TotalUsed = "totalUsed",
  TotalDischarged = "totalDischarged",
  TotalSelfUsed = "totalSelfUsed",
  GridPower = "gridPower",
  BatteryPercentage = "batteryPercentage",
  SolarPercentage = "solarPercentage",
  GridPercentage = "gridPercentage",
}

export interface Data extends Record<DataKeys, Accumulator> {
  hour: Date;
}

class Day {
  private computedStats?: Record<StatKeys, number>;

  constructor(public date: Date, public data: Data[]) {
    // An hour might be missing due to daylight saving time
    for (let i = 0; i < 24; i++) {
      if (!data[i]) {
        data[i] = data[i - 1];
      }
    }
  }

  serialize() {
    const transformData = (data: Data) => ({
      hour: data.hour.getTime(),
      usePower: data.usePower.finalize().serialize(),
      dischargePower: data.dischargePower.finalize().serialize(),
      selfUsePower: data.selfUsePower.finalize().serialize(),
      chargePower: data.chargePower.finalize().serialize(),
      productPower: data.productPower.finalize().serialize(),
    });

    return this.data.map(transformData);
  }

  private computeStats(): Record<StatKeys, number> {
    // Self use => power from panels to both using and charging
    // Use power => actual consumption

    const totalProduced = this.data.reduce(
      (sum, data) => sum + data.productPower.average,
      0
    );
    const totalCharged = this.data.reduce(
      (sum, data) => sum + data.chargePower.average,
      0
    );
    const totalDischarged = this.data.reduce(
      (sum, data) => sum + data.dischargePower.average,
      0
    );
    const totalUsed = this.data.reduce(
      (sum, data) => sum + data.usePower.average,
      0
    );

    const totalSelfUsed =
      this.data.reduce((sum, data) => sum + data.selfUsePower.average, 0) -
      totalCharged;

    const gridPower = totalUsed - totalSelfUsed - totalDischarged;

    const batteryPercentage = totalDischarged / totalUsed;
    const solarPercentage = totalSelfUsed / totalUsed;
    const gridPercentage = gridPower / totalUsed;

    return {
      totalProduced,
      totalCharged,
      totalUsed,
      totalDischarged,
      totalSelfUsed,
      gridPower,
      batteryPercentage,
      solarPercentage,
      gridPercentage,
    };
  }

  getStats() {
    if (!this.computedStats) {
      this.computedStats = this.computeStats();
    }

    return this.computedStats;
  }

  static createFromSolarFusion(
    dates: string[],
    usePower: string[],
    dischargePower: string[],
    selfUsePower: string[],
    chargePower: string[],
    productPower: string[]
  ) {
    const date = new Date(dates[0]);
    const data: Data[] = [];

    dates.forEach((value, index) => {
      const date = new Date(value);
      const slice = data[date.getHours()] || Day.createEmptyData(date);

      slice.usePower.add(parseFloat(usePower[index]));
      slice.dischargePower.add(parseFloat(dischargePower[index]));
      slice.selfUsePower.add(parseFloat(selfUsePower[index]));
      slice.chargePower.add(parseFloat(chargePower[index]));
      slice.productPower.add(parseFloat(productPower[index]));

      data[date.getHours()] = slice;
    });

    return new Day(
      date,
      data.map((slice) => ({
        hour: slice.hour,
        usePower: slice.usePower,
        dischargePower: slice.dischargePower,
        selfUsePower: slice.selfUsePower,
        chargePower: slice.chargePower,
        productPower: slice.productPower,
      }))
    );
  }

  static deserialize(data: Array<Record<string, any>>) {
    const date = new Date(data[0].hour);
    date.setHours(0, 0, 0, 0);

    return new Day(
      date,
      data.map((data) => ({
        hour: new Date(data.hour),
        usePower: Accumulator.deserialize(data.usePower),
        dischargePower: Accumulator.deserialize(data.dischargePower),
        selfUsePower: Accumulator.deserialize(data.selfUsePower),
        chargePower: Accumulator.deserialize(data.chargePower),
        productPower: Accumulator.deserialize(data.productPower),
      }))
    );
  }

  static createEmptyData(date: Date) {
    const data = Object.values(DataKeys).reduce((obj, key) => {
      obj[key] = new Accumulator();
      return obj;
    }, {} as Record<DataKeys, Accumulator>) as Data;

    data.hour = date;

    return data;
  }
}

export default Day;
