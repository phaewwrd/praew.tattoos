import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "@/app/db";
import { user } from "@/app/db/auth-schema";
import { auth } from "@/lib/auth";

async function createAdmin() {
	const name = process.env.ADMIN_NAME?.trim();
	const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
	const password = process.env.ADMIN_PASSWORD;

	if (
		!name ||
		!email ||
		!password ||
		password.length < 8 ||
		password.length > 128
	) {
		throw new Error(
			"Set ADMIN_NAME, ADMIN_EMAIL, and an ADMIN_PASSWORD between 8 and 128 characters.",
		);
	}

	const existing = await db
		.select({ id: user.id })
		.from(user)
		.where(eq(user.email, email))
		.limit(1);
	if (existing[0]) {
		throw new Error(
			"An account with this email already exists; no account was changed.",
		);
	}

	const created = await auth.api.signUpEmail({
		body: { name, email, password },
	});

	await db
		.update(user)
		.set({ role: "admin" })
		.where(eq(user.id, created.user.id));
	console.log(`Admin account created for ${email}.`);
}

createAdmin().catch((error: unknown) => {
	console.error(
		error instanceof Error ? error.message : "Admin account creation failed.",
	);
	process.exitCode = 1;
});
