"use client";

import { useState, type FormEvent } from "react";
import { deleteService, saveService, setServiceActive, type ServiceInput } from "./actions";
import type { TattooService } from "@/lib/services";

const emptyService: ServiceInput = {
  name: "", description: "", priceFrom: 0, depositAmount: 0,
  durationMinutes: 60, sortOrder: 0, isActive: true,
};

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "THB", maximumFractionDigits: 2 }).format(value);
}

export function ServiceManager({ services }: { services: TattooService[] }) {
  const [draft, setDraft] = useState<ServiceInput>(emptyService);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  function edit(service: TattooService) {
    setDraft({
      id: service.id, name: service.name, description: service.description ?? "",
      priceFrom: service.priceFrom, depositAmount: service.depositAmount,
      durationMinutes: service.durationMinutes ?? 60, sortOrder: service.sortOrder,
      isActive: service.isActive,
    });
    setMessage("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    const result = await saveService(draft);
    setMessage(result.ok ? "Service saved." : result.error);
    if (result.ok) setDraft(emptyService);
    setBusy(false);
  }

  async function toggle(service: TattooService) {
    setBusy(true);
    const result = await setServiceActive(service.id, !service.isActive);
    setMessage(result.ok ? `Service ${service.isActive ? "deactivated" : "activated"}.` : result.error);
    setBusy(false);
  }

  async function remove(service: TattooService) {
    if (!window.confirm(`Permanently delete ${service.name}? Services with booking history cannot be deleted.`)) return;
    setBusy(true);
    const result = await deleteService(service.id);
    setMessage(result.ok ? "Service deleted." : result.error);
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold text-neutral-900">Services</h1>
        <p className="mt-1 text-sm text-neutral-600">Manage the services available for new appointment requests.</p>
      </section>

      <form onSubmit={submit} className="grid gap-4 rounded-lg border border-neutral-200 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <h2 className="text-sm font-semibold text-neutral-900 sm:col-span-2 lg:col-span-4">{draft.id ? "Edit service" : "Add service"}</h2>
        <label className="text-sm text-neutral-700 sm:col-span-2">Name
          <input required maxLength={150} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2" />
        </label>
        <label className="text-sm text-neutral-700">Starting price (THB)
          <input required type="number" min="0" step="0.01" value={draft.priceFrom} onChange={(event) => setDraft({ ...draft, priceFrom: Number(event.target.value) })} className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2" />
        </label>
        <label className="text-sm text-neutral-700">Deposit (THB)
          <input required type="number" min="0" step="0.01" value={draft.depositAmount} onChange={(event) => setDraft({ ...draft, depositAmount: Number(event.target.value) })} className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2" />
        </label>
        <label className="text-sm text-neutral-700">Duration (minutes)
          <input required type="number" min="1" max="1440" step="1" value={draft.durationMinutes} onChange={(event) => setDraft({ ...draft, durationMinutes: Number(event.target.value) })} className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2" />
        </label>
        <label className="text-sm text-neutral-700">Display order
          <input type="number" min="0" step="1" value={draft.sortOrder} onChange={(event) => setDraft({ ...draft, sortOrder: Number(event.target.value) })} className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2" />
        </label>
        <label className="flex items-center gap-2 self-end pb-2 text-sm text-neutral-700">
          <input type="checkbox" checked={draft.isActive} onChange={(event) => setDraft({ ...draft, isActive: event.target.checked })} /> Available for booking
        </label>
        <label className="text-sm text-neutral-700 sm:col-span-2 lg:col-span-4">Description
          <textarea rows={3} maxLength={10000} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2" />
        </label>
        <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-4">
          <button disabled={busy} className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{busy ? "Saving..." : draft.id ? "Save changes" : "Create service"}</button>
          {draft.id && <button type="button" onClick={() => setDraft(emptyService)} className="text-sm text-neutral-600 underline">Cancel edit</button>}
          {message && <p role="status" className="text-sm text-neutral-600">{message}</p>}
        </div>
      </form>

      <section className="overflow-hidden rounded-lg border border-neutral-200">
        {services.length === 0 ? <p className="p-4 text-sm text-neutral-600">No services yet.</p> : <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500"><tr><th className="px-4 py-3 font-medium">Service</th><th className="px-4 py-3 font-medium">Price</th><th className="px-4 py-3 font-medium">Deposit</th><th className="px-4 py-3 font-medium">Duration</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Actions</th></tr></thead>
            <tbody>{services.map((service) => <tr key={service.id} className="border-t border-neutral-200">
              <td className="px-4 py-3"><p className="font-medium text-neutral-900">{service.name}</p><p className="mt-0.5 max-w-md text-xs text-neutral-500">{service.description || "No description"}</p></td>
              <td className="whitespace-nowrap px-4 py-3">{money(service.priceFrom)}</td><td className="whitespace-nowrap px-4 py-3">{money(service.depositAmount)}</td><td className="whitespace-nowrap px-4 py-3">{service.durationMinutes} min</td>
              <td className="px-4 py-3">{service.isActive ? "Active" : "Inactive"}</td>
              <td className="whitespace-nowrap px-4 py-3"><div className="flex gap-3"><button disabled={busy} onClick={() => edit(service)} className="font-medium text-neutral-700 underline">Edit</button><button disabled={busy} onClick={() => void toggle(service)} className="font-medium text-neutral-700 underline">{service.isActive ? "Deactivate" : "Activate"}</button><button disabled={busy || service.isActive} onClick={() => void remove(service)} className="font-medium text-red-700 underline disabled:opacity-40">Delete</button></div></td>
            </tr>)}</tbody>
          </table>
        </div>}
      </section>
    </div>
  );
}