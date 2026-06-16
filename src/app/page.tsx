import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Brand from "@/components/Brand";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* halo de fondo */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-200 to-violet-200 opacity-50 blur-3xl" />
      </div>

      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <Brand />
        <Link
          href="/login"
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Iniciar sesión
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 text-center">
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          Conecta tu Meta en un clic
        </span>
        <h1 className="text-balance text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
          Sube anuncios a Meta
          <br />
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            en segundos
          </span>
        </h1>
        <p className="mt-5 max-w-xl text-lg text-slate-500">
          Automatiza la creación de anuncios en Facebook e Instagram. Conecta tu
          cuenta, sube tus creatividades y deja que el resto sea automático.
        </p>
        <div className="mt-8 flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            Empezar gratis
          </Link>
        </div>

        <div className="mt-14 grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            ["⚡", "Sin Excel", "Rellena el copy en la web, sin archivos."],
            ["🔒", "Seguro", "Tu token va cifrado, conectas con un clic."],
            ["🚀", "En lote", "Sube muchos anuncios de una sola vez."],
          ].map(([icon, title, desc]) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm"
            >
              <div className="text-2xl">{icon}</div>
              <p className="mt-2 font-semibold text-slate-900">{title}</p>
              <p className="mt-1 text-sm text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="mx-auto w-full max-w-5xl px-6 py-8 text-center text-sm text-slate-400">
        AutoAds · Hecho para subir anuncios rápido
      </footer>
    </div>
  );
}
