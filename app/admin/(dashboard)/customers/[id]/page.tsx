import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, PageHeader, StatusBadge } from "@/components/admin/ui";
import { TableScroll } from "@/components/ui/TableScroll";
import { formatDate, formatInstant, formatTime } from "@/lib/time";
import { uuidSchema } from "@/lib/validation/common";
import { getCustomer, listAllTags } from "@/server/customers";
import { CustomerDetail } from "./customer-detail";

export const metadata = { title: "Customer" };

export default async function CustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) notFound();
  const [customer, allTags] = await Promise.all([
    getCustomer(id),
    listAllTags(),
  ]);
  if (!customer) notFound();

  return (
    <>
      <Link
        href="/admin/customers"
        className="mb-2 inline-block text-neutral-600 text-sm underline"
      >
        ← Customers
      </Link>
      <PageHeader title={`${customer.firstName} ${customer.lastName}`} />
      <div className="grid gap-6">
        <CustomerDetail
          customer={{
            id: customer.id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email ?? "",
            phone: customer.phone ?? "",
          }}
          tags={customer.tagLinks.map((link) => link.tag)}
          suggestions={allTags.map((tag) => tag.name)}
          notes={customer.notes.map((note) => ({
            id: note.id,
            body: note.body,
            createdAt: formatInstant(note.createdAt),
          }))}
        />
        <Card
          title={`Booking history (${customer.bookings.length})`}
          className="p-0 sm:p-0"
        >
          <TableScroll label="Booking history">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="border-neutral-200 border-b bg-neutral-50 text-neutral-600">
                <tr>
                  <th className="px-3 py-2 font-medium">Appointment</th>
                  <th className="px-3 py-2 font-medium">Service</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Note</th>
                </tr>
              </thead>
              <tbody>
                {customer.bookings.map((booking) => (
                  <tr key={booking.id} className="border-neutral-100 border-b">
                    <td className="px-3 py-2">
                      {formatDate(booking.slot.date)} ·{" "}
                      {formatTime(booking.slot.startTime)}
                    </td>
                    <td className="px-3 py-2">
                      {booking.service?.name ?? "—"}
                    </td>
                    <td className="px-3 py-2">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-3 py-2 text-neutral-600">
                      {booking.adminNote ?? ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScroll>
        </Card>
      </div>
    </>
  );
}
