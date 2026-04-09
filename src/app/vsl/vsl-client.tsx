"use client";

import { useCallback, useEffect } from "react";
import VideoPlayer from "@/components/video-player";
import CtaButton from "@/components/cta-button";
import { useVideoTracker } from "@/hooks/use-video-tracker";
import { useCtaVisibility } from "@/hooks/use-cta-visibility";

interface VSLClientProps {
  videoUrl: string;
  schoolUrl: string;
  ctaTimestamp: number;
}

export default function VSLClient({ videoUrl, schoolUrl, ctaTimestamp }: VSLClientProps) {
  const { trackEvent } = useVideoTracker();
  const { isVisible, checkVisibility } = useCtaVisibility(ctaTimestamp);

  const handleTimeUpdate = useCallback((currentTime: number) => {
    trackEvent({ type: "timeupdate", timestampSec: currentTime });
    checkVisibility(currentTime);
  }, [trackEvent, checkVisibility]);

  const handlePlay = useCallback(() => {
    trackEvent({ type: "play", timestampSec: 0 });
  }, [trackEvent]);

  const handlePause = useCallback((currentTime: number) => {
    trackEvent({ type: "pause", timestampSec: currentTime });
  }, [trackEvent]);

  const handleSeekBack = useCallback((from: number, to: number) => {
    trackEvent({ type: "seek_back", timestampSec: to, metadata: { from } });
  }, [trackEvent]);

  const handleEnded = useCallback(() => {
    trackEvent({ type: "ended", timestampSec: 0 });
  }, [trackEvent]);

  const handlePageLeave = useCallback((currentTime: number) => {
    trackEvent({ type: "page_leave", timestampSec: currentTime });
  }, [trackEvent]);

  useEffect(() => {
    if (isVisible) {
      trackEvent({ type: "cta_shown", timestampSec: ctaTimestamp });
    }
  }, [isVisible, trackEvent, ctaTimestamp]);

  const handleCtaClick = useCallback(() => {
    trackEvent({ type: "cta_clicked", timestampSec: ctaTimestamp });
  }, [trackEvent, ctaTimestamp]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl space-y-2">
        <h1 className="text-2xl font-bold text-center text-foreground sm:text-3xl">
          Tu clase gratuita esta lista
        </h1>
        <p className="text-center text-muted mb-6">
          Descubre como reducir el insomnio en la menopausia de forma natural
        </p>

        <VideoPlayer
          src={videoUrl}
          onTimeUpdate={handleTimeUpdate}
          onPlay={handlePlay}
          onPause={handlePause}
          onSeekBack={handleSeekBack}
          onEnded={handleEnded}
          onPageLeave={handlePageLeave}
        />

        <CtaButton
          isVisible={isVisible}
          url={schoolUrl}
          onClick={handleCtaClick}
        />
      </div>
    </main>
  );
}
