"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FunnelDesignConfig, FormField, RADIUS_MAP, getButtonStyles } from "@/components/funnel-preview";

export default function LeadForm({
  funnelId,
  ctaText = "Acceder a la Clase Gratuita",
  designConfig = {},
  extraFields = [],
}: {
  funnelId?: string | null;
  ctaText?: string;
  designConfig?: FunnelDesignConfig;
  extraFields?: FormField[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [extraValues, setExtraValues] = useState<Record<string, string>>({});
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

  // Design tokens
  const primaryColor = designConfig.primary_color || "#9b6b4a";
  const bodyColor = designConfig.body_color || "#6b7280";
  const radius = RADIUS_MAP[designConfig.button_radius || "lg"] || "16px";

  const inputStyle: React.CSSProperties = {
    borderRadius: radius === "9999px" ? "12px" : radius, // pill inputs look odd, cap them
  };

  const inputCls =
    "w-full rounded-xl border border-foreground/10 bg-white px-4 py-3 text-base text-foreground placeholder:text-muted outline-none transition-all focus:ring-2";

  const inputFocusStyle = `--tw-ring-color: ${primaryColor}40`;

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
          extraData: Object.keys(extraValues).length > 0 ? extraValues : null,
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

  const btnStyle = getButtonStyles({ ...designConfig, landing_cta_text: ctaText });
  // For real button we need pointer-events and cursor
  const realBtnStyle: React.CSSProperties = {
    ...btnStyle,
    cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? 0.6 : 1,
    border: "none",
    outline: "none",
  };
  if (designConfig.button_style === "outline") {
    realBtnStyle.border = `2px solid ${primaryColor}`;
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      {/* Name */}
      <div>
        <label
          htmlFor="fullName"
          className="block text-sm font-medium mb-1.5"
          style={{ color: bodyColor }}
        >
          Nombre completo
        </label>
        <input
          id="fullName"
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Tu nombre completo"
          className={inputCls}
          style={{ ...inputStyle, borderColor: "#e5e7eb" }}
        />
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium mb-1.5"
          style={{ color: bodyColor }}
        >
          Correo electronico
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          className={inputCls}
          style={{ ...inputStyle, borderColor: "#e5e7eb" }}
        />
      </div>

      {/* Extra fields */}
      {extraFields.map((field) => (
        <div key={field.id}>
          <label
            htmlFor={`extra-${field.id}`}
            className="block text-sm font-medium mb-1.5"
            style={{ color: bodyColor }}
          >
            {field.label}
            {field.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          {field.type === "textarea" ? (
            <textarea
              id={`extra-${field.id}`}
              required={field.required}
              rows={3}
              value={extraValues[field.id] || ""}
              onChange={(e) => setExtraValues((v) => ({ ...v, [field.id]: e.target.value }))}
              placeholder={field.placeholder}
              className={inputCls + " resize-none"}
              style={{ ...inputStyle, borderColor: "#e5e7eb" }}
            />
          ) : (
            <input
              id={`extra-${field.id}`}
              type={field.type}
              required={field.required}
              value={extraValues[field.id] || ""}
              onChange={(e) => setExtraValues((v) => ({ ...v, [field.id]: e.target.value }))}
              placeholder={field.placeholder}
              className={inputCls}
              style={{ ...inputStyle, borderColor: "#e5e7eb" }}
            />
          )}
        </div>
      ))}

      {/* Privacy checkbox */}
      <div className="flex items-start gap-3">
        <input
          id="privacy"
          type="checkbox"
          required
          checked={privacyAccepted}
          onChange={(e) => {
            setPrivacyAccepted(e.target.checked);
            setPrivacyError(false);
          }}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-foreground/20 cursor-pointer"
          style={{ accentColor: primaryColor }}
        />
        <label htmlFor="privacy" className="text-xs leading-relaxed cursor-pointer" style={{ color: bodyColor }}>
          He leido y acepto la{" "}
          {privacyUrl ? (
            <a
              href={privacyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-80"
              style={{ color: primaryColor }}
              onClick={(e) => e.stopPropagation()}
            >
              {privacyLinkText}
            </a>
          ) : (
            <span style={{ color: primaryColor }}>{privacyLinkText}</span>
          )}{" "}
          y consiento el tratamiento de mis datos personales con la finalidad de recibir comunicaciones comerciales sobre los servicios ofrecidos, de conformidad con el Reglamento (UE) 2016/679 (RGPD) y la normativa nacional aplicable.
        </label>
      </div>

      {privacyError && (
        <p className="text-xs text-red-500">
          Debes aceptar la politica de privacidad para continuar.
        </p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={loading} style={realBtnStyle}>
        {loading ? "Registrando..." : ctaText}
      </button>

      <p className="text-xs text-center" style={{ color: bodyColor, opacity: 0.7 }}>
        Tu informacion esta segura. No compartiremos tus datos con terceros.
      </p>
    </form>
  );
}
