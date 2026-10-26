const longDateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

export function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function dateKey(date: Date) {
  return `${monthKey(date)}-${String(date.getDate()).padStart(2, "0")}`;
}

export function dateFromKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatLongDate(key: string) {
  return longDateFormatter.format(dateFromKey(key));
}

// Any fixed date works; only the time of day is formatted.
export function formatTimeOfDay(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return timeFormatter.format(new Date(2026, 0, 1, hours, minutes));
}
