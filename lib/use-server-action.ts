"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { ServerFailure, ServerResponse } from "@/lib/server-response";

export class ServerActionError extends Error {
  readonly failure: ServerFailure;
  constructor(failure: ServerFailure) {
    super(failure.message);
    this.failure = failure;
  }
}

/**
 * TanStack Query mutation around a server action created with createAction().
 * Refreshes server components on success so page data stays current.
 */
export function useServerAction<I, R>(
  action: (input: I) => Promise<ServerResponse<R>>,
  options: { onSuccess?: (data: R) => void; refresh?: boolean } = {},
) {
  const router = useRouter();
  return useMutation({
    mutationFn: async (input: I) => {
      const result = await action(input);
      if (!result.ok) throw new ServerActionError(result);
      return result.data;
    },
    onSuccess: (data) => {
      if (options.refresh !== false) router.refresh();
      options.onSuccess?.(data);
    },
  });
}
