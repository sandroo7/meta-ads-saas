"use client";

import { useEffect, useState } from "react";
import type { Account } from "./AccountManager";
import FeaturesPicker from "./FeaturesPicker";

type Resultado = { anuncio: string; estado: string; ad_id?: string; error?: string };
type NamedId = { id: string; name: string };
type Page = { id: string; name: string; ig_id: string; ig_user: string };

const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50 disabled:text-slate-400";
const labelCls = "mb-1 block text-sm font-medium text-slate-700";
const sectionCls = "mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400";

export default function UploadPanel({ account }: { account: Account }) {
  const [tipo, setTipo] = useState<"Imágenes" | "Vídeos">("Imágenes");
  const fmt: "img" | "vid" = tipo === "Imágenes" ? "img" : "vid";

  // Cascada
  const [campaigns, setCampaigns] = useState<NamedId[]>([]);
  const [campaignId, setCampaignId] = useState("");
  const [adsets, setAdsets] = useState<NamedId[]>([]);
  const [adsetId, setAdsetId] = useState("");
  const [pages, setPages] = useState<Page[]>([]);
  const [pageId, setPageId] = useState("");
  const [igAccounts, setIgAccounts] = useState<{ id: string; username: string }[]>([]);
  const [igId, setIgId] = useState("");
  const [loadingC, setLoadingC] = useState(true);
  const [loadingA, setLoadingA] = useState(false);

  // Copy + opciones
  const [primaryText, setPrimaryText] = useState("");
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [cta, setCta] = useState("SHOP_NOW");
  const [status, setStatus] = useState("PAUSED");
  const [urlParams, setUrlParams] = useState("");
  const [caption, setCaption] = useState("");
  const [conversionDomain, setConversionDomain] = useState("");
  const [dsaBen, setDsaBen] = useState("");
  const [dsaPayor, setDsaPayor] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [advOpen, setAdvOpen] = useState(false);

  const [validateOnly, setValidateOnly] = useState(true);
  const [files, setFiles] = useState<File[]>([]);

  function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const all = Array.from(e.target.files ?? []);
    const filtered =
      tipo === "Imágenes"
        ? all.filter((f) => /\.(jpe?g|png|gif|webp)$/i.test(f.name))
        : all.filter((f) => /\.(mp4|mov|avi|mkv|m4v|wmv)$/i.test(f.name));
    setFiles(filtered);
  }

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultados, setResultados] = useState<Resultado[] | null>(null);

  useEffect(() => {
    setLoadingC(true);
    Promise.all([
      fetch(`/api/meta/campaigns?accountId=${account.account_id}`).then((r) => r.json()),
      fetch(`/api/meta/pages?accountId=${account.account_id}`).then((r) => r.json()),
      fetch(`/api/meta/instagram?accountId=${account.account_id}`).then((r) => r.json()),
    ])
      .then(([c, p, ig]) => {
        setCampaigns(c.campaigns ?? []);
        setPages(p.pages ?? []);
        setIgAccounts(ig.accounts ?? []);
        if (p.pages?.length === 1) setPageId(p.pages[0].id);
      })
      .catch(() => setError("No se pudieron cargar campañas/páginas."))
      .finally(() => setLoadingC(false));
  }, [account.account_id]);

  useEffect(() => {
    setAdsets([]);
    setAdsetId("");
    if (!campaignId) return;
    setLoadingA(true);
    fetch(`/api/meta/adsets?campaignId=${campaignId}`)
      .then((r) => r.json())
      .then((d) => setAdsets(d.adsets ?? []))
      .catch(() => {})
      .finally(() => setLoadingA(false));
  }, [campaignId]);

  useEffect(() => {
    setIgId(pages.find((p) => p.id === pageId)?.ig_id ?? "");
  }, [pageId, pages]);

  // Al cambiar de tipo, limpiar archivos y features (cambian las disponibles)
  useEffect(() => {
    setFiles([]);
    setFeatures([]);
  }, [tipo]);

  async function subir() {
    setError(null);
    setResultados(null);
    if (!adsetId) return setError("Elige una campaña y un ad set.");
    if (!pageId) return setError("Elige una página.");
    if (!primaryText.trim()) return setError("Falta el texto principal.");
    if (!link.trim()) return setError("Falta el enlace.");
    if (files.length === 0)
      return setError(tipo === "Imágenes" ? "Elige la carpeta de imágenes." : "Selecciona vídeos.");

    // Copy en un JSON (lo que espera el motor)
    const copyFields = {
      primary_text: primaryText,
      headline,
      description,
      link: link.trim(),
      page_id: pageId,
      cta,
      status,
      url_parameters: urlParams.trim(),
      instagram_actor_id: igId,
      caption: caption.trim(),
      conversion_domain: conversionDomain.trim(),
      dsa_beneficiary: dsaBen.trim(),
      dsa_payor: dsaPayor.trim(),
    };

    const fd = new FormData();
    fd.set("account_id", account.account_id);
    fd.set("adset_id", adsetId);
    fd.set("copy_json", JSON.stringify(copyFields));
    fd.set("features", JSON.stringify(features));
    fd.set("validate_only", String(validateOnly));
    files.forEach((f) => {
      // En imágenes conservamos la ruta relativa (V1/V1.1/img.jpg) para detectar anidado
      const fname = tipo === "Imágenes" ? f.webkitRelativePath || f.name : f.name;
      fd.append("files", f, fname);
    });

    const motorUrl = process.env.NEXT_PUBLIC_MOTOR_URL ?? "http://127.0.0.1:8000";
    const endpoint = tipo === "Imágenes" ? "/subir-imagenes" : "/subir-videos";

    setLoading(true);
    try {
      // 1) Pedir un ticket firmado a nuestra web
      const tk = await fetch("/api/upload/ticket", { method: "POST" }).then((r) => r.json());
      if (!tk.ticket) {
        setError("No se pudo autorizar la subida. Inicia sesión de nuevo.");
        return;
      }
      // 2) Subir DIRECTO al motor con el ticket
      const res = await fetch(`${motorUrl}${endpoint}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${tk.ticket}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) setError(data.detail ?? data.error ?? "Error al subir.");
      else setResultados(data.resultados ?? []);
    } catch {
      setError("No se pudo contactar con el motor de subida.");
    } finally {
      setLoading(false);
    }
  }

  const okCount = resultados?.filter((r) => ["ÉXITO", "VALIDADO"].includes(r.estado)).length ?? 0;

  return (
    <div className="space-y-6">
      {/* Tipo */}
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
        {(["Imágenes", "Vídeos"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTipo(t)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              tipo === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t === "Imágenes" ? "🖼️ Imágenes" : "🎬 Vídeos"}
          </button>
        ))}
      </div>

      {/* Destino */}
      <section>
        <h4 className={sectionCls}>Destino</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Campaña *</label>
            <select className={inputCls} value={campaignId} onChange={(e) => setCampaignId(e.target.value)} disabled={loadingC}>
              <option value="">{loadingC ? "Cargando…" : "Elige campaña…"}</option>
              {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {!loadingC && campaigns.length === 0 && <p className="mt-1 text-xs text-amber-600">No hay campañas activas.</p>}
          </div>
          <div>
            <label className={labelCls}>Ad Set *</label>
            <select className={inputCls} value={adsetId} onChange={(e) => setAdsetId(e.target.value)} disabled={!campaignId || loadingA}>
              <option value="">{loadingA ? "Cargando…" : !campaignId ? "Elige campaña antes" : "Elige ad set…"}</option>
              {adsets.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            {campaignId && !loadingA && adsets.length === 0 && <p className="mt-1 text-xs text-amber-600">Sin ad sets activos.</p>}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Página de Facebook *</label>
            <select className={inputCls} value={pageId} onChange={(e) => setPageId(e.target.value)} disabled={loadingC}>
              <option value="">{loadingC ? "Cargando…" : "Elige página…"}</option>
              {pages.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Cuenta de Instagram</label>
            <select className={inputCls} value={igId} onChange={(e) => setIgId(e.target.value)} disabled={loadingC}>
              <option value="">Usar la página de Facebook</option>
              {igAccounts.map((a) => <option key={a.id} value={a.id}>@{a.username || a.id}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* Copy */}
      <section>
        <h4 className={sectionCls}>Texto del anuncio</h4>
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Texto principal * <span className="font-normal text-slate-400">(una variación por línea)</span></label>
            <textarea className={inputCls} rows={3} value={primaryText} onChange={(e) => setPrimaryText(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Titular(es)</label><textarea className={inputCls} rows={2} value={headline} onChange={(e) => setHeadline(e.target.value)} /></div>
            <div><label className={labelCls}>Descripción(es)</label><textarea className={inputCls} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Enlace *</label><input className={inputCls} value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…" /></div>
            <div>
              <label className={labelCls}>Botón (CTA)</label>
              <select className={inputCls} value={cta} onChange={(e) => setCta(e.target.value)}>
                {["SHOP_NOW", "LEARN_MORE", "SIGN_UP", "SUBSCRIBE", "BUY_NOW", "DOWNLOAD", "GET_OFFER", "CONTACT_US", "NO_BUTTON"].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Funciones de IA */}
      <FeaturesPicker fmt={fmt} value={features} onChange={setFeatures} />

      {/* Opciones avanzadas */}
      <div>
        <button type="button" onClick={() => setAdvOpen((o) => !o)} className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50">
          <span>➕ Opciones avanzadas</span>
          <span className="text-slate-400">{advOpen ? "▲" : "▼"}</span>
        </button>
        {advOpen && (
          <div className="mt-2 grid grid-cols-2 gap-3 rounded-lg border border-slate-200 p-4">
            <div>
              <label className={labelCls}>Estado al crear</label>
              <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="PAUSED">PAUSED</option>
                <option value="ACTIVE">ACTIVE</option>
              </select>
            </div>
            <div><label className={labelCls}>conversion_domain</label><input className={inputCls} value={conversionDomain} onChange={(e) => setConversionDomain(e.target.value)} placeholder="tutienda.com" /></div>
            <div className="col-span-2"><label className={labelCls}>url_parameters (UTM)</label><input className={inputCls} value={urlParams} onChange={(e) => setUrlParams(e.target.value)} placeholder="utm_source=meta&utm_medium=cpc" /></div>
            <div><label className={labelCls}>caption</label><input className={inputCls} value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="tutienda.com" /></div>
            <div></div>
            <div><label className={labelCls}>dsa_beneficiary (UE)</label><input className={inputCls} value={dsaBen} onChange={(e) => setDsaBen(e.target.value)} /></div>
            <div><label className={labelCls}>dsa_payor (UE)</label><input className={inputCls} value={dsaPayor} onChange={(e) => setDsaPayor(e.target.value)} /></div>
          </div>
        )}
      </div>

      {/* Media */}
      <section>
        <h4 className={sectionCls}>{tipo === "Imágenes" ? "Imágenes" : "Vídeos"}</h4>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition hover:border-indigo-400 hover:bg-indigo-50/40">
          <span className="text-2xl">{tipo === "Imágenes" ? "📁" : "🎬"}</span>
          <span className="text-sm font-medium text-slate-700">
            {files.length > 0
              ? `${files.length} archivo(s) seleccionado(s)`
              : tipo === "Imágenes"
              ? "Elige la carpeta de imágenes"
              : "Haz clic para elegir vídeos"}
          </span>
          <span className="text-xs text-slate-400">
            {tipo === "Imágenes" ? "Carpeta plana o anidada (V1/V1.1) — se detecta sola" : "MP4, MOV…"}
          </span>
          {tipo === "Imágenes" ? (
            <input
              type="file"
              className="hidden"
              onChange={onPickFiles}
              {...({ webkitdirectory: "", directory: "" } as Record<string, string>)}
            />
          ) : (
            <input type="file" multiple accept="video/*" onChange={onPickFiles} className="hidden" />
          )}
        </label>
        {tipo === "Vídeos" && (
          <p className="mt-2 text-xs text-slate-400">
            Los vídeos se suben a tu biblioteca de Meta automáticamente (puede tardar según el peso).
          </p>
        )}
      </section>

      {/* Acciones */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={validateOnly} onChange={(e) => setValidateOnly(e.target.checked)} className="rounded" />
          Modo validación (no crea nada)
        </label>
        <button onClick={subir} disabled={loading} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50">
          {loading ? "Subiendo…" : "Subir anuncios"}
        </button>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">❌ {error}</p>}

      {resultados && (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2.5">
            <span className="text-sm font-medium text-slate-700">Resultados</span>
            <span className="text-xs font-medium text-slate-500">{okCount}/{resultados.length} correctos</span>
          </div>
          <ul className="divide-y divide-slate-100">
            {resultados.map((r, i) => {
              const ok = ["ÉXITO", "VALIDADO"].includes(r.estado);
              return (
                <li key={i} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span className="text-slate-900">{r.anuncio}</span>
                  <span className={ok ? "text-green-600" : "text-red-600"}>
                    {ok ? "✅" : "❌"} {r.estado}{r.ad_id ? ` · ${r.ad_id}` : ""}{r.error ? ` · ${r.error}` : ""}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
