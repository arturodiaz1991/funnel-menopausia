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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!password) return;

    async function fetchData() {
      try {
        const [statsRes, heatmapRes] = await Promise.all([
          fetch("/api/admin/stats", { headers: { "x-admin-password": password } }),
          fetch("/api/admin/heatmap", { headers: { "x-admin-password": password } }),
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (heatmapRes.ok) setHeatmap(await heatmapRes.json());
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
            <FunnelStep label="Leads registrados" value={stats.totalLeads} percent={100} />
            <FunnelStep label="Vieron el VSL" value={Math.round(stats.totalLeads * stats.vslViewRate / 100)} percent={stats.vslViewRate} />
            <FunnelStep label="Vieron el CTA" value={Math.round(stats.totalLeads * stats.ctaShowRate / 100)} percent={stats.ctaShowRate} />
            <FunnelStep label="Clickearon CTA" value={Math.round(stats.totalLeads * stats.ctaClickRate / 100)} percent={stats.ctaClickRate} />
          </div>
        </div>
      )}

      <HeatmapChart data={heatmap} />
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
