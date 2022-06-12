const dateFormatter = new Intl.DateTimeFormat("nl-BE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export const format = (date: Date) => {
  return dateFormatter
    .formatToParts(date)
    .reverse()
    .map(({ value }) => value)
    .join("");
};

const hourFormatter = new Intl.DateTimeFormat("nl-BE", {
  hour: "2-digit",
  minute: "2-digit",
});

export const formatWithHour = (date: Date) => {
  return format(date) + " " + hourFormatter.format(date);
};

const monthFormatter = new Intl.DateTimeFormat("en", { month: "long" });

export const formatMonth = (date: Date) => monthFormatter.format(date);

const monthYearFormatter = new Intl.DateTimeFormat("nl-BE", {
  month: "2-digit",
  year: "numeric",
});

export const formatMonthYear = (date: Date) =>
  monthYearFormatter
    .formatToParts(date)
    .reverse()
    .map(({ value }) => value)
    .join("");
