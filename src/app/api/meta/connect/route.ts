import { NextResponse } from "next/server";
import crypto from "crypto";
import { getOAuthUrl } from "@/lib/meta";

/**
 * Inicia el flujo OAuth: genera un `state` anti-CSRF, lo guarda en cookie
 * y redirige al usuario al diálogo de login de Facebook.
 */
export async function GET() {
  const state = crypto.randomBytes(16).toString("hex");

  const response = NextResponse.redirect(getOAuthUrl(state));
  response.cookies.set("meta_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutos
    path: "/",
  });
  return response;
}
