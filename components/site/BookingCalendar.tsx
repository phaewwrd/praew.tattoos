"use client";

import Image from "next/image";
import { type KeyboardEvent, useRef } from "react";
import { daysInMonth, monthName, shiftMonth, weekdayIndex } from "@/lib/time";
import { cn } from "@/lib/utils";
import { Mushroom } from "./illustrations";

const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

type Props = {
  month: string;
  today: string;
  minMonth: string;
  availableDates: Set<string>;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  onChangeMonth: (month: string) => void;
  monthImageUrl: string | null;
  heartImageUrl: string | null;
};

export function BookingCalendar({
  month,
  today,
  minMonth,
  availableDates,
  selectedDate,
  onSelectDate,
  onChangeMonth,
  monthImageUrl,
  heartImageUrl,
}: Props) {
  const gridRef = useRef<HTMLFieldSetElement>(null);
  const days = daysInMonth(month);
  const leading = weekdayIndex(days[0]);
  const name = monthName(month);
  const isAvailable = (date: string) =>
    date >= today && availableDates.has(date);
  // Roving tab stop: selected day, else first available day of the month.
  const tabStop =
    days.find((d) => d === selectedDate && isAvailable(d)) ??
    days.find(isAvailable);

  function onKeyDown(event: KeyboardEvent<HTMLFieldSetElement>) {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[
      event.key
    ];
    if (!step) return;
    const current = (event.target as HTMLElement).dataset.date;
    if (!current) return;
    event.preventDefault();
    const start = days.indexOf(current);
    for (let i = start + step; i >= 0 && i < days.length; i += step) {
      if (isAvailable(days[i])) {
        gridRef.current
          ?.querySelector<HTMLButtonElement>(`[data-date="${days[i]}"]`)
          ?.focus();
        return;
      }
    }
  }

  return (
    <div className="grid gap-4 bg-paper p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] sm:p-5">
      <div className="relative hidden min-h-48 sm:block">
        {monthImageUrl ? (
          <Image
            src={monthImageUrl}
            alt={`Hand-painted illustration for ${name}`}
            fill
            sizes="(min-width: 1024px) 18vw, 40vw"
            className="object-contain"
          />
        ) : (
          <Mushroom className="size-full" />
        )}
      </div>

      <div>
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onChangeMonth(shiftMonth(month, -1))}
            disabled={month <= minMonth}
            aria-label="Previous month"
            className="grid size-10 shrink-0 place-items-center rounded-full font-hand text-3xl text-mint hover:bg-mint/10 disabled:opacity-25"
          >
            ‹
          </button>
          <h3 className="text-center font-hand text-5xl text-mint uppercase leading-none tracking-wide">
            {name}
            <span className="sr-only"> {month.slice(0, 4)}</span>
          </h3>
          <button
            type="button"
            onClick={() => onChangeMonth(shiftMonth(month, 1))}
            aria-label="Next month"
            className="grid size-10 shrink-0 place-items-center rounded-full font-hand text-3xl text-mint hover:bg-mint/10"
          >
            ›
          </button>
        </div>
        <span className="sr-only" aria-live="polite">
          {name} {month.slice(0, 4)}
        </span>

        <div className="mt-2 grid grid-cols-7 text-center">
          {WEEKDAYS.map((day) => (
            <span
              key={day}
              className="py-1 font-hand text-ink/70 text-sm tracking-wider"
            >
              {day}
            </span>
          ))}
        </div>
        <fieldset
          ref={gridRef}
          onKeyDown={onKeyDown}
          className="grid grid-cols-7 text-center"
        >
          <legend className="sr-only">
            Days in {name}. Use arrow keys to move between available days.
          </legend>
          {Array.from({ length: leading }, (_, i) => `pad-${i}`).map((key) => (
            <span key={key} aria-hidden="true" />
          ))}
          {days.map((date) => {
            const available = isAvailable(date);
            const selected = date === selectedDate;
            const label = Number(date.slice(8));
            if (!available) {
              return (
                <span
                  key={date}
                  className={cn(
                    "grid aspect-square place-items-center font-hand text-ink/30 text-lg",
                    date < today && "line-through decoration-1",
                  )}
                >
                  <span className="sr-only">{date}, unavailable</span>
                  <span aria-hidden="true">{label}</span>
                </span>
              );
            }
            return (
              <button
                key={date}
                type="button"
                data-date={date}
                tabIndex={date === tabStop ? 0 : -1}
                onClick={() => onSelectDate(date)}
                aria-pressed={selected}
                aria-label={`${date}, available`}
                className="relative grid aspect-square place-items-center rounded-full font-bold font-hand text-ink text-xl hover:bg-butter"
              >
                {label}
                {selected ? (
                  <Image
                    src={heartImageUrl ?? "/heart.PNG"}
                    alt=""
                    fill
                    sizes="56px"
                    className="pointer-events-none scale-125 object-contain"
                  />
                ) : null}
              </button>
            );
          })}
        </fieldset>
      </div>
    </div>
  );
}
