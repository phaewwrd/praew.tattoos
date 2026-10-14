"use client";

import { useState } from "react";
import { updateBooking } from "@/app/admin/(dashboard)/bookings/actions";
import type { Booking, BookingStatus } from "@/services/bookings";

type BookingDraft = { status: BookingStatus; notes: string };

export function useBookingEditor() {
	const [drafts, setDrafts] = useState<Record<number, BookingDraft>>({});
	const [message, setMessage] = useState("");
	const [busyId, setBusyId] = useState<number | null>(null);

	function getDraft(booking: Booking): BookingDraft {
		return (
			drafts[booking.id] ?? {
				status: booking.status,
				notes: booking.notes ?? "",
			}
		);
	}

	function updateDraft(booking: Booking, patch: Partial<BookingDraft>) {
		setDrafts((current) => ({
			...current,
			[booking.id]: { ...getDraft(booking), ...patch },
		}));
	}

	async function save(booking: Booking) {
		const draft = getDraft(booking);
		setBusyId(booking.id);
		const result = await updateBooking(booking.id, draft.status, draft.notes);
		setMessage(result.ok ? `Booking #${booking.id} updated.` : result.error);
		setBusyId(null);
	}

	return { busyId, getDraft, message, save, updateDraft };
}
