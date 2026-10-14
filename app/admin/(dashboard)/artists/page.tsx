import { connection } from "next/server";
import { ArtistManager } from "./artist-manager";
import { getArtists } from "@/lib/artists";

export default async function AdminArtistsPage() {
  await connection();
  const artists = await getArtists();
  return <ArtistManager artists={artists} />;
}
