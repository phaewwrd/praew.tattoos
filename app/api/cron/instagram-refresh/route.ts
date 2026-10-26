import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { INSTAGRAM_CACHE_TAG, refreshInstagramToken } from "@/server/instagram";

export const dynamic = "force-dynamic";

// Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`.
function authorized(header: string | null): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || !header) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(header);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

/** Daily (Hobby-plan compatible) refresh of the long-lived Instagram token. */
export async function GET(request: Request) {
  if (!authorized(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await refreshInstagramToken();
    revalidateTag(INSTAGRAM_CACHE_TAG, "max");
    return NextResponse.json(result);
  } catch (error) {
    console.error("Instagram token refresh failed", (error as Error).message);
    return NextResponse.json({ error: "Refresh failed" }, { status: 502 });
  }
}
