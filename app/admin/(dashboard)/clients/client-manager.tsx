"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TableScroll } from "@/components/ui/TableScroll";
import type { ClientListItem } from "@/services/clients";
import { saveClient, setClientArchived } from "./actions";

function formatDate(value: string | null) {
	if (!value) return "-";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	}).format(date);
}

export function ClientManager({
	clients,
	includeArchived,
}: {
	clients: ClientListItem[];
	includeArchived: boolean;
}) {
	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [message, setMessage] = useState("");
	const [busy, setBusy] = useState(false);

	async function create(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setBusy(true);
		const result = await saveClient({ fullName, email, phone });
		setMessage(result.ok ? "Client added." : result.error);
		if (result.ok) {
			setFullName("");
			setEmail("");
			setPhone("");
		}
		setBusy(false);
	}

	async function archive(client: ClientListItem) {
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
		<>
			<form
				onSubmit={create}
				className="grid gap-3 rounded-lg border border-neutral-200 p-4 sm:grid-cols-2 lg:grid-cols-4"
			>
				<h2 className="text-sm font-semibold text-neutral-900 sm:col-span-2 lg:col-span-4">
					Add client
				</h2>
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
					Phone
					<Input
						required
						maxLength={20}
						value={phone}
						onChange={(event) => setPhone(event.target.value)}
						className="mt-1"
					/>
				</label>
				<div className="flex items-end gap-3">
					<Button type="submit" disabled={busy}>
						Add client
					</Button>
					{message && (
						<p role="status" className="pb-2 text-xs text-neutral-600">
							{message}
						</p>
					)}
				</div>
			</form>

			<section className="overflow-hidden rounded-lg border border-neutral-200">
				{clients.length === 0 ? (
					<p className="p-4 text-sm text-neutral-600">
						No clients{includeArchived ? " found" : " yet"}.
					</p>
				) : (
					<TableScroll label="Clients">
						<table className="min-w-full text-left text-sm">
							<thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
								<tr>
									<th className="px-4 py-2 font-medium">Name</th>
									<th className="px-4 py-2 font-medium">Email</th>
									<th className="px-4 py-2 font-medium">Phone</th>
									<th className="px-4 py-2 font-medium">Bookings</th>
									<th className="px-4 py-2 font-medium">Latest booking</th>
									<th className="px-4 py-2 font-medium">Created</th>
									<th className="px-4 py-2 font-medium">Status</th>
									<th className="px-4 py-2 font-medium">Action</th>
								</tr>
							</thead>
							<tbody>
								{clients.map((client) => (
									<tr key={client.id} className="border-t border-neutral-200">
										<td className="px-4 py-3">
											<Link
												href={`/admin/clients/${client.id}`}
												className="font-medium text-neutral-900 hover:underline"
											>
												{client.fullName}
											</Link>
										</td>
										<td className="px-4 py-3">{client.email || "-"}</td>
										<td className="px-4 py-3">{client.phone || "-"}</td>
										<td className="px-4 py-3">{client.bookingsCount}</td>
										<td className="px-4 py-3">
											{formatDate(client.latestBookingDate)}
										</td>
										<td className="px-4 py-3">
											{formatDate(client.createdAt)}
										</td>
										<td className="px-4 py-3">
											{client.isArchived ? "Archived" : "Active"}
										</td>
										<td className="px-4 py-3">
											<Button
												variant="link"
												disabled={busy}
												onClick={() => void archive(client)}
												className="text-sm"
											>
												{client.isArchived ? "Restore" : "Archive"}
											</Button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</TableScroll>
				)}
			</section>
		</>
	);
}
