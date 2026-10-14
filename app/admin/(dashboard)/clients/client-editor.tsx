"use client";

import { type FormEvent, useState } from "react";
import type { ClientDetail } from "@/lib/clients";
import { saveClient, setClientArchived } from "./actions";

export function ClientEditor({ client }: { client: ClientDetail }) {
	const [fullName, setFullName] = useState(client.fullName);
	const [email, setEmail] = useState(client.email ?? "");
	const [phone, setPhone] = useState(client.phone);
	const [message, setMessage] = useState("");
	const [busy, setBusy] = useState(false);

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setBusy(true);
		const result = await saveClient({ id: client.id, fullName, email, phone });
		setMessage(result.ok ? "Client details saved." : result.error);
		setBusy(false);
	}

	async function toggleArchive() {
		setBusy(true);
		const result = await setClientArchived(client.id, !client.isArchived);
		setMessage(
			result.ok
				? `Client ${client.isArchived ? "restored" : "archived"}.`
				: result.error,
		);
		setBusy(false);
	}

	return (
		<section className="rounded-lg border border-neutral-200 p-4 sm:p-6">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div>
					<h1 className="text-xl font-semibold text-neutral-900">
						{client.fullName}
					</h1>
					<p className="mt-1 text-sm text-neutral-600">
						{client.isArchived ? "Archived client" : "Client profile"}
					</p>
				</div>
				<button
					disabled={busy}
					onClick={() => void toggleArchive()}
					className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
				>
					{client.isArchived ? "Restore client" : "Archive client"}
				</button>
			</div>
			<form onSubmit={submit} className="mt-5 grid gap-3 sm:grid-cols-3">
				<label className="text-sm text-neutral-700">
					Full name
					<input
						required
						maxLength={100}
						value={fullName}
						onChange={(event) => setFullName(event.target.value)}
						className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
					/>
				</label>
				<label className="text-sm text-neutral-700">
					Email
					<input
						required
						type="email"
						maxLength={255}
						value={email}
						onChange={(event) => setEmail(event.target.value)}
						className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
					/>
				</label>
				<label className="text-sm text-neutral-700">
					Phone WhatsApp
					<input
						required
						maxLength={20}
						value={phone}
						onChange={(event) => setPhone(event.target.value)}
						className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
					/>
				</label>
				<div className="flex items-center gap-3 sm:col-span-3">
					<button
						disabled={busy}
						className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
					>
						Save details
					</button>
					{message && (
						<p role="status" className="text-sm text-neutral-600">
							{message}
						</p>
					)}
				</div>
			</form>
		</section>
	);
}
