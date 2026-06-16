import { NextResponse } from "next/server";
import { getUserToken } from "@/lib/userToken";
import { getInstagramAccounts } from "@/lib/meta";

/** GET /api/meta/instagram?accountId=123  → cuentas de Instagram disponibles. */
export async function GET(request: Request) {
  const { user, token } = await getUserToken();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!token) return NextResponse.json({ accounts: [] });

  const accountId = new URL(request.url).searchParams.get("accountId") ?? "";
  if (!accountId) return NextResponse.json({ error: "Falta accountId" }, { status: 400 });
  const adAccountId = accountId.startsWith("act_") ? accountId : `act_${accountId}`;

  try {
    const accounts = await getInstagramAccounts(token, adAccountId);
    return NextResponse.json({ accounts });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: message, accounts: [] }, { status: 200 });
  }
}
