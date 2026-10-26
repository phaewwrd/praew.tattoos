"use client";

import { useForm, useStore } from "@tanstack/react-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { requestBookingAction } from "@/app/actions";
import { formatDate, monthKey } from "@/lib/time";
import { useServerAction } from "@/lib/use-server-action";
import { cn } from "@/lib/utils";
import { contactFieldsSchema } from "@/lib/validation/booking";
import type { PublicSlot } from "@/server/slots";
import { BookingCalendar } from "./BookingCalendar";

type Props = {
  initialSlots: PublicSlot[];
  today: string;
  monthImages: Record<number, string>;
  heartImageUrl: string | null;
};

const FIELDS = [
  {
    name: "firstName",
    label: "First name",
    autoComplete: "given-name",
    type: "text",
  },
  {
    name: "lastName",
    label: "Last name",
    autoComplete: "family-name",
    type: "text",
  },
  {
    name: "phone",
    label: "Phone number / WhatsApp",
    autoComplete: "tel",
    type: "tel",
  },
  { name: "email", label: "Email", autoComplete: "email", type: "email" },
] as const;

async function fetchSlots(): Promise<PublicSlot[]> {
  const response = await fetch("/api/slots", { cache: "no-store" });
  if (!response.ok) throw new Error("Could not load times.");
  return response.json();
}

