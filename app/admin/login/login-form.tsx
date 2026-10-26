"use client";

import { useActionState } from "react";
import { type AdminLoginState, loginAdminAction } from "@/app/admin/actions";

const initialState: AdminLoginState = { error: null };

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAdminAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block font-medium text-neutral-800 text-sm"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          maxLength={254}
          className="w-full rounded-md border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-700 focus:ring-2 focus:ring-neutral-200"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block font-medium text-neutral-800 text-sm"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={128}
          className="w-full rounded-md border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-700 focus:ring-2 focus:ring-neutral-200"
        />
      </div>
      {state.error ? (
        <p id="login-error" role="alert" className="text-red-700 text-sm">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-neutral-900 px-4 py-2.5 font-medium text-sm text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Signing in..." : "Log in"}
      </button>
    </form>
  );
}
