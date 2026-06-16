import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Middleware global: refresca la sesión de Supabase en cada navegación.
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Se ejecuta en todas las rutas EXCEPTO archivos estáticos e imágenes.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
