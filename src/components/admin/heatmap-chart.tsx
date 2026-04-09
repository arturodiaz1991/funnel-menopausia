"use client";

import { useMemo } from "react";
import type { HeatmapDataPoint } from "@/types";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return mins > 0 ? `${mins}m${secs > 0 ? ` ${secs}s` : ""}` : `${secs}s`;
}

interface DropZone {
  second: number;
  drop: number; // percentage drop
  label: string;
}

export default function HeatmapChart({ data, ctaTimestamp = parseInt(process.env.NEXT_PUBLIC_CTA_TIMESTAMP_SECONDS || "30", 10) }: { data: HeatmapDataPoint[]; ctaTimestamp?: number }) {

  const metrics = useMemo(() => {
    if (data.length < 2) return null;

    const firstPercent = data[0]?.viewerPercent ?? 100;

    // Retention at key milestones
    const at25 = data.find((d) => d.second >= Math.floor(data[data.length - 1].second * 0.25));
    const at50 = data.find((d) => d.second >= Math.floor(data[data.length - 1].second * 0.5));
    const at75 = data.find((d) => d.second >= Math.floor(data[data.length - 1].second * 0.75));
    const atEnd = data[data.length - 1];

    // Find biggest drop zones (consecutive buckets with >10% drop in viewerPercent)
    const drops: DropZone[] = [];
    for (let i = 1; i < data.length; i++) {
      const drop = data[i - 1].viewerPercent - data[i].viewerPercent;
      if (drop > 5) {
        drops.push({ second: data[i].second, drop, label: formatTime(data[i].second) });
      }
    }
    drops.sort((a, b) => b.drop - a.drop);
    const topDrops = drops.slice(0, 3);

    // Average watch percent
    const avgPercent = data.reduce((sum, d) => sum + d.viewerPercent, 0) / data.length;

    return { firstPercent, at25, at50, at75, atEnd, topDrops, avgPercent };
  }, [data]);

  // SVG line chart
  const svgData = useMemo(() => {
    if (data.length < 2) return null;
    const W = 800;
    const H = 200;
    const PAD = { top: 10, right: 20, bottom: 10, left: 10 };
    const chartW = W - PAD.left - PAD.right;
    const chartH = H - PAD.top - PAD.bottom;

    const maxSec = data[data.length - 1].second;

    const toX = (sec: number) => PAD.left + (sec / maxSec) * chartW;
    const toY = (pct: number) => PAD.top + chartH - (pct / 100) * chartH;

    const points = data.map((d) => ({ x: toX(d.second), y: toY(d.viewerPercent), ...d }));

    // Smooth polyline path
    const pathD = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(" ");

    // Fill area under the curve
    const fillD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${(PAD.top + chartH).toFixed(1)} L ${PAD.left} ${(PAD.top + chartH).toFixed(1)} Z`;

    // CTA marker x position
    const ctaX = toX(ctaTimestamp);

    return { W, H, points, pathD, fillD, toX, toY, maxSec, chartH, PAD };
  }, [data, ctaTimestamp]);

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-foreground/5 bg-white p-6">
        <h3 className="text-lg font-semibold mb-2">Curva de Retencion del VSL</h3>
        <p className="text-muted text-sm">Aun no hay datos suficientes para mostrar la grafica.</p>
      </div>
    );
  }

  const ctaX = svgData ? svgData.toX(ctaTimestamp) : null;

  return (
    <div className="rounded-2xl border border-foreground/5 bg-white p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Curva de Retencion del VSL</h3>
        <p className="text-xs text-muted mt-0.5">Porcentaje de espectadores que siguen viendo en cada momento</p>
      </div>

      {/* Key metrics row */}
      {metrics && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricBox label="Retencion 25%" value={`${metrics.at25?.viewerPercent.toFixed(0) ?? "-"}%`} />
          <MetricBox label="Retencion 50%" value={`${metrics.at50?.viewerPercent.toFixed(0) ?? "-"}%`} />
          <MetricBox label="Retencion 75%" value={`${metrics.at75?.viewerPercent.toFixed(0) ?? "-"}%`} />
          <MetricBox label="Llegaron al final" value={`${metrics.atEnd?.viewerPercent.toFixed(0) ?? "-"}%`} />
        </div>
      )}

      {/* SVG chart */}
      {svgData && (
        <div className="relative w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${svgData.W} ${svgData.H}`}
            className="w-full"
            style={{ minWidth: 300, height: 200 }}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="retention-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b6f9a" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#8b6f9a" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Fill */}
            <path d={svgData.fillD} fill="url(#retention-fill)" />

            {/* Line */}
            <path d={svgData.pathD} fill="none" stroke="#8b6f9a" strokeWidth="2.5" strokeLinejoin="round" />

            {/* CTA marker */}
            {ctaX !== null && ctaX >= svgData.PAD.left && ctaX <= svgData.W - svgData.PAD.right && (
              <>
                <line
                  x1={ctaX} y1={svgData.PAD.top}
                  x2={ctaX} y2={svgData.PAD.top + svgData.chartH}
                  stroke="#16a34a" strokeWidth="1.5" strokeDasharray="4 3"
                />
                <text x={ctaX + 4} y={svgData.PAD.top + 12} fontSize="9" fill="#16a34a" fontWeight="600">CTA</text>
              </>
            )}

            {/* 50% retention line */}
            <line
              x1={svgData.PAD.left} y1={svgData.toY(50)}
              x2={svgData.W - svgData.PAD.right} y2={svgData.toY(50)}
              stroke="#d1d5db" strokeWidth="1" strokeDasharray="4 4"
            />
            <text x={svgData.PAD.left + 2} y={svgData.toY(50) - 3} fontSize="8" fill="#9ca3af">50%</text>
          </svg>

          {/* X-axis labels */}
          <div className="flex justify-between text-xs text-muted mt-1 px-1">
            <span>{formatTime(data[0]?.second || 0)}</span>
            <span>{formatTime(data[Math.floor(data.length / 4)]?.second || 0)}</span>
            <span>{formatTime(data[Math.floor(data.length / 2)]?.second || 0)}</span>
            <span>{formatTime(data[Math.floor(data.length * 3 / 4)]?.second || 0)}</span>
            <span>{formatTime(data[data.length - 1]?.second || 0)}</span>
          </div>
        </div>
      )}

      {/* Drop zones */}
      {metrics && metrics.topDrops.length > 0 && (
        <div>
          <p className="text-sm font-semibold mb-2">Puntos de mayor abandono</p>
          <div className="flex flex-col gap-2">
            {metrics.topDrops.map((drop, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs font-mono bg-red-50 text-red-600 rounded px-2 py-0.5 w-16 text-center">
                  {drop.label}
                </span>
                <div className="flex-1 h-2 rounded-full bg-foreground/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-red-400"
                    style={{ width: `${Math.min(drop.drop * 4, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-muted w-20 text-right">-{drop.drop.toFixed(1)}% espect.</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted mt-2">
            Estos son los momentos donde mas gente abandona el video. Revisa el contenido en esos puntos.
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted border-t border-foreground/5 pt-4">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 bg-[#8b6f9a] inline-block" /> Retencion de espectadores
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 bg-green-600 inline-block border-dashed border-t-2" /> Momento CTA
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 bg-gray-300 inline-block border-dashed border-t-2" /> 50% retencion
        </span>
      </div>
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-background/60 border border-foreground/5 px-4 py-3 text-center">
      <p className="text-xs text-muted mb-1">{label}</p>
      <p className="text-xl font-bold text-foreground">{value}</p>
    </div>
  );
}
