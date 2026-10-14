"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/app/db";
import {
	portfolioCategories,
	portfolios,
	tattooArtists,
} from "@/app/db/tattoo-schema";
import { requireAdminSession } from "@/lib/admin-auth";
import { deletePortfolioImage, uploadPortfolioImage } from "@/lib/cloudinary";
import type { MutationResult } from "../services/actions";

export type ArtistInput = {
	id?: number;
	name: string;
	phone: string;
	email: string;
	bio: string;
};

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/gif",
]);

function validateArtist(input: ArtistInput): string | null {
	if (!input || typeof input !== "object") return "Enter valid artist details.";
	if (
		typeof input.name !== "string" ||
		!input.name.trim() ||
		input.name.trim().length > 100
	)
		return "Name is required (maximum 100 characters).";
	if (typeof input.phone !== "string" || input.phone.trim().length > 20)
		return "Phone must be 20 characters or fewer.";
	if (typeof input.email !== "string" || input.email.trim().length > 255)
		return "Email must be 255 characters or fewer.";
	if (
		input.email.trim() &&
		!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())
	)
		return "Enter a valid email address.";
	if (typeof input.bio !== "string" || input.bio.length > 5000)
		return "Bio must be 5,000 characters or fewer.";
	return null;
}

function revalidateArtists() {
	revalidatePath("/admin/artists");
	revalidatePath("/admin/portfolio");
	revalidatePath("/", "page");
}

export async function saveArtist(input: ArtistInput): Promise<MutationResult> {
	await requireAdminSession();

	const invalid = validateArtist(input);
	if (invalid) return { ok: false, error: invalid };

	const values = {
		name: input.name.trim(),
		phone: input.phone.trim() || null,
		email: input.email.trim() || null,
		bio: input.bio.trim() || null,
	};

	try {
		if (input.id !== undefined) {
			if (!Number.isSafeInteger(input.id) || input.id < 1)
				return { ok: false, error: "Choose a valid artist." };
			const updated = await db
				.update(tattooArtists)
				.set(values)
				.where(eq(tattooArtists.id, input.id))
				.returning({ id: tattooArtists.id });
			if (!updated.length) return { ok: false, error: "Artist not found." };
		} else {
			await db.insert(tattooArtists).values(values);
		}
	} catch {
		return { ok: false, error: "Unable to save this artist. Try again." };
	}

	revalidateArtists();
	return { ok: true };
}

export async function deleteArtist(id: number): Promise<MutationResult> {
	await requireAdminSession();
	if (!Number.isSafeInteger(id) || id < 1)
		return { ok: false, error: "Choose a valid artist." };

	try {
		const images = await db
			.select({ imagePublicId: portfolios.imagePublicId })
			.from(portfolios)
			.where(eq(portfolios.artistId, id));

		const deleted = await db
			.delete(tattooArtists)
			.where(eq(tattooArtists.id, id))
			.returning({ id: tattooArtists.id });
		if (!deleted.length) return { ok: false, error: "Artist not found." };

		await Promise.all(
			images
				.map((image) => image.imagePublicId)
				.filter((publicId): publicId is string => Boolean(publicId))
				.map((publicId) =>
					deletePortfolioImage(publicId).catch(() => undefined),
				),
		);
	} catch {
		return { ok: false, error: "Unable to delete this artist. Try again." };
	}

	revalidateArtists();
	return { ok: true };
}

