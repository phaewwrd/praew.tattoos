import { asc, eq } from "drizzle-orm";
import { db } from "@/app/db";
import { portfolios, tattooArtists } from "@/app/db/tattoo-schema";

export type PortfolioImage = {
	id: number;
	title: string;
	imageUrl: string;
	imagePublicId: string | null;
	details: string | null;
};

export type Artist = {
	id: number;
	name: string;
	phone: string | null;
	email: string | null;
	bio: string | null;
	portfolios: PortfolioImage[];
};

export async function getArtists(): Promise<Artist[]> {
	const [artistRows, portfolioRows] = await Promise.all([
		db
			.select({
				id: tattooArtists.id,
				name: tattooArtists.name,
				phone: tattooArtists.phone,
				email: tattooArtists.email,
				bio: tattooArtists.bio,
			})
			.from(tattooArtists)
			.orderBy(asc(tattooArtists.name)),
		db
			.select({
				id: portfolios.id,
				artistId: portfolios.artistId,
				title: portfolios.title,
				imageUrl: portfolios.imageUrl,
				imagePublicId: portfolios.imagePublicId,
				details: portfolios.details,
			})
			.from(portfolios)
			.orderBy(asc(portfolios.createdAt)),
	]);

	return artistRows.map((artist) => ({
		...artist,
		portfolios: portfolioRows
			.filter((item) => item.artistId === artist.id)
			.map(({ id, title, imageUrl, imagePublicId, details }) => ({
				id,
				title,
				imageUrl,
				imagePublicId,
				details,
			})),
	}));
}

export async function getArtistById(id: number): Promise<Artist | null> {
	const [artist] = await db
		.select({
			id: tattooArtists.id,
			name: tattooArtists.name,
			phone: tattooArtists.phone,
			email: tattooArtists.email,
			bio: tattooArtists.bio,
		})
		.from(tattooArtists)
		.where(eq(tattooArtists.id, id))
		.limit(1);

	if (!artist) return null;

	const portfolioRows = await db
		.select({
			id: portfolios.id,
			title: portfolios.title,
			imageUrl: portfolios.imageUrl,
			imagePublicId: portfolios.imagePublicId,
			details: portfolios.details,
		})
		.from(portfolios)
		.where(eq(portfolios.artistId, id))
		.orderBy(asc(portfolios.createdAt));

	return { ...artist, portfolios: portfolioRows };
}
