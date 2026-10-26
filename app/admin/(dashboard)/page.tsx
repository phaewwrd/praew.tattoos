import Link from "next/link";
import { Card, PageHeader, StatusBadge } from "@/components/admin/ui";
import { addDays, formatDate, toBangkokDate } from "@/lib/time";
import {
  type AdminBookingRow,
  countPending,
  listAppointmentsOn,
} from "@/server/bookings";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const today = toBangkokDate();
  const tomorrow = addDays(today, 1);
  const [pending, appointments] = await Promise.all([
    countPending(),
    listAppointmentsOn([today, tomorrow]),
  ]);

  return (
    <>
      <PageHeader title="Dashboard" />
      <div className="grid gap-6">
        <Link
          href="/admin/bookings?status=pending"
          className="block rounded-xl border-2 border-amber-300 bg-amber-50 p-6 hover:bg-amber-100"
        >
          <p className="font-medium text-amber-900 text-sm uppercase tracking-wide">
            Pending requests
          </p>
          <p className="mt-1 font-bold text-5xl text-amber-950">{pending}</p>
          <p className="mt-2 text-amber-900 text-sm">
            {pending > 0
              ? "Email these customers to confirm and arrange the deposit →"
              : "All caught up."}
          </p>
        </Link>
        <div className="grid gap-6 lg:grid-cols-2">
          <DayList
            title={`Today · ${formatDate(today)}`}
            items={appointments.filter((a) => a.date === today)}
          />
          <DayList
            title={`Tomorrow · ${formatDate(tomorrow)}`}
            items={appointments.filter((a) => a.date === tomorrow)}
          />
        </div>
      </div>
    </>
  );
}

function DayList({
  title,
  items,
}: {
  title: string;
  items: AdminBookingRow[];
}) {
  return (
    <Card title={title}>
      {items.length === 0 ? (
        <p className="text-neutral-600 text-sm">No appointments.</p>
      ) : (
        <ul className="grid gap-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3 border-neutral-100 border-b pb-3 last:border-0"
            >
              <div>
                <p className="font-semibold">{item.time}</p>
                <Link
                  href={`/admin/customers/${item.customerId}`}
                  className="underline"
                >
                  {item.customerName}
                </Link>
                <p className="text-neutral-600 text-xs">
                  {[item.serviceName, item.phone].filter(Boolean).join(" · ")}
                </p>
              </div>
              <StatusBadge status={item.status} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
