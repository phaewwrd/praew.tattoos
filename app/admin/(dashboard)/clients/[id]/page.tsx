import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ClientEditor } from "@/app/admin/(dashboard)/clients/client-editor";
import { StatusBadge } from "@/components/features/admin/StatusBadge";
import { TableScroll } from "@/components/ui/TableScroll";
import { getClientDetail } from "@/services/clients";

function formatDate(value: string) {
	if (!value) return "-";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	}).format(date);
}

export default async function AdminClientDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	await connection();
	const { id } = await params;
	const clientId = Number(id);
	if (!Number.isInteger(clientId) || clientId <= 0) {
		notFound();
	}

	const client = await getClientDetail(clientId);
	if (!client) {
		notFound();
	}

	return (
		<div className="space-y-6">
			<Link
				href="/admin/clients"
				className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
			>
				&larr; Back to clients
			</Link>

			<ClientEditor client={client} />
			<dl className="grid gap-4 border-b border-neutral-200 pb-4 sm:grid-cols-2 lg:grid-cols-4">
				<div>
					<dt className="text-xs uppercase tracking-wide text-neutral-500">
						Email
					</dt>
					<dd className="mt-1 text-sm text-neutral-900">
						{client.email || "-"}
					</dd>
				</div>
				<div>
					<dt className="text-xs uppercase tracking-wide text-neutral-500">
						Phone
					</dt>
					<dd className="mt-1 text-sm text-neutral-900">
						{client.phone || "-"}
					</dd>
				</div>
				<div>
					<dt className="text-xs uppercase tracking-wide text-neutral-500">
						Client since
					</dt>
					<dd className="mt-1 text-sm text-neutral-900">
						{formatDate(client.createdAt)}
					</dd>
				</div>
				<div>
					<dt className="text-xs uppercase tracking-wide text-neutral-500">
						Total bookings
					</dt>
					<dd className="mt-1 text-sm text-neutral-900">
						{client.bookings.length}
					</dd>
				</div>
			</dl>

			<section className="overflow-hidden rounded-xl border border-neutral-200">
				<header className="border-b border-neutral-200 px-4 py-3">
					<h2 className="text-sm font-semibold text-neutral-900">
						Booking history
					</h2>
				</header>
				{client.bookings.length === 0 ? (
					<p className="p-4 text-sm text-neutral-600">
						This client has no bookings yet.
					</p>
				) : (
					<TableScroll label="Booking history">
						<table className="min-w-full text-left text-sm">
							<thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
								<tr>
									<th className="px-4 py-2 font-medium">Booking ID</th>
									<th className="px-4 py-2 font-medium">Service</th>
									<th className="px-4 py-2 font-medium">Date</th>
									<th className="px-4 py-2 font-medium">Time</th>
									<th className="px-4 py-2 font-medium">Status</th>
									<th className="px-4 py-2 font-medium">Payment</th>
									<th className="px-4 py-2 font-medium">Agreed / deposit</th>
									<th className="px-4 py-2 font-medium">Paid</th>
								</tr>
							</thead>
							<tbody>
								{client.bookings.map((booking) => (
									<tr key={booking.id} className="border-t border-neutral-200">
										<td className="px-4 py-3">#{booking.id}</td>
										<td className="px-4 py-3">{booking.service}</td>
										<td className="px-4 py-3">{formatDate(booking.date)}</td>
										<td className="px-4 py-3">{booking.time || "-"}</td>
										<td className="px-4 py-3">
											<StatusBadge status={booking.status} />
										</td>
										<td className="px-4 py-3">
											{booking.paymentStatus ? (
												<StatusBadge status={booking.paymentStatus} />
											) : (
												"-"
											)}
										</td>
										<td className="whitespace-nowrap px-4 py-3">
											฿{booking.agreedPrice} / ฿{booking.depositAmount}
										</td>
										<td className="whitespace-nowrap px-4 py-3">
											฿{booking.paidAmount}
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
