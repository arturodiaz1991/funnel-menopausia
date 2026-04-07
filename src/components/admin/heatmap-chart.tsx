"use client";

import type { HeatmapDataPoint } from "@/types";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function HeatmapChart({ data }: { data: HeatmapDataPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-foreground/5 bg-white p-6">
        <h3 className="text-lg font-semibold mb-4">Curva de Retencion</h3>
        <p className="text-muted text-sm">Aun no hay datos suficientes</p>
      </div>
    );
  }

  const maxViewers = Math.max(...data.map((d) => d.viewerCount));

  return (
    <div className="rounded-2xl border border-foreground/5 bg-white p-6">
      <h3 className="text-lg font-semibold mb-4">Curva de Retencion del VSL</h3>
      <div className="relative h-48 flex items-end gap-px">
        {data.map((point) => (
          <div
            key={point.second}
            className="group relative flex-1 min-w-[2px]"
            style={{ height: "100%" }}
          >
            <div
              className="absolute bottom-0 w-full rounded-t-sm transition-colors"
              style={{
                height: `${point.viewerPercent}%`,
                backgroundColor: point.viewerPercent > 50
                  ? "#8b6f9a"
                  : point.viewerPercent > 25
                    ? "#d4a8c7"
                    : "#ef4444",
              }}
            />
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
              <div className="bg-foreground text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap shadow-lg">
                {formatTime(point.second)}: {point.viewerPercent.toFixed(1)}% ({point.viewerCount})
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* X-axis labels */}
      <div className="flex justify-between mt-2 text-xs text-muted">
        <span>{formatTime(data[0]?.second || 0)}</span>
        <span>{formatTime(data[Math.floor(data.length / 2)]?.second || 0)}</span>
        <span>{formatTime(data[data.length - 1]?.second || 0)}</span>
      </div>
      {/* Legend */}
      <div className="flex gap-4 mt-4 text-xs text-muted">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-[#8b6f9a]" /> &gt;50%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-[#d4a8c7]" /> 25-50%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-red-500" /> &lt;25%
        </span>
      </div>
    </div>
  );
}
