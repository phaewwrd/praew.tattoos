import { StatusBadge } from "@/components/admin/status-badge";
import { getAdminDashboardData } from "@/lib/admin-dashboard";

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

function formatDateTime(value: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function AdminDashboardPage() {
  const dashboard = await getAdminDashboardData();

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-600">Operational overview for appointments, bookings, payments, and messages.</p>
        {dashboard.isMockData ? (
          <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Displaying fallback data. Connect auth and database configuration to view live values.
          </p>
        ) : null}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">Today&apos;s Appointments</p>
          <p className="mt-2 text-3xl font-semibold text-neutral-900">{dashboard.todayAppointmentsCount}</p>
        </article>
        <article className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">Upcoming Appointments</p>
          <p className="mt-2 text-3xl font-semibold text-neutral-900">{dashboard.upcomingAppointmentsCount}</p>
        </article>
        <article className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">Pending Payments</p>
          <p className="mt-2 text-3xl font-semibold text-neutral-900">{dashboard.pendingPaymentsCount}</p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="overflow-hidden rounded-xl border border-neutral-200">
          <header className="border-b border-neutral-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-neutral-900">Today&apos;s appointments</h2>
          </header>
          {dashboard.todayAppointments.length === 0 ? (
            <p className="p-4 text-sm text-neutral-600">No appointments scheduled for today.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
                  <tr>
                    <th className="px-4 py-2 font-medium">Client</th>
                    <th className="px-4 py-2 font-medium">Time</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.todayAppointments.map((item) => (
                    <tr key={item.id} className="border-t border-neutral-200">
                      <td className="px-4 py-3">{item.clientName}</td>
                      <td className="px-4 py-3">{item.time || "-"}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={item.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <article className="overflow-hidden rounded-xl border border-neutral-200">
          <header className="border-b border-neutral-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-neutral-900">Upcoming appointments</h2>
          </header>
          {dashboard.upcomingAppointments.length === 0 ? (
            <p className="p-4 text-sm text-neutral-600">No upcoming appointments in the next two weeks.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
                  <tr>
                    <th className="px-4 py-2 font-medium">Date</th>
                    <th className="px-4 py-2 font-medium">Client</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.upcomingAppointments.map((item) => (
                    <tr key={item.id} className="border-t border-neutral-200">
                      <td className="px-4 py-3">{formatDate(item.date)}</td>
                      <td className="px-4 py-3">{item.clientName}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={item.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="overflow-hidden rounded-xl border border-neutral-200">
          <header className="border-b border-neutral-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-neutral-900">Recent bookings</h2>
          </header>
          {dashboard.recentBookings.length === 0 ? (
            <p className="p-4 text-sm text-neutral-600">No bookings yet.</p>
          ) : (
            <ul className="divide-y divide-neutral-200">
              {dashboard.recentBookings.map((booking) => (
                <li key={booking.id} className="flex items-start justify-between gap-4 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{booking.clientName}</p>
                    <p className="text-xs text-neutral-600">
                      {formatDate(booking.date)} {booking.time ? `at ${booking.time}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">Created {formatDateTime(booking.createdAt)}</p>
                  </div>
                  <StatusBadge status={booking.status} />
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="overflow-hidden rounded-xl border border-neutral-200">
          <header className="border-b border-neutral-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-neutral-900">Recent contact messages</h2>
          </header>
          {dashboard.recentMessages.length === 0 ? (
            <p className="p-4 text-sm text-neutral-600">No contact messages yet.</p>
          ) : (
            <ul className="divide-y divide-neutral-200">
              {dashboard.recentMessages.map((message) => (
                <li key={message.id} className="px-4 py-3">
                  <p className="text-sm font-medium text-neutral-900">{message.name}</p>
                  <p className="text-xs text-neutral-600">{message.email}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-neutral-700">{message.message}</p>
                  <p className="mt-1 text-xs text-neutral-500">Received {formatDateTime(message.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <section className="rounded-xl border border-neutral-200 p-4">
        <h2 className="text-sm font-semibold text-neutral-900">Booking status summary</h2>
        {dashboard.bookingStatusSummary.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-600">No appointment data available.</p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {dashboard.bookingStatusSummary.map((item) => (
              <div key={item.status} className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                <div className="flex items-center justify-between">
                  <StatusBadge status={item.status} />
                  <span className="text-lg font-semibold text-neutral-900">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