export function BookingSection({
  initialSlots,
  today,
  monthImages,
  heartImageUrl,
}: Props) {
  const queryClient = useQueryClient();
  const { data: slots = initialSlots } = useQuery({
    queryKey: ["public-slots"],
    queryFn: fetchSlots,
    initialData: initialSlots,
    staleTime: 30_000,
  });

  const firstFree = slots.find((s) => s.free)?.date;
  const [month, setMonth] = useState(monthKey(firstFree ?? today));
  const [date, setDate] = useState<string | null>(null);
  const [slotId, setSlotId] = useState<string | null>(null);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [website, setWebsite] = useState("");
  const [done, setDone] = useState<{ date: string; time: string } | null>(null);

  const availableDates = new Set(
    slots.filter((s) => s.free).map((s) => s.date),
  );
  const daySlots = date ? slots.filter((s) => s.date === date) : [];
  const selectedSlot = slots.find((s) => s.id === slotId) ?? null;

  const request = useServerAction(requestBookingAction, {
    refresh: false,
    onSuccess: () => {
      if (selectedSlot)
        setDone({ date: selectedSlot.date, time: selectedSlot.time });
      queryClient.invalidateQueries({ queryKey: ["public-slots"] });
    },
  });

  const form = useForm({
    defaultValues: { firstName: "", lastName: "", phone: "", email: "" },
    validators: { onSubmit: contactFieldsSchema },
    onSubmit: async ({ value }) => {
      if (!slotId) {
        setSlotError("Pick a day and a time first.");
        return;
      }
      try {
        await request.mutateAsync({ ...value, slotId, website });
      } catch {
        // Slot taken in the meantime: refresh times so the user can pick again.
        queryClient.invalidateQueries({ queryKey: ["public-slots"] });
      }
    },
  });
  const values = useStore(form.store, (state) => state.values);

  function selectDate(next: string) {
    setDate(next);
    setSlotId(null);
    setSlotError(null);
  }

  function reset() {
    setDone(null);
    setDate(null);
    setSlotId(null);
    form.reset();
    request.reset();
  }

  return (
    <section
      id="booking"
      aria-labelledby="booking-title"
      className="scroll-mt-6 px-4 pt-6 pb-16 sm:px-8"
    >
      <h2
        id="booking-title"
        className="mb-6 font-black text-2xl text-brand uppercase tracking-wider"
      >
        Book an appointment
      </h2>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-8">
        {/* Left: calendar + times */}
        <div className="grid content-start gap-6">
          <BookingCalendar
            month={month}
            today={today}
            minMonth={monthKey(today)}
            availableDates={availableDates}
            selectedDate={date}
            onSelectDate={selectDate}
            onChangeMonth={setMonth}
            monthImageUrl={monthImages[Number(month.slice(5))] ?? null}
            heartImageUrl={heartImageUrl}
          />
          <fieldset disabled={Boolean(done)}>
            <legend className="mb-2 font-hand text-2xl">
              {date
                ? `Times on ${formatDate(date)}`
                : "Pick a day to see times"}
            </legend>
            {date ? (
              <div className="flex flex-wrap gap-2">
                {daySlots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={!slot.free}
                    aria-pressed={slot.id === slotId}
                    onClick={() => {
                      setSlotId(slot.id);
                      setSlotError(null);
                    }}
                    className={cn(
                      "min-w-20 border-2 border-ink px-3 py-2 font-black text-lg disabled:cursor-not-allowed disabled:border-ink/20 disabled:text-ink/30 disabled:line-through",
                      slot.id === slotId
                        ? "bg-brand text-cream"
                        : "bg-paper hover:bg-butter",
                    )}
                  >
                    {slot.time}
                    {!slot.free ? (
                      <span className="sr-only"> (booked)</span>
                    ) : null}
                  </button>
                ))}
              </div>
            ) : null}
          </fieldset>
        </div>

        {/* Middle: details form */}
        <form
          id="booking-form"
          noValidate
          className="grid content-start gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            form.handleSubmit().catch(() => {});
          }}
        >
          <fieldset disabled={Boolean(done)} className="grid gap-5">
            <legend className="mb-1 font-hand text-2xl">Your details</legend>
            {FIELDS.map(({ name, label, autoComplete, type }) => (
              <form.Field key={name} name={name}>
                {(field) => {
                  const error = field.state.meta.errors[0]?.message;
                  const id = `booking-${name}`;
                  return (
                    <div className="grid gap-1">
                      <label
                        htmlFor={id}
                        className="font-hand text-2xl text-ink/80"
                      >
                        {label}
                      </label>
                      <input
                        id={id}
                        name={name}
                        type={type}
                        autoComplete={autoComplete}
                        required
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        aria-invalid={Boolean(error)}
                        aria-describedby={error ? `${id}-error` : undefined}
                        className="border-0 border-ink/40 border-b-2 bg-transparent px-1 py-2 font-bold text-lg outline-none focus:border-brand aria-invalid:border-brand"
                      />
                      {error ? (
                        <p
                          id={`${id}-error`}
                          className="font-bold text-brand text-sm"
                        >
                          {error}
                        </p>
                      ) : null}
                    </div>
                  );
                }}
              </form.Field>
            ))}
            {/* Honeypot: hidden from people and assistive tech. */}
            <div
              aria-hidden="true"
              className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
            >
              <label htmlFor="booking-website">Website</label>
              <input
                id="booking-website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
          </fieldset>
          <p className="text-ink/70 text-sm">
            Privacy: your details are used only to arrange your appointment and
            are never shared.
          </p>
        </form>

        {/* Right: yellow notepad preview */}
        <div className="notepad-lines relative mx-auto w-full max-w-sm rotate-2 self-start px-6 pt-10 pb-6 pl-14 shadow-[0_18px_30px_-12px_rgb(42_26_23/50%)]">
          <span
            aria-hidden="true"
            className="absolute -top-3 left-1/2 h-7 w-28 -translate-x-1/2 -rotate-3 bg-sky/70"
          />
          {done ? (
            <div role="status" className="font-hand text-2xl leading-[2rem]">
              <p className="font-bold text-4xl text-brand">Request received!</p>
              <p className="mt-2">
                {formatDate(done.date)} at {done.time}
              </p>
              <p className="mt-2">
                The studio will email you to confirm your appointment and
                arrange the deposit.
              </p>
              <button
                type="button"
                onClick={reset}
                className="mt-4 font-bold text-ink/70 underline underline-offset-4"
              >
                Make another request
              </button>
            </div>
          ) : (
            <div className="font-hand text-2xl leading-[2rem]">
              <dl className="grid grid-cols-[auto_1fr] gap-x-3">
                <dt className="text-ink/60">Date:</dt>
                <dd className="truncate">{date ? formatDate(date) : "…"}</dd>
                <dt className="text-ink/60">Time:</dt>
                <dd>
                  {selectedSlot && selectedSlot.date === date
                    ? selectedSlot.time
                    : "…"}
                </dd>
                <dt className="text-ink/60">Name:</dt>
                <dd className="truncate">
                  {`${values.firstName} ${values.lastName}`.trim() || "…"}
                </dd>
                <dt className="text-ink/60">Email:</dt>
                <dd className="truncate">{values.email || "…"}</dd>
                <dt className="text-ink/60">Phone:</dt>
                <dd className="truncate">{values.phone || "…"}</dd>
              </dl>
              {slotError ? (
                <p className="mt-2 font-bold text-brand text-xl">{slotError}</p>
              ) : null}
              {request.error ? (
                <p role="alert" className="mt-2 font-bold text-brand text-xl">
                  {request.error.message}
                </p>
              ) : null}
              <button
                type="submit"
                form="booking-form"
                disabled={request.isPending}
                className="mt-4 w-full border-2 border-ink bg-brand py-3 font-black font-sans text-cream text-lg uppercase tracking-[0.2em] shadow-[4px_4px_0_var(--color-ink)] hover:bg-brand-dark disabled:opacity-60"
              >
                {request.isPending ? "Sending…" : "Confirm"}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
