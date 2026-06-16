import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { createClient } from "@/lib/supabase/server";

/**
 * Emite un "ticket" (JWT corto) que el navegador usa para subir DIRECTAMENTE
 * al motor. El ticket solo contiene el user_id y va firmado con el secreto
 * compartido (MOTOR_JWT_SECRET). El motor lo verifica y resuelve el token de
 * Meta por su cuenta (nunca pasa por el navegador).
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const secret = new TextEncoder().encode(process.env.MOTOR_JWT_SECRET!);
  const jwt = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secret);

  return NextResponse.json({ ticket: jwt });
}
