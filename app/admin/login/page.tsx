import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { AdminLoginForm } from "./login-form";

export default async function AdminLoginPage() {
  if (await getAdminSession()) {
    redirect("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-100 px-4 py-12 text-neutral-900">
      <section className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Praew Tattoos</p>
        <h1 className="mt-2 text-2xl font-semibold">Admin login</h1>
        <p className="mt-1 text-sm text-neutral-600">Sign in with your administrator account.</p>
        <AdminLoginForm />
      </section>
    </main>
  );
}