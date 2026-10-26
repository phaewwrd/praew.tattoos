import Link from "next/link";
import { connection } from "next/server";
import { getClients } from "@/services/clients";
import { ClientManager } from "./client-manager";

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; archived?: string }>;
}) {
  await connection();
  const { q, archived } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  const includeArchived = archived === "1";
  const clients = await getClients({ query, includeArchived });

  return (
    <div className="space-y-6">
      <section>
        <h1 className="font-semibold text-2xl text-neutral-900">Clients</h1>
        <p className="mt-1 text-neutral-600 text-sm">
          Search customers and review their booking history.
        </p>
      </section>

      <form
        action="/admin/clients"
        method="get"
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
      >
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search by name, email, or phone"
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none sm:max-w-sm"
        />
        <button
          type="submit"
          className="rounded-md border border-neutral-300 px-3 py-2 font-medium text-neutral-700 text-sm hover:bg-neutral-100"
        >
          Search
        </button>
        {includeArchived && <input type="hidden" name="archived" value="1" />}
        {query ? (
          <Link
            href="/admin/clients"
            className="font-medium text-neutral-600 text-sm underline underline-offset-2 hover:text-neutral-900"
          >
            Clear
          </Link>
        ) : null}
        <Link
          href={`/admin/clients?${new URLSearchParams({ ...(query ? { q: query } : {}), ...(includeArchived ? {} : { archived: "1" }) }).toString()}`}
          className="font-medium text-neutral-600 text-sm underline underline-offset-2 hover:text-neutral-900"
        >
          {includeArchived ? "Hide archived" : "Show archived"}
        </Link>
      </form>
      <ClientManager clients={clients} includeArchived={includeArchived} />
    </div>
  );
}
