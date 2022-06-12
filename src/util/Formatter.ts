const kDaWhFormatter = new Intl.NumberFormat("en", {
  maximumFractionDigits: 0,
});

const kWhFormatter = new Intl.NumberFormat("en", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});

const whFormatter = new Intl.NumberFormat("en", {
  maximumFractionDigits: 0,
});

export const formatPower = (value: number) => {
  if (value < 1) {
    return whFormatter.format(value * 1000) + " Wh";
  }

  if (value >= 10) {
    return kDaWhFormatter.format(value) + " kWh";
  }

  return kWhFormatter.format(value) + " kWh";
};

const formatter = Intl.NumberFormat("en", {
  maximumFractionDigits: 2,
  style: "percent",
});

export const formatPercentage = (value: number) => formatter.format(value);
