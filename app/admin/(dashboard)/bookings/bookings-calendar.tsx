"use client";

import { useState } from "react";
import { Card, STATUS_LABELS } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import {
  daysInMonth,
  monthKey,
  monthName,
  shiftMonth,
  weekdayIndex,
} from "@/lib/time";
import { cn } from "@/lib/utils";
import type { AdminBookingRow } from "@/server/bookings";

const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const DOT: Record<AdminBookingRow["status"], string> = {
  pending: "bg-amber-400",
  confirmed: "bg-emerald-500",
  completed: "bg-sky-500",
  cancelled: "bg-neutral-300",
  no_show: "bg-red-500",
};

export function BookingsCalendar({
  bookings,
  today,
}: {
  bookings: AdminBookingRow[];
  today: string;
}) {
  const [month, setMonth] = useState(monthKey(today));
  const days = daysInMonth(month);
  const leading = weekdayIndex(days[0]);
  const byDate = new Map<string, AdminBookingRow[]>();
  for (const booking of bookings) {
    byDate.set(booking.date, [...(byDate.get(booking.date) ?? []), booking]);
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="secondary"
          aria-label="Previous month"
          onClick={() => setMonth(shiftMonth(month, -1))}
        >
          ←
        </Button>
        <h2 className="font-semibold text-lg">
          {monthName(month)} {month.slice(0, 4)}
        </h2>
        <Button
          variant="secondary"
          aria-label="Next month"
          onClick={() => setMonth(shiftMonth(month, 1))}
        >
          →
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-xs">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-1 text-center font-medium text-neutral-500"
          >
            {day}
          </div>
        ))}
        {Array.from({ length: leading }, (_, i) => `pad-${i}`).map((key) => (
          <div key={key} />
        ))}
        {days.map((date) => {
          const items = (byDate.get(date) ?? []).toSorted((a, b) =>
            a.time.localeCompare(b.time),
          );
          return (
            <div
              key={date}
              className={cn(
                "min-h-24 rounded border border-neutral-200 p-1",
                date === today && "border-neutral-900",
              )}
            >
              <div className="mb-1 font-medium">{Number(date.slice(8))}</div>
              <ul className="grid gap-0.5">
                {items.map((b) => (
                  <li
                    key={b.id}
                    className="flex items-center gap-1 truncate"
                    title={STATUS_LABELS[b.status]}
                  >
                    <span
                      className={cn(
                        "size-2 shrink-0 rounded-full",
                        DOT[b.status],
                      )}
                      aria-hidden="true"
                    />
                    <span className="truncate">
                      {b.time} {b.customerName}
                    </span>
                    <span className="sr-only">({STATUS_LABELS[b.status]})</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
