"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdmin } from "../layout";

interface FunnelConfig {
  landing_headline?: string;
  landing_subheadline?: string;
  landing_cta_text?: string;
  video_url?: string;
  cta_timestamp_seconds?: number | string;
  school_url?: string;
}

interface Funnel {
  id: string;
  name: string;
  isActive: boolean;
  config: FunnelConfig;
  createdAt: number;
}

interface FunnelStats {
  id: string;
  name: string;
  isActive: boolean;
  config: FunnelConfig;
  landingVisits: number;
  leads: number;
  vslViewers: number;
  ctaShown: number;
  ctaClicked: number;
  leadConvRate: number | null;
  vslConvRate: number | null;
  ctaShownRate: number | null;
  ctaClickRate: number | null;
  overallConvRate: number | null;
}

const EMPTY_CONFIG: FunnelConfig = {
  landing_headline: "",
  landing_subheadline: "",
  landing_cta_text: "",
  video_url: "",
  cta_timestamp_seconds: "",
  school_url: "",
};

function pct(n: number | null) {
  if (n === null) return "—";
  return `${n.toFixed(1)}%`;
}

function winner(stats: FunnelStats[], key: keyof FunnelStats): string | null {
  const active = stats.filter((s) => s.isActive);
  if (active.length < 2) return null;
  const best = [...active].sort((a, b) => {
    const av = (a[key] as number | null) ?? -1;
    const bv = (b[key] as number | null) ?? -1;
    return bv - av;
  })[0];
  return best.id;
}

