"use client";

import { type FormEvent, useRef, useState } from "react";
import type { Artist } from "@/lib/artists";
import {
  type ArtistInput,
  deleteArtist,
  deletePortfolioItem,
  saveArtist,
} from "./actions";

const emptyArtist: ArtistInput = { name: "", phone: "", email: "", bio: "" };

export function ArtistManager({ artists }: { artists: Artist[] }) {
  const [draft, setDraft] = useState<ArtistInput>(emptyArtist);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  function edit(artist: Artist) {
    setDraft({ id: artist.id, name: artist.name, phone: artist.phone ?? "", email: artist.email ?? "", bio: artist.bio ?? "" });
    setMessage("");
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
    if (!window.confirm(`Permanently delete ${artist.name} and their portfolio images?`)) return;
    setBusy(true);
    const result = await deleteArtist(artist.id);
    setMessage(result.ok ? "Artist deleted." : result.error);
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold text-neutral-900">Artists</h1>
        <p className="mt-1 text-sm text-neutral-600">Manage artist profiles and their portfolio images.</p>
      </section>

      <form onSubmit={submit} className="grid gap-4 rounded-lg border border-neutral-200 p-4 sm:grid-cols-2">
        <h2 className="text-sm font-semibold text-neutral-900 sm:col-span-2">{draft.id ? "Edit artist" : "Add artist"}</h2>
        <label className="text-sm text-neutral-700">Name
          <input required maxLength={100} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2" />
        </label>
        <label className="text-sm text-neutral-700">Phone
          <input maxLength={20} value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2" />
        </label>
        <label className="text-sm text-neutral-700">Email
          <input type="email" maxLength={255} value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2" />
        </label>
        <label className="text-sm text-neutral-700 sm:col-span-2">Bio
          <textarea rows={3} maxLength={5000} value={draft.bio} onChange={(event) => setDraft({ ...draft, bio: event.target.value })} className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2" />
        </label>
        <div className="flex items-center gap-3 sm:col-span-2">
          <button type="submit" disabled={busy} className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{busy ? "Saving..." : draft.id ? "Save changes" : "Create artist"}</button>
          {draft.id && <button type="button" onClick={() => setDraft(emptyArtist)} className="text-sm text-neutral-600 underline">Cancel edit</button>}
          {message && <p role="status" className="text-sm text-neutral-600">{message}</p>}
        </div>
      </form>

      <section className="space-y-4">
        {artists.length === 0 ? (
          <p className="rounded-lg border border-neutral-200 p-4 text-sm text-neutral-600">No artists yet.</p>
        ) : (
          artists.map((artist) => (
            <ArtistCard
              key={artist.id}
              artist={artist}
              expanded={expandedId === artist.id}
              busy={busy}
              onToggle={() => setExpandedId(expandedId === artist.id ? null : artist.id)}
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

function ArtistCard({
  artist,
  expanded,
  busy,
  onToggle,
  onEdit,
  onDelete,
  onBusyChange,
  onMessage,
}: {
  artist: Artist;
  expanded: boolean;
  busy: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onBusyChange: (busy: boolean) => void;
  onMessage: (message: string) => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [uploading, setUploading] = useState(false);

  async function uploadImage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploading(true);
    onBusyChange(true);
    try {
      const formData = new FormData(event.currentTarget);
      const response = await fetch(
        "/api/admin/artists/portfolio",
        {
          method: "POST",
          body: formData,
        },
      );
      const result = await response.json();
      onMessage(result.ok ? "Portfolio image uploaded." : result.error);
      if (result.ok) formRef.current?.reset();
    } catch (error) {
      console.error("Portfolio upload error:", error);
      onMessage("Failed to upload portfolio image.");
    } finally {
      setUploading(false);
      onBusyChange(false);
    }
  }

  async function removeImage(id: number) {
    if (!window.confirm("Delete this portfolio image?")) return;
    onBusyChange(true);
    const result = await deletePortfolioItem(id);
    onMessage(result.ok ? "Portfolio image deleted." : result.error);
    onBusyChange(false);
  }

  return (
    <div className="rounded-lg border border-neutral-200">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="font-medium text-neutral-900">{artist.name}</p>
          <p className="text-xs text-neutral-500">{artist.email || "No email"} · {artist.phone || "No phone"} · {artist.portfolios.length} portfolio image(s)</p>
        </div>
        <div className="flex gap-3">
          <button type="button" disabled={busy} onClick={onToggle} className="text-sm font-medium text-neutral-700 underline">{expanded ? "Hide portfolio" : "Manage portfolio"}</button>
          <button type="button" disabled={busy} onClick={onEdit} className="text-sm font-medium text-neutral-700 underline">Edit</button>
          <button type="button" disabled={busy} onClick={onDelete} className="text-sm font-medium text-red-700 underline">Delete</button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-4 border-t border-neutral-200 p-4">
          <form ref={formRef} onSubmit={uploadImage} className="grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="artistId" value={artist.id} />
            <label className="text-sm text-neutral-700">Title
              <input required name="title" maxLength={150} className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2" />
            </label>
            <label className="text-sm text-neutral-700">Image
              <input required type="file" name="file" accept="image/jpeg,image/png,image/webp,image/gif" className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2" />
            </label>
            <label className="text-sm text-neutral-700 sm:col-span-2">Details
              <textarea name="details" rows={2} maxLength={5000} className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2" />
            </label>
            <div className="sm:col-span-2">
              <button type="submit" disabled={uploading} className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{uploading ? "Uploading..." : "Upload image"}</button>
            </div>
          </form>

          {artist.portfolios.length === 0 ? (
            <p className="text-sm text-neutral-600">No portfolio images yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {artist.portfolios.map((image) => (
                // eslint-disable-next-line @next/next/no-img-element
                <div key={image.id} className="overflow-hidden rounded-md border border-neutral-200">
                  {/* biome-ignore lint/performance/noImgElement: Cloudinary images are served from external URLs. */}
                  <img src={image.imageUrl} alt={image.title} className="h-40 w-full object-cover" />
                  <div className="p-3">
                    <p className="text-sm font-medium text-neutral-900">{image.title}</p>
                    {image.details && <p className="mt-1 text-xs text-neutral-500">{image.details}</p>}
                    <button type="button" disabled={busy} onClick={() => void removeImage(image.id)} className="mt-2 text-xs font-medium text-red-700 underline">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
