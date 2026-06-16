"use client";

import { useMemo, useState } from "react";
import { FEATURES } from "@/lib/features";

/**
 * Selector de funciones de IA / Advantage+, filtradas por formato (img/vid),
 * agrupadas y plegado tras un interruptor.
 */
export default function FeaturesPicker({
  fmt,
  value,
  onChange,
}: {
  fmt: "img" | "vid";
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const grupos = useMemo(() => {
    const out: Record<string, { api: string; label: string; applies: string }[]> = {};
    for (const f of FEATURES) {
      if (f.applies === fmt || f.applies === "both") {
        (out[f.group] ??= []).push({ api: f.api, label: f.label, applies: f.applies });
      }
    }
    return out;
  }, [fmt]);

  function toggle(api: string) {
    onChange(value.includes(api) ? value.filter((x) => x !== api) : [...value, api]);
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <span>🤖 Funciones de IA / Advantage+{value.length > 0 ? `  ·  ${value.length} activa(s)` : ""}</span>
        <span className="text-slate-400">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="mt-2 space-y-4 rounded-lg border border-slate-200 p-4">
          <p className="text-xs text-slate-400">
            Solo se muestran las compatibles con {fmt === "img" ? "imágenes" : "vídeos"}.
            Si no marcas nada, el anuncio sale “limpio”.
          </p>
          {Object.entries(grupos).map(([grupo, items]) => (
            <div key={grupo}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {grupo}
              </p>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {items.map((f) => (
                  <label
                    key={f.api}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={value.includes(f.api)}
                      onChange={() => toggle(f.api)}
                      className="rounded"
                    />
                    <span>
                      {f.label}
                      {f.applies === "vid" && <span className="text-slate-400"> · vídeo</span>}
                      {f.applies === "img" && <span className="text-slate-400"> · imagen</span>}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
