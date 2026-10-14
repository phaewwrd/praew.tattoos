"use client";

import { type FormEvent, useState } from "react";
import {
	type ArtistInput,
	deleteArtist,
	saveArtist,
} from "@/app/admin/(dashboard)/artists/actions";
import type { Artist } from "@/services/artists";

const emptyArtist: ArtistInput = { name: "", phone: "", email: "", bio: "" };

export function useArtistManager() {
	const [draft, setDraft] = useState<ArtistInput>(emptyArtist);
	const [message, setMessage] = useState("");
	const [busy, setBusy] = useState(false);
	const [expandedId, setExpandedId] = useState<number | null>(null);

	function edit(artist: Artist) {
		setDraft({
			id: artist.id,
			name: artist.name,
			phone: artist.phone ?? "",
			email: artist.email ?? "",
			bio: artist.bio ?? "",
		});
		setMessage("");
	}

	function cancelEdit() {
		setDraft(emptyArtist);
	}

	function toggleExpanded(id: number) {
		setExpandedId((current) => (current === id ? null : id));
	}

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setBusy(true);
		const result = await saveArtist(draft);
		setMessage(result.ok ? "Artist saved." : result.error);
		if (result.ok) setDraft(emptyArtist);
		setBusy(false);
	}

	async function remove(artist: Artist) {
		if (
			!window.confirm(
				`Permanently delete ${artist.name} and their portfolio images?`,
			)
		)
			return;
		setBusy(true);
		const result = await deleteArtist(artist.id);
		setMessage(result.ok ? "Artist deleted." : result.error);
		setBusy(false);
	}

	return {
		busy,
		cancelEdit,
		draft,
		edit,
		expandedId,
		message,
		remove,
		setBusy,
		setDraft,
		setMessage,
		submit,
		toggleExpanded,
	};
}
