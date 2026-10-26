import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { AdminLoginForm } from "./login-form";

export default async function AdminLoginPage() {
  if (await getAdminSession()) {
    redirect("/admin");
  }

  return (
    <main className="admin-shell flex min-h-dvh items-center justify-center bg-neutral-100 px-4 py-12 text-neutral-900">
      <section className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="font-semibold text-neutral-500 text-xs uppercase tracking-wide">
          Praew Tattoos
        </p>
        <h1 className="mt-2 font-semibold text-2xl">Admin login</h1>
        <p className="mt-1 text-neutral-600 text-sm">
          Sign in with your administrator account.
        </p>
        <AdminLoginForm />
      </section>
    </main>
  );
}
