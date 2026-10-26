"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, ErrorMessage } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { addDays, formatDate, formatTime } from "@/lib/time";
import { useServerAction } from "@/lib/use-server-action";
import { cn } from "@/lib/utils";
import type { AdminSlot } from "@/server/slots";
import {
  copyPreviousWeekAction,
  removeSlotsAction,
  setDaySlotsAction,
  toggleSlotAction,
} from "./actions";

const HOURLY = ["11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

type Props = { weekStart: string; today: string; slots: AdminSlot[] };

export function SlotsManager({ weekStart, today, slots }: Props) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [times, setTimes] = useState<string[]>([]);
  const [customTime, setCustomTime] = useState("");
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const apply = useServerAction(setDaySlotsAction, {
    onSuccess: () => setMessage("Slots saved."),
  });
  const copy = useServerAction(copyPreviousWeekAction, {
    onSuccess: (count) =>
      setMessage(`Copied ${count} slot(s) from the previous week.`),
  });
  const remove = useServerAction(removeSlotsAction, {
    onSuccess: ({ deleted, closed, kept }) => {
      setSelectedSlots([]);
      setMessage(
        `Deleted ${deleted}, closed ${closed} (had past bookings), kept ${kept} (active booking).`,
      );
    },
  });
  const toggle = useServerAction(toggleSlotAction);
  const busy = apply.isPending || copy.isPending || remove.isPending;

  const toggleIn = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  function loadDayTimes(date: string) {
    setTimes(
      slots
        .filter((s) => s.date === date && s.isOpen)
        .map((s) => formatTime(s.startTime)),
    );
  }

  function addCustomTime() {
    if (
      /^([01]\d|2[0-3]):[0-5]\d$/.test(customTime) &&
      !times.includes(customTime)
    ) {
      setTimes([...times, customTime].sort());
      setCustomTime("");
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-100"
          href={`/admin/slots?week=${addDays(weekStart, -7)}`}
        >
          ← Previous week
        </Link>
        <Link
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-100"
          href="/admin/slots"
        >
          This week
        </Link>
        <Link
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-100"
          href={`/admin/slots?week=${addDays(weekStart, 7)}`}
        >
          Next week →
        </Link>
        <p className="ml-auto font-medium text-sm">
          {formatDate(weekStart)} to {formatDate(addDays(weekStart, 6))}
        </p>
      </div>

      <Card title="Open times">
        <p className="mb-3 text-neutral-500 text-sm">
          Hint: usual hours are Tue–Sun 11:00–18:00 (last slot 17:00), closed
          Monday.
        </p>
        <fieldset className="mb-4">
          <legend className="mb-2 font-medium text-sm">1. Pick days</legend>
          <div className="flex flex-wrap gap-2">
            {days.map((date, i) => (
              <label
                key={date}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm",
                  selectedDays.includes(date)
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300",
                  date < today && "opacity-50",
                )}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={selectedDays.includes(date)}
                  onChange={() => setSelectedDays(toggleIn(selectedDays, date))}
                />
                {DAY_LABELS[i]} {date.slice(8)}
              </label>
            ))}
            <Button
              variant="secondary"
              onClick={() => setSelectedDays(days.slice(1))}
            >
              Tue–Sun
            </Button>
            <Button variant="secondary" onClick={() => setSelectedDays([])}>
              Clear
            </Button>
          </div>
        </fieldset>
        <fieldset className="mb-4">
          <legend className="mb-2 font-medium text-sm">2. Tick times</legend>
          <div className="flex flex-wrap gap-2">
            {[...new Set([...HOURLY, ...times])].sort().map((time) => (
              <label
                key={time}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm",
                  times.includes(time)
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300",
                )}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={times.includes(time)}
                  onChange={() => setTimes(toggleIn(times, time))}
                />
                {time}
              </label>
            ))}
            <Button variant="secondary" onClick={() => setTimes(HOURLY)}>
              11:00–17:00
            </Button>
          </div>
          <div className="mt-3 flex items-end gap-2">
            <div>
              <label
                htmlFor="custom-time"
                className="mb-1 block text-neutral-600 text-xs"
              >
                Custom time
              </label>
              <Input
                id="custom-time"
                type="time"
                step={300}
                className="w-32"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
              />
            </div>
            <Button
              variant="secondary"
              onClick={addCustomTime}
              disabled={!customTime}
            >
              Add time
            </Button>
          </div>
        </fieldset>
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={busy || selectedDays.length === 0}
            onClick={() =>
              apply.mutate({ dates: selectedDays, times, mode: "replace" })
            }
          >
            Set exactly these times
          </Button>
          <Button
            variant="secondary"
            disabled={busy || selectedDays.length === 0 || times.length === 0}
            onClick={() =>
              apply.mutate({ dates: selectedDays, times, mode: "add" })
            }
          >
            Add these times
          </Button>
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() => copy.mutate({ weekStart })}
          >
            Copy slots from previous week
          </Button>
        </div>
        <p className="mt-2 text-neutral-500 text-xs">
          “Set exactly” removes other free slots on the selected days. Booked
          slots are never removed.
        </p>
      </Card>

      <Card title="This week">
        <div className="grid gap-3 md:grid-cols-7">
          {days.map((date, i) => {
            const daySlots = slots.filter((s) => s.date === date);
            return (
              <div
                key={date}
                className="rounded-lg border border-neutral-200 p-2"
              >
                <button
                  type="button"
                  className="mb-2 w-full text-left font-medium text-sm hover:underline"
                  onClick={() => {
                    setSelectedDays([date]);
                    loadDayTimes(date);
                  }}
                  title="Edit this day"
                >
                  {DAY_LABELS[i]} {date.slice(8)}
                </button>
                {daySlots.length === 0 ? (
                  <p className="text-neutral-400 text-xs">No slots</p>
                ) : null}
                <ul className="grid gap-1">
                  {daySlots.map((slot) => (
                    <li
                      key={slot.id}
                      className={cn(
                        "flex items-center gap-1.5 rounded px-1.5 py-1 text-xs",
                        slot.booking
                          ? "bg-amber-50"
                          : slot.isOpen
                            ? "bg-emerald-50"
                            : "bg-neutral-100 text-neutral-500 line-through",
                      )}
                    >
                      <input
                        type="checkbox"
                        aria-label={`Select ${formatTime(slot.startTime)} on ${date}`}
                        checked={selectedSlots.includes(slot.id)}
                        onChange={() =>
                          setSelectedSlots(toggleIn(selectedSlots, slot.id))
                        }
                      />
                      <span className="font-medium">
                        {formatTime(slot.startTime)}
                      </span>
                      {slot.booking ? (
                        <Link
                          href={`/admin/bookings?q=${encodeURIComponent(slot.booking.customerName)}`}
                          className="truncate underline"
                        >
                          {slot.booking.customerName}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          className="ml-auto text-neutral-600 underline"
                          disabled={toggle.isPending}
                          onClick={() =>
                            toggle.mutate({ id: slot.id, isOpen: !slot.isOpen })
                          }
                        >
                          {slot.isOpen ? "Close" : "Open"}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            disabled={busy || selectedSlots.length === 0}
            onClick={() => {
              if (confirm(`Delete ${selectedSlots.length} selected slot(s)?`)) {
                remove.mutate({ ids: selectedSlots });
              }
            }}
          >
            Delete selected ({selectedSlots.length})
          </Button>
          <p className="text-neutral-500 text-xs">
            Green = free, amber = booked, grey = closed.
          </p>
        </div>
      </Card>

      {message ? (
        <p className="text-emerald-700 text-sm" role="status">
          {message}
        </p>
      ) : null}
      <ErrorMessage
        error={apply.error ?? copy.error ?? remove.error ?? toggle.error}
      />
    </div>
  );
}
