import { NextResponse } from "next/server";
import { getUserToken } from "@/lib/userToken";
import { getAdSets } from "@/lib/meta";

/** GET /api/meta/adsets?campaignId=123  → ad sets ACTIVOS de la campaña. */
export async function GET(request: Request) {
  const { user, token } = await getUserToken();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!token) return NextResponse.json({ adsets: [] });

  const campaignId = new URL(request.url).searchParams.get("campaignId") ?? "";
  if (!campaignId) return NextResponse.json({ error: "Falta campaignId" }, { status: 400 });

  try {
    const adsets = await getAdSets(token, campaignId);
    return NextResponse.json({ adsets });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: message, adsets: [] }, { status: 200 });
  }
}
