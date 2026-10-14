"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useRef, useState } from "react";
import {
	createPortfolioCategory,
	deletePortfolioCategory,
	deletePortfolioItem,
	setPortfolioItemCategory,
} from "@/app/admin/(dashboard)/artists/actions";
import type { Artist } from "@/services/artists";
import { uploadPortfolioImage } from "@/services/portfolioUpload";

export function usePortfolioManager(artists: Artist[]) {
	const router = useRouter();
	const formRef = useRef<HTMLFormElement>(null);
	const [artistId, setArtistId] = useState(artists[0]?.id.toString() ?? "");
	const [busy, setBusy] = useState(false);
	const [message, setMessage] = useState("");
	const [newCategory, setNewCategory] = useState("");
	const selectedArtist = artists.find(
		(artist) => artist.id.toString() === artistId,
	);

	async function addCategory(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setBusy(true);
		const result = await createPortfolioCategory(newCategory);
		setMessage(result.ok ? "Category added." : result.error);
		if (result.ok) {
			setNewCategory("");
			router.refresh();
		}
		setBusy(false);
	}

	async function removeCategory(id: number) {
		if (!window.confirm("Delete this category? Images become uncategorized."))
			return;
		setBusy(true);
		const result = await deletePortfolioCategory(id);
		setMessage(result.ok ? "Category deleted." : result.error);
		if (result.ok) router.refresh();
		setBusy(false);
	}

	async function changeCategory(id: number, value: string) {
		setBusy(true);
		const result = await setPortfolioItemCategory(
			id,
			value ? Number(value) : null,
		);
		setMessage(result.ok ? "Category updated." : result.error);
		if (result.ok) router.refresh();
		setBusy(false);
	}

	async function uploadImage(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setBusy(true);
		setMessage("");

		try {
			const result = await uploadPortfolioImage(
				new FormData(event.currentTarget),
			);
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

	return {
		addCategory,
		artistId,
		busy,
		changeCategory,
		formRef,
		message,
		newCategory,
		removeCategory,
		removeImage,
		selectedArtist,
		setArtistId,
		setNewCategory,
		uploadImage,
	};
}
