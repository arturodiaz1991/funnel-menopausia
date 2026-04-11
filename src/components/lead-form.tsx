"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LeadForm({
  funnelId,
  ctaText = "Acceder a la Clase Gratuita",
}: {
  funnelId?: string | null;
  ctaText?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [privacyError, setPrivacyError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [privacyUrl, setPrivacyUrl] = useState<string | null>(null);
  const [privacyLinkText, setPrivacyLinkText] = useState("Politica de Privacidad");

  useEffect(() => {
    router.prefetch("/vsl");
    fetch("/api/config/public")
      .then((r) => r.json())
      .then((data) => {
        if (data.privacy_url) setPrivacyUrl(data.privacy_url);
        if (data.privacy_link_text) setPrivacyLinkText(data.privacy_link_text);
      })
      .catch(() => {});
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!privacyAccepted) {
      setPrivacyError(true);
      return;
    }
    setPrivacyError(false);
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          funnelId: funnelId ?? null,
          utmSource: searchParams.get("utm_source"),
          utmMedium: searchParams.get("utm_medium"),
          utmCampaign: searchParams.get("utm_campaign"),
          utmContent: searchParams.get("utm_content"),
          utmTerm: searchParams.get("utm_term"),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al registrarte");
      }

      router.push("/vsl");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-foreground/80 mb-1.5">
          Nombre completo
        </label>
        <input
          id="fullName"
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Tu nombre completo"
          className="w-full rounded-xl border border-foreground/10 bg-white px-4 py-3 text-base text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground/80 mb-1.5">
          Correo electronico
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          className="w-full rounded-xl border border-foreground/10 bg-white px-4 py-3 text-base text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      {/* Checkbox de privacidad */}
      <div className="flex items-start gap-3">
        <input
          id="privacy"
          type="checkbox"
          required
          checked={privacyAccepted}
          onChange={(e) => { setPrivacyAccepted(e.target.checked); setPrivacyError(false); }}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-foreground/20 accent-primary cursor-pointer"
        />
        <label htmlFor="privacy" className="text-xs text-muted leading-relaxed cursor-pointer">
          He leido y acepto la{" "}
          {privacyUrl ? (
            <a
              href={privacyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:text-primary/80"
              onClick={(e) => e.stopPropagation()}
            >
              {privacyLinkText}
            </a>
          ) : (
            <span className="text-primary">{privacyLinkText}</span>
          )}{" "}
          y consiento el tratamiento de mis datos personales con la finalidad de recibir comunicaciones comerciales sobre los servicios ofrecidos, de conformidad con el Reglamento (UE) 2016/679 (RGPD) y la normativa nacional aplicable.
        </label>
      </div>

      {privacyError && (
        <p className="text-xs text-red-500">
          Debes aceptar la politica de privacidad para continuar.
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Registrando..." : ctaText}
      </button>

      <p className="text-xs text-center text-muted">
        Tu informacion esta segura. No compartiremos tus datos con terceros.
      </p>
    </form>
  );
}
