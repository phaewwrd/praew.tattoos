import { connection } from "next/server";
import { getArtists } from "@/lib/artists";
import { PortfolioManager } from "./portfolio-manager";

export default async function AdminPortfolioPage() {
	await connection();
	const artists = await getArtists();
	return <PortfolioManager artists={artists} />;
}
