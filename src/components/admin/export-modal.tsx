"use client";

import { useState } from "react";

interface ExportModalProps {
  password: string;
  onClose: () => void;
}

export default function ExportModal({ password, onClose }: ExportModalProps) {
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    minWatchMinutes: "",
    funnelStage: "all",
    emailSent: "all",
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<number | null>(null);

  function set(key: string, value: string) {
    setFilters((f) => ({ ...f, [key]: value }));
    setPreview(null);
  }

  function buildQuery() {
    const params = new URLSearchParams();
    if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.set("dateTo", filters.dateTo);
    if (filters.minWatchMinutes) params.set("minWatchMinutes", filters.minWatchMinutes);
    if (filters.funnelStage !== "all") params.set("funnelStage", filters.funnelStage);
    if (filters.emailSent !== "all") params.set("emailSent", filters.emailSent);
    return params.toString();
  }

  async function handlePreview() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/export?${buildQuery()}`, {
        headers: { "x-admin-password": password },
      });
      if (res.ok) {
        const text = await res.text();
        const lines = text.trim().split("\n").length - 1; // minus header
        setPreview(lines);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleExport() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/export?${buildQuery()}`, {
        headers: { "x-admin-password": password },
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-foreground/5 px-6 py-4">
          <h2 className="text-lg font-semibold">Exportar leads</h2>
          <button onClick={onClose} className="text-muted hover:text-foreground text-xl leading-none">&times;</button>
        </div>

        <div className="space-y-5 px-6 py-5">
          {/* Fechas */}
          <div>
            <p className="text-sm font-medium mb-2">Rango de fechas</p>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-muted block mb-1">Desde</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => set("dateFrom", e.target.value)}
                  className="w-full rounded-lg border border-foreground/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted block mb-1">Hasta</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => set("dateTo", e.target.value)}
                  className="w-full rounded-lg border border-foreground/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
          </div>

          {/* Tiempo mínimo visto */}
          <div>
            <label className="text-sm font-medium block mb-2">
              Tiempo mínimo visto en el VSL
            </label>
            <select
              value={filters.minWatchMinutes}
              onChange={(e) => set("minWatchMinutes", e.target.value)}
              className="w-full rounded-lg border border-foreground/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Cualquier tiempo (incluye 0)</option>
              <option value="1">Al menos 1 minuto</option>
              <option value="3">Al menos 3 minutos</option>
              <option value="5">Al menos 5 minutos</option>
              <option value="10">Al menos 10 minutos</option>
              <option value="15">Al menos 15 minutos</option>
              <option value="20">Al menos 20 minutos</option>
              <option value="30">Al menos 30 minutos</option>
              <option value="45">Al menos 45 minutos</option>
            </select>
          </div>

          {/* Etapa del funnel */}
          <div>
            <label className="text-sm font-medium block mb-2">
              Etapa en el funnel
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "all", label: "Todos los leads" },
                { value: "vsl", label: "Vio el VSL" },
                { value: "cta_shown", label: "Vio el botón CTA" },
                { value: "cta_clicked", label: "Clickeó el CTA" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => set("funnelStage", opt.value)}
                  className={`rounded-lg border px-3 py-2 text-sm text-left transition-colors ${
                    filters.funnelStage === opt.value
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-foreground/10 text-muted hover:border-foreground/20"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Emails enviados */}
          <div>
            <label className="text-sm font-medium block mb-2">
              Emails de seguimiento enviados
            </label>
            <div className="flex gap-2">
              {[
                { value: "all", label: "Todos" },
                { value: "yes", label: "Con emails" },
                { value: "no", label: "Sin emails" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => set("emailSent", opt.value)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
                    filters.emailSent === opt.value
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-foreground/10 text-muted hover:border-foreground/20"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview resultado */}
          {preview !== null && (
            <div className="rounded-lg bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-800">
              Con estos filtros se exportarán <strong>{preview} leads</strong>.
            </div>
          )}
        </div>

        <div className="flex gap-3 border-t border-foreground/5 px-6 py-4">
          <button
            onClick={handlePreview}
            disabled={loading}
            className="flex-1 rounded-xl border border-foreground/10 px-4 py-2.5 text-sm font-medium hover:bg-background/50 transition-colors disabled:opacity-50"
          >
            {loading ? "Calculando..." : "Ver cuántos leads"}
          </button>
          <button
            onClick={handleExport}
            disabled={loading}
            className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Exportando..." : "Descargar CSV"}
          </button>
        </div>
      </div>
    </div>
  );
}
