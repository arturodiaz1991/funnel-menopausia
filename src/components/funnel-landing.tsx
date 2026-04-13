"use client";

import { useState, useEffect, Suspense } from "react";
import LeadForm from "@/components/lead-form";
import LandingTracker from "@/components/landing-tracker";
import { FunnelDesignConfig, FONT_OPTIONS, loadGoogleFont } from "@/components/funnel-preview";

const DEFAULT_HEADLINE = "Reduce el insomnio en la menopausia";
const DEFAULT_SUBHEADLINE =
  "Descubre metodos naturales y efectivos para volver a dormir bien. Accede gratis a nuestra clase exclusiva.";
const DEFAULT_CTA_TEXT = "Acceder a la Clase Gratuita";

function getCookieFunnelId(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)funnel_id=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export default function FunnelLanding() {
  const [funnelId, setFunnelId] = useState<string | null>(null);
  const [funnelConfig, setFunnelConfig] = useState<FunnelDesignConfig>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function assign() {
      try {
        const res = await fetch("/api/funnel/assign");
        if (res.ok) {
          const data = await res.json();
          setFunnelId(data.funnelId ?? null);
          setFunnelConfig(data.config ?? {});
          if (data.config?.heading_font) loadGoogleFont(data.config.heading_font);
        }
      } catch {
        // No A/B test active — use defaults
      } finally {
        setReady(true);
      }
    }
    assign();
  }, []);

  const headline = funnelConfig.landing_headline || DEFAULT_HEADLINE;
  const subheadline = funnelConfig.landing_subheadline || DEFAULT_SUBHEADLINE;
  const ctaText = funnelConfig.landing_cta_text || DEFAULT_CTA_TEXT;

  // Design tokens with defaults
  const primaryColor = funnelConfig.primary_color || "#9b6b4a";
  const bgColor = funnelConfig.bg_color || "#f9f5f0";
  const bgImageUrl = funnelConfig.bg_image_url;
  const headingColor = funnelConfig.heading_color || "#1a1a1a";
  const bodyColor = funnelConfig.body_color || "#6b7280";
  const fontValue = funnelConfig.heading_font || "inter";
  const fontOption = FONT_OPTIONS.find((f) => f.value === fontValue) || FONT_OPTIONS[0];
  const headingWeight = funnelConfig.heading_weight || "700";
  const logoUrl = funnelConfig.logo_url;
  const heroImageUrl = funnelConfig.hero_image_url;

  const containerStyle: React.CSSProperties = {
    backgroundColor: bgColor,
    backgroundImage: bgImageUrl ? `url(${bgImageUrl})` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "100%",
    flex: 1,
    display: "flex",
    flexDirection: "column",
  };

  return (
    <div style={containerStyle}>
      <LandingTracker funnelId={funnelId} />

      {/* Logo */}
      {logoUrl && (
        <div className="flex justify-center pt-6 px-4">
          <img src={logoUrl} alt="Logo" className="max-h-14 max-w-[200px] object-contain" />
        </div>
      )}

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center space-y-8">
          {/* Hero image */}
          {heroImageUrl && (
            <div className="rounded-2xl overflow-hidden">
              <img
                src={heroImageUrl}
                alt="Imagen principal"
                className="w-full h-56 object-cover"
              />
            </div>
          )}

          <div className="space-y-4">
            {/* Badge */}
            <p
              className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: primaryColor }}
            >
              Clase gratuita
            </p>

            {/* Headline */}
            <h1
              className="text-3xl leading-tight sm:text-4xl"
              style={{
                fontFamily: fontOption.family,
                fontWeight: headingWeight,
                color: headingColor,
              }}
            >
              {headline}
            </h1>

            {/* Subheadline */}
            <p className="text-lg leading-relaxed" style={{ color: bodyColor }}>
              {subheadline}
            </p>
          </div>

          <Suspense fallback={<div className="h-64" />}>
            <div className="flex justify-center">
              <LeadForm
                funnelId={funnelId}
                ctaText={ready ? ctaText : DEFAULT_CTA_TEXT}
                designConfig={funnelConfig}
                extraFields={funnelConfig.extra_form_fields || []}
              />
            </div>
          </Suspense>
        </div>
      </main>
    </div>
  );
}
