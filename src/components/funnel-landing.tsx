"use client";

import { useState, useEffect, Suspense } from "react";
import LeadForm from "@/components/lead-form";
import LandingTracker from "@/components/landing-tracker";

interface FunnelConfig {
  landing_headline?: string;
  landing_subheadline?: string;
  landing_cta_text?: string;
  video_url?: string;
  cta_timestamp_seconds?: number;
  school_url?: string;
}

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
  const [funnelConfig, setFunnelConfig] = useState<FunnelConfig>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const existingId = getCookieFunnelId();

    async function assign() {
      try {
        const res = await fetch("/api/funnel/assign");
        if (res.ok) {
          const data = await res.json();
          setFunnelId(data.funnelId ?? null);
          setFunnelConfig(data.config ?? {});
        }
      } catch {
        // No A/B test active — use defaults
      } finally {
        setReady(true);
      }
    }

    if (existingId) {
      // Already assigned: fetch config for this funnel (re-validates it's still active)
      assign();
    } else {
      assign();
    }
  }, []);

  const headline = funnelConfig.landing_headline || DEFAULT_HEADLINE;
  const subheadline = funnelConfig.landing_subheadline || DEFAULT_SUBHEADLINE;
  const ctaText = funnelConfig.landing_cta_text || DEFAULT_CTA_TEXT;

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <LandingTracker funnelId={funnelId} />
      <div className="w-full max-w-md text-center space-y-8">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            Clase gratuita
          </p>
          <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            {headline}
          </h1>
          <p className="text-lg text-muted leading-relaxed">
            {subheadline}
          </p>
        </div>

        <Suspense fallback={<div className="h-64" />}>
          <div className="flex justify-center">
            <LeadForm funnelId={funnelId} ctaText={ready ? ctaText : DEFAULT_CTA_TEXT} />
          </div>
        </Suspense>
      </div>
    </main>
  );
}
