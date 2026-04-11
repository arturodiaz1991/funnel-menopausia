"use client";

import { useEffect } from "react";

export default function LandingTracker({ funnelId }: { funnelId?: string | null }) {
  useEffect(() => {
    fetch("/api/track/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: "landing", funnelId: funnelId ?? null }),
    }).catch(() => {});
  }, [funnelId]);

  return null;
}
