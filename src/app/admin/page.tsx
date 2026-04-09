"use client";

import { useState, useEffect } from "react";
import { useAdmin } from "./layout";
import StatsCards from "@/components/admin/stats-cards";
import HeatmapChart from "@/components/admin/heatmap-chart";
import type { FunnelStats, HeatmapDataPoint } from "@/types";

export default function AdminDashboard() {
  const { password } = useAdmin();
  const [stats, setStats] = useState<FunnelStats | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapDataPoint[]>([]);
  const [ctaTimestamp, setCtaTimestamp] = useState(parseInt(process.env.NEXT_PUBLIC_CTA_TIMESTAMP_SECONDS || "30", 10));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!password) return;

    async function fetchData() {
      try {
        const [statsRes, heatmapRes, configRes] = await Promise.all([
          fetch("/api/admin/stats", { headers: { "x-admin-password": password } }),
          fetch("/api/admin/heatmap", { headers: { "x-admin-password": password } }),
          fetch("/api/admin/config", { headers: { "x-admin-password": password } }),
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (heatmapRes.ok) setHeatmap(await heatmapRes.json());
        if (configRes.ok) {
          const cfg = await configRes.json();
          if (cfg.cta_timestamp_seconds) setCtaTimestamp(parseInt(cfg.cta_timestamp_seconds, 10));
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [password]);

  if (loading) {
    return <p className="text-muted">Cargando dashboard...</p>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {stats && <StatsCards stats={stats} />}

      {/* Funnel visualization */}
      {stats && (
        <div className="rounded-2xl border border-foreground/5 bg-white p-6">
          <h3 className="text-lg font-semibold mb-4">Embudo de Conversion</h3>
          <div className="flex flex-col gap-2 max-w-md mx-auto">
            {(() => {
              const base = stats.landingVisits || stats.totalLeads;
              const vslViewers = Math.round(stats.totalLeads * stats.vslViewRate / 100);
              const ctaViewers = Math.round(vslViewers * stats.ctaShowRate / 100);
              const ctaClickers = Math.round(vslViewers * stats.ctaClickRate / 100);
              const pct = (n: number) => base > 0 ? (n / base) * 100 : 0;
              return (
                <>
                  <FunnelStep label="Visitaron la landing" value={stats.landingVisits} percent={100} />
                  <FunnelStep label="Leads registrados" value={stats.totalLeads} percent={pct(stats.totalLeads)} />
                  <FunnelStep label="Vieron el VSL" value={vslViewers} percent={pct(vslViewers)} />
                  <FunnelStep label="Vieron el CTA" value={ctaViewers} percent={pct(ctaViewers)} />
                  <FunnelStep label="Clickearon CTA" value={ctaClickers} percent={pct(ctaClickers)} />
                </>
              );
            })()}
          </div>
        </div>
      )}

      <HeatmapChart data={heatmap} ctaTimestamp={ctaTimestamp} />
    </div>
  );
}

function FunnelStep({ label, value, percent }: { label: string; value: number; percent: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div
          className="rounded-lg bg-primary/20 py-2 px-4 text-center transition-all"
          style={{ width: `${Math.max(percent, 20)}%`, marginInline: "auto" }}
        >
          <span className="text-sm font-semibold text-foreground">{value}</span>
        </div>
      </div>
      <span className="text-sm text-muted w-40 shrink-0">{label} ({percent.toFixed(1)}%)</span>
    </div>
  );
}
