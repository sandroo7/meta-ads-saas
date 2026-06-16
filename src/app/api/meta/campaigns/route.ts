import { NextResponse } from "next/server";
import { getUserToken } from "@/lib/userToken";
import { getCampaigns } from "@/lib/meta";

/** GET /api/meta/campaigns?accountId=123  → campañas ACTIVAS de la cuenta. */
export async function GET(request: Request) {
  const { user, token } = await getUserToken();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!token) return NextResponse.json({ campaigns: [] });

  const accountId = new URL(request.url).searchParams.get("accountId") ?? "";
  if (!accountId) return NextResponse.json({ error: "Falta accountId" }, { status: 400 });
  const adAccountId = accountId.startsWith("act_") ? accountId : `act_${accountId}`;

  try {
    const campaigns = await getCampaigns(token, adAccountId);
    return NextResponse.json({ campaigns });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: message, campaigns: [] }, { status: 200 });
  }
}
