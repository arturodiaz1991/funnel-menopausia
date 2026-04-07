"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [ctaTimestamp, setCtaTimestamp] = useState(
    process.env.NEXT_PUBLIC_CTA_TIMESTAMP_SECONDS || "30"
  );
  const [schoolUrl, setSchoolUrl] = useState(
    process.env.NEXT_PUBLIC_SCHOOL_COMMUNITY_URL || "https://school.com/tu-comunidad"
  );

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Configuracion</h1>

      <div className="rounded-2xl border border-foreground/5 bg-white p-6 max-w-lg space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-1.5">
            Minuto de aparicion del CTA (segundos)
          </label>
          <input
            type="number"
            value={ctaTimestamp}
            onChange={(e) => setCtaTimestamp(e.target.value)}
            className="w-full rounded-xl border border-foreground/10 bg-white px-4 py-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <p className="mt-1 text-xs text-muted">
            Equivale a {Math.floor(parseInt(ctaTimestamp) / 60)}m {parseInt(ctaTimestamp) % 60}s del video.
            Cambiar este valor requiere actualizar la variable de entorno CTA_TIMESTAMP_SECONDS y reiniciar.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-1.5">
            URL de la Comunidad de School
          </label>
          <input
            type="url"
            value={schoolUrl}
            onChange={(e) => setSchoolUrl(e.target.value)}
            className="w-full rounded-xl border border-foreground/10 bg-white px-4 py-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <p className="mt-1 text-xs text-muted">
            URL a la que redirige el boton CTA. Cambiar requiere actualizar SCHOOL_COMMUNITY_URL.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-1.5">
            Timeout de abandono (minutos)
          </label>
          <input
            type="number"
            value="30"
            disabled
            className="w-full rounded-xl border border-foreground/10 bg-gray-50 px-4 py-3 text-base text-muted"
          />
          <p className="mt-1 text-xs text-muted">
            Tiempo de inactividad antes de considerar una sesion como abandonada.
          </p>
        </div>

        <div className="pt-4 border-t border-foreground/5">
          <h3 className="text-sm font-semibold mb-2">Ejecutar cron manualmente</h3>
          <p className="text-xs text-muted mb-3">
            Procesa las sesiones abandonadas y envia los emails correspondientes.
          </p>
          <button
            onClick={async () => {
              try {
                const cronSecret = prompt("Introduce el CRON_SECRET:");
                if (!cronSecret) return;
                const res = await fetch("/api/cron/abandonment", {
                  method: "POST",
                  headers: { authorization: `Bearer ${cronSecret}` },
                });
                const data = await res.json();
                alert(JSON.stringify(data, null, 2));
              } catch {
                alert("Error ejecutando el cron");
              }
            }}
            className="rounded-xl bg-foreground/10 px-4 py-2 text-sm font-medium hover:bg-foreground/20 transition-colors"
          >
            Ejecutar cron de abandono
          </button>
        </div>
      </div>
    </div>
  );
}
