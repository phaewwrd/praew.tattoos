import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
	portfolioCategories,
	portfolios,
	tattooArtists,
} from "@/db/tattoo-schema";

export type PortfolioItem = {
	id: number;
	title: string;
	imageUrl: string;
	details: string | null;
	artistName: string;
};

export type PortfolioGroup = {
	id: number | null;
	name: string;
	items: PortfolioItem[];
};

export type PortfolioCategory = {
	id: number;
	name: string;
};

export async function getPortfolioCategories(): Promise<PortfolioCategory[]> {
	return db
		.select({ id: portfolioCategories.id, name: portfolioCategories.name })
		.from(portfolioCategories)
		.orderBy(asc(portfolioCategories.name));
}

export async function getPortfolioGallery(): Promise<PortfolioGroup[]> {
	const rows = await db
		.select({
			categoryId: portfolios.categoryId,
			categoryName: portfolioCategories.name,
			artistName: tattooArtists.name,
			id: portfolios.id,
			title: portfolios.title,
			imageUrl: portfolios.imageUrl,
			details: portfolios.details,
		})
		.from(portfolios)
		.innerJoin(tattooArtists, eq(portfolios.artistId, tattooArtists.id))
		.leftJoin(
			portfolioCategories,
			eq(portfolios.categoryId, portfolioCategories.id),
		)
		.orderBy(asc(portfolioCategories.name), asc(portfolios.createdAt));

	const groups = new Map<number | null, PortfolioGroup>();
	for (const row of rows) {
		let group = groups.get(row.categoryId);
		if (!group) {
			group = {
				id: row.categoryId,
				name: row.categoryName ?? "Other work",
				items: [],
			};
			groups.set(row.categoryId, group);
		}
		group.items.push({
			id: row.id,
			title: row.title,
			imageUrl: row.imageUrl,
			details: row.details,
			artistName: row.artistName,
		});
	}

	// Uncategorized work goes last.
	return Array.from(groups.values()).sort(
		(a, b) => Number(a.id === null) - Number(b.id === null),
	);
}
