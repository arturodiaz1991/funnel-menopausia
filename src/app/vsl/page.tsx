"use client";

import { useCallback } from "react";
import VideoPlayer from "@/components/video-player";
import CtaButton from "@/components/cta-button";
import { useVideoTracker } from "@/hooks/use-video-tracker";
import { useCtaVisibility } from "@/hooks/use-cta-visibility";

const CTA_TIMESTAMP = parseInt(process.env.NEXT_PUBLIC_CTA_TIMESTAMP_SECONDS || "30", 10);
const SCHOOL_URL = process.env.NEXT_PUBLIC_SCHOOL_COMMUNITY_URL || "https://school.com/tu-comunidad";
const VIDEO_URL = process.env.NEXT_PUBLIC_VIDEO_URL || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export default function VSLPage() {
  const { trackEvent } = useVideoTracker();
  const { isVisible, checkVisibility } = useCtaVisibility(CTA_TIMESTAMP);

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

  const handleCtaClick = useCallback(() => {
    trackEvent({ type: "cta_clicked", timestampSec: 0 });
  }, [trackEvent]);

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
          src={VIDEO_URL}
          onTimeUpdate={handleTimeUpdate}
          onPlay={handlePlay}
          onPause={handlePause}
          onSeekBack={handleSeekBack}
          onEnded={handleEnded}
          onPageLeave={handlePageLeave}
        />

        <CtaButton
          isVisible={isVisible}
          url={SCHOOL_URL}
          onClick={handleCtaClick}
        />
      </div>
    </main>
  );
}
