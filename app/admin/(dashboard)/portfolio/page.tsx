import { connection } from "next/server";
import { getArtists } from "@/services/artists";
import { getPortfolioCategories } from "@/services/portfolio";
import { PortfolioManager } from "./portfolio-manager";

export default async function AdminPortfolioPage() {
	await connection();
	const [artists, categories] = await Promise.all([
		getArtists(),
		getPortfolioCategories(),
	]);
	return <PortfolioManager artists={artists} categories={categories} />;
}
