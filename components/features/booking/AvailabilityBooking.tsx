"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  useAvailableDates,
  useAvailableTimes,
  useReserveAppointment,
} from "@/hooks/useAvailability";
import type { ServerResponse } from "@/lib/server-response";
import type { TattooService } from "@/services/services";
import type { AvailableDates } from "@/types/availability";

type FormValues = {
  fullName: string;
  email: string;
  serviceId: string;
  phone: string;
};

type FormErrors = Partial<Record<keyof FormValues | "date" | "time", string>>;

const initialForm = { fullName: "", email: "", serviceId: "", phone: "" };

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(dateKey: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${dateKey}T12:00:00`));
}

function formatTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(2026, 0, 1, hours, minutes));
}

export function AvailabilityBooking({
  initialAvailableDates,
  services,
}: {
  initialAvailableDates: ServerResponse<AvailableDates>;
  services: TattooService[];
}) {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [form, setForm] = useState<FormValues>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitState, setSubmitState] = useState<
    "idle" | "success" | "stale" | "error"
  >("idle");
  const datesQuery = useAvailableDates(initialAvailableDates);
  const timesQuery = useAvailableTimes(selectedDate);
  const reservation = useReserveAppointment();
  const availableDates = datesQuery.data?.ok ? datesQuery.data.data.dates : [];
  const availableTimes = timesQuery.data?.ok ? timesQuery.data.data.times : [];
  const availableDateSet = new Set(availableDates);
  const selectedDateObject = selectedDate
    ? new Date(`${selectedDate}T12:00:00`)
    : undefined;
  const todayKey = toDateKey(today);

  function selectDate(date: string) {
    setSelectedDate(date);
    setSelectedTime("");
    setSubmitState("idle");
  }

  function validate() {
    const nextErrors: FormErrors = {};
    if (!selectedDate) nextErrors.date = "Choose a date.";
    if (!selectedTime) nextErrors.time = "Choose a time.";
    if (!form.fullName.trim()) nextErrors.fullName = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      nextErrors.email = "Enter a valid email.";
    if (!form.serviceId) nextErrors.serviceId = "Choose a service.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState("idle");
    if (!validate()) return;
    const response = await reservation.mutateAsync({
      ...form,
      date: selectedDate,
      time: selectedTime,
    });
    if (!response.ok) {
      if (response.code === "SLOT_UNAVAILABLE") {
        setSubmitState("stale");
        setSelectedTime("");
        return;
      }
      setSubmitState("error");
      return;
    }
    setSubmitState("success");
  }

  function reset() {
    setSelectedDate("");
    setSelectedTime("");
    setForm(initialForm);
    setErrors({});
    setSubmitState("idle");
  }

  return (
    <div className="booking-layout">
      <div className="booking-calendar">
        {datesQuery.isLoading && (
          <p className="booking-message">Loading calendar...</p>
        )}
        {datesQuery.data && !datesQuery.data.ok && (
          <p className="booking-message is-error">{datesQuery.data.message}</p>
        )}
        {datesQuery.data?.ok && (
          <>
            <Calendar
              mode="single"
              selected={selectedDateObject}
              onSelect={(date) => {
                if (!date) return;
                selectDate(toDateKey(date));
              }}
              disabled={(date) => {
                const dateKey = toDateKey(date);
                return dateKey < todayKey || !availableDateSet.has(dateKey);
              }}
              modifiers={{
                available: (date) => availableDateSet.has(toDateKey(date)),
              }}
              modifiersClassNames={{
                today: "border-[var(--ink)]",
              }}
            />
            {availableDates.length === 0 && (
              <p className="booking-message">No available slots right now.</p>
            )}
          </>
        )}
      </div>
      <form className="appointment-form" onSubmit={submit} noValidate>
        <div>
          <p className="eyebrow">Appointment request</p>
          <h3>Let&apos;s make an appointment.</h3>
        </div>
        <div className="form-selection">
          <span>Date</span>
          <strong>
            {selectedDate ? formatDate(selectedDate) : "Select a date"}
          </strong>
          {errors.date && <small>{errors.date}</small>}
        </div>
        <fieldset>
          <legend>Time</legend>
          {!selectedDate && <p>Select a date to see available times.</p>}
          {timesQuery.isLoading && <p>Loading available times...</p>}
          {timesQuery.data && !timesQuery.data.ok && (
            <p className="is-error">{timesQuery.data.message}</p>
          )}
          {timesQuery.data?.ok &&
            (availableTimes.length ? (
              <div className="time-list">
                {availableTimes.map((time) => (
                  <button
                    type="button"
                    className={time === selectedTime ? "is-selected" : ""}
                    key={time}
                    onClick={() => {
                      setSelectedTime(time);
                      setErrors((current) => ({ ...current, time: undefined }));
                    }}
                  >
                    {formatTime(time)}
                  </button>
                ))}
              </div>
            ) : (
              <p>No available times for this date.</p>
            ))}
          {errors.time && <small>{errors.time}</small>}
        </fieldset>
        <div className="form-row">
          <label>
            Full name
            <input
              value={form.fullName}
              onChange={(event) =>
                setForm({ ...form, fullName: event.target.value })
              }
              aria-invalid={Boolean(errors.fullName)}
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
              aria-invalid={Boolean(errors.email)}
            />
          </label>
        </div>
        <div>
          <label>
            Phone or WhatsApp
            <input
              required
              maxLength={20}
              value={form.phone}
              onChange={(event) =>
                setForm({ ...form, phone: event.target.value })
              }
              aria-invalid={Boolean(errors.phone)}
            />
          </label>
        </div>
        {(errors.fullName || errors.email) && (
          <p className="form-error">{errors.fullName ?? errors.email}</p>
        )}
        <label>
          Service
          <select
            value={form.serviceId}
            onChange={(event) =>
              setForm({ ...form, serviceId: event.target.value })
            }
            aria-invalid={Boolean(errors.serviceId)}
          >
            <option value="">Select a service</option>
            {services
              .filter((service) => service.isActive)
              .map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
          </select>
        </label>
        {errors.serviceId && <p className="form-error">{errors.serviceId}</p>}
        {submitState === "success" && (
          <p className="booking-message is-success">
            Your appointment request is reserved. We&apos;ll contact you via
            information provided with the next steps.
          </p>
        )}
        {submitState === "stale" && (
          <p className="booking-message is-error">
            That time was just taken. Please choose another available time.
          </p>
        )}
        {submitState === "error" && (
          <p className="booking-message is-error">
            We couldn&apos;t create your request. Please try again.
          </p>
        )}
        <div className="form-actions">
          <button type="button" className="text-button" onClick={reset}>
            Cancel
          </button>
          <button
            type="submit"
            className="confirm-button"
            disabled={reservation.isPending}
          >
            {reservation.isPending ? "Confirming..." : "Confirm"}
          </button>
        </div>
      </form>
    </div>
  );
}
