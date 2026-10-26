import "server-only";

import { createHash } from "node:crypto";
import { sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";

/** Fixed-window limiter stored in Postgres (works across serverless instances). */
export async function hitRateLimit(
  scope: string,
  { limit, windowSeconds }: { limit: number; windowSeconds: number },
): Promise<boolean> {
  const requestHeaders = await headers();
  const ip =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip") ||
    "unknown";
  // Store a salted hash, never the raw IP.
  const key = `${scope}:${createHash("sha256")
    .update(`${process.env.BETTER_AUTH_SECRET ?? ""}:${ip}`)
    .digest("hex")
    .slice(0, 32)}`;

  const result = await db.execute<{ hits: number }>(sql`
    insert into rate_limits (key, window_start, hits) values (${key}, now(), 1)
    on conflict (key) do update set
      hits = case when rate_limits.window_start < now() - make_interval(secs => ${windowSeconds})
        then 1 else rate_limits.hits + 1 end,
      window_start = case when rate_limits.window_start < now() - make_interval(secs => ${windowSeconds})
        then now() else rate_limits.window_start end
    returning hits
  `);
  return Number(result.rows[0]?.hits ?? 0) <= limit;
}
