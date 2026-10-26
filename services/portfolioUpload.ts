import type { ActionResult } from "@/types/actions";

export async function uploadPortfolioImage(
  body: FormData,
): Promise<ActionResult> {
  const response = await fetch("/api/admin/artists/portfolio", {
    method: "POST",
    body,
  });
  return (await response.json()) as ActionResult;
}
