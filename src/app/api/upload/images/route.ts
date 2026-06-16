import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { decrypt } from "@/lib/crypto";

const MOTOR_URL = process.env.MOTOR_API_URL ?? "http://127.0.0.1:8000";

/**
 * Recibe del navegador los archivos + el copy, descifra el token del usuario
 * (en servidor) y reenvía todo al motor de Python (FastAPI) para subir.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const form = await request.formData();
  const accountId = String(form.get("account_id") ?? "");
  const adsetId = String(form.get("adset_id") ?? "");
  if (!accountId || !adsetId) {
    return NextResponse.json({ error: "Falta la cuenta o el Ad Set." }, { status: 400 });
  }

  // Token cifrado del usuario → descifrar en servidor
  const { data: conn } = await supabaseAdmin
    .from("meta_connections")
    .select("access_token_encrypted")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!conn) return NextResponse.json({ error: "No has conectado Meta." }, { status: 400 });
  const token = decrypt(conn.access_token_encrypted);

  // Campos del copy → JSON para el motor
  const copyFields = {
    primary_text: String(form.get("primary_text") ?? ""),
    headline: String(form.get("headline") ?? ""),
    description: String(form.get("description") ?? ""),
    link: String(form.get("link") ?? ""),
    page_id: String(form.get("page_id") ?? ""),
    cta: String(form.get("cta") ?? ""),
    status: String(form.get("status") ?? "PAUSED"),
    url_parameters: String(form.get("url_parameters") ?? ""),
    instagram_actor_id: String(form.get("instagram_actor_id") ?? ""),
    caption: String(form.get("caption") ?? ""),
    conversion_domain: String(form.get("conversion_domain") ?? ""),
    dsa_beneficiary: String(form.get("dsa_beneficiary") ?? ""),
    dsa_payor: String(form.get("dsa_payor") ?? ""),
  };

  // Reenvío al motor
  const fwd = new FormData();
  fwd.set("token", token);
  fwd.set("account_id", accountId);
  fwd.set("adset_id", adsetId);
  fwd.set("copy_json", JSON.stringify(copyFields));
  fwd.set("features", String(form.get("features") ?? "[]"));
  fwd.set("validate_only", String(form.get("validate_only") ?? "false"));
  for (const f of form.getAll("files")) {
    const file = f as File;
    fwd.append("files", file, file.name); // file.name puede incluir la ruta (V1/V1.1/img.jpg)
  }

  try {
    const res = await fetch(`${MOTOR_URL}/subir-imagenes`, { method: "POST", body: fwd });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: data.detail ?? "Error en el motor de subida." },
        { status: 400 }
      );
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "No se pudo contactar con el motor (¿está corriendo en :8000?)." },
      { status: 502 }
    );
  }
}
