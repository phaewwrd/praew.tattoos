import { NextResponse } from "next/server";
import { listPublicSlots } from "@/server/slots";

export const dynamic = "force-dynamic";

export async function GET() {
  const slots = await listPublicSlots();
  return NextResponse.json(slots, { headers: { "Cache-Control": "no-store" } });
}
