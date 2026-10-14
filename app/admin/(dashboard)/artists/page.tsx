import { connection } from "next/server";
import { getArtists } from "@/services/artists";
import { ArtistManager } from "./artist-manager";

export default async function AdminArtistsPage() {
	await connection();
	const artists = await getArtists();
	return <ArtistManager artists={artists} />;
}
