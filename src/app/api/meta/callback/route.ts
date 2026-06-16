import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { encrypt } from "@/lib/crypto";
import { exchangeCodeForToken, exchangeForLongLived, getMetaUser } from "@/lib/meta";

/**
 * Callback de OAuth de Meta.
 * 1. Verifica el `state` (anti-CSRF).
 * 2. Canjea el code → token corto → token largo.
 * 3. Cifra el token y lo guarda en `meta_connections` (con la service role key).
 * 4. Vuelve al panel.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  const dashboard = new URL("/dashboard", url.origin);

  // El usuario canceló o Meta devolvió error
  if (oauthError || !code) {
    dashboard.searchParams.set("meta", "error");
    return NextResponse.redirect(dashboard);
  }

  // Verificar el state guardado en la cookie
  const cookieStore = await cookies();
  const savedState = cookieStore.get("meta_oauth_state")?.value;
  if (!savedState || savedState !== state) {
    dashboard.searchParams.set("meta", "state");
    return NextResponse.redirect(dashboard);
  }

  // ¿Qué usuario de NUESTRA app está conectando? (sesión de Supabase)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", url.origin));

  try {
    const shortToken = await exchangeCodeForToken(code);
    const { token, expiresIn } = await exchangeForLongLived(shortToken);
    const metaUser = await getMetaUser(token);

    const expiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 1000).toISOString()
      : null;

    // Guardar (cifrado) con la service role → se salta RLS, solo backend.
    const { error } = await supabaseAdmin.from("meta_connections").upsert(
      {
        user_id: user.id,
        meta_user_id: metaUser.id,
        access_token_encrypted: encrypt(token),
        token_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
    if (error) throw error;

    dashboard.searchParams.set("meta", "ok");
    return NextResponse.redirect(dashboard);
  } catch (e) {
    console.error("Meta callback error:", e);
    dashboard.searchParams.set("meta", "error");
    return NextResponse.redirect(dashboard);
  }
}
