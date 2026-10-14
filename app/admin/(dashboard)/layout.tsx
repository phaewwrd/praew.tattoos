import type { ReactNode } from "react";
import { logoutAdminAction } from "@/app/admin/actions";
import { AdminSidebar } from "@/components/layouts/AdminSidebar";
import { requireAdminSession } from "@/lib/admin-auth";

export default async function AdminDashboardLayout({
	children,
}: {
	children: ReactNode;
}) {
	const session = await requireAdminSession();

	return (
		<div className="admin-shell min-h-dvh bg-neutral-100 font-sans text-neutral-900">
			<div className="mx-auto grid min-h-dvh w-full max-w-7xl grid-cols-1 gap-4 p-4 lg:grid-cols-[260px_1fr] lg:gap-6 lg:p-6">
				<AdminSidebar />
				<div className="flex min-h-[70dvh] flex-col rounded-xl border border-neutral-200 bg-white">
					<header className="flex flex-col gap-3 border-b border-neutral-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
						<div>
							<p className="text-xs uppercase tracking-wide text-neutral-500">
								Signed in as
							</p>
							<p className="text-sm font-medium text-neutral-800">
								{session.user.name || session.user.email}
							</p>
						</div>
						<form action={logoutAdminAction}>
							<button
								type="submit"
								className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
							>
								Logout
							</button>
						</form>
					</header>
					<main className="flex-1 p-4 sm:p-6">{children}</main>
				</div>
			</div>
		</div>
	);
}
