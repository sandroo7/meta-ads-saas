import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { decrypt } from "@/lib/crypto";

/**
 * Devuelve el usuario logueado y su token de Meta descifrado (o null).
 * Para usar en route handlers del servidor.
 */
export async function getUserToken() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, token: null as string | null };

  const { data: conn } = await supabaseAdmin
    .from("meta_connections")
    .select("access_token_encrypted")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!conn) return { user, token: null as string | null };

  return { user, token: decrypt(conn.access_token_encrypted) };
}
