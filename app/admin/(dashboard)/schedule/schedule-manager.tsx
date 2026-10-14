"use client";

import { FreeSlotsTable } from "@/components/features/admin/FreeSlotsTable";
import { ScheduleSlotRow } from "@/components/features/admin/ScheduleSlotRow";
import { Button } from "@/components/ui/Button";
import { Calendar } from "@/components/ui/calendar";
import { useScheduleManager } from "@/hooks/useScheduleManager";
import type {
	AdminScheduleAllFreeSlots,
	AdminScheduleMonth,
	Artist,
} from "@/services/admin-schedule";
import { dateFromKey, dateKey, formatLongDate } from "@/utils/date";

const timeInputClass =
	"rounded-md border border-neutral-300 px-2 py-2 text-sm text-neutral-900";

type ScheduleManagerProps = {
	initialMonth: string;
	initialDate: string;
	initialSchedule: AdminScheduleMonth;
	allFreeSlots: AdminScheduleAllFreeSlots;
	initialArtist: Artist[];
};

export function ScheduleManager({
	initialMonth,
	initialDate,
	initialSchedule,
	allFreeSlots,
	initialArtist: artists,
}: ScheduleManagerProps) {
	const {
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
	} = useScheduleManager({
		artists,
		initialDate,
		initialMonth,
		initialSchedule,
	});

	const artistName = (id: number | null) =>
		(id ? artists.find((artist) => artist.id === id)?.name : null) ?? "N/A";

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
							if (date) selectDate(date);
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
								{formatLongDate(selectedDate)}
							</h2>
						</div>
						<Button
							variant="secondary"
							disabled={busy}
							onClick={toggleDateBlocked}
						>
							{blocked ? "Reopen date" : "Block date"}
						</Button>
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
									{slotsForDate.map((slot) => (
										<li key={slot.id} className="space-y-3 p-3">
											<ScheduleSlotRow
												slot={slot}
												artistName={artistName(slot.artistId)}
												dateBlocked={blocked}
												busy={busy}
												editing={editingSlot === slot.id}
												onEdit={() => setEditingSlot(slot.id)}
												onCancelEdit={() => setEditingSlot(null)}
												onSubmit={(event) => submitSlot(event, slot.id)}
												onToggleAvailable={() => toggleSlotAvailable(slot)}
												onRemove={() => removeSlot(slot)}
											/>
										</li>
									))}
								</ul>
							)}
						</div>

						<div>artist: {artistName(selectedArtistId)}</div>

						<div>
							<label className="grid gap-1 text-xs font-medium text-neutral-600">
								Artist
								<select
									value={selectedArtistId ?? ""}
									onChange={(event) =>
										selectArtist(
											event.target.value === ""
												? null
												: Number(event.target.value),
										)
									}
									className={timeInputClass}
								>
									<option value="">Select an artist</option>
									{artists.map((artist) => (
										<option key={artist.id} value={artist.id}>
											{artist.name}
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
										className={timeInputClass}
									/>
								</label>
								<label className="grid gap-1 text-xs font-medium text-neutral-600">
									End
									<input
										name="endTime"
										type="time"
										required
										className={timeInputClass}
									/>
								</label>
								<Button
									type="submit"
									disabled={busy}
									className="px-3 hover:bg-neutral-700"
								>
									Add slot
								</Button>
							</form>
						)}
					</div>
				</section>

				<FreeSlotsTable slots={allFreeSlots} artists={artists} />
			</div>
		</div>
	);
}
