"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TableScroll } from "@/components/ui/TableScroll";
import { Textarea } from "@/components/ui/Textarea";
import { useServiceManager } from "@/hooks/useServiceManager";
import type { TattooService } from "@/services/services";

const thbFormatter = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "THB",
	maximumFractionDigits: 2,
});

export function ServiceManager({ services }: { services: TattooService[] }) {
	const {
		busy,
		cancelEdit,
		draft,
		edit,
		message,
		remove,
		setDraft,
		submit,
		toggle,
	} = useServiceManager();

	return (
		<div className="space-y-6">
			<section>
				<h1 className="text-2xl font-semibold text-neutral-900">Services</h1>
				<p className="mt-1 text-sm text-neutral-600">
					Manage the services available for new appointment requests.
				</p>
			</section>

			<form
				onSubmit={submit}
				className="grid gap-4 rounded-lg border border-neutral-200 p-4 sm:grid-cols-2 lg:grid-cols-4"
			>
				<h2 className="text-sm font-semibold text-neutral-900 sm:col-span-2 lg:col-span-4">
					{draft.id ? "Edit service" : "Add service"}
				</h2>
				<label className="text-sm text-neutral-700 sm:col-span-2">
					Name
					<Input
						required
						maxLength={150}
						value={draft.name}
						onChange={(event) =>
							setDraft({ ...draft, name: event.target.value })
						}
						className="mt-1"
					/>
				</label>
				<label className="text-sm text-neutral-700">
					Starting price (THB)
					<Input
						required
						type="number"
						min="0"
						step="0.01"
						value={draft.priceFrom}
						onChange={(event) =>
							setDraft({ ...draft, priceFrom: Number(event.target.value) })
						}
						className="mt-1"
					/>
				</label>
				<label className="text-sm text-neutral-700">
					Deposit (THB)
					<Input
						required
						type="number"
						min="0"
						step="0.01"
						value={draft.depositAmount}
						onChange={(event) =>
							setDraft({ ...draft, depositAmount: Number(event.target.value) })
						}
						className="mt-1"
					/>
				</label>
				<label className="text-sm text-neutral-700">
					Duration (minutes)
					<Input
						required
						type="number"
						min="1"
						max="1440"
						step="1"
						value={draft.durationMinutes}
						onChange={(event) =>
							setDraft({
								...draft,
								durationMinutes: Number(event.target.value),
							})
						}
						className="mt-1"
					/>
				</label>
				<label className="text-sm text-neutral-700">
					Display order
					<Input
						type="number"
						min="0"
						step="1"
						value={draft.sortOrder}
						onChange={(event) =>
							setDraft({ ...draft, sortOrder: Number(event.target.value) })
						}
						className="mt-1"
					/>
				</label>
				<label className="flex items-center gap-2 self-end pb-2 text-sm text-neutral-700">
					<input
						type="checkbox"
						checked={draft.isActive}
						onChange={(event) =>
							setDraft({ ...draft, isActive: event.target.checked })
						}
					/>{" "}
					Available for booking
				</label>
				<label className="text-sm text-neutral-700 sm:col-span-2 lg:col-span-4">
					Description
					<Textarea
						rows={3}
						maxLength={10000}
						value={draft.description}
						onChange={(event) =>
							setDraft({ ...draft, description: event.target.value })
						}
						className="mt-1"
					/>
				</label>
				<div className="flex items-center gap-3 sm:col-span-2 lg:col-span-4">
					<Button type="submit" disabled={busy}>
						{busy ? "Saving..." : draft.id ? "Save changes" : "Create service"}
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

			<section className="overflow-hidden rounded-lg border border-neutral-200">
				{services.length === 0 ? (
					<p className="p-4 text-sm text-neutral-600">No services yet.</p>
				) : (
					<TableScroll label="Services">
						<table className="min-w-full text-left text-sm">
							<thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
								<tr>
									<th className="px-4 py-3 font-medium">Service</th>
									<th className="px-4 py-3 font-medium">Price</th>
									<th className="px-4 py-3 font-medium">Deposit</th>
									<th className="px-4 py-3 font-medium">Duration</th>
									<th className="px-4 py-3 font-medium">Status</th>
									<th className="px-4 py-3 font-medium">Actions</th>
								</tr>
							</thead>
							<tbody>
								{services.map((service) => (
									<tr key={service.id} className="border-t border-neutral-200">
										<td className="px-4 py-3">
											<p className="font-medium text-neutral-900">
												{service.name}
											</p>
											<p className="mt-0.5 max-w-md text-xs text-neutral-500">
												{service.description || "No description"}
											</p>
										</td>
										<td className="whitespace-nowrap px-4 py-3">
											{thbFormatter.format(service.priceFrom)}
										</td>
										<td className="whitespace-nowrap px-4 py-3">
											{thbFormatter.format(service.depositAmount)}
										</td>
										<td className="whitespace-nowrap px-4 py-3">
											{service.durationMinutes} min
										</td>
										<td className="px-4 py-3">
											{service.isActive ? "Active" : "Inactive"}
										</td>
										<td className="whitespace-nowrap px-4 py-3">
											<div className="flex gap-3">
												<Button
													variant="link"
													disabled={busy}
													onClick={() => edit(service)}
												>
													Edit
												</Button>
												<Button
													variant="link"
													disabled={busy}
													onClick={() => void toggle(service)}
												>
													{service.isActive ? "Deactivate" : "Activate"}
												</Button>
												<Button
													variant="link"
													disabled={busy || service.isActive}
													onClick={() => void remove(service)}
													className="text-red-700 disabled:opacity-40"
												>
													Delete
												</Button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</TableScroll>
				)}
			</section>
		</div>
	);
}
