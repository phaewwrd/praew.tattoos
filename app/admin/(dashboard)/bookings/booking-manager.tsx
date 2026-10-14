"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/admin/status-badge";
import type { BookingStatus } from "@/lib/bookings";
import { updateBooking } from "./actions";

type Booking = Awaited<ReturnType<typeof import("@/lib/bookings").getBookings>>[number];
const statusOptions: BookingStatus[] = ["PENDING_PAYMENT", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"];

function formatDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(date);
}

function money(value: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "THB", maximumFractionDigits: 2 }).format(Number(value));
}

export function BookingManager({ bookings }: { bookings: Booking[] }) {
  const [drafts, setDrafts] = useState<Record<number, { status: BookingStatus; notes: string }>>({});
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  async function save(booking: Booking) {
    const draft = drafts[booking.id] ?? { status: booking.status, notes: booking.notes ?? "" };
    setBusyId(booking.id);
    const result = await updateBooking(booking.id, draft.status, draft.notes);
    setMessage(result.ok ? `Booking #${booking.id} updated.` : result.error);
    setBusyId(null);
  }

  return <div className="space-y-6">
    <section><h1 className="text-2xl font-semibold text-neutral-900">Bookings</h1><p className="mt-1 text-sm text-neutral-600">Review appointments, update their status, and keep admin notes.</p></section>
    {message && <p role="status" className="text-sm text-neutral-700">{message}</p>}
    <section className="overflow-hidden rounded-lg border border-neutral-200">
      {bookings.length === 0 ? <p className="p-4 text-sm text-neutral-600">No bookings yet.</p> : <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500"><tr><th className="px-4 py-3 font-medium">Appointment</th><th className="px-4 py-3 font-medium">Client</th><th className="px-4 py-3 font-medium">Service</th><th className="px-4 py-3 font-medium">Agreed / deposit</th><th className="px-4 py-3 font-medium">Payment</th><th className="px-4 py-3 font-medium">Status / notes</th><th className="px-4 py-3 font-medium">Save</th></tr></thead>
          <tbody>{bookings.map((booking) => {
            const draft = drafts[booking.id] ?? { status: booking.status, notes: booking.notes ?? "" };
            return <tr key={booking.id} className="border-t border-neutral-200 align-top">
              <td className="whitespace-nowrap px-4 py-3"><p className="font-medium text-neutral-900">{formatDate(booking.date)}</p><p className="mt-1 text-xs text-neutral-600">{booking.startTime}–{booking.endTime} · #{booking.id}</p></td>
              <td className="px-4 py-3"><p className="font-medium">{booking.clientName}</p><p className="text-xs text-neutral-600">{booking.clientEmail || "-"}</p><p className="text-xs text-neutral-600">{booking.clientPhone}</p></td>
              <td className="px-4 py-3">{booking.service}</td><td className="whitespace-nowrap px-4 py-3">{money(booking.agreedPrice)} / {money(booking.depositAmount)}</td>
              <td className="whitespace-nowrap px-4 py-3">{booking.paymentStatus ? <><StatusBadge status={booking.paymentStatus} /><p className="mt-1 text-xs">Paid {money(booking.paidAmount)}</p></> : "No payment"}</td>
              <td className="min-w-56 px-4 py-3"><div className="mb-2"><StatusBadge status={booking.status} /></div><select value={draft.status} onChange={(event) => setDrafts({ ...drafts, [booking.id]: { ...draft, status: event.target.value as BookingStatus } })} className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm">{statusOptions.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select><textarea aria-label={`Admin notes for booking ${booking.id}`} rows={2} maxLength={10000} placeholder="Admin notes" value={draft.notes} onChange={(event) => setDrafts({ ...drafts, [booking.id]: { ...draft, notes: event.target.value } })} className="mt-2 w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm" /></td>
              <td className="px-4 py-3"><button disabled={busyId === booking.id} onClick={() => void save(booking)} className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-100 disabled:opacity-50">{busyId === booking.id ? "Saving" : "Save"}</button></td>
            </tr>;
          })}</tbody>
        </table>
      </div>}
    </section>
  </div>;
}