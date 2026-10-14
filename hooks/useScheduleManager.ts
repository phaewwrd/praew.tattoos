"use client";

import { type FormEvent, useState } from "react";
import {
	createScheduleSlot,
	deleteScheduleSlot,
	getScheduleMonthAction,
	setScheduleDateBlocked,
	setScheduleSlotAvailable,
	updateScheduleSlot,
} from "@/app/admin/(dashboard)/schedule/actions";
import type {
	AdminScheduleMonth,
	AdminScheduleSlot,
	Artist,
} from "@/services/admin-schedule";
import type { ActionResult } from "@/types/actions";
import { dateKey, monthKey } from "@/utils/date";

type UseScheduleManagerOptions = {
	artists: Artist[];
	initialDate: string;
	initialMonth: string;
	initialSchedule: AdminScheduleMonth;
};

export function isBooked(slot: AdminScheduleSlot) {
	return slot.appointmentStatus !== null;
}

export function useScheduleManager({
	artists,
	initialDate,
	initialMonth,
	initialSchedule,
}: UseScheduleManagerOptions) {
	const [month, setMonth] = useState(initialMonth);
	const [selectedDate, setSelectedDate] = useState(initialDate);
	const [schedule, setSchedule] = useState(initialSchedule);
	const [editingSlot, setEditingSlot] = useState<number | null>(null);
	const [busy, setBusy] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [selectedArtistId, setSelectedArtistId] = useState<number | null>(
		artists[0]?.id ?? null,
	);

	const slotsForDate = schedule.slots.filter(
		(slot) => slot.date === selectedDate,
	);
	const blocked = schedule.blockedDates.includes(selectedDate);
	const availableDates = new Set(
		schedule.slots
			.filter(
				(slot) =>
					slot.status === "AVAILABLE" &&
					!isBooked(slot) &&
					!schedule.blockedDates.includes(slot.date),
			)
			.map((slot) => slot.date),
	);
	const bookedDates = new Set(
		schedule.slots.filter(isBooked).map((slot) => slot.date),
	);
	const blockedSlotDates = new Set(
		schedule.slots
			.filter((slot) => slot.status === "BLOCKED")
			.map((slot) => slot.date),
	);

	async function refreshSchedule(
		nextMonth = month,
		artistId = selectedArtistId,
	) {
		if (artistId === null) {
			setSchedule({ slots: [], blockedDates: [] });
			return;
		}
		setSchedule(await getScheduleMonthAction(nextMonth, artistId));
	}

	async function perform(
		action: () => Promise<ActionResult>,
		successMessage: string,
		followDate?: string,
	) {
		setBusy(true);
		setError("");
		setMessage("");
		try {
			const result = await action();
			if (!result.ok) {
				setError(result.error);
				return;
			}
			setMessage(successMessage);
			setEditingSlot(null);
			if (followDate) {
				const nextMonth = followDate.slice(0, 7);
				setSelectedDate(followDate);
				if (nextMonth !== month) setMonth(nextMonth);
				await refreshSchedule(nextMonth);
			} else {
				await refreshSchedule();
			}
		} catch {
			setError("The schedule could not be updated. Please try again.");
		} finally {
			setBusy(false);
		}
	}

	function clearFeedback() {
		setError("");
		setMessage("");
	}

	function changeMonth(next: Date) {
		const nextMonth = monthKey(next);
		setMonth(nextMonth);
		clearFeedback();
		void refreshSchedule(nextMonth).catch(() =>
			setError("Unable to load this month."),
		);
	}

	function selectDate(date: Date) {
		setSelectedDate(dateKey(date));
		clearFeedback();
	}

	function selectArtist(id: number | null) {
		setSelectedArtistId(id);
		clearFeedback();
		void refreshSchedule(month, id).catch(() =>
			setError("Unable to load this artist's schedule."),
		);
	}

	function submitSlot(event: FormEvent<HTMLFormElement>, slotId?: number) {
		event.preventDefault();
		if (selectedArtistId === null) {
			setError("Choose an artist first.");
			return;
		}
		const formData = new FormData(event.currentTarget);
		const input = {
			artistId: selectedArtistId,
			date: String(formData.get("date") ?? selectedDate),
			startTime: String(formData.get("startTime") ?? ""),
			endTime: String(formData.get("endTime") ?? ""),
		};
		void perform(
			() =>
				slotId === undefined
					? createScheduleSlot(input)
					: updateScheduleSlot(slotId, input),
			slotId === undefined ? "Available slot created." : "Slot updated.",
			slotId === undefined ? undefined : input.date,
		);
	}

	function toggleDateBlocked() {
		void perform(
			() =>
				setScheduleDateBlocked(selectedDate, !blocked, selectedArtistId ?? 0),
			blocked ? "Date reopened." : "Date blocked from booking.",
		);
	}

	function toggleSlotAvailable(slot: AdminScheduleSlot) {
		void perform(
			() => setScheduleSlotAvailable(slot.id, slot.status !== "AVAILABLE"),
			slot.status === "AVAILABLE" ? "Slot blocked." : "Slot made available.",
		);
	}

	function removeSlot(slot: AdminScheduleSlot) {
		if (!window.confirm("Remove this slot from the schedule?")) return;
		void perform(() => deleteScheduleSlot(slot.id), "Slot removed.");
	}

	return {
		availableDates,
		blocked,
		blockedSlotDates,
		bookedDates,
		busy,
		changeMonth,
		editingSlot,
		error,
		message,
		month,
		removeSlot,
		schedule,
		selectArtist,
		selectDate,
		selectedArtistId,
		selectedDate,
		setEditingSlot,
		slotsForDate,
		submitSlot,
		toggleDateBlocked,
		toggleSlotAvailable,
	};
}
