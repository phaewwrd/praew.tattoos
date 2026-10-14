"use client";

import { type FormEvent, useState } from "react";
import {
	deleteService,
	type ServiceInput,
	saveService,
	setServiceActive,
} from "@/app/admin/(dashboard)/services/actions";
import type { TattooService } from "@/services/services";

const DEFAULT_DURATION_MINUTES = 60;

const emptyService: ServiceInput = {
	name: "",
	description: "",
	priceFrom: 0,
	depositAmount: 0,
	durationMinutes: DEFAULT_DURATION_MINUTES,
	sortOrder: 0,
	isActive: true,
};

export function useServiceManager() {
	const [draft, setDraft] = useState<ServiceInput>(emptyService);
	const [message, setMessage] = useState("");
	const [busy, setBusy] = useState(false);

	function edit(service: TattooService) {
		setDraft({
			id: service.id,
			name: service.name,
			description: service.description ?? "",
			priceFrom: service.priceFrom,
			depositAmount: service.depositAmount,
			durationMinutes: service.durationMinutes ?? DEFAULT_DURATION_MINUTES,
			sortOrder: service.sortOrder,
			isActive: service.isActive,
		});
		setMessage("");
	}

	function cancelEdit() {
		setDraft(emptyService);
	}

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setBusy(true);
		const result = await saveService(draft);
		setMessage(result.ok ? "Service saved." : result.error);
		if (result.ok) setDraft(emptyService);
		setBusy(false);
	}

	async function toggle(service: TattooService) {
		setBusy(true);
		const result = await setServiceActive(service.id, !service.isActive);
		setMessage(
			result.ok
				? `Service ${service.isActive ? "deactivated" : "activated"}.`
				: result.error,
		);
		setBusy(false);
	}

	async function remove(service: TattooService) {
		if (
			!window.confirm(
				`Permanently delete ${service.name}? Services with booking history cannot be deleted.`,
			)
		)
			return;
		setBusy(true);
		const result = await deleteService(service.id);
		setMessage(result.ok ? "Service deleted." : result.error);
		setBusy(false);
	}

	return {
		busy,
		cancelEdit,
		draft,
		edit,
		message,
		remove,
		setDraft,
		submit,
		toggle,
	};
}
