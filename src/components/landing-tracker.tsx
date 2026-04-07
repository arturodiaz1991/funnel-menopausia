"use client";

import { useEffect } from "react";

export default function LandingTracker() {
  useEffect(() => {
    fetch("/api/track/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: "landing" }),
    }).catch(() => {});
  }, []);

  return null;
}
