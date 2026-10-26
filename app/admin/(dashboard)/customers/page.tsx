import Link from "next/link";
import { Card, PageHeader } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TableScroll } from "@/components/ui/TableScroll";
import { formatDate } from "@/lib/time";
import { searchCustomers } from "@/server/customers";
import { NewCustomerForm } from "./new-customer-form";

export const metadata = { title: "Customers" };

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const customers = await searchCustomers(q.slice(0, 100));

  return (
    <>
      <PageHeader
        title="Customers"
        description="Created automatically from bookings and merged by email or phone."
      />
      <div className="grid gap-6">
        <search>
          <form className="flex flex-wrap items-end gap-2">
            <div className="min-w-64 flex-1">
              <label
                htmlFor="customer-search"
                className="mb-1 block text-neutral-600 text-xs"
              >
                Search name, phone or email
              </label>
              <Input
                id="customer-search"
                type="search"
                name="q"
                defaultValue={q}
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </search>

        <Card className="p-0 sm:p-0">
          <TableScroll label="Customers">
            <table className="w-full min-w-[44rem] text-left text-sm">
              <thead className="border-neutral-200 border-b bg-neutral-50 text-neutral-600">
                <tr>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Phone</th>
                  <th className="px-3 py-2 font-medium">Email</th>
                  <th className="px-3 py-2 font-medium">Bookings</th>
                  <th className="px-3 py-2 font-medium">Last appointment</th>
                  <th className="px-3 py-2 font-medium">Tags</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-neutral-100 border-b">
                    <td className="px-3 py-2">
                      <Link
                        className="font-medium underline"
                        href={`/admin/customers/${customer.id}`}
                      >
                        {customer.firstName} {customer.lastName}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{customer.phone ?? "—"}</td>
                    <td className="px-3 py-2">{customer.email ?? "—"}</td>
                    <td className="px-3 py-2">{customer.bookingCount}</td>
                    <td className="px-3 py-2">
                      {customer.lastBookingDate
                        ? formatDate(customer.lastBookingDate)
                        : "—"}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {customer.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {customers.length === 0 ? (
              <p className="p-4 text-neutral-600 text-sm">
                No customers found.
              </p>
            ) : null}
          </TableScroll>
        </Card>

        <Card title="Add customer manually">
          <NewCustomerForm />
        </Card>
      </div>
    </>
  );
}
