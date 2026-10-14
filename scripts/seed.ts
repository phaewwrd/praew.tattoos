import "dotenv/config";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { slots, tattooArtists, tattooServices } from "@/db/tattoo-schema";

const serviceSeeds = [
	{
		id: "fine-line",
		name: "Fine Line Tattoo",
		slug: "fine-line-tattoo",
		description:
			"Delicate, considered linework for small to medium custom pieces.",
		priceFrom: 2500,
		depositAmount: 1000,
		durationMinutes: 90,
		isActive: true,
		sortOrder: 1,
	},
	{
		id: "ornamental",
		name: "Ornamental Tattoo",
		slug: "ornamental-tattoo",
		description:
			"Flowing decorative designs composed for the placement and body.",
		priceFrom: 4000,
		depositAmount: 1000,
		durationMinutes: 180,
		isActive: true,
		sortOrder: 2,
	},
	{
		id: "custom-color",
		name: "Custom Color Tattoo",
		slug: "custom-color-tattoo",
		description:
			"Color-focused work, discussed and designed for each individual piece.",
		priceFrom: 5000,
		depositAmount: 1500,
		durationMinutes: 240,
		isActive: true,
		sortOrder: 3,
	},
	{
		id: "guest-flash",
		name: "Guest Flash",
		slug: "guest-flash",
		description: "A limited guest-artist offering.",
		priceFrom: 0,
		depositAmount: 0,
		durationMinutes: 60,
		isActive: false,
		sortOrder: 4,
	},
] as const;

const slotSeeds = [
	{ date: "2026-10-02", startTime: "11:00:00", endTime: "12:30:00" },
	{ date: "2026-10-02", startTime: "13:30:00", endTime: "15:00:00" },
	{ date: "2026-10-02", startTime: "16:00:00", endTime: "17:30:00" },
	{ date: "2026-10-04", startTime: "10:30:00", endTime: "12:00:00" },
	{ date: "2026-10-04", startTime: "14:00:00", endTime: "15:30:00" },
	{ date: "2026-10-08", startTime: "11:00:00", endTime: "12:30:00" },
	{ date: "2026-10-08", startTime: "15:30:00", endTime: "17:00:00" },
	{ date: "2026-10-08", startTime: "17:30:00", endTime: "19:00:00" },
	{ date: "2026-10-11", startTime: "12:00:00", endTime: "13:30:00" },
	{ date: "2026-10-11", startTime: "14:30:00", endTime: "16:00:00" },
	{ date: "2026-10-16", startTime: "10:30:00", endTime: "12:00:00" },
	{ date: "2026-10-16", startTime: "13:00:00", endTime: "14:30:00" },
	{ date: "2026-10-16", startTime: "16:30:00", endTime: "18:00:00" },
	{ date: "2026-10-21", startTime: "11:30:00", endTime: "13:00:00" },
	{ date: "2026-10-21", startTime: "14:00:00", endTime: "15:30:00" },
	{ date: "2026-10-25", startTime: "10:30:00", endTime: "12:00:00" },
	{ date: "2026-10-25", startTime: "13:30:00", endTime: "15:00:00" },
	{ date: "2026-10-25", startTime: "16:00:00", endTime: "17:30:00" },
] as const;

async function ensureArtist() {
	const existing = await db
		.select({ id: tattooArtists.id })
		.from(tattooArtists)
		.limit(1);
	if (existing[0]) return existing[0].id;

	const inserted = await db
		.insert(tattooArtists)
		.values({
			name: "Praew",
			email: "hello@praew.tattoos",
			phone: "-",
			bio: "Fine line and ornamental tattoo artist.",
		})
		.returning({ id: tattooArtists.id });

	return inserted[0].id;
}

async function seedServices() {
	for (const service of serviceSeeds) {
		await db
			.insert(tattooServices)
			.values({
				...service,
				priceFrom: service.priceFrom.toFixed(2),
				depositAmount: service.depositAmount.toFixed(2),
			})
			.onConflictDoUpdate({
				target: tattooServices.id,
				set: {
					name: service.name,
					slug: service.slug,
					description: service.description,
					priceFrom: service.priceFrom.toFixed(2),
					depositAmount: service.depositAmount.toFixed(2),
					durationMinutes: service.durationMinutes,
					isActive: service.isActive,
					sortOrder: service.sortOrder,
					updatedAt: new Date(),
				},
			});
	}
}

async function seedSlots(artistId: number) {
	for (const slot of slotSeeds) {
		const exists = await db
			.select({ id: slots.id })
			.from(slots)
			.where(
				and(
					eq(slots.artistId, artistId),
					eq(slots.date, slot.date),
					eq(slots.startTime, slot.startTime),
				),
			)
			.limit(1);

		if (exists[0]) continue;

		await db.insert(slots).values({
			artistId,
			date: slot.date,
			startTime: slot.startTime,
			endTime: slot.endTime,
			status: "AVAILABLE",
		});
	}
}

async function main() {
	const artistId = await ensureArtist();
	await seedServices();
	await seedSlots(artistId);
	console.log("Seed complete: tattoo services and slots are up to date.");
}

main().catch((error) => {
	console.error("Seed failed", error);
	process.exitCode = 1;
});
