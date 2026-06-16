import { NextResponse } from "next/server";
import { getUserToken } from "@/lib/userToken";

const MOTOR_URL = process.env.MOTOR_API_URL ?? "http://127.0.0.1:8000";

/** Reenvía la subida de vídeos al motor de Python (FastAPI). */
export async function POST(request: Request) {
  const { user, token } = await getUserToken();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!token) return NextResponse.json({ error: "No has conectado Meta." }, { status: 400 });

  const form = await request.formData();
  const accountId = String(form.get("account_id") ?? "");
  const adsetId = String(form.get("adset_id") ?? "");
  if (!accountId || !adsetId) {
    return NextResponse.json({ error: "Falta la cuenta o el Ad Set." }, { status: 400 });
  }

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

  const fwd = new FormData();
  fwd.set("token", token);
  fwd.set("account_id", accountId);
  fwd.set("adset_id", adsetId);
  fwd.set("copy_json", JSON.stringify(copyFields));
  fwd.set("features", String(form.get("features") ?? "[]"));
  fwd.set("validate_only", String(form.get("validate_only") ?? "false"));
  for (const f of form.getAll("files")) {
    const file = f as File;
    fwd.append("files", file, file.name);
  }

  try {
    const res = await fetch(`${MOTOR_URL}/subir-videos`, { method: "POST", body: fwd });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data.detail ?? "Error en el motor." }, { status: 400 });
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "No se pudo contactar con el motor (¿está corriendo en :8000?)." },
      { status: 502 }
    );
  }
}
