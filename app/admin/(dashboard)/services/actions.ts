"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { appointments, tattooServices } from "@/db/tattoo-schema";
import { requireAdminSession } from "@/lib/admin-auth";
import type { MutationResult } from "@/types/actions";

export type ServiceInput = {
	id?: string;
	name: string;
	description: string;
	priceFrom: number;
	depositAmount: number;
	durationMinutes: number;
	sortOrder: number;
	isActive: boolean;
};

function validateService(input: ServiceInput): string | null {
	if (!input || typeof input !== "object")
		return "Enter valid service details.";
	if (
		typeof input.name !== "string" ||
		!input.name.trim() ||
		input.name.trim().length > 150
	)
		return "Service name is required (maximum 150 characters).";
	if (typeof input.description !== "string" || input.description.length > 10000)
		return "Description must be 10,000 characters or fewer.";
	if (
		!Number.isFinite(input.priceFrom) ||
		input.priceFrom < 0 ||
		Math.round(input.priceFrom * 100) !== input.priceFrom * 100
	)
		return "Starting price must be 0 or more with at most 2 decimal places.";
	if (
		!Number.isFinite(input.depositAmount) ||
		input.depositAmount < 0 ||
		Math.round(input.depositAmount * 100) !== input.depositAmount * 100
	)
		return "Deposit must be 0 or more with at most 2 decimal places.";
	if (
		!Number.isSafeInteger(input.durationMinutes) ||
		input.durationMinutes < 1 ||
		input.durationMinutes > 1440
	)
		return "Duration must be between 1 and 1,440 minutes.";
	if (!Number.isSafeInteger(input.sortOrder) || input.sortOrder < 0)
		return "Sort order must be 0 or greater.";
	if (typeof input.isActive !== "boolean") return "Choose an active status.";
	return null;
}

function serviceSlug(value: string) {
	return (
		value
			.toLowerCase()
			.trim()
			.normalize("NFKD")
			.replace(/[\u0300-\u036f]/g, "")
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-|-$/g, "")
			.slice(0, 160) || "service"
	);
}

function revalidateServices() {
	revalidatePath("/admin/services");
	revalidatePath("/", "page");
}

export async function saveService(
	input: ServiceInput,
): Promise<MutationResult> {
	await requireAdminSession();

	const invalid = validateService(input);
	if (invalid) {
		return { ok: false, error: invalid };
	}

	try {
		if (input.id) {
			if (typeof input.id !== "string" || input.id.length > 100) {
				return {
					ok: false,
					error: "Choose a valid service.",
				};
			}

			const [existing] = await db
				.select({
					id: tattooServices.id,
					slug: tattooServices.slug,
				})
				.from(tattooServices)
				.where(eq(tattooServices.id, input.id))
				.limit(1);

			if (!existing) {
				return {
					ok: false,
					error: "Service not found.",
				};
			}

			const slug =
				existing.slug === serviceSlug(input.name)
					? existing.slug
					: `${serviceSlug(input.name)}-${input.id
							.toLowerCase()
							.replace(/[^a-z0-9]/g, "")
							.slice(-8)}`;

			await db
				.update(tattooServices)
				.set({
					name: input.name.trim(),
					description: input.description.trim(),
					priceFrom: input.priceFrom.toFixed(2),
					depositAmount: input.depositAmount.toFixed(2),
					durationMinutes: input.durationMinutes,
					sortOrder: input.sortOrder,
					isActive: input.isActive,
					slug,
				})
				.where(eq(tattooServices.id, input.id));
		} else {
			const id = crypto.randomUUID();

			await db.insert(tattooServices).values({
				id,
				name: input.name.trim(),
				description: input.description.trim(),
				priceFrom: input.priceFrom.toFixed(2),
				depositAmount: input.depositAmount.toFixed(2),
				durationMinutes: input.durationMinutes,
				sortOrder: input.sortOrder,
				isActive: input.isActive,
				slug: `${serviceSlug(input.name)}-${id.slice(0, 8)}`,
			});
		}
	} catch (error) {
		console.error("❌ saveService error:", error);

		return {
			ok: false,
			error:
				error instanceof Error
					? error.message
					: "Unable to save this service. Try again.",
		};
	}

	revalidateServices();

	return { ok: true };
}

