"use client";

import { StatusBadge } from "@/components/features/admin/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { TableScroll } from "@/components/ui/TableScroll";
import { Textarea } from "@/components/ui/Textarea";
import { useBookingEditor } from "@/hooks/useBookingEditor";
import type { Booking, BookingStatus } from "@/services/bookings";
import { formatDateLabel, formatThb } from "@/utils/format";

const statusOptions: BookingStatus[] = [
	"PENDING_PAYMENT",
	"CONFIRMED",
	"COMPLETED",
	"CANCELLED",
	"NO_SHOW",
];

export function BookingManager({ bookings }: { bookings: Booking[] }) {
	const { busyId, getDraft, message, save, updateDraft } = useBookingEditor();

	return (
		<div className="space-y-6">
			<section>
				<h1 className="text-2xl font-semibold text-neutral-900">Bookings</h1>
				<p className="mt-1 text-sm text-neutral-600">
					Review appointments, update their status, and keep admin notes.
				</p>
			</section>
			{message && (
				<p role="status" className="text-sm text-neutral-700">
					{message}
				</p>
			)}
			<section className="overflow-hidden rounded-lg border border-neutral-200">
				{bookings.length === 0 ? (
					<p className="p-4 text-sm text-neutral-600">No bookings yet.</p>
				) : (
					<TableScroll label="Bookings">
						<table className="min-w-full text-left text-sm">
							<thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
								<tr>
									<th className="px-4 py-3 font-medium">Appointment</th>
									<th className="px-4 py-3 font-medium">Client</th>
									<th className="px-4 py-3 font-medium">Service</th>
									<th className="px-4 py-3 font-medium">Agreed / deposit</th>
									<th className="px-4 py-3 font-medium">Payment</th>
									<th className="px-4 py-3 font-medium">Status / notes</th>
									<th className="px-4 py-3 font-medium">Save</th>
								</tr>
							</thead>
							<tbody>
								{bookings.map((booking) => {
									const draft = getDraft(booking);
									return (
										<tr
											key={booking.id}
											className="border-t border-neutral-200 align-top"
										>
											<td className="whitespace-nowrap px-4 py-3">
												<p className="font-medium text-neutral-900">
													{formatDateLabel(booking.date)}
												</p>
												<p className="mt-1 text-xs text-neutral-600">
													{booking.startTime}–{booking.endTime} · #{booking.id}
												</p>
											</td>
											<td className="px-4 py-3">
												<p className="font-medium">{booking.clientName}</p>
												<p className="text-xs text-neutral-600">
													{booking.clientEmail || "-"}
												</p>
												<p className="text-xs text-neutral-600">
													{booking.clientPhone}
												</p>
											</td>
											<td className="px-4 py-3">{booking.service}</td>
											<td className="whitespace-nowrap px-4 py-3">
												{formatThb(booking.agreedPrice)} /{" "}
												{formatThb(booking.depositAmount)}
											</td>
											<td className="whitespace-nowrap px-4 py-3">
												{booking.paymentStatus ? (
													<>
														<StatusBadge status={booking.paymentStatus} />
														<p className="mt-1 text-xs">
															Paid {formatThb(booking.paidAmount)}
														</p>
													</>
												) : (
													"No payment"
												)}
											</td>
											<td className="min-w-56 px-4 py-3">
												<div className="mb-2">
													<StatusBadge status={booking.status} />
												</div>
												<Select
													value={draft.status}
													onChange={(event) =>
														updateDraft(booking, {
															status: event.target.value as BookingStatus,
														})
													}
													className="px-2 py-1.5 text-sm"
												>
													{statusOptions.map((status) => (
														<option key={status} value={status}>
															{status.replaceAll("_", " ")}
														</option>
													))}
												</Select>
												<Textarea
													aria-label={`Admin notes for booking ${booking.id}`}
													rows={2}
													maxLength={10000}
													placeholder="Admin notes"
													value={draft.notes}
													onChange={(event) =>
														updateDraft(booking, { notes: event.target.value })
													}
													className="mt-2 px-2 py-1.5 text-sm"
												/>
											</td>
											<td className="px-4 py-3">
												<Button
													variant="secondary"
													disabled={busyId === booking.id}
													onClick={() => void save(booking)}
													className="px-3 py-1.5 text-neutral-900"
												>
													{busyId === booking.id ? "Saving" : "Save"}
												</Button>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</TableScroll>
				)}
			</section>
		</div>
	);
}
