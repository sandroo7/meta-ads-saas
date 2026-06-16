import { createClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase con la SERVICE_ROLE key.
 *
 * ⚠️  IMPORTANTE: esta key SE SALTA las reglas de seguridad (RLS).
 *     - Úsalo SOLO en el servidor (route handlers / acciones de servidor).
 *     - NUNCA lo importes en componentes de cliente.
 *     - Se usa para leer/escribir los tokens de Meta en `meta_connections`,
 *       a los que el navegador no tiene acceso.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);