// export async function saveService(input: ServiceInput): Promise<MutationResult> {
//   await requireAdminSession();
//   const invalid = validateService(input);
//   if (invalid) return { ok: false, error: invalid };

//   try {
//     if (input.id) {
//       if (typeof input.id !== "string" || input.id.length > 100) return { ok: false, error: "Choose a valid service." };
//       const [existing] = await db.select({ id: tattooServices.id, slug: tattooServices.slug }).from(tattooServices).where(eq(tattooServices.id, input.id)).limit(1);
//       if (!existing) return { ok: false, error: "Service not found." };
//       const slug = existing.slug === serviceSlug(input.name) ? existing.slug : `${serviceSlug(input.name)}-${input.id.toLowerCase().replace(/[^a-z0-9]/g, "").slice(-8)}`;
//       await db.update(tattooServices).set({
//         name: input.name.trim(), description: input.description.trim(), priceFrom: input.priceFrom.toFixed(2),
//         depositAmount: input.depositAmount.toFixed(2), durationMinutes: input.durationMinutes,
//         sortOrder: input.sortOrder, isActive: input.isActive, slug,
//       }).where(eq(tattooServices.id, input.id));
//     } else {
//       const id = crypto.randomUUID();
//       await db.insert(tattooServices).values({
//         id, name: input.name.trim(), description: input.description.trim(),
//         priceFrom: input.priceFrom.toFixed(2), depositAmount: input.depositAmount.toFixed(2),
//         durationMinutes: input.durationMinutes, sortOrder: input.sortOrder,
//         isActive: input.isActive, slug: `${serviceSlug(input.name)}-${id.slice(0, 8)}`,
//       });
//     }
//   } catch {
//     return { ok: false, error: "Unable to save this service. Try again." };
//   }
//   revalidateServices();
//   return { ok: true };
// }

export async function setServiceActive(
	id: string,
	isActive: boolean,
): Promise<MutationResult> {
	await requireAdminSession();
	if (
		typeof id !== "string" ||
		!id ||
		id.length > 100 ||
		typeof isActive !== "boolean"
	)
		return { ok: false, error: "Choose a valid service and status." };
	try {
		const updated = await db
			.update(tattooServices)
			.set({ isActive })
			.where(eq(tattooServices.id, id))
			.returning({ id: tattooServices.id });
		if (!updated.length) return { ok: false, error: "Service not found." };
	} catch {
		return { ok: false, error: "Unable to change this service. Try again." };
	}
	revalidateServices();
	return { ok: true };
}

export async function deleteService(id: string): Promise<MutationResult> {
	await requireAdminSession();
	if (typeof id !== "string" || !id || id.length > 100)
		return { ok: false, error: "Choose a valid service." };
	try {
		const [service] = await db
			.select({ id: tattooServices.id, isActive: tattooServices.isActive })
			.from(tattooServices)
			.where(eq(tattooServices.id, id))
			.limit(1);
		if (!service) return { ok: false, error: "Service not found." };
		if (service.isActive)
			return {
				ok: false,
				error: "Deactivate this service before deleting it.",
			};
		const references = await db
			.select({ count: sql<number>`count(*)::int` })
			.from(appointments)
			.where(sql`${appointments.details} = ${`Service ID: ${id}`}`);
		if (references[0]?.count)
			return {
				ok: false,
				error:
					"This service is in booking history. Deactivate it to preserve those records.",
			};
		const deleted = await db
			.delete(tattooServices)
			.where(and(eq(tattooServices.id, id), eq(tattooServices.isActive, false)))
			.returning({ id: tattooServices.id });
		if (!deleted.length)
			return { ok: false, error: "Unable to delete this service. Try again." };
	} catch {
		return {
			ok: false,
			error: "Unable to delete this service. Deactivate it first or try again.",
		};
	}
	revalidateServices();
	return { ok: true };
}
