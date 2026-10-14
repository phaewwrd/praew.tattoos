import { and, asc, eq, gte, lte } from "drizzle-orm";
import { db } from "@/app/db";
import {
	appointments,
	clients,
	scheduleDateBlocks,
	slots,
	tattooArtists,
} from "@/app/db/tattoo-schema";

export type AdminScheduleSlot = {
	artistId: number | null;
	id: number;
	date: string;
	startTime: string;
	endTime: string;
	status: "AVAILABLE" | "BOOKED" | "BLOCKED";
	appointmentStatus:
		| "PENDING_PAYMENT"
		| "CONFIRMED"
		| "COMPLETED"
		| "CANCELLED"
		| "NO_SHOW"
		| null;
	clientName: string | null;
};

export type AdminScheduleMonth = {
	slots: AdminScheduleSlot[];
	blockedDates: string[];
};

export type AdminScheduleAllFreeSlots = {
	allFreeSlots: {
		date: string;
		startTime: string;
		endTime: string;
		artistId: number;
	}[];
};

export type Artist = {
	id: number;
	name: string;
};

export async function getMainArtistId() {
	const [artist] = await db
		.select({ id: tattooArtists.id })
		.from(tattooArtists)
		.orderBy(asc(tattooArtists.id))
		.limit(1);
	return artist?.id ?? null;
}

export async function getAdminScheduleMonth(
	month: string,
): Promise<AdminScheduleMonth> {
	if (!/^\d{4}-\d{2}$/.test(month)) return { slots: [], blockedDates: [] };
	const [year, monthNumber] = month.split("-").map(Number);
	if (monthNumber < 1 || monthNumber > 12)
		return { slots: [], blockedDates: [] };
	// if (!Number.isSafeInteger(artistId) || artistId < 1)
	// 	return { slots: [], blockedDates: [] };

	const startDate = `${month}-01`;
	const endDate = `${month}-${String(new Date(year, monthNumber, 0).getDate()).padStart(2, "0")}`;

	const [slotRows, blockRows] = await Promise.all([
		db
			.select({
				id: slots.id,
				date: slots.date,
				startTime: slots.startTime,
				endTime: slots.endTime,
				status: slots.status,
				appointmentStatus: appointments.status,
				clientName: clients.name,
				artistId: slots.artistId,
			})
			.from(slots)
			.leftJoin(appointments, eq(appointments.slotId, slots.id))
			.leftJoin(clients, eq(clients.id, appointments.clientId))
			.where(and(gte(slots.date, startDate), lte(slots.date, endDate)))
			.orderBy(asc(slots.date), asc(slots.startTime)),
		db
			.select({ date: scheduleDateBlocks.date })
			.from(scheduleDateBlocks)
			.where(
				and(
					gte(scheduleDateBlocks.date, startDate),
					lte(scheduleDateBlocks.date, endDate),
				),
			)
			.orderBy(asc(scheduleDateBlocks.date)),
	]);

	return {
		slots: slotRows.map((slot) => ({
			...slot,
			startTime: slot.startTime.slice(0, 5),
			endTime: slot.endTime.slice(0, 5),
		})),
		blockedDates: blockRows.map((block) => block.date),
	};
}

export async function getAdminScheduleAllFreeSlots(): Promise<AdminScheduleAllFreeSlots> {
	const allSlots = await db
		.select({
			date: slots.date,
			startTime: slots.startTime,
			endTime: slots.endTime,
			artistId: slots.artistId,
		})
		.from(slots)
		.where(eq(slots.status, "AVAILABLE"))
		.orderBy(asc(slots.date));

	return {
		allFreeSlots: allSlots.map((slot) => ({
			date: slot.date,
			startTime: slot.startTime.slice(0, 5),
			endTime: slot.endTime.slice(0, 5),
			artistId: slot.artistId,
		})),
	};
}

export async function getAllArtists(): Promise<Artist[]> {
	return db
		.select({ id: tattooArtists.id, name: tattooArtists.name })
		.from(tattooArtists);
}

export function studioTodayKey() {
	return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(
		new Date(),
	);
}
