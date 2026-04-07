"use client";

import { useState, useCallback } from "react";

export function useCtaVisibility(ctaTimestampSeconds: number) {
  const [isVisible, setIsVisible] = useState(false);

  const checkVisibility = useCallback((currentTime: number) => {
    if (!isVisible && currentTime >= ctaTimestampSeconds) {
      setIsVisible(true);
    }
  }, [isVisible, ctaTimestampSeconds]);

  return { isVisible, checkVisibility };
}