export async function addPortfolioImage(
	formData: FormData,
): Promise<MutationResult> {
	await requireAdminSession();

	const artistId = Number(formData.get("artistId"));
	const title = String(formData.get("title") ?? "");
	const details = String(formData.get("details") ?? "");
	const categoryValue = String(formData.get("categoryId") ?? "");
	const categoryId = categoryValue ? Number(categoryValue) : null;
	const file = formData.get("file");

	if (!Number.isSafeInteger(artistId) || artistId < 1)
		return { ok: false, error: "Choose a valid artist." };
	if (
		categoryId !== null &&
		(!Number.isSafeInteger(categoryId) || categoryId < 1)
	)
		return { ok: false, error: "Choose a valid category." };
	if (!title.trim() || title.trim().length > 150)
		return { ok: false, error: "Title is required (maximum 150 characters)." };
	if (details.length > 5000)
		return { ok: false, error: "Details must be 5,000 characters or fewer." };
	if (!(file instanceof File) || file.size === 0)
		return { ok: false, error: "Choose an image to upload." };
	if (!ALLOWED_IMAGE_TYPES.has(file.type))
		return {
			ok: false,
			error: "Only JPEG, PNG, WEBP, or GIF images are supported.",
		};
	if (file.size > MAX_IMAGE_BYTES)
		return { ok: false, error: "Image must be 8MB or smaller." };

	try {
		const [artist] = await db
			.select({ id: tattooArtists.id })
			.from(tattooArtists)
			.where(eq(tattooArtists.id, artistId))
			.limit(1);
		if (!artist) return { ok: false, error: "Artist not found." };

		const buffer = Buffer.from(await file.arrayBuffer());
		const uploaded = await uploadPortfolioImage(buffer);

		await db.insert(portfolios).values({
			artistId,
			categoryId,
			title: title.trim(),
			details: details.trim() || null,
			imageUrl: uploaded.url,
			imagePublicId: uploaded.publicId,
		});
	} catch {
		return { ok: false, error: "Unable to upload this image. Try again." };
	}

	revalidateArtists();
	return { ok: true };
}

export async function createPortfolioCategory(
	name: string,
): Promise<MutationResult> {
	await requireAdminSession();
	const trimmed = typeof name === "string" ? name.trim() : "";
	if (!trimmed || trimmed.length > 80)
		return { ok: false, error: "Name is required (maximum 80 characters)." };

	try {
		const inserted = await db
			.insert(portfolioCategories)
			.values({ name: trimmed })
			.onConflictDoNothing()
			.returning({ id: portfolioCategories.id });
		if (!inserted.length)
			return { ok: false, error: "That category already exists." };
	} catch {
		return { ok: false, error: "Unable to save this category. Try again." };
	}

	revalidateArtists();
	return { ok: true };
}

export async function deletePortfolioCategory(
	id: number,
): Promise<MutationResult> {
	await requireAdminSession();
	if (!Number.isSafeInteger(id) || id < 1)
		return { ok: false, error: "Choose a valid category." };

	try {
		const deleted = await db
			.delete(portfolioCategories)
			.where(eq(portfolioCategories.id, id))
			.returning({ id: portfolioCategories.id });
		if (!deleted.length) return { ok: false, error: "Category not found." };
	} catch {
		return { ok: false, error: "Unable to delete this category. Try again." };
	}

	revalidateArtists();
	return { ok: true };
}

export async function setPortfolioItemCategory(
	id: number,
	categoryId: number | null,
): Promise<MutationResult> {
	await requireAdminSession();
	if (!Number.isSafeInteger(id) || id < 1)
		return { ok: false, error: "Choose a valid portfolio image." };
	if (
		categoryId !== null &&
		(!Number.isSafeInteger(categoryId) || categoryId < 1)
	)
		return { ok: false, error: "Choose a valid category." };

	try {
		const updated = await db
			.update(portfolios)
			.set({ categoryId })
			.where(eq(portfolios.id, id))
			.returning({ id: portfolios.id });
		if (!updated.length)
			return { ok: false, error: "Portfolio image not found." };
	} catch {
		return { ok: false, error: "Unable to update this image. Try again." };
	}

	revalidateArtists();
	return { ok: true };
}

export async function deletePortfolioItem(id: number): Promise<MutationResult> {
	await requireAdminSession();
	if (!Number.isSafeInteger(id) || id < 1)
		return { ok: false, error: "Choose a valid portfolio image." };

	try {
		const deleted = await db
			.delete(portfolios)
			.where(eq(portfolios.id, id))
			.returning({ imagePublicId: portfolios.imagePublicId });
		if (!deleted.length)
			return { ok: false, error: "Portfolio image not found." };

		const [{ imagePublicId } = { imagePublicId: null }] = deleted;
		if (imagePublicId)
			await deletePortfolioImage(imagePublicId).catch(() => undefined);
	} catch {
		return { ok: false, error: "Unable to delete this image. Try again." };
	}

	revalidateArtists();
	return { ok: true };
}
