"use client";

import { ArtistCard } from "@/components/features/admin/ArtistCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useArtistManager } from "@/hooks/useArtistManager";
import type { Artist } from "@/services/artists";

export function ArtistManager({ artists }: { artists: Artist[] }) {
	const {
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
	} = useArtistManager();

	return (
		<div className="space-y-6">
			<section>
				<h1 className="text-2xl font-semibold text-neutral-900">Artists</h1>
				<p className="mt-1 text-sm text-neutral-600">
					Manage artist profiles and their portfolio images.
				</p>
			</section>

			<form
				onSubmit={submit}
				className="grid gap-4 rounded-lg border border-neutral-200 p-4 sm:grid-cols-2"
			>
				<h2 className="text-sm font-semibold text-neutral-900 sm:col-span-2">
					{draft.id ? "Edit artist" : "Add artist"}
				</h2>
				<label className="text-sm text-neutral-700">
					Name
					<Input
						required
						maxLength={100}
						value={draft.name}
						onChange={(event) =>
							setDraft({ ...draft, name: event.target.value })
						}
						className="mt-1"
					/>
				</label>
				<label className="text-sm text-neutral-700">
					Phone
					<Input
						maxLength={20}
						value={draft.phone}
						onChange={(event) =>
							setDraft({ ...draft, phone: event.target.value })
						}
						className="mt-1"
					/>
				</label>
				<label className="text-sm text-neutral-700">
					Email
					<Input
						type="email"
						maxLength={255}
						value={draft.email}
						onChange={(event) =>
							setDraft({ ...draft, email: event.target.value })
						}
						className="mt-1"
					/>
				</label>
				<label className="text-sm text-neutral-700 sm:col-span-2">
					Bio
					<Textarea
						rows={3}
						maxLength={5000}
						value={draft.bio}
						onChange={(event) =>
							setDraft({ ...draft, bio: event.target.value })
						}
						className="mt-1"
					/>
				</label>
				<div className="flex items-center gap-3 sm:col-span-2">
					<Button type="submit" disabled={busy}>
						{busy ? "Saving..." : draft.id ? "Save changes" : "Create artist"}
					</Button>
					{draft.id && (
						<Button
							variant="link"
							onClick={cancelEdit}
							className="text-sm font-normal text-neutral-600"
						>
							Cancel edit
						</Button>
					)}
					{message && (
						<p role="status" className="text-sm text-neutral-600">
							{message}
						</p>
					)}
				</div>
			</form>

			<section className="space-y-4">
				{artists.length === 0 ? (
					<p className="rounded-lg border border-neutral-200 p-4 text-sm text-neutral-600">
						No artists yet.
					</p>
				) : (
					artists.map((artist) => (
						<ArtistCard
							key={artist.id}
							artist={artist}
							expanded={expandedId === artist.id}
							busy={busy}
							onToggle={() => toggleExpanded(artist.id)}
							onEdit={() => edit(artist)}
							onDelete={() => void remove(artist)}
							onBusyChange={setBusy}
							onMessage={setMessage}
						/>
					))
				)}
			</section>
		</div>
	);
}
