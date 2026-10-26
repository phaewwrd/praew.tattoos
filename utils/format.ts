const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

const thbFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 2,
});

// Noon avoids timezone shifts when parsing a bare YYYY-MM-DD date.
export function formatDateLabel(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

export function formatThb(value: string) {
  return thbFormatter.format(Number(value));
}
