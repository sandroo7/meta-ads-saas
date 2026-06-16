"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Brand from "@/components/Brand";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setMsg(null);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) setMsg({ type: "err", text: error.message });
      else router.push("/dashboard");
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) setMsg({ type: "err", text: error.message });
      else
        setMsg({
          type: "ok",
          text: "Cuenta creada. Ya puedes iniciar sesión.",
        });
    }
  }

  const tab = (m: "signin" | "signup", label: string) => (
    <button
      onClick={() => {
        setMode(m);
        setMsg(null);
      }}
      className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
        mode === m
          ? "bg-white text-slate-900 shadow-sm"
          : "text-slate-500 hover:text-slate-700"
      }`}
    >
      {label}
    </button>
  );

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-200 to-violet-200 opacity-40 blur-3xl" />
      </div>

      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Brand />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex gap-1 rounded-xl bg-slate-100 p-1">
            {tab("signin", "Iniciar sesión")}
            {tab("signup", "Crear cuenta")}
          </div>

          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            placeholder="tu@email.com"
          />

          <label className="mb-1 block text-sm font-medium text-slate-700">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="mb-5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            placeholder="••••••••"
          />

          <button
            onClick={submit}
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading
              ? "Cargando…"
              : mode === "signin"
              ? "Entrar"
              : "Crear cuenta"}
          </button>

          {msg && (
            <p
              className={`mt-4 rounded-lg px-3 py-2 text-center text-sm ${
                msg.type === "ok"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {msg.text}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
