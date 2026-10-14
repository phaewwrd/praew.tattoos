import { NextResponse } from "next/server";
import { addPortfolioImage } from "@/app/admin/(dashboard)/artists/actions";
import { getAdminSession } from "@/lib/admin-auth";

export async function POST(request: Request) {
	if (!(await getAdminSession())) {
		return NextResponse.json(
			{ ok: false, error: "Admin access required." },
			{ status: 401 },
		);
	}

	try {
		const result = await addPortfolioImage(await request.formData());
		return NextResponse.json(result, { status: result.ok ? 200 : 400 });
	} catch {
		return NextResponse.json(
			{ ok: false, error: "Failed to upload portfolio image." },
			{ status: 500 },
		);
	}
}
