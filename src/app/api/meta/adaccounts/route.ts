import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { decrypt } from "@/lib/crypto";
import { getAdAccounts } from "@/lib/meta";

/**
 * Devuelve las cuentas de anuncios del usuario conectado.
 * Lee su token cifrado, lo descifra (solo en servidor) y consulta la Graph API.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { data: conn } = await supabaseAdmin
    .from("meta_connections")
    .select("access_token_encrypted")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!conn) return NextResponse.json({ connected: false, accounts: [] });

  try {
    const token = decrypt(conn.access_token_encrypted);
    const accounts = await getAdAccounts(token);
    return NextResponse.json({ connected: true, accounts });
  } catch (e) {
    console.error("adaccounts error:", e);
    return NextResponse.json(
      { connected: true, accounts: [], error: "No se pudieron leer las cuentas (token caducado o sin permiso)." },
      { status: 200 }
    );
  }
}
