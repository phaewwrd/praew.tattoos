import "server-only";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin, UnauthorizedError } from "@/lib/admin-auth";
import {
  ActionError,
  failure,
  type ServerResponse,
  success,
} from "@/lib/server-response";

type Options = {
  /** Paths to revalidate after success (the public home page is a common one). */
  revalidate?: string[];
  /** Skip the admin check (public actions). */
  public?: boolean;
};

function isUniqueViolation(error: unknown): boolean {
  const cause = (error as { cause?: { code?: string } })?.cause;
  return (
    (error as { code?: string })?.code === "23505" || cause?.code === "23505"
  );
}

/**
 * Wraps a server action: validates input with Zod, checks the admin session,
 * maps known errors to typed failures and never leaks internals.
 */
export function createAction<S extends z.ZodType, R>(
  schema: S,
  handler: (input: z.output<S>) => Promise<R>,
  options: Options = {},
) {
  return async (raw: z.input<S>): Promise<ServerResponse<R>> => {
    try {
      if (!options.public) await requireAdmin();

      const parsed = schema.safeParse(raw);
      if (!parsed.success) {
        const flat = z.flattenError(parsed.error);
        return failure(
          "INVALID_INPUT",
          flat.formErrors[0] ?? "Please check the highlighted fields.",
          flat.fieldErrors as Record<string, string[]>,
        );
      }

      const data = await handler(parsed.data);
      for (const path of options.revalidate ?? []) revalidatePath(path);
      return success(data);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return failure("UNAUTHORIZED", "Please sign in again.");
      }
      if (error instanceof ActionError) {
        return failure(error.code, error.message);
      }
      if (isUniqueViolation(error)) {
        return failure("CONFLICT", "That already exists.");
      }
      console.error("Action failed", error);
      return failure("INTERNAL_ERROR", "Something went wrong. Please retry.");
    }
  };
}
