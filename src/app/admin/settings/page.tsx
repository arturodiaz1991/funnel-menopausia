"use client";

import { useState, useEffect } from "react";
import { useAdmin } from "../layout";

export default function SettingsPage() {
  const { password } = useAdmin();

  const [ctaTimestamp] = useState(
    process.env.NEXT_PUBLIC_CTA_TIMESTAMP_SECONDS || "30"
  );
  const [videoUrl, setVideoUrl] = useState("");
  const [videoSaving, setVideoSaving] = useState(false);
  const [videoStatus, setVideoStatus] = useState<"idle" | "saved" | "error">("idle");

  const [pixelId, setPixelId] = useState("");
  const [pixelSaving, setPixelSaving] = useState(false);
  const [pixelStatus, setPixelStatus] = useState<"idle" | "saved" | "error">("idle");

  const [schoolUrl, setSchoolUrl] = useState("");
  const [schoolSaving, setSchoolSaving] = useState(false);
  const [schoolStatus, setSchoolStatus] = useState<"idle" | "saved" | "error">("idle");

  useEffect(() => {
    if (!password) return;
    fetch("/api/admin/config", {
      headers: { "x-admin-password": password },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.video_url) setVideoUrl(data.video_url);
        if (data.fb_pixel_id) setPixelId(data.fb_pixel_id);
        if (data.school_url) setSchoolUrl(data.school_url);
      })
      .catch(() => {});
  }, [password]);

  async function handleSaveVideoUrl() {
    if (!videoUrl.trim()) return;
    setVideoSaving(true);
    setVideoStatus("idle");
    try {
      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: {
          "x-admin-password": password,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key: "video_url", value: videoUrl }),
      });
      setVideoStatus(res.ok ? "saved" : "error");
    } catch {
      setVideoStatus("error");
    } finally {
      setVideoSaving(false);
    }
  }

  async function handleSaveSchoolUrl() {
    if (!schoolUrl.trim()) return;
    setSchoolSaving(true);
    setSchoolStatus("idle");
    try {
      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: {
          "x-admin-password": password,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key: "school_url", value: schoolUrl }),
      });
      setSchoolStatus(res.ok ? "saved" : "error");
    } catch {
      setSchoolStatus("error");
    } finally {
      setSchoolSaving(false);
    }
  }

  async function handleSavePixelId() {
    setPixelSaving(true);
    setPixelStatus("idle");
    try {
      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: {
          "x-admin-password": password,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key: "fb_pixel_id", value: pixelId }),
      });
      setPixelStatus(res.ok ? "saved" : "error");
    } catch {
      setPixelStatus("error");
    } finally {
      setPixelSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Configuracion</h1>

      {/* Video VSL */}
      <div className="rounded-2xl border border-foreground/5 bg-white p-6 max-w-lg space-y-4">
        <div>
          <h2 className="text-base font-semibold mb-1">URL del video VSL</h2>
          <p className="text-xs text-muted mb-3">
            Pega aqui la URL directa del video (.mp4 o streaming). Al guardar, el VSL cargara el nuevo video inmediatamente sin necesidad de redesplegar.
          </p>
          <textarea
            value={videoUrl}
            onChange={(e) => { setVideoUrl(e.target.value); setVideoStatus("idle"); }}
            rows={3}
            placeholder="https://ejemplo.com/tu-vsl.mp4"
            className="w-full rounded-xl border border-foreground/10 bg-white px-4 py-3 text-sm font-mono outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
          />
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={handleSaveVideoUrl}
              disabled={videoSaving || !videoUrl.trim()}
              className="rounded-xl bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {videoSaving ? "Guardando..." : "Guardar URL"}
            </button>
            {videoStatus === "saved" && (
              <span className="text-sm text-green-600 font-medium">Guardado. El VSL ya usa este video.</span>
            )}
            {videoStatus === "error" && (
              <span className="text-sm text-red-600 font-medium">Error al guardar. Intenta de nuevo.</span>
            )}
          </div>
          {videoUrl && (
            <div className="mt-3 pt-3 border-t border-foreground/5">
              <a
                href="/vsl"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                Abrir VSL para verificar &rarr;
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Facebook Pixel */}
      <div className="rounded-2xl border border-foreground/5 bg-white p-6 max-w-lg space-y-4">
        <div>
          <h2 className="text-base font-semibold mb-1">Facebook Pixel</h2>
          <p className="text-xs text-muted mb-3">
            Pega aqui tu Pixel ID de Meta Ads. Al guardar, el pixel se activara en todas las paginas sin necesidad de redesplegar. Dejalo en blanco para desactivarlo.
          </p>
          <input
            type="text"
            value={pixelId}
            onChange={(e) => { setPixelId(e.target.value); setPixelStatus("idle"); }}
            placeholder="Ej: 1234567890123456"
            className="w-full rounded-xl border border-foreground/10 bg-white px-4 py-3 text-sm font-mono outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={handleSavePixelId}
              disabled={pixelSaving}
              className="rounded-xl bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {pixelSaving ? "Guardando..." : "Guardar Pixel"}
            </button>
            {pixelId && (
              <button
                onClick={() => { setPixelId(""); setPixelStatus("idle"); }}
                className="rounded-xl border border-foreground/10 px-4 py-2 text-sm font-medium text-muted hover:bg-foreground/5 transition-colors"
              >
                Limpiar
              </button>
            )}
            {pixelStatus === "saved" && (
              <span className="text-sm text-green-600 font-medium">
                {pixelId ? "Pixel activado correctamente." : "Pixel desactivado."}
              </span>
            )}
            {pixelStatus === "error" && (
              <span className="text-sm text-red-600 font-medium">Error al guardar. Intenta de nuevo.</span>
            )}
          </div>
          <p className="mt-2 text-xs text-muted">
            Encuentra tu Pixel ID en Meta Business Suite &rarr; Eventos &rarr; Pixeles.
          </p>
        </div>
      </div>

      {/* Otras configuraciones (solo lectura) */}
      <div className="rounded-2xl border border-foreground/5 bg-white p-6 max-w-lg space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-1.5">
            Minuto de aparicion del CTA (segundos)
          </label>
          <input
            type="number"
            value={ctaTimestamp}
            disabled
            className="w-full rounded-xl border border-foreground/10 bg-gray-50 px-4 py-3 text-base text-muted"
          />
          <p className="mt-1 text-xs text-muted">
            Equivale a {Math.floor(parseInt(ctaTimestamp) / 60)}m {parseInt(ctaTimestamp) % 60}s del video.
            Cambiar este valor requiere actualizar la variable de entorno CTA_TIMESTAMP_SECONDS en Vercel.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-1.5">
            URL del CTA (Comunidad de School)
          </label>
          <input
            type="url"
            value={schoolUrl}
            onChange={(e) => { setSchoolUrl(e.target.value); setSchoolStatus("idle"); }}
            placeholder="https://school.com/tu-comunidad"
            className="w-full rounded-xl border border-foreground/10 bg-white px-4 py-3 text-sm font-mono outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={handleSaveSchoolUrl}
              disabled={schoolSaving || !schoolUrl.trim()}
              className="rounded-xl bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {schoolSaving ? "Guardando..." : "Guardar URL"}
            </button>
            {schoolStatus === "saved" && (
              <span className="text-sm text-green-600 font-medium">Guardado. El CTA ya apunta a esta URL.</span>
            )}
            {schoolStatus === "error" && (
              <span className="text-sm text-red-600 font-medium">Error al guardar. Intenta de nuevo.</span>
            )}
          </div>
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
        </div>

        <div className="pt-4 border-t border-foreground/5">
          <h3 className="text-sm font-semibold mb-2 text-red-600">Zona peligrosa</h3>
          <p className="text-xs text-muted mb-3">
            Elimina todos los leads, sesiones, eventos y emails de la base de datos. Irreversible.
          </p>
          <button
            onClick={async () => {
              if (!confirm("¿Seguro que quieres borrar TODOS los datos? Esta acción no se puede deshacer.")) return;
              if (!confirm("Última confirmación: se borrarán todos los leads, sesiones y eventos.")) return;
              const res = await fetch("/api/admin/reset", {
                method: "DELETE",
                headers: { "x-admin-password": password },
              });
              if (res.ok) {
                alert("Datos borrados correctamente.");
              } else {
                alert("Error al borrar los datos.");
              }
            }}
            className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            Borrar todos los datos
          </button>
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
