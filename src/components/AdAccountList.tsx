"use client";

import { useEffect, useState } from "react";

type Account = { account_id: string; name: string; currency: string; id: string };

/**
 * Lista las cuentas de anuncios del usuario, pidiéndolas a /api/meta/adaccounts.
 */
export default function AdAccountList() {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) return <p className="text-sm text-gray-500">Cargando cuentas…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (accounts.length === 0)
    return <p className="text-sm text-gray-500">No se encontraron cuentas de anuncios.</p>;

  return (
    <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
      {accounts.map((a) => (
        <li key={a.account_id} className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="font-medium text-gray-900">{a.name}</p>
            <p className="text-xs text-gray-500">
              act_{a.account_id} · {a.currency}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