export default function ABTestingPage() {
  const { password } = useAdmin();
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [stats, setStats] = useState<FunnelStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{ name: string; isActive: boolean; config: FunnelConfig }>({
    name: "",
    isActive: true,
    config: { ...EMPTY_CONFIG },
  });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const headers = { "x-admin-password": password };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [fRes, sRes] = await Promise.all([
        fetch("/api/admin/funnels", { headers }),
        fetch("/api/admin/ab-stats", { headers }),
      ]);
      if (fRes.ok) setFunnels(await fRes.json());
      if (sRes.ok) setStats(await sRes.json());
    } finally {
      setLoading(false);
    }
  }, [password]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (password) fetchData();
  }, [password, fetchData]);

  async function handleCreate() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/funnels", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, isActive: form.isActive, config: form.config }),
      });
      if (res.ok) {
        setCreating(false);
        setForm({ name: "", isActive: true, config: { ...EMPTY_CONFIG } });
        fetchData();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(id: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/funnels/${id}`, {
        method: "PATCH",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, isActive: form.isActive, config: form.config }),
      });
      if (res.ok) {
        setEditingId(null);
        fetchData();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(funnel: Funnel) {
    await fetch(`/api/admin/funnels/${funnel.id}`, {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !funnel.isActive }),
    });
    fetchData();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/funnels/${id}`, { method: "DELETE", headers });
    setDeleteConfirm(null);
    fetchData();
  }

  function startEdit(funnel: Funnel) {
    setEditingId(funnel.id);
    setCreating(false);
    setForm({ name: funnel.name, isActive: funnel.isActive, config: { ...EMPTY_CONFIG, ...funnel.config } });
  }

  const winnerId = winner(stats, "overallConvRate");
  const winnerIdLead = winner(stats, "leadConvRate");
  const winnerIdCta = winner(stats, "ctaClickRate");

  if (loading) return <p className="text-muted">Cargando A/B testing...</p>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">A/B Testing</h1>
          <p className="text-sm text-muted mt-1">
            Crea variantes del funnel para comparar titulares, textos y configuracion del video.
            Cada visitante es asignado aleatoriamente a un funnel activo.
          </p>
        </div>
        <button
          onClick={() => { setCreating(true); setEditingId(null); setForm({ name: "", isActive: true, config: { ...EMPTY_CONFIG } }); }}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
        >
          + Nuevo funnel
        </button>
      </div>

      {/* Create / Edit Form */}
      {(creating || editingId) && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 space-y-5">
          <h2 className="text-base font-semibold">{creating ? "Nuevo funnel" : "Editar funnel"}</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nombre del funnel *" required>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Ej: Funnel A — Titular emocional"
                className={inputCls}
              />
            </Field>
            <Field label="Estado">
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="h-4 w-4 accent-primary"
                />
                <span className="text-sm text-foreground">Activo (recibe trafico)</span>
              </label>
            </Field>
          </div>

          <div className="border-t border-foreground/10 pt-4 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">
              Landing page — textos (dejar vacio = usa el texto global por defecto)
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Titular principal">
                <input type="text" value={form.config.landing_headline || ""} onChange={(e) => setForm((f) => ({ ...f, config: { ...f.config, landing_headline: e.target.value } }))} placeholder="Ej: Duerme como antes de la menopausia" className={inputCls} />
              </Field>
              <Field label="Texto CTA del formulario">
                <input type="text" value={form.config.landing_cta_text || ""} onChange={(e) => setForm((f) => ({ ...f, config: { ...f.config, landing_cta_text: e.target.value } }))} placeholder="Ej: Quiero mi clase gratuita" className={inputCls} />
              </Field>
              <Field label="Subtitulo / descripcion" className="sm:col-span-2">
                <textarea value={form.config.landing_subheadline || ""} onChange={(e) => setForm((f) => ({ ...f, config: { ...f.config, landing_subheadline: e.target.value } }))} placeholder="Ej: Te contamos el metodo que usan..." rows={2} className={inputCls + " resize-none"} />
              </Field>
            </div>
          </div>

          <div className="border-t border-foreground/10 pt-4 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">
              VSL — config (dejar vacio = usa la config global del admin)
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="URL del video">
                <input type="text" value={form.config.video_url || ""} onChange={(e) => setForm((f) => ({ ...f, config: { ...f.config, video_url: e.target.value } }))} placeholder="https://..." className={inputCls} />
              </Field>
              <Field label="URL del CTA (School)">
                <input type="text" value={form.config.school_url || ""} onChange={(e) => setForm((f) => ({ ...f, config: { ...f.config, school_url: e.target.value } }))} placeholder="https://..." className={inputCls} />
              </Field>
              <Field label="Segundo de aparicion del CTA">
                <input type="number" min={0} value={form.config.cta_timestamp_seconds || ""} onChange={(e) => setForm((f) => ({ ...f, config: { ...f.config, cta_timestamp_seconds: e.target.value } }))} placeholder="Ej: 1500" className={inputCls} />
              </Field>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={creating ? handleCreate : () => handleUpdate(editingId!)}
              disabled={saving || !form.name.trim()}
              className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50 transition-colors"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
            <button
              onClick={() => { setCreating(false); setEditingId(null); }}
              className="rounded-xl border border-foreground/10 px-6 py-2.5 text-sm font-medium text-muted hover:bg-foreground/5 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Funnels list */}
      {funnels.length === 0 && !creating ? (
        <div className="rounded-2xl border border-foreground/5 bg-white p-10 text-center">
          <p className="text-muted text-sm">Aun no hay funnels creados.</p>
          <p className="text-muted text-xs mt-1">Crea al menos 2 variantes para empezar un test A/B.</p>
        </div>
      ) : (
        <>
          {/* Stats comparison — only show if >= 2 active funnels with data */}
          {stats.filter((s) => s.isActive).length >= 1 && (
            <div className="rounded-2xl border border-foreground/5 bg-white p-6 space-y-5">
              <div>
                <h2 className="text-lg font-semibold">Comparacion de rendimiento</h2>
                <p className="text-xs text-muted mt-0.5">Solo se muestran funnels activos con trafico.</p>
              </div>

              {/* Big winner banner */}
              {winnerId && stats.find((s) => s.id === winnerId) && (
                <div className="rounded-xl bg-green-50 border border-green-200 px-5 py-4 flex items-center gap-3">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <p className="text-sm font-bold text-green-800">
                      Funnel ganador: {stats.find((s) => s.id === winnerId)?.name}
                    </p>
                    <p className="text-xs text-green-700 mt-0.5">
                      Mejor conversion global (visita landing → click CTA):{" "}
                      <strong>{pct(stats.find((s) => s.id === winnerId)?.overallConvRate ?? null)}</strong>
                    </p>
                  </div>
                </div>
              )}

              {/* Comparison table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-foreground/5">
                      <th className="text-left pb-3 pr-4 font-semibold text-foreground">Funnel</th>
                      <th className="text-right pb-3 px-3 font-medium text-muted whitespace-nowrap">Visitas landing</th>
                      <th className="text-right pb-3 px-3 font-medium text-muted whitespace-nowrap">Leads</th>
                      <th className="text-right pb-3 px-3 font-medium text-muted whitespace-nowrap">Conv. lead</th>
                      <th className="text-right pb-3 px-3 font-medium text-muted whitespace-nowrap">Vieron VSL</th>
                      <th className="text-right pb-3 px-3 font-medium text-muted whitespace-nowrap">Click CTA</th>
                      <th className="text-right pb-3 pl-3 font-medium text-muted whitespace-nowrap">Conv. global</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.filter((s) => s.isActive).map((s) => (
                      <tr key={s.id} className="border-b border-foreground/5 last:border-0">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            {s.id === winnerId && <span title="Ganador global">🏆</span>}
                            <span className="font-medium text-foreground">{s.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right text-foreground">{s.landingVisits}</td>
                        <td className="py-3 px-3 text-right text-foreground">{s.leads}</td>
                        <td className={`py-3 px-3 text-right font-semibold ${s.id === winnerIdLead ? "text-green-600" : "text-foreground"}`}>
                          {pct(s.leadConvRate)}
                          {s.id === winnerIdLead && <span className="ml-1 text-xs">↑</span>}
                        </td>
                        <td className="py-3 px-3 text-right text-foreground">{s.vslViewers}</td>
                        <td className={`py-3 px-3 text-right font-semibold ${s.id === winnerIdCta ? "text-green-600" : "text-foreground"}`}>
                          {pct(s.ctaClickRate)}
                          {s.id === winnerIdCta && <span className="ml-1 text-xs">↑</span>}
                        </td>
                        <td className={`py-3 pl-3 text-right font-bold ${s.id === winnerId ? "text-green-600" : "text-foreground"}`}>
                          {pct(s.overallConvRate)}
                          {s.id === winnerId && <span className="ml-1 text-xs">↑</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bar chart: overall conv rate */}
              {stats.filter((s) => s.isActive && s.overallConvRate !== null).length > 0 && (
                <div className="space-y-2 border-t border-foreground/5 pt-4">
                  <p className="text-xs font-semibold text-muted uppercase tracking-widest">Conversion global visual</p>
                  {stats.filter((s) => s.isActive).map((s) => {
                    const max = Math.max(...stats.filter((x) => x.isActive).map((x) => x.overallConvRate ?? 0), 0.001);
                    const barW = s.overallConvRate !== null ? Math.max((s.overallConvRate / max) * 100, 4) : 4;
                    return (
                      <div key={s.id} className="flex items-center gap-3">
                        <span className="text-xs text-muted w-44 truncate shrink-0">{s.name}</span>
                        <div className="flex-1 h-5 rounded-full bg-foreground/5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${s.id === winnerId ? "bg-green-500" : "bg-primary/50"}`}
                            style={{ width: `${barW}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold w-14 text-right ${s.id === winnerId ? "text-green-600" : "text-foreground"}`}>
                          {pct(s.overallConvRate)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <p className="text-xs text-muted">
                <strong>Conv. lead</strong> = visitas que dejan su email.{" "}
                <strong>Click CTA</strong> = leads que hacen click en el boton de compra sobre visitas VSL.{" "}
                <strong>Conv. global</strong> = clicks CTA sobre visitas totales a la landing.
              </p>
            </div>
          )}

          {/* Funnel cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {funnels.map((funnel) => {
              const s = stats.find((x) => x.id === funnel.id);
              return (
                <div
                  key={funnel.id}
                  className={`rounded-2xl border bg-white p-5 space-y-4 ${funnel.isActive ? "border-foreground/10" : "border-foreground/5 opacity-70"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{funnel.name}</span>
                        {s?.id === winnerId && <span className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5 font-medium">Ganador</span>}
                      </div>
                      <span className={`text-xs mt-0.5 ${funnel.isActive ? "text-green-600" : "text-muted"}`}>
                        {funnel.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => startEdit(funnel)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-foreground/10 text-muted hover:bg-foreground/5 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleToggle(funnel)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${funnel.isActive ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100" : "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"}`}
                      >
                        {funnel.isActive ? "Pausar" : "Activar"}
                      </button>
                      {deleteConfirm === funnel.id ? (
                        <>
                          <button onClick={() => handleDelete(funnel.id)} className="text-xs px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors">Confirmar</button>
                          <button onClick={() => setDeleteConfirm(null)} className="text-xs px-3 py-1.5 rounded-lg border border-foreground/10 text-muted hover:bg-foreground/5 transition-colors">No</button>
                        </>
                      ) : (
                        <button onClick={() => setDeleteConfirm(funnel.id)} className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors">Eliminar</button>
                      )}
                    </div>
                  </div>

                  {/* Mini stats */}
                  {s && (
                    <div className="grid grid-cols-3 gap-2 border-t border-foreground/5 pt-3">
                      <MiniStat label="Visitas" value={s.landingVisits} />
                      <MiniStat label="Leads" value={s.leads} />
                      <MiniStat label="Conv. lead" value={pct(s.leadConvRate)} highlight={s.id === winnerIdLead} />
                      <MiniStat label="VSL" value={s.vslViewers} />
                      <MiniStat label="Click CTA" value={s.ctaClicked} />
                      <MiniStat label="Conv. global" value={pct(s.overallConvRate)} highlight={s.id === winnerId} />
                    </div>
                  )}

                  {/* Config summary */}
                  {Object.values(funnel.config).some(Boolean) && (
                    <div className="border-t border-foreground/5 pt-3 space-y-1">
                      {funnel.config.landing_headline && (
                        <p className="text-xs text-muted"><span className="font-medium text-foreground/60">Titular:</span> {funnel.config.landing_headline}</p>
                      )}
                      {funnel.config.landing_cta_text && (
                        <p className="text-xs text-muted"><span className="font-medium text-foreground/60">CTA:</span> {funnel.config.landing_cta_text}</p>
                      )}
                      {funnel.config.cta_timestamp_seconds && (
                        <p className="text-xs text-muted"><span className="font-medium text-foreground/60">Segundo CTA:</span> {funnel.config.cta_timestamp_seconds}s</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {funnels.filter((f) => f.isActive).length < 2 && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              <strong>Nota:</strong> Necesitas al menos 2 funnels activos para que el test A/B funcione. Con uno solo, todos los visitantes ven ese funnel.
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Field({ label, children, className, required }: { label: string; children: React.ReactNode; className?: string; required?: boolean }) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-foreground/70 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function MiniStat({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="text-center">
      <p className="text-xs text-muted">{label}</p>
      <p className={`text-sm font-bold mt-0.5 ${highlight ? "text-green-600" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-foreground/10 bg-white px-3 py-2.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all";
