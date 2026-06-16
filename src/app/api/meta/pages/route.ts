import { NextResponse } from "next/server";
import { getUserToken } from "@/lib/userToken";
import { getPages } from "@/lib/meta";

/** GET /api/meta/pages?accountId=123  → páginas (con IG) de la cuenta. */
export async function GET(request: Request) {
  const { user, token } = await getUserToken();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!token) return NextResponse.json({ pages: [] });

  const accountId = new URL(request.url).searchParams.get("accountId") ?? "";
  if (!accountId) return NextResponse.json({ error: "Falta accountId" }, { status: 400 });
  const adAccountId = accountId.startsWith("act_") ? accountId : `act_${accountId}`;

  try {
    const pages = await getPages(token, adAccountId);
    return NextResponse.json({ pages });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: message, pages: [] }, { status: 200 });
  }
}
