// Slots are stored as Bangkok-local date + time. Timestamps are UTC and rendered in Bangkok.
export const TIME_ZONE = "Asia/Bangkok";

const isoDateFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const clockFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** YYYY-MM-DD in Bangkok for the given instant. */
export function toBangkokDate(instant: Date = new Date()): string {
  return isoDateFormat.format(instant);
}

/** HH:MM in Bangkok for the given instant. */
export function toBangkokClock(instant: Date = new Date()): string {
  return clockFormat.format(instant);
}

function parseDate(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function formatParsed(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(date: string, days: number): string {
  const value = parseDate(date);
  value.setUTCDate(value.getUTCDate() + days);
  return formatParsed(value);
}

/** 0 = Monday … 6 = Sunday. */
export function weekdayIndex(date: string): number {
  return (parseDate(date).getUTCDay() + 6) % 7;
}

export function startOfWeek(date: string): string {
  return addDays(date, -weekdayIndex(date));
}

export function monthKey(date: string): string {
  return date.slice(0, 7);
}

/** All YYYY-MM-DD dates in the month `YYYY-MM`. */
export function daysInMonth(month: string): string[] {
  const [y, m] = month.split("-").map(Number);
  const count = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return Array.from(
    { length: count },
    (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`,
  );
}

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const value = new Date(Date.UTC(y, m - 1 + delta, 1));
  return formatParsed(value).slice(0, 7);
}

export function monthName(month: string): string {
  return parseDate(`${month}-01`).toLocaleDateString("en-GB", {
    month: "long",
    timeZone: "UTC",
  });
}

/** "Tue 4 Nov 2026" */
export function formatDate(date: string): string {
  return parseDate(date).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** "14:30:00" → "14:30" */
export function formatTime(time: string): string {
  return time.slice(0, 5);
}

/** UTC instant → "4 Nov 2026, 14:30" in Bangkok. */
export function formatInstant(instant: Date): string {
  return instant.toLocaleString("en-GB", {
    timeZone: TIME_ZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
}

/** True when the Bangkok-local slot start is in the past. */
export function isPastSlot(date: string, time: string, now = new Date()) {
  const today = toBangkokDate(now);
  if (date !== today) return date < today;
  return formatTime(time) <= toBangkokClock(now);
}
