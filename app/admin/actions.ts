"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { user } from "@/db/auth-schema";
import { requireAdminSession } from "@/lib/admin-auth";
import { auth } from "@/lib/auth";

export type AdminLoginState = {
	error: string | null;
};

export async function loginAdminAction(
	_previousState: AdminLoginState,
	formData: FormData,
): Promise<AdminLoginState> {
	const emailValue = formData.get("email");
	const passwordValue = formData.get("password");
	const email =
		typeof emailValue === "string" ? emailValue.trim().toLowerCase() : "";
	const password = typeof passwordValue === "string" ? passwordValue : "";

	if (
		!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
		email.length > 254 ||
		!password ||
		password.length > 128
	) {
		return { error: "Enter a valid email and password." };
	}

	let account: { role: string | null; disabled: boolean | null }[];
	try {
		account = await db
			.select({ role: user.role, disabled: user.disabled })
			.from(user)
			.where(eq(user.email, email))
			.limit(1);
	} catch {
		return { error: "Unable to sign in right now. Please try again." };
	}

	if (account[0]?.role !== "admin" || account[0].disabled) {
		return { error: "Invalid email or password." };
	}

	try {
		await auth.api.signInEmail({
			body: { email, password },
			headers: await headers(),
		});
	} catch {
		return { error: "Invalid email or password." };
	}

	redirect("/admin");
}

export async function logoutAdminAction() {
	await requireAdminSession();

	try {
		const requestHeaders = await headers();
		await auth.api.signOut({ headers: requestHeaders });
	} catch {
		// Do not expose internal auth errors to the client.
	}

	redirect("/admin/login");
}
