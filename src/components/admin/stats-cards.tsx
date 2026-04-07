"use client";

import type { FunnelStats } from "@/types";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}m ${secs}s`;
}

export default function StatsCards({ stats }: { stats: FunnelStats }) {
  const cards = [
    { label: "Total Leads", value: stats.totalLeads.toString(), sub: `Hoy: ${stats.leadsToday} | Semana: ${stats.leadsThisWeek}` },
    { label: "Tasa VSL", value: `${stats.vslViewRate.toFixed(1)}%`, sub: "Leads que vieron el VSL" },
    { label: "Tiempo medio", value: formatTime(stats.avgWatchTimeSec), sub: "Promedio de visualizacion" },
    { label: "CTA mostrado", value: `${stats.ctaShowRate.toFixed(1)}%`, sub: "Llegaron al CTA" },
    { label: "CTA clickeado", value: `${stats.ctaClickRate.toFixed(1)}%`, sub: "Clickearon el CTA" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl border border-foreground/5 bg-white p-5 shadow-sm">
          <p className="text-sm text-muted">{card.label}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{card.value}</p>
          <p className="mt-1 text-xs text-muted">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
