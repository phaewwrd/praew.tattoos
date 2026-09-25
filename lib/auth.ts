// @ts-expect-error — better-auth is provided by the project runtime but lacks local type declarations.
import { betterAuth } from "better-auth";

import { drizzleAdapter } from "@better-auth/drizzle-adapter";

import { db } from "@/app/db";
import * as authSchema from "@/app/db/auth-schema";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: authSchema,
	}),
	emailAndPassword: {
		enabled: true,
	},
	user: {
		additionalFields: {
			role: {
				type: "string",
				required: true,
				defaultValue: "admin",
			},
			disabled: {
				type: "boolean",
				required: true,
				defaultValue: false,
			},
		},
	},
	plugins: [],
});
