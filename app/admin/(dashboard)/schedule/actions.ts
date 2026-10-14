"use server";

import { and, eq, gt, lt, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/app/db";
import {
	appointments,
	scheduleDateBlocks,
	slots,
	tattooArtists,
} from "@/app/db/tattoo-schema";
import { requireAdminSession } from "@/lib/admin-auth";

type SlotInput = {
	artistId: number;
	date: string;
	startTime: string;
	endTime: string;
};
type ActionResult = { ok: true } | { ok: false; error: string };

function validArtistId(value: unknown): value is number {
	return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

function validDate(value: string) {
	if (typeof value !== "string") return false;
	if (!DATE_PATTERN.test(value)) return false;
	const parsed = new Date(`${value}T00:00:00.000Z`);
	return (
		!Number.isNaN(parsed.getTime()) &&
		parsed.toISOString().slice(0, 10) === value
	);
}

function validateSlot(input: SlotInput): ActionResult | null {
	if (
		!input ||
		typeof input !== "object" ||
		!validArtistId(input.artistId) ||
		typeof input.date !== "string" ||
		typeof input.startTime !== "string" ||
		typeof input.endTime !== "string"
	) {
		return {
			ok: false,
			error: "Choose an artist and enter a valid date and start/end time.",
		};
	}
	if (
		!validDate(input.date) ||
		!TIME_PATTERN.test(input.startTime) ||
		!TIME_PATTERN.test(input.endTime)
	) {
		return { ok: false, error: "Enter a valid date and start/end time." };
	}
	if (
		input.date <
		new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(
			new Date(),
		)
	) {
		return { ok: false, error: "Past dates cannot be added to the schedule." };
	}
	if (input.endTime <= input.startTime) {
		return {
			ok: false,
			error: "The end time must be later than the start time.",
		};
	}
	return null;
}

async function lockArtist(
	tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
	artistId: number,
) {
	const [artist] = await tx
		.select({ id: tattooArtists.id })
		.from(tattooArtists)
		.where(eq(tattooArtists.id, artistId))
		.for("update");
	return Boolean(artist);
}

async function checkOpenDate(
	tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
	artistId: number,
	date: string,
) {
	const [blocked] = await tx
		.select({ date: scheduleDateBlocks.date })
		.from(scheduleDateBlocks)
		.where(
			and(
				eq(scheduleDateBlocks.artistId, artistId),
				eq(scheduleDateBlocks.date, date),
			),
		)
		.limit(1);
	return !blocked;
}

async function hasOverlap(
	tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
	input: SlotInput,
	artistId: number,
	slotId?: number,
) {
	const filters = [
		eq(slots.artistId, artistId),
		eq(slots.date, input.date),
		lt(slots.startTime, `${input.endTime}:00`),
		gt(slots.endTime, `${input.startTime}:00`),
	];
	if (slotId !== undefined) filters.push(ne(slots.id, slotId));
	const [conflict] = await tx
		.select({ id: slots.id })
		.from(slots)
		.where(and(...filters))
		.limit(1);
	return Boolean(conflict);
}

function revalidateSchedule() {
	revalidatePath("/admin/schedule");
	revalidatePath("/", "page");
}

export async function getScheduleMonthAction(month: string, artistId: number) {
	await requireAdminSession();
	if (typeof month !== "string" || !validArtistId(artistId))
		return { slots: [], blockedDates: [] };
	const { getAdminScheduleMonth } = await import("@/lib/admin-schedule");
	return getAdminScheduleMonth(month);
}

export async function createScheduleSlot(
	input: SlotInput,
): Promise<ActionResult> {
	await requireAdminSession();
	const invalid = validateSlot(input);
	if (invalid) return invalid;

	const artistId = input.artistId;
	console.log(input);
	try {
		const result = await db.transaction(async (tx) => {
			if (!(await lockArtist(tx, artistId)))
				return { ok: false as const, error: "Artist profile not found." };
			if (!(await checkOpenDate(tx, artistId, input.date)))
				return { ok: false as const, error: "This date is blocked." };
			if (await hasOverlap(tx, input, artistId))
				return {
					ok: false as const,
					error: "This time overlaps another slot.",
				};
			await tx.insert(slots).values({
				artistId,
				date: input.date,
				startTime: `${input.startTime}:00`,
				endTime: `${input.endTime}:00`,
				status: "AVAILABLE",
			});
			return { ok: true as const };
		});
		if (!result.ok) return result;
	} catch (err) {
		console.error("createScheduleSlot failed:", err);
		return {
			ok: false,
			error:
				"Unable to create this slot. Check for a duplicate time and try again.",
		};
	}

	revalidateSchedule();
	return { ok: true };
}

export async function updateScheduleSlot(
	slotId: number,
	input: SlotInput,
): Promise<ActionResult> {
	await requireAdminSession();
	const invalid = validateSlot(input);
	if (invalid) return invalid;
	if (!Number.isSafeInteger(slotId) || slotId < 1)
		return { ok: false, error: "Choose a valid slot." };

	try {
		const result = await db.transaction(async (tx) => {
			const [existing] = await tx
				.select({ id: slots.id, artistId: slots.artistId })
				.from(slots)
				.where(eq(slots.id, slotId))
				.for("update");
			if (!existing) return { ok: false as const, error: "Slot not found." };
			const artistId = existing.artistId;
			if (!(await lockArtist(tx, artistId)))
				return { ok: false as const, error: "Artist profile not found." };
			const [appointment] = await tx
				.select({ id: appointments.id })
				.from(appointments)
				.where(eq(appointments.slotId, slotId))
				.limit(1);
			if (appointment)
				return { ok: false as const, error: "Booked slots cannot be edited." };
			if (!(await checkOpenDate(tx, artistId, input.date)))
				return { ok: false as const, error: "This date is blocked." };
			if (await hasOverlap(tx, input, artistId, slotId))
				return {
					ok: false as const,
					error: "This time overlaps another slot.",
				};
			await tx
				.update(slots)
				.set({
					date: input.date,
					startTime: `${input.startTime}:00`,
					endTime: `${input.endTime}:00`,
				})
				.where(eq(slots.id, slotId));
			return { ok: true as const };
		});
		if (!result.ok) return result;
	} catch {
		return { ok: false, error: "Unable to update this slot. Try again." };
	}

	revalidateSchedule();
	return { ok: true };
}

export async function setScheduleSlotAvailable(
	slotId: number,
	available: boolean,
): Promise<ActionResult> {
	await requireAdminSession();
	if (!Number.isSafeInteger(slotId) || slotId < 1)
		return { ok: false, error: "Choose a valid slot." };
	if (typeof available !== "boolean")
		return { ok: false, error: "Choose a valid slot status." };

	try {
		const result = await db.transaction(async (tx) => {
			const [slot] = await tx
				.select({ id: slots.id, date: slots.date, artistId: slots.artistId })
				.from(slots)
				.where(eq(slots.id, slotId))
				.for("update");
			if (!slot) return { ok: false as const, error: "Slot not found." };
			const artistId = slot.artistId;
			if (!(await lockArtist(tx, artistId)))
				return { ok: false as const, error: "Artist profile not found." };
			const [appointment] = await tx
				.select({ id: appointments.id })
				.from(appointments)
				.where(eq(appointments.slotId, slotId))
				.limit(1);
			if (appointment)
				return { ok: false as const, error: "Booked slots cannot be changed." };
			if (available && !(await checkOpenDate(tx, artistId, slot.date)))
				return { ok: false as const, error: "This date is blocked." };
			await tx
				.update(slots)
				.set({ status: available ? "AVAILABLE" : "BLOCKED" })
				.where(eq(slots.id, slotId));
			return { ok: true as const };
		});
		if (!result.ok) return result;
	} catch {
		return { ok: false, error: "Unable to change this slot. Try again." };
	}

	revalidateSchedule();
	return { ok: true };
}

export async function deleteScheduleSlot(
	slotId: number,
): Promise<ActionResult> {
	await requireAdminSession();
	if (!Number.isSafeInteger(slotId) || slotId < 1)
		return { ok: false, error: "Choose a valid slot." };

	try {
		const result = await db.transaction(async (tx) => {
			const [slot] = await tx
				.select({ id: slots.id, artistId: slots.artistId })
				.from(slots)
				.where(eq(slots.id, slotId))
				.for("update");
			if (!slot) return { ok: false as const, error: "Slot not found." };
			if (!(await lockArtist(tx, slot.artistId)))
				return { ok: false as const, error: "Artist profile not found." };
			const [appointment] = await tx
				.select({ id: appointments.id })
				.from(appointments)
				.where(eq(appointments.slotId, slotId))
				.limit(1);
			if (appointment)
				return { ok: false as const, error: "Booked slots cannot be removed." };
			await tx.delete(slots).where(eq(slots.id, slotId));
			return { ok: true as const };
		});
		if (!result.ok) return result;
	} catch {
		return { ok: false, error: "Unable to remove this slot. Try again." };
	}

	revalidateSchedule();
	return { ok: true };
}

export async function setScheduleDateBlocked(
	date: string,
	blocked: boolean,
	artistId: number,
): Promise<ActionResult> {
	await requireAdminSession();
	if (!validDate(date)) return { ok: false, error: "Choose a valid date." };
	if (typeof blocked !== "boolean")
		return { ok: false, error: "Choose a valid date status." };
	if (!validArtistId(artistId))
		return { ok: false, error: "Choose a valid artist." };
	if (
		blocked &&
		date <
			new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(
				new Date(),
			)
	) {
		return { ok: false, error: "Past dates cannot be blocked from booking." };
	}

	try {
		const result = await db.transaction(async (tx) => {
			if (!(await lockArtist(tx, artistId)))
				return { ok: false as const, error: "Artist profile not found." };
			if (blocked) {
				await tx
					.insert(scheduleDateBlocks)
					.values({ artistId, date })
					.onConflictDoNothing();
			} else {
				await tx
					.delete(scheduleDateBlocks)
					.where(
						and(
							eq(scheduleDateBlocks.artistId, artistId),
							eq(scheduleDateBlocks.date, date),
						),
					);
			}
			return { ok: true as const };
		});
		if (!result.ok) return result;
	} catch {
		return { ok: false, error: "Unable to change this date. Try again." };
	}

	revalidateSchedule();
	return { ok: true };
}
