import Day from "./Day";

class Accumulator {
  private min = Number.MAX_VALUE;
  private max = -Number.MAX_VALUE;
  private avg = 0;
  private med = 0;
  private _sum = 0;
  private values: number[] = [];

  public maxRef?: Day;
  public minRef?: Day;

  private isFinalized = false;

  constructor();
  constructor(
    min: number,
    minRef: any,
    max: number,
    maxRef: any,
    avg: number,
    med: number,
    sum: number,
    values?: number[]
  );
  constructor(
    min?: number,
    minRef?: any,
    max?: number,
    maxRef?: any,
    avg?: number,
    med?: number,
    sum?: number,
    values?: []
  ) {
    if (min !== undefined) {
      this.isFinalized = true;
      this.min = min;
      this.max = max!;
      this.avg = avg!;
      this.med = med!;
      this._sum = sum!;

      this.minRef = minRef ? Day.deserialize(minRef) : undefined;
      this.maxRef = this.maxRef ? Day.deserialize(maxRef) : undefined;

      if (values) {
        this.values = values;
      }
    }
  }

  add(value: number, min: number, max: number, ref?: Day): this;
  add(value: number): this;
  add(value: number, min?: number, max?: number, ref?: Day) {
    if (this.isFinalized) {
      throw new Error(
        "Can not add values to an already finalized accumulator. Add all values before calling the getters"
      );
    }

    if (isNaN(value)) {
      return this;
    }

    this.values.push(value);

    if (min !== undefined && min < this.min) {
      this.min = min;
      this.minRef = ref;
    }
    if (max !== undefined && max > this.max) {
      this.max = max;
      this.maxRef = ref;
    }
    return this;
  }

  get minimum() {
    this.finalize();
    return this.min;
  }

  get maximum() {
    this.finalize();
    return this.max;
  }

  get average() {
    this.finalize();
    return this.avg;
  }

  get median() {
    this.finalize();
    return this.med;
  }

  get sum() {
    this.finalize();
    return this._sum;
  }

  getValues() {
    return this.values;
  }

  serialize(serializeValues = false): any[] {
    if (!this.isFinalized) {
      throw new Error("Can not serialize a non finalized accumulator");
    }

    const obj: any[] = [
      this.min,
      this.minRef?.serialize() ?? null,
      this.max,
      this.maxRef?.serialize() ?? null,
      this.avg,
      this.med,
      this._sum,
    ];

    if (serializeValues) {
      obj.push(this.values);
    }

    return obj;
  }

  /**
   * Happens automatically when a value is read.
   * You can call this manually if you want to serialize without ever reading a value.
   */
  finalize() {
    if (this.isFinalized) {
      return this;
    }

    this.isFinalized = true;

    const values = [...this.values].sort((a, b) => a - b);
    values.forEach((value) => {
      if (value < this.min) {
        this.min = value;
      }

      if (value > this.max) {
        this.max = value;
      }

      this._sum += value;
    });

    this.avg = this._sum / values.length;

    const amount = values.length;
    const middle = (amount / 2) | 0;
    if (amount % 2) {
      this.med = (values[middle] + values[middle + 1]) / 2;
    } else {
      this.med = values[middle];
    }

    return this;
  }

  static deserialize(
    data: [
      number,
      any,
      number,
      any,
      number,
      number,
      number,
      number[] | undefined
    ]
  ) {
    return new Accumulator(...data);
  }
}

export default Accumulator;
