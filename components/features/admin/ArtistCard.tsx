"use client";

import Image from "next/image";
import { type FormEvent, useRef, useState } from "react";
import { deletePortfolioItem } from "@/app/admin/(dashboard)/artists/actions";
import { Button } from "@/components/ui/Button";
import type { Artist } from "@/services/artists";
import { uploadPortfolioImage } from "@/services/portfolioUpload";
import { PortfolioUploadFields } from "./PortfolioUploadFields";

type ArtistCardProps = {
	artist: Artist;
	expanded: boolean;
	busy: boolean;
	onToggle: () => void;
	onEdit: () => void;
	onDelete: () => void;
	onBusyChange: (busy: boolean) => void;
	onMessage: (message: string) => void;
};

export function ArtistCard({
	artist,
	expanded,
	busy,
	onToggle,
	onEdit,
	onDelete,
	onBusyChange,
	onMessage,
}: ArtistCardProps) {
	const formRef = useRef<HTMLFormElement>(null);
	const [uploading, setUploading] = useState(false);

	async function uploadImage(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setUploading(true);
		onBusyChange(true);
		try {
			const result = await uploadPortfolioImage(
				new FormData(event.currentTarget),
			);
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
					<p className="text-xs text-neutral-500">
						{artist.email || "No email"} · {artist.phone || "No phone"} ·{" "}
						{artist.portfolios.length} portfolio image(s)
					</p>
				</div>
				<div className="flex gap-3">
					<Button
						variant="link"
						disabled={busy}
						onClick={onToggle}
						className="text-sm"
					>
						{expanded ? "Hide portfolio" : "Manage portfolio"}
					</Button>
					<Button
						variant="link"
						disabled={busy}
						onClick={onEdit}
						className="text-sm"
					>
						Edit
					</Button>
					<Button
						variant="link"
						disabled={busy}
						onClick={onDelete}
						className="text-sm text-red-700"
					>
						Delete
					</Button>
				</div>
			</div>

			{expanded && (
				<div className="space-y-4 border-t border-neutral-200 p-4">
					<form
						ref={formRef}
						onSubmit={uploadImage}
						className="grid gap-3 sm:grid-cols-2"
					>
						<input type="hidden" name="artistId" value={artist.id} />
						<PortfolioUploadFields />
						<div className="sm:col-span-2">
							<Button type="submit" disabled={uploading}>
								{uploading ? "Uploading..." : "Upload image"}
							</Button>
						</div>
					</form>

					{artist.portfolios.length === 0 ? (
						<p className="text-sm text-neutral-600">No portfolio images yet.</p>
					) : (
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{artist.portfolios.map((image) => (
								<div
									key={image.id}
									className="overflow-hidden rounded-md border border-neutral-200"
								>
									<div className="relative h-40 w-full">
										<Image
											src={image.imageUrl}
											alt={image.title}
											fill
											sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
											className="object-cover"
										/>
									</div>
									<div className="p-3">
										<p className="text-sm font-medium text-neutral-900">
											{image.title}
										</p>
										{image.details && (
											<p className="mt-1 text-xs text-neutral-500">
												{image.details}
											</p>
										)}
										<Button
											variant="link"
											disabled={busy}
											onClick={() => void removeImage(image.id)}
											className="mt-2 text-xs text-red-700"
										>
											Delete
										</Button>
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
