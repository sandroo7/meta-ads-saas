import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import TopBar from "@/components/TopBar";
import ConnectMetaButton from "@/components/ConnectMetaButton";
import AccountManager from "@/components/AccountManager";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ meta?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: conn } = await supabaseAdmin
    .from("meta_connections")
    .select("meta_user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  const connected = !!conn;

  const { meta } = await searchParams;

  return (
    <div className="min-h-screen">
      <TopBar email={user.email} />

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Subir anuncios
          </h1>
          <p className="text-sm text-slate-500">
            Conecta Meta, elige una cuenta y sube tus anuncios.
          </p>
        </div>

        {/* Avisos del flujo OAuth */}
        {meta === "ok" && (
          <Banner type="ok">✅ Cuenta de Meta conectada correctamente.</Banner>
        )}
        {meta === "error" && (
          <Banner type="err">❌ Hubo un problema al conectar con Meta. Inténtalo de nuevo.</Banner>
        )}
        {meta === "state" && (
          <Banner type="warn">⚠️ Sesión de conexión caducada. Vuelve a intentarlo.</Banner>
        )}

        {connected ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-green-50 px-2.5 text-xs font-medium text-green-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Meta conectado
                </span>
              </div>
              <ConnectMetaButton label="Reconectar" subtle />
            </div>
            <AccountManager />
          </section>
        ) : (
          <section className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-2xl">
              🔗
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              Conecta tu cuenta de Meta
            </h2>
            <p className="mx-auto mb-6 mt-1 max-w-sm text-sm text-slate-500">
              Necesitamos permiso para gestionar tus anuncios. Tu token se guarda
              cifrado y solo tú accedes a tus cuentas.
            </p>
            <div className="flex justify-center">
              <ConnectMetaButton />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function Banner({
  type,
  children,
}: {
  type: "ok" | "err" | "warn";
  children: React.ReactNode;
}) {
  const styles = {
    ok: "bg-green-50 text-green-700",
    err: "bg-red-50 text-red-700",
    warn: "bg-amber-50 text-amber-700",
  }[type];
  return <div className={`mb-4 rounded-xl px-4 py-3 text-sm ${styles}`}>{children}</div>;
}
