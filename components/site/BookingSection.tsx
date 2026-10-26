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
    placeholder: "First",
    autoComplete: "given-name",
    type: "text",
  },
  {
    name: "lastName",
    label: "Last name",
    placeholder: "Last",
    autoComplete: "family-name",
    type: "text",
  },
  {
    name: "phone",
    label: "Phone number / WhatsApp",
    placeholder: "Phone / WhatsApp",
    autoComplete: "tel",
    type: "tel",
  },
  {
    name: "email",
    label: "Email",
    placeholder: "Email@mail.com",
    autoComplete: "email",
    type: "email",
  },
] as const;

/** "Tue 4 Nov 2026" → "4 NOV 2026" for the handwritten note. */
const noteDate = (date: string) =>
  formatDate(date).split(" ").slice(1).join(" ").toUpperCase();

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
      className="relative z-10 scroll-mt-6 px-4 pt-10 pb-16 sm:px-8 lg:px-[4%] lg:pt-0"
    >
      <h2 id="booking-title" className="sr-only">
        Book an appointment
      </h2>
      <div className="grid gap-8 bg-sand px-4 py-8 sm:px-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,0.85fr)_minmax(0,1.1fr)] lg:gap-10 lg:px-[3%] lg:py-12">
        {/* Left: calendar */}
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

        {/* Middle: times + details form */}
        <div className="grid content-start gap-5">
          <fieldset disabled={Boolean(done)}>
            <legend className="mb-2 font-hand text-brand text-xl">
              {date
                ? `Times on ${formatDate(date)}`
                : "Pick a day to see times"}
            </legend>
            {date ? (
              <div className="flex flex-wrap gap-3">
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
                      "min-w-18 border-2 px-2.5 py-1 font-hand text-2xl disabled:cursor-not-allowed disabled:border-transparent disabled:bg-ink/10 disabled:text-ink/30",
                      slot.id === slotId
                        ? "border-brand bg-brand text-cream"
                        : "border-brand text-brand hover:bg-brand/10",
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

          <form
            id="booking-form"
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              form.handleSubmit().catch(() => {});
            }}
          >
            <fieldset
              disabled={Boolean(done)}
              className="grid grid-cols-2 gap-x-3 gap-y-3"
            >
              <legend className="sr-only">Your details</legend>
              {FIELDS.map(
                ({ name, label, placeholder, autoComplete, type }) => (
                  <form.Field key={name} name={name}>
                    {(field) => {
                      const error = field.state.meta.errors[0]?.message;
                      const id = `booking-${name}`;
                      const half = name === "firstName" || name === "lastName";
                      return (
                        <div
                          className={cn("grid gap-1", !half && "col-span-2")}
                        >
                          <label
                            htmlFor={id}
                            className="font-hand text-brand text-xl leading-none"
                          >
                            {label}
                          </label>
                          <input
                            id={id}
                            name={name}
                            type={type}
                            placeholder={placeholder}
                            autoComplete={autoComplete}
                            required
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            aria-invalid={Boolean(error)}
                            aria-describedby={error ? `${id}-error` : undefined}
                            className="w-full min-w-0 border-2 border-ink/40 bg-paper px-3 py-1.5 font-hand text-xl outline-none placeholder:text-ink/35 focus:border-brand aria-invalid:border-brand"
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
                ),
              )}
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
            <p className="mt-4 text-ink/60 text-xs">
              Privacy: your details are used only to arrange your appointment
              and are never shared.
            </p>
          </form>
        </div>

        {/* Right: yellow notepad preview, spilling over the panel edges */}
        <div className="notepad-lines relative mx-auto flex min-h-96 w-full max-w-md -rotate-2 flex-col px-8 pt-8 pb-6 pl-14 text-brand shadow-[0_18px_30px_-12px_rgb(42_26_23/45%)] lg:-my-20">
          {done ? (
            <div role="status" className="font-hand text-2xl leading-[2rem]">
              <p className="font-bold text-4xl">Request received!</p>
              <p className="mt-2">
                {noteDate(done.date)} at {done.time}
              </p>
              <p className="mt-2 text-ink">
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
            <>
              <dl className="font-hand">
                <dt className="sr-only">Date</dt>
                <dd className="text-right text-5xl leading-none">
                  {date ? noteDate(date) : "pick a day…"}
                </dd>
                <dt className="sr-only">Time</dt>
                <dd className="mt-1 mr-10 text-right text-3xl">
                  {selectedSlot && selectedSlot.date === date
                    ? selectedSlot.time
                    : "--:--"}
                </dd>
                <dt className="sr-only">Name</dt>
                <dd className="mt-4 truncate text-5xl leading-tight">
                  {`${values.firstName} ${values.lastName}`.trim() ||
                    "Your name"}
                </dd>
                <dt className="sr-only">Email</dt>
                <dd className="ml-8 truncate text-2xl">
                  {values.email || "email@mail.com"}
                </dd>
                <dt className="sr-only">Phone</dt>
                <dd className="truncate text-2xl">{values.phone || "+66 …"}</dd>
              </dl>
              {slotError ? (
                <p className="mt-2 font-bold font-hand text-xl">{slotError}</p>
              ) : null}
              {request.error ? (
                <p role="alert" className="mt-2 font-bold font-hand text-xl">
                  {request.error.message}
                </p>
              ) : null}
              <button
                type="submit"
                form="booking-form"
                disabled={request.isPending}
                className="mt-auto ml-auto w-full max-w-64 bg-brand py-2 font-hand text-2xl text-cream tracking-[0.2em] hover:bg-brand-dark disabled:opacity-60"
              >
                {request.isPending ? "sending…" : "confirm"}
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
