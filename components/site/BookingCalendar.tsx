"use client";

import Image from "next/image";
import { type KeyboardEvent, useRef } from "react";
import { daysInMonth, monthName, shiftMonth, weekdayIndex } from "@/lib/time";
import { cn } from "@/lib/utils";
import { HeartScribble, Mushroom } from "./illustrations";

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
    <div className="relative border-2 border-ink bg-paper p-4 shadow-[8px_8px_0_var(--color-ink)] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-hand text-ink/70 text-xl">{month.slice(0, 4)}</p>
          <h3 className="font-bold font-hand text-5xl text-brand uppercase leading-none sm:text-6xl">
            {name}
          </h3>
        </div>
        <div className="relative size-24 shrink-0 -rotate-6 sm:size-32">
          {monthImageUrl ? (
            <Image
              src={monthImageUrl}
              alt={`Hand-painted illustration for ${name}`}
              fill
              sizes="128px"
              className="object-contain"
            />
          ) : (
            <Mushroom className="size-full" />
          )}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onChangeMonth(shiftMonth(month, -1))}
          disabled={month <= minMonth}
          aria-label="Previous month"
          className="grid size-11 place-items-center rounded-full font-black text-2xl text-brand hover:bg-butter disabled:opacity-30"
        >
          ‹
        </button>
        <span className="sr-only" aria-live="polite">
          {name} {month.slice(0, 4)}
        </span>
        <button
          type="button"
          onClick={() => onChangeMonth(shiftMonth(month, 1))}
          aria-label="Next month"
          className="grid size-11 place-items-center rounded-full font-black text-2xl text-brand hover:bg-butter"
        >
          ›
        </button>
      </div>

      <div className="mt-2 grid grid-cols-7 text-center">
        {WEEKDAYS.map((day) => (
          <span
            key={day}
            className="py-1 font-black text-[0.7rem] text-ink/70 tracking-wider sm:text-xs"
          >
            {day}
          </span>
        ))}
      </div>
      <fieldset
        ref={gridRef}
        onKeyDown={onKeyDown}
        className="grid grid-cols-7 gap-y-1 text-center"
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
                  "grid aspect-square place-items-center text-ink/25 text-lg",
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
              className="relative grid aspect-square place-items-center rounded-full font-black text-ink text-lg hover:bg-butter"
            >
              {label}
              {selected ? (
                heartImageUrl ? (
                  <Image
                    src={heartImageUrl}
                    alt=""
                    fill
                    sizes="56px"
                    className="pointer-events-none scale-125 object-contain"
                  />
                ) : (
                  <HeartScribble className="pointer-events-none absolute inset-0 m-auto size-[125%]" />
                )
              ) : null}
            </button>
          );
        })}
      </fieldset>
    </div>
  );
}
