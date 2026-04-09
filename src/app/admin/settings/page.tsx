"use client";

import { useState, useEffect } from "react";
import { useAdmin } from "../layout";

export default function SettingsPage() {
  const { password } = useAdmin();

  const [ctaTimestamp, setCtaTimestamp] = useState(process.env.NEXT_PUBLIC_CTA_TIMESTAMP_SECONDS || "1500");
  const [ctaSaving, setCtaSaving] = useState(false);
  const [ctaStatus, setCtaStatus] = useState<"idle" | "saved" | "error">("idle");

  const [abandonmentTimeout, setAbandonmentTimeout] = useState("30");
  const [abandonmentSaving, setAbandonmentSaving] = useState(false);
  const [abandonmentStatus, setAbandonmentStatus] = useState<"idle" | "saved" | "error">("idle");

  const [videoUrl, setVideoUrl] = useState("");
  const [videoSaving, setVideoSaving] = useState(false);
  const [videoStatus, setVideoStatus] = useState<"idle" | "saved" | "error">("idle");

  const [pixelId, setPixelId] = useState("");
  const [pixelSaving, setPixelSaving] = useState(false);
  const [pixelStatus, setPixelStatus] = useState<"idle" | "saved" | "error">("idle");

  const [schoolUrl, setSchoolUrl] = useState("");
  const [schoolSaving, setSchoolSaving] = useState(false);
  const [schoolStatus, setSchoolStatus] = useState<"idle" | "saved" | "error">("idle");

  const [privacyUrl, setPrivacyUrl] = useState("");
  const [privacyLinkText, setPrivacyLinkText] = useState("");
  const [privacySaving, setPrivacySaving] = useState(false);
  const [privacyStatus, setPrivacyStatus] = useState<"idle" | "saved" | "error">("idle");

  const [cookieBannerEnabled, setCookieBannerEnabled] = useState(true);
  const [cookieBannerSaving, setCookieBannerSaving] = useState(false);
  const [cookieBannerStatus, setCookieBannerStatus] = useState<"idle" | "saved" | "error">("idle");

  const [contactEmail, setContactEmail] = useState("info@natucoach.com");
  const [contactEmailSaving, setContactEmailSaving] = useState(false);
  const [contactEmailStatus, setContactEmailStatus] = useState<"idle" | "saved" | "error">("idle");

  const [skipLanding, setSkipLanding] = useState(false);
  const [skipLandingSaving, setSkipLandingSaving] = useState(false);
  const [skipLandingStatus, setSkipLandingStatus] = useState<"idle" | "saved" | "error">("idle");

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
        if (data.privacy_url) setPrivacyUrl(data.privacy_url);
        if (data.privacy_link_text) setPrivacyLinkText(data.privacy_link_text);
        setCookieBannerEnabled(data.cookie_banner_enabled !== "false");
        if (data.contact_email) setContactEmail(data.contact_email);
        setSkipLanding(data.skip_landing === "true");
        if (data.cta_timestamp_seconds) setCtaTimestamp(data.cta_timestamp_seconds);
        if (data.abandonment_timeout_minutes) setAbandonmentTimeout(data.abandonment_timeout_minutes);
      })
      .catch(() => {});
  }, [password]);

  async function saveConfig(key: string, value: string) {
    return fetch("/api/admin/config", {
      method: "PUT",
      headers: { "x-admin-password": password, "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
  }

  async function handleSaveCtaTimestamp() {
    setCtaSaving(true);
    setCtaStatus("idle");
    try {
      const res = await saveConfig("cta_timestamp_seconds", ctaTimestamp);
      setCtaStatus(res.ok ? "saved" : "error");
    } catch {
      setCtaStatus("error");
    } finally {
      setCtaSaving(false);
    }
  }

  async function handleSaveAbandonmentTimeout() {
    setAbandonmentSaving(true);
    setAbandonmentStatus("idle");
    try {
      const res = await saveConfig("abandonment_timeout_minutes", abandonmentTimeout);
      setAbandonmentStatus(res.ok ? "saved" : "error");
    } catch {
      setAbandonmentStatus("error");
    } finally {
      setAbandonmentSaving(false);
    }
  }

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

  async function handleSavePrivacy() {
    setPrivacySaving(true);
    setPrivacyStatus("idle");
    try {
      await Promise.all([
        fetch("/api/admin/config", {
          method: "PUT",
          headers: { "x-admin-password": password, "Content-Type": "application/json" },
          body: JSON.stringify({ key: "privacy_url", value: privacyUrl }),
        }),
        fetch("/api/admin/config", {
          method: "PUT",
          headers: { "x-admin-password": password, "Content-Type": "application/json" },
          body: JSON.stringify({ key: "privacy_link_text", value: privacyLinkText || "Politica de Privacidad" }),
        }),
      ]);
      setPrivacyStatus("saved");
    } catch {
      setPrivacyStatus("error");
    } finally {
      setPrivacySaving(false);
    }
  }

  async function handleSaveCookieBanner(enabled: boolean) {
    setCookieBannerSaving(true);
    setCookieBannerStatus("idle");
    try {
      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "x-admin-password": password, "Content-Type": "application/json" },
        body: JSON.stringify({ key: "cookie_banner_enabled", value: enabled ? "true" : "false" }),
      });
      if (res.ok) {
        setCookieBannerEnabled(enabled);
        setCookieBannerStatus("saved");
      } else {
        setCookieBannerStatus("error");
      }
    } catch {
      setCookieBannerStatus("error");
    } finally {
      setCookieBannerSaving(false);
    }
  }

  async function handleSaveContactEmail() {
    setContactEmailSaving(true);
    setContactEmailStatus("idle");
    try {
      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "x-admin-password": password, "Content-Type": "application/json" },
        body: JSON.stringify({ key: "contact_email", value: contactEmail }),
      });
      setContactEmailStatus(res.ok ? "saved" : "error");
    } catch {
      setContactEmailStatus("error");
    } finally {
      setContactEmailSaving(false);
    }
  }

  async function handleSaveSkipLanding(skip: boolean) {
    setSkipLandingSaving(true);
    setSkipLandingStatus("idle");
    try {
      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "x-admin-password": password, "Content-Type": "application/json" },
        body: JSON.stringify({ key: "skip_landing", value: skip ? "true" : "false" }),
      });
      if (res.ok) {
        setSkipLanding(skip);
        setSkipLandingStatus("saved");
      } else {
        setSkipLandingStatus("error");
      }
    } catch {
      setSkipLandingStatus("error");
    } finally {
      setSkipLandingSaving(false);
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
              disabled={videoSaving}
              className="rounded-xl bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {videoSaving ? "Guardando..." : "Guardar URL"}
            </button>
            <button
              onClick={async () => { setVideoUrl(""); const res = await saveConfig("video_url", ""); setVideoStatus(res.ok ? "saved" : "error"); }}
              disabled={videoSaving}
              className="rounded-xl border border-foreground/10 px-4 py-2 text-sm font-medium text-muted hover:bg-foreground/5 transition-colors disabled:opacity-50"
            >
              Eliminar
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
            <button
              onClick={async () => { setPixelId(""); const res = await saveConfig("fb_pixel_id", ""); setPixelStatus(res.ok ? "saved" : "error"); }}
              disabled={pixelSaving}
              className="rounded-xl border border-foreground/10 px-4 py-2 text-sm font-medium text-muted hover:bg-foreground/5 transition-colors disabled:opacity-50"
            >
              Eliminar
            </button>
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

      {/* Politica de Privacidad */}
      <div className="rounded-2xl border border-foreground/5 bg-white p-6 max-w-lg space-y-4">
        <div>
          <h2 className="text-base font-semibold mb-1">Politica de Privacidad</h2>
          <p className="text-xs text-muted mb-4">
            Configura el enlace y el texto que aparece en el checkbox obligatorio del formulario de captacion.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-foreground/70 mb-1">
                Texto del enlace (nombre visible)
              </label>
              <input
                type="text"
                value={privacyLinkText}
                onChange={(e) => { setPrivacyLinkText(e.target.value); setPrivacyStatus("idle"); }}
                placeholder="Politica de Privacidad"
                className="w-full rounded-xl border border-foreground/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground/70 mb-1">
                URL de la Politica de Privacidad
              </label>
              <input
                type="url"
                value={privacyUrl}
                onChange={(e) => { setPrivacyUrl(e.target.value); setPrivacyStatus("idle"); }}
                placeholder="https://tudominio.com/privacidad"
                className="w-full rounded-xl border border-foreground/10 bg-white px-4 py-3 text-sm font-mono outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={handleSavePrivacy}
              disabled={privacySaving}
              className="rounded-xl bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {privacySaving ? "Guardando..." : "Guardar"}
            </button>
            <button
              onClick={async () => { setPrivacyUrl(""); setPrivacyLinkText(""); await Promise.all([saveConfig("privacy_url", ""), saveConfig("privacy_link_text", "")]); setPrivacyStatus("saved"); }}
              disabled={privacySaving}
              className="rounded-xl border border-foreground/10 px-4 py-2 text-sm font-medium text-muted hover:bg-foreground/5 transition-colors disabled:opacity-50"
            >
              Eliminar
            </button>
            {privacyStatus === "saved" && (
              <span className="text-sm text-green-600 font-medium">Guardado correctamente.</span>
            )}
            {privacyStatus === "error" && (
              <span className="text-sm text-red-600 font-medium">Error al guardar.</span>
            )}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-background/60 border border-foreground/5">
            <p className="text-xs text-muted font-medium mb-1">Vista previa del checkbox:</p>
            <p className="text-xs text-muted leading-relaxed">
              He leido y acepto la{" "}
              <span className="text-primary underline">{privacyLinkText || "Politica de Privacidad"}</span>
              {" "}y consiento el tratamiento de mis datos personales con la finalidad de recibir comunicaciones comerciales sobre los servicios ofrecidos, de conformidad con el Reglamento (UE) 2016/679 (RGPD) y la normativa nacional aplicable.
            </p>
          </div>
        </div>
      </div>

      {/* Banner de Cookies */}
      <div className="rounded-2xl border border-foreground/5 bg-white p-6 max-w-lg space-y-4">
        <div>
          <h2 className="text-base font-semibold mb-1">Banner de Cookies</h2>
          <p className="text-xs text-muted mb-4">
            Activa o desactiva el banner de consentimiento de cookies que aparece en la primera visita. Si lo desactivas, el banner no aparecera y el Pixel de Facebook no se cargara para nuevos visitantes (a menos que ya hayan aceptado previamente).
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={() => handleSaveCookieBanner(true)}
              disabled={cookieBannerSaving || cookieBannerEnabled}
              className={`rounded-xl px-5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${
                cookieBannerEnabled
                  ? "bg-green-600 text-white opacity-100 cursor-default"
                  : "border border-foreground/15 text-foreground/70 hover:bg-foreground/5 disabled:opacity-50"
              }`}
            >
              Activado
            </button>
            <button
              onClick={() => handleSaveCookieBanner(false)}
              disabled={cookieBannerSaving || !cookieBannerEnabled}
              className={`rounded-xl px-5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${
                !cookieBannerEnabled
                  ? "bg-red-500 text-white opacity-100 cursor-default"
                  : "border border-foreground/15 text-foreground/70 hover:bg-foreground/5 disabled:opacity-50"
              }`}
            >
              Desactivado
            </button>
          </div>

          {cookieBannerStatus === "saved" && (
            <p className="mt-2 text-sm text-green-600 font-medium">
              {cookieBannerEnabled ? "Banner activado correctamente." : "Banner desactivado. El Pixel no cargara para nuevos visitantes."}
            </p>
          )}
          {cookieBannerStatus === "error" && (
            <p className="mt-2 text-sm text-red-600 font-medium">Error al guardar. Intenta de nuevo.</p>
          )}

          <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-xs text-amber-700">
              <strong>Nota legal:</strong> Desactivar el banner no exime del cumplimiento del RGPD y la LSSI-CE. Solo hazlo si tienes otra solucion de consentimiento en vigor.
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-foreground/5">
            <p className="text-xs text-muted mb-2">
              <strong>Probar el banner:</strong> El banner no se muestra si ya aceptaste o rechazaste las cookies en este navegador. Pulsa este boton para resetear tu eleccion y volver a verlo.
            </p>
            <button
              onClick={() => { localStorage.removeItem("cookie_consent"); alert("Consentimiento reseteado. Recarga la pagina para ver el banner."); }}
              className="rounded-xl border border-foreground/10 px-4 py-2 text-sm font-medium text-muted hover:bg-foreground/5 transition-colors"
            >
              Resetear consentimiento de cookies
            </button>
          </div>
        </div>
      </div>

      {/* Email de contacto */}
      <div className="rounded-2xl border border-foreground/5 bg-white p-6 max-w-lg space-y-4">
        <div>
          <h2 className="text-base font-semibold mb-1">Email de contacto</h2>
          <p className="text-xs text-muted mb-3">
            Direccion de email que aparece en la Politica de Cookies como punto de contacto para consultas legales.
          </p>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => { setContactEmail(e.target.value); setContactEmailStatus("idle"); }}
            placeholder="info@tudominio.com"
            className="w-full rounded-xl border border-foreground/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={handleSaveContactEmail}
              disabled={contactEmailSaving}
              className="rounded-xl bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {contactEmailSaving ? "Guardando..." : "Guardar email"}
            </button>
            <button
              onClick={async () => { setContactEmail(""); const res = await saveConfig("contact_email", ""); setContactEmailStatus(res.ok ? "saved" : "error"); }}
              disabled={contactEmailSaving}
              className="rounded-xl border border-foreground/10 px-4 py-2 text-sm font-medium text-muted hover:bg-foreground/5 transition-colors disabled:opacity-50"
            >
              Eliminar
            </button>
            {contactEmailStatus === "saved" && (
              <span className="text-sm text-green-600 font-medium">Guardado correctamente.</span>
            )}
            {contactEmailStatus === "error" && (
              <span className="text-sm text-red-600 font-medium">Error al guardar.</span>
            )}
          </div>
        </div>
      </div>

      {/* Flujo del funnel */}
      <div className="rounded-2xl border border-foreground/5 bg-white p-6 max-w-lg space-y-4">
        <div>
          <h2 className="text-base font-semibold mb-1">Flujo del funnel</h2>
          <p className="text-xs text-muted mb-4">
            Elige si los visitantes deben pasar por la landing de captacion de datos antes de ver el VSL, o si aterrizan directamente en el VSL.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => handleSaveSkipLanding(false)}
              disabled={skipLandingSaving || !skipLanding}
              className={`w-full flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                !skipLanding
                  ? "border-primary bg-primary/5"
                  : "border-foreground/10 hover:bg-foreground/5"
              }`}
            >
              <span className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center ${!skipLanding ? "border-primary" : "border-foreground/20"}`}>
                {!skipLanding && <span className="h-2 w-2 rounded-full bg-primary block" />}
              </span>
              <span>
                <span className="block text-sm font-medium text-foreground">Landing → VSL (recomendado)</span>
                <span className="block text-xs text-muted mt-0.5">Los visitantes ven primero el formulario de captacion. Solo acceden al VSL quienes dejan sus datos.</span>
              </span>
            </button>

            <button
              onClick={() => handleSaveSkipLanding(true)}
              disabled={skipLandingSaving || skipLanding}
              className={`w-full flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                skipLanding
                  ? "border-primary bg-primary/5"
                  : "border-foreground/10 hover:bg-foreground/5"
              }`}
            >
              <span className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center ${skipLanding ? "border-primary" : "border-foreground/20"}`}>
                {skipLanding && <span className="h-2 w-2 rounded-full bg-primary block" />}
              </span>
              <span>
                <span className="block text-sm font-medium text-foreground">Directo al VSL</span>
                <span className="block text-xs text-muted mt-0.5">La landing redirige automaticamente al VSL. No se capturan datos de los visitantes.</span>
              </span>
            </button>
          </div>

          {skipLandingStatus === "saved" && (
            <p className="mt-3 text-sm text-green-600 font-medium">
              {skipLanding ? "Ahora los visitantes van directamente al VSL." : "La landing de captacion esta activa de nuevo."}
            </p>
          )}
          {skipLandingStatus === "error" && (
            <p className="mt-3 text-sm text-red-600 font-medium">Error al guardar. Intenta de nuevo.</p>
          )}
        </div>
      </div>

      {/* CTA Timestamp */}
      <div className="rounded-2xl border border-foreground/5 bg-white p-6 max-w-lg space-y-4">
        <div>
          <h2 className="text-base font-semibold mb-1">Minuto de aparicion del CTA (segundos)</h2>
          <p className="text-xs text-muted mb-3">
            Segundo del video en el que aparece el boton de CTA. Por ejemplo: 1500 = minuto 25.
          </p>
          <input
            type="number"
            value={ctaTimestamp}
            onChange={(e) => { setCtaTimestamp(e.target.value); setCtaStatus("idle"); }}
            min="0"
            className="w-full rounded-xl border border-foreground/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          {ctaTimestamp && (
            <p className="mt-1 text-xs text-muted">
              Equivale a {Math.floor(parseInt(ctaTimestamp) / 60)}m {parseInt(ctaTimestamp) % 60}s del video.
            </p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={handleSaveCtaTimestamp}
              disabled={ctaSaving || !ctaTimestamp}
              className="rounded-xl bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {ctaSaving ? "Guardando..." : "Guardar"}
            </button>
            {ctaStatus === "saved" && <span className="text-sm text-green-600 font-medium">Guardado correctamente.</span>}
            {ctaStatus === "error" && <span className="text-sm text-red-600 font-medium">Error al guardar.</span>}
          </div>
        </div>
      </div>

      {/* Timeout de abandono */}
      <div className="rounded-2xl border border-foreground/5 bg-white p-6 max-w-lg space-y-4">
        <div>
          <h2 className="text-base font-semibold mb-1">Timeout de abandono (minutos)</h2>
          <p className="text-xs text-muted mb-3">
            Minutos de inactividad tras los cuales una sesion se considera abandonada y se envia el email de seguimiento.
          </p>
          <input
            type="number"
            value={abandonmentTimeout}
            onChange={(e) => { setAbandonmentTimeout(e.target.value); setAbandonmentStatus("idle"); }}
            min="1"
            className="w-full rounded-xl border border-foreground/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={handleSaveAbandonmentTimeout}
              disabled={abandonmentSaving || !abandonmentTimeout}
              className="rounded-xl bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {abandonmentSaving ? "Guardando..." : "Guardar"}
            </button>
            {abandonmentStatus === "saved" && <span className="text-sm text-green-600 font-medium">Guardado correctamente.</span>}
            {abandonmentStatus === "error" && <span className="text-sm text-red-600 font-medium">Error al guardar.</span>}
          </div>
        </div>
      </div>

      {/* URL del CTA */}
      <div className="rounded-2xl border border-foreground/5 bg-white p-6 max-w-lg space-y-4">
        <div>
          <h2 className="text-base font-semibold mb-1">URL del CTA (Comunidad de School)</h2>
          <p className="text-xs text-muted mb-3">
            Enlace al que se dirige el boton CTA cuando el usuario hace clic.
          </p>
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
              disabled={schoolSaving}
              className="rounded-xl bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {schoolSaving ? "Guardando..." : "Guardar URL"}
            </button>
            <button
              onClick={async () => { setSchoolUrl(""); const res = await saveConfig("school_url", ""); setSchoolStatus(res.ok ? "saved" : "error"); }}
              disabled={schoolSaving}
              className="rounded-xl border border-foreground/10 px-4 py-2 text-sm font-medium text-muted hover:bg-foreground/5 transition-colors disabled:opacity-50"
            >
              Eliminar
            </button>
            {schoolStatus === "saved" && <span className="text-sm text-green-600 font-medium">Guardado.</span>}
            {schoolStatus === "error" && <span className="text-sm text-red-600 font-medium">Error al guardar.</span>}
          </div>
        </div>
      </div>

      {/* Zona peligrosa + Cron */}
      <div className="rounded-2xl border border-foreground/5 bg-white p-6 max-w-lg space-y-6">
        <div className="pt-0 border-t-0">
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
