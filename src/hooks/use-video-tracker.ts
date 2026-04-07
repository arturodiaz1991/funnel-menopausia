"use client";

import { useRef, useEffect, useCallback } from "react";
import type { VideoEvent } from "@/types";
import { v4 as uuidv4 } from "uuid";

const FLUSH_INTERVAL_MS = 5000;
const TIMEUPDATE_SAMPLE_INTERVAL = 5; // Record timeupdate every 5 seconds of playback

export function useVideoTracker() {
  const eventsBuffer = useRef<VideoEvent[]>([]);
  const sessionId = useRef<string>("");
  const lastTimeupdateRecorded = useRef<number>(0);

  useEffect(() => {
    sessionId.current = uuidv4();
  }, []);

  const flushEvents = useCallback(async (useBeacon = false) => {
    if (eventsBuffer.current.length === 0) return;

    const eventsToSend = [...eventsBuffer.current];
    eventsBuffer.current = [];

    const payload = JSON.stringify({
      sessionId: sessionId.current,
      events: eventsToSend,
    });

    if (useBeacon) {
      navigator.sendBeacon("/api/analytics", payload);
    } else {
      try {
        await fetch("/api/analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
        });
      } catch {
        // Re-add events on failure
        eventsBuffer.current = [...eventsToSend, ...eventsBuffer.current];
      }
    }
  }, []);

  // Periodic flush
  useEffect(() => {
    const interval = setInterval(() => flushEvents(false), FLUSH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [flushEvents]);

  // Flush on page leave
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushEvents(true);
      }
    };
    const handleBeforeUnload = () => {
      flushEvents(true);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      flushEvents(true); // Flush on unmount
    };
  }, [flushEvents]);

  const trackEvent = useCallback((event: VideoEvent) => {
    // Sample timeupdate events to reduce volume
    if (event.type === "timeupdate") {
      const secondsBucket = Math.floor(event.timestampSec / TIMEUPDATE_SAMPLE_INTERVAL) * TIMEUPDATE_SAMPLE_INTERVAL;
      if (secondsBucket <= lastTimeupdateRecorded.current) return;
      lastTimeupdateRecorded.current = secondsBucket;
    }

    eventsBuffer.current.push(event);
  }, []);

  return { trackEvent, sessionId: sessionId.current };
}
