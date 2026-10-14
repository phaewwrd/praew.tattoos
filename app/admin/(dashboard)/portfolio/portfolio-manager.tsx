"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useRef, useState } from "react";
import type { Artist } from "@/lib/artists";
import { deletePortfolioItem } from "../artists/actions";

export function PortfolioManager({ artists }: { artists: Artist[] }) {
	const router = useRouter();
	const formRef = useRef<HTMLFormElement>(null);
	const [artistId, setArtistId] = useState(artists[0]?.id.toString() ?? "");
	const [busy, setBusy] = useState(false);
	const [message, setMessage] = useState("");
	const selectedArtist = artists.find(
		(artist) => artist.id.toString() === artistId,
	);

	async function uploadImage(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setBusy(true);
		setMessage("");

		try {
			const response = await fetch("/api/admin/artists/portfolio", {
				method: "POST",
				body: new FormData(event.currentTarget),
			});
			const result = await response.json();
			setMessage(result.ok ? "Portfolio image uploaded." : result.error);
			if (result.ok) {
				formRef.current?.reset();
				router.refresh();
			}
		} catch {
			setMessage("Unable to upload this image. Try again.");
		} finally {
			setBusy(false);
		}
	}

	async function removeImage(id: number) {
		if (!window.confirm("Delete this portfolio image?")) return;
		setBusy(true);
		const result = await deletePortfolioItem(id);
		setMessage(result.ok ? "Portfolio image deleted." : result.error);
		if (result.ok) router.refresh();
		setBusy(false);
	}

	return (
		<div className="space-y-6">
			<section>
				<h1 className="text-2xl font-semibold text-neutral-900">Portfolio</h1>
				<p className="mt-1 text-sm text-neutral-600">
					Upload and manage portfolio images by artist.
				</p>
			</section>

			{artists.length === 0 ? (
				<p className="rounded-lg border border-neutral-200 p-4 text-sm text-neutral-600">
					Add an artist before uploading portfolio images.
				</p>
			) : (
				<>
					<label className="block max-w-sm text-sm font-medium text-neutral-700">
						Artist
						<select
							value={artistId}
							onChange={(event) => setArtistId(event.target.value)}
							className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2"
						>
							{artists.map((artist) => (
								<option key={artist.id} value={artist.id}>
									{artist.name}
								</option>
							))}
						</select>
					</label>

					<form
						ref={formRef}
						onSubmit={uploadImage}
						className="grid gap-4 rounded-lg border border-neutral-200 p-4 sm:grid-cols-2"
					>
						<input type="hidden" name="artistId" value={artistId} />
						<label className="text-sm text-neutral-700">
							Title
							<input
								required
								name="title"
								maxLength={150}
								className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
							/>
						</label>
						<label className="text-sm text-neutral-700">
							Image
							<input
								required
								type="file"
								name="file"
								accept="image/jpeg,image/png,image/webp,image/gif"
								className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
							/>
						</label>
						<label className="text-sm text-neutral-700 sm:col-span-2">
							Details
							<textarea
								name="details"
								rows={2}
								maxLength={5000}
								className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
							/>
						</label>
						<div className="flex items-center gap-3 sm:col-span-2">
							<button
								type="submit"
								disabled={busy}
								className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
							>
								{busy ? "Uploading..." : "Upload image"}
							</button>
							{message && (
								<p role="status" className="text-sm text-neutral-600">
									{message}
								</p>
							)}
						</div>
					</form>

					<section>
						<div className="mb-3 flex items-baseline justify-between gap-3">
							<h2 className="text-lg font-semibold text-neutral-900">
								{selectedArtist?.name}'s work
							</h2>
							<p className="text-sm text-neutral-500">
								{selectedArtist?.portfolios.length ?? 0} images
							</p>
						</div>
						{!selectedArtist?.portfolios.length ? (
							<p className="rounded-lg border border-neutral-200 p-4 text-sm text-neutral-600">
								No portfolio images for this artist yet.
							</p>
						) : (
							<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
								{selectedArtist.portfolios.map((image) => (
									// eslint-disable-next-line @next/next/no-img-element
									<article
										key={image.id}
										className="overflow-hidden rounded-md border border-neutral-200"
									>
										{/* biome-ignore lint/performance/noImgElement: Cloudinary images are served from external URLs. */}
										<img
											src={image.imageUrl}
											alt={image.title}
											className="h-48 w-full object-cover"
										/>
										<div className="p-3">
											<h3 className="text-sm font-medium text-neutral-900">
												{image.title}
											</h3>
											{image.details && (
												<p className="mt-1 text-xs text-neutral-500">
													{image.details}
												</p>
											)}
											<button
												type="button"
												disabled={busy}
												onClick={() => void removeImage(image.id)}
												className="mt-3 text-xs font-medium text-red-700 underline disabled:opacity-50"
											>
												Delete image
											</button>
										</div>
									</article>
								))}
							</div>
						)}
					</section>
				</>
			)}
		</div>
	);
}
