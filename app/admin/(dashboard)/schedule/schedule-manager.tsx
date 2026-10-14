"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { FreeSlotsTable } from "@/components/ui/free-slots-table";
import type {
	AdminScheduleAllFreeSlots,
	AdminScheduleMonth,
	AdminScheduleSlot,
	Artist,
} from "@/lib/admin-schedule";
import {
	createScheduleSlot,
	deleteScheduleSlot,
	getScheduleMonthAction,
	setScheduleDateBlocked,
	setScheduleSlotAvailable,
	updateScheduleSlot,
} from "./actions";

function dateKey(date: Date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function dateFromKey(key: string) {
	const [year, month, day] = key.split("-").map(Number);
	return new Date(year, month - 1, day);
}

function formatDate(key: string) {
	return new Intl.DateTimeFormat("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric",
		year: "numeric",
	}).format(dateFromKey(key));
}

function formatTime(value: string) {
	const [hours, minutes] = value.split(":").map(Number);
	return new Intl.DateTimeFormat("en-US", {
		hour: "numeric",
		minute: "2-digit",
	}).format(new Date(2026, 0, 1, hours, minutes));
}

function monthKey(date: Date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function isBooked(slot: AdminScheduleSlot) {
	return slot.appointmentStatus !== null;
}

export function ScheduleManager({
	initialMonth,
	initialDate,
	initialSchedule,
	allFreeSlots,
	initialArtist,
}: {
	initialMonth: string;
	initialDate: string;
	initialSchedule: AdminScheduleMonth;
	allFreeSlots: AdminScheduleAllFreeSlots;
	initialArtist: Artist[];
	// artist: Artist[];
}) {
	const [month, setMonth] = useState(initialMonth);
	const [selectedDate, setSelectedDate] = useState(initialDate);
	const [schedule, setSchedule] = useState(initialSchedule);
	const [editingSlot, setEditingSlot] = useState<number | null>(null);
	const [busy, setBusy] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	const [artist, _setArtist] = useState<Artist[]>(initialArtist);
	const [selectedArtistId, setSelectedArtistId] = useState<number | null>(
		initialArtist?.[0]?.id ?? null,
	);
	// const selectArtist = artist?.find(a => a.id === selectedArtistId) ?? null;

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
		action: () => Promise<{ ok: true } | { ok: false; error: string }>,
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

	function changeMonth(next: Date) {
		const nextMonth = monthKey(next);
		setMonth(nextMonth);
		setError("");
		setMessage("");
		void refreshSchedule(nextMonth).catch(() =>
			setError("Unable to load this month."),
		);
	}

	function submitSlot(
		event: React.FormEvent<HTMLFormElement>,
		slotId?: number,
	) {
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
	console.log("allFreeSlots schedule", allFreeSlots.allFreeSlots);
	console.log(initialArtist);
	console.log(schedule);

	return (
		<div className="space-y-6">
			<header>
				<h1 className="text-2xl font-semibold text-neutral-900">Schedule</h1>
				<p className="mt-1 text-sm text-neutral-600">
					Control appointment availability and review booked times.
				</p>
			</header>

			<div className="grid gap-6 xl:grid-cols-[minmax(290px,360px)_1fr]">
				<section
					className="rounded-lg border border-neutral-200 p-4"
					aria-label="Schedule calendar"
				>
					<Calendar
						mode="single"
						month={dateFromKey(`${month}-01`)}
						onMonthChange={changeMonth}
						selected={dateFromKey(selectedDate)}
						onSelect={(date) => {
							if (!date) return;
							setSelectedDate(dateKey(date));
							setError("");
							setMessage("");
						}}
						modifiers={{
							hasAvailableSlots: (date) => availableDates.has(dateKey(date)),
							hasBookedSlots: (date) => bookedDates.has(dateKey(date)),
							hasBlockedSlots: (date) => blockedSlotDates.has(dateKey(date)),
							blockedDate: (date) =>
								schedule.blockedDates.includes(dateKey(date)),
						}}
						modifiersClassNames={{
							hasAvailableSlots: "bg-emerald-50",
							hasBookedSlots: "ring-1 ring-sky-600",
							hasBlockedSlots: "text-amber-800",
							blockedDate: "bg-amber-100 ring-1 ring-amber-500",
						}}
						className="mx-auto"
					/>
					<div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 border-t border-neutral-200 pt-3 text-xs text-neutral-600">
						<span className="flex items-center gap-2">
							<i className="h-3 w-3 rounded-sm bg-emerald-100" />
							Available
						</span>
						<span className="flex items-center gap-2">
							<i className="h-3 w-3 rounded-sm border border-sky-600" />
							Booked
						</span>
						<span className="flex items-center gap-2">
							<i className="h-3 w-3 rounded-sm bg-amber-200" />
							Blocked
						</span>
					</div>
				</section>

				<section className="min-w-0 rounded-lg border border-neutral-200">
					<div className="flex flex-col gap-3 border-b border-neutral-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
								Selected date
							</p>
							<h2 className="mt-1 text-lg font-semibold text-neutral-900">
								{formatDate(selectedDate)}
							</h2>
						</div>
						<button
							type="button"
							disabled={busy}
							onClick={() =>
								void perform(
									() => setScheduleDateBlocked(selectedDate, !blocked, artist),
									blocked ? "Date reopened." : "Date blocked from booking.",
								)
							}
							className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 disabled:opacity-50"
						>
							{blocked ? "Reopen date" : "Block date"}
						</button>
					</div>

					<div className="space-y-4 p-4">
						{message && (
							<p role="status" className="text-sm text-emerald-800">
								{message}
							</p>
						)}
						{error && (
							<p role="alert" className="text-sm text-red-700">
								{error}
							</p>
						)}
						{blocked && (
							<p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
								This date is blocked. Existing slots remain listed below, but
								cannot be booked.
							</p>
						)}

						<div className="space-y-2">
							<h3 className="text-sm font-semibold text-neutral-800">
								Time slots
							</h3>
							{slotsForDate.length === 0 ? (
								<p className="rounded-md bg-neutral-50 px-3 py-4 text-sm text-neutral-600">
									No slots scheduled for this date.
								</p>
							) : (
								<ul className="divide-y divide-neutral-200 rounded-md border border-neutral-200">
									{slotsForDate.map((slot) => {
										const bookedSlot = isBooked(slot);
										const status = bookedSlot
											? "Booked"
											: blocked || slot.status === "BLOCKED"
												? "Blocked"
												: "Available";
										return (
											<li key={slot.id} className="space-y-3 p-3">
												{editingSlot === slot.id ? (
													<form
														onSubmit={(event) => submitSlot(event, slot.id)}
														className="flex flex-wrap items-end gap-3"
													>
														<label className="grid gap-1 text-xs font-medium text-neutral-600">
															Start
															<input
																name="startTime"
																type="time"
																required
																defaultValue={slot.startTime}
																className="rounded-md border border-neutral-300 px-2 py-2 text-sm text-neutral-900"
															/>
														</label>
														<label className="grid gap-1 text-xs font-medium text-neutral-600">
															End
															<input
																name="endTime"
																type="time"
																required
																defaultValue={slot.endTime}
																className="rounded-md border border-neutral-300 px-2 py-2 text-sm text-neutral-900"
															/>
														</label>
														<button
															type="submit"
															disabled={busy}
															className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
														>
															Save
														</button>
														<button
															type="button"
															onClick={() => setEditingSlot(null)}
															className="px-2 py-2 text-sm text-neutral-600"
														>
															Cancel
														</button>
													</form>
												) : (
													<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
														<div className="min-w-0">
															<p className="text-xs text-neutral-500">
																Artist:{" "}
																{slot.artistId
																	? (artist?.find((a) => a.id === slot.artistId)
																			?.name ?? "N/A")
																	: "N/A"}
															</p>
															<p className="font-medium text-neutral-900">
																{formatTime(slot.startTime)}–
																{formatTime(slot.endTime)}
															</p>
															<p
																className={`mt-1 text-xs font-medium ${bookedSlot ? "text-sky-800" : status === "Blocked" ? "text-amber-800" : "text-emerald-800"}`}
															>
																{status}
																{slot.appointmentStatus
																	? ` · ${slot.appointmentStatus.replace("_", " ")}`
																	: ""}
																{slot.clientName ? ` · ${slot.clientName}` : ""}
															</p>
														</div>
														{!bookedSlot && (
															<div className="flex flex-wrap gap-2">
																<button
																	type="button"
																	disabled={busy || blocked}
																	onClick={() => setEditingSlot(slot.id)}
																	className="rounded-md border border-neutral-300 px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 disabled:opacity-50"
																>
																	Edit
																</button>
																<button
																	type="button"
																	disabled={busy || blocked}
																	onClick={() =>
																		void perform(
																			() =>
																				setScheduleSlotAvailable(
																					slot.id,
																					slot.status !== "AVAILABLE",
																				),
																			slot.status === "AVAILABLE"
																				? "Slot blocked."
																				: "Slot made available.",
																		)
																	}
																	className="rounded-md border border-neutral-300 px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 disabled:opacity-50"
																>
																	{slot.status === "AVAILABLE"
																		? "Block slot"
																		: "Make available"}
																</button>
																<button
																	type="button"
																	disabled={busy}
																	onClick={() => {
																		if (
																			window.confirm(
																				"Remove this slot from the schedule?",
																			)
																		)
																			void perform(
																				() => deleteScheduleSlot(slot.id),
																				"Slot removed.",
																			);
																	}}
																	className="rounded-md border border-neutral-300 px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 disabled:opacity-50"
																>
																	Remove
																</button>
															</div>
														)}
													</div>
												)}
											</li>
										);
									})}
								</ul>
							)}
						</div>

						{/* artist selection */}
						<div>
							artist:{" "}
							{selectedArtistId
								? (artist?.find((a) => a.id === selectedArtistId)?.name ??
									"N/A")
								: "N/A"}
						</div>

						<div>
							<label className="grid gap-1 text-xs font-medium text-neutral-600">
								Artist
								<select
									value={selectedArtistId ?? ""}
									onChange={(e) => {
										const id =
											e.target.value === "" ? null : Number(e.target.value);
										setSelectedArtistId(id);
										setError("");
										setMessage("");
										void refreshSchedule(month, id).catch(() =>
											setError("Unable to load this artist's schedule."),
										);
									}}
									className="rounded-md border border-neutral-300 px-2 py-2 text-sm text-neutral-900"
								>
									<option value="">Select an artist</option>
									{artist?.map((a) => (
										<option key={a.id} value={a.id}>
											{a.name}
										</option>
									))}
								</select>
							</label>
						</div>

						{!blocked && (
							<form
								onSubmit={(event) => submitSlot(event)}
								className="flex flex-wrap items-end gap-3 border-t border-neutral-200 pt-4"
							>
								<div className="mr-auto">
									<h3 className="text-sm font-semibold text-neutral-800">
										Add available slot
									</h3>
									<p className="mt-1 text-xs text-neutral-500">
										Times use the studio timezone (Asia/Bangkok).
									</p>
								</div>
								<label className="grid gap-1 text-xs font-medium text-neutral-600">
									Start
									<input
										name="startTime"
										type="time"
										required
										className="rounded-md border border-neutral-300 px-2 py-2 text-sm text-neutral-900"
									/>
								</label>
								<label className="grid gap-1 text-xs font-medium text-neutral-600">
									End
									<input
										name="endTime"
										type="time"
										required
										className="rounded-md border border-neutral-300 px-2 py-2 text-sm text-neutral-900"
									/>
								</label>
								<button
									type="submit"
									disabled={busy}
									className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
								>
									Add slot
								</button>
							</form>
						)}
					</div>
				</section>

				{/* slots table  */}
				<FreeSlotsTable slots={allFreeSlots} artists={artist} />
			</div>
		</div>
	);
}
