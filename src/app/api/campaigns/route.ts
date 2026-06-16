import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { decrypt } from "@/lib/crypto";
import { createCampaign } from "@/lib/meta";

/**
 * Crea una campaña básica en la cuenta indicada.
 * Body: { accountId: string, name: string, objective?: string }
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { accountId, name, objective } = await request.json();
  if (!accountId || !name) {
    return NextResponse.json({ error: "Faltan datos (accountId/name)." }, { status: 400 });
  }

  // Token cifrado del usuario
  const { data: conn } = await supabaseAdmin
    .from("meta_connections")
    .select("access_token_encrypted")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!conn) {
    return NextResponse.json({ error: "No has conectado Meta." }, { status: 400 });
  }

  try {
    const token = decrypt(conn.access_token_encrypted);
    const adAccountId = String(accountId).startsWith("act_")
      ? String(accountId)
      : `act_${accountId}`;
    const id = await createCampaign(token, adAccountId, name, objective);
    return NextResponse.json({ id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
