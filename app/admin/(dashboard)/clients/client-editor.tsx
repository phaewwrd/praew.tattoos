"use client";

import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { ClientDetail } from "@/services/clients";
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
				<Button
					variant="secondary"
					disabled={busy}
					onClick={() => void toggleArchive()}
				>
					{client.isArchived ? "Restore client" : "Archive client"}
				</Button>
			</div>
			<form onSubmit={submit} className="mt-5 grid gap-3 sm:grid-cols-3">
				<label className="text-sm text-neutral-700">
					Full name
					<Input
						required
						maxLength={100}
						value={fullName}
						onChange={(event) => setFullName(event.target.value)}
						className="mt-1"
					/>
				</label>
				<label className="text-sm text-neutral-700">
					Email
					<Input
						required
						type="email"
						maxLength={255}
						value={email}
						onChange={(event) => setEmail(event.target.value)}
						className="mt-1"
					/>
				</label>
				<label className="text-sm text-neutral-700">
					Phone WhatsApp
					<Input
						required
						maxLength={20}
						value={phone}
						onChange={(event) => setPhone(event.target.value)}
						className="mt-1"
					/>
				</label>
				<div className="flex items-center gap-3 sm:col-span-3">
					<Button type="submit" disabled={busy}>
						Save details
					</Button>
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
