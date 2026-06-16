"use client";

import { useEffect, useMemo, useState } from "react";
import UploadPanel from "./UploadPanel";

export type Account = { account_id: string; name: string; currency: string; id: string };

export default function AccountManager() {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Account | null>(null);

  useEffect(() => {
    fetch("/api/meta/adaccounts")
      .then((r) => r.json())
      .then((d) => {
        setAccounts(d.accounts ?? []);
        if (d.error) setError(d.error);
      })
      .catch(() => setError("Error de red al cargar las cuentas."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter(
      (a) => a.name.toLowerCase().includes(q) || a.account_id.includes(q)
    );
  }, [accounts, query]);

  if (loading)
    return (
      <div className="animate-pulse space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-14 rounded-xl bg-slate-100" />
        ))}
      </div>
    );

  if (error) return <p className="text-sm text-red-600">{error}</p>;

  // ── Cuenta seleccionada → panel de subida ──────────────────────────
  if (selected) {
    return (
      <div>
        <button
          onClick={() => setSelected(null)}
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          ← Cambiar de cuenta
        </button>
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-sm font-semibold text-indigo-700">
            {selected.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{selected.name}</p>
            <p className="text-xs text-slate-500">
              act_{selected.account_id} · {selected.currency}
            </p>
          </div>
        </div>
        <UploadPanel account={selected} />
      </div>
    );
  }

  // ── Buscador + lista ───────────────────────────────────────────────
  return (
    <div>
      <div className="relative mb-4">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          🔎
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar cuenta por nombre o ID…"
          className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">
          No hay cuentas que coincidan con “{query}”.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {filtered.map((a) => (
            <li key={a.account_id}>
              <button
                onClick={() => setSelected(a)}
                className="group flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50/40"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-700">
                  {a.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900">{a.name}</p>
                  <p className="text-xs text-slate-500">
                    act_{a.account_id} · {a.currency}
                  </p>
                </div>
                <span className="text-slate-300 transition group-hover:text-indigo-500">
                  →
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-xs text-slate-400">
        {filtered.length} de {accounts.length} cuenta(s)
      </p>
    </div>
  );
}
