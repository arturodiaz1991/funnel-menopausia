"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface VideoPlayerProps {
  src: string;
  onTimeUpdate?: (currentTime: number) => void;
  onPlay?: () => void;
  onPause?: (currentTime: number) => void;
  onSeekBack?: (from: number, to: number) => void;
  onEnded?: () => void;
  onPageLeave?: (currentTime: number) => void;
}

export default function VideoPlayer({
  src,
  onTimeUpdate,
  onPlay,
  onPause,
  onSeekBack,
  onEnded,
  onPageLeave,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const maxReachedTimeRef = useRef(0);
  const lastTimeRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load maxReachedTime from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("vsl_max_reached");
    if (saved) {
      maxReachedTimeRef.current = parseFloat(saved);
    }
  }, []);

  // Save maxReachedTime to localStorage on change
  const saveMaxReached = useCallback((time: number) => {
    if (time > maxReachedTimeRef.current) {
      maxReachedTimeRef.current = time;
      localStorage.setItem("vsl_max_reached", time.toString());
    }
  }, []);

  // Prevent forward seeking
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleSeeking = () => {
      if (video.currentTime > maxReachedTimeRef.current + 0.5) {
        video.currentTime = maxReachedTimeRef.current;
      }
    };

    video.addEventListener("seeking", handleSeeking);
    return () => video.removeEventListener("seeking", handleSeeking);
  }, []);

  // Handle page leave
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && videoRef.current) {
        onPageLeave?.(videoRef.current.currentTime);
      }
    };

    const handleBeforeUnload = () => {
      if (videoRef.current) {
        onPageLeave?.(videoRef.current.currentTime);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [onPageLeave]);

  // Block keyboard shortcuts for seeking forward
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return;
      const video = videoRef.current;

      switch (e.key) {
        case "ArrowRight":
        case "l":
          e.preventDefault(); // Block forward seek
          break;
        case "ArrowLeft":
        case "j":
          e.preventDefault();
          rewind(10);
          break;
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowUp":
          e.preventDefault();
          setVolume((v) => {
            const newVol = Math.min(1, v + 0.1);
            video.volume = newVol;
            return newVol;
          });
          break;
        case "ArrowDown":
          e.preventDefault();
          setVolume((v) => {
            const newVol = Math.max(0, v - 0.1);
            video.volume = newVol;
            return newVol;
          });
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
      onPlay?.();
    } else {
      video.pause();
      setIsPlaying(false);
      onPause?.(video.currentTime);
    }
  }

  function rewind(seconds: number) {
    const video = videoRef.current;
    if (!video) return;
    const from = video.currentTime;
    video.currentTime = Math.max(0, video.currentTime - seconds);
    onSeekBack?.(from, video.currentTime);
  }

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }

  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const video = videoRef.current;
    if (!video) return;
    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      video.muted = false;
      setIsMuted(false);
    }
  }

  function handleTimeUpdate() {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    saveMaxReached(video.currentTime);
    onTimeUpdate?.(video.currentTime);
  }

  function handleLoadedMetadata() {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);
  }

  function handleVideoEnded() {
    setIsPlaying(false);
    onEnded?.();
  }

  function handleProgressBarClick(e: React.MouseEvent<HTMLDivElement>) {
    const video = videoRef.current;
    if (!video || duration === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = clickX / rect.width;
    const seekTime = percent * duration;

    // Only allow seeking backward (to already watched positions)
    if (seekTime <= maxReachedTimeRef.current) {
      const from = video.currentTime;
      video.currentTime = seekTime;
      if (seekTime < from) {
        onSeekBack?.(from, seekTime);
      }
    }
  }

  function handleMouseMove() {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const maxReachedPercent = duration > 0 ? (maxReachedTimeRef.current / duration) * 100 : 0;

  return (
    <div
      className="relative w-full max-w-3xl mx-auto rounded-2xl overflow-hidden bg-black group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video element - no native controls, no context menu */}
      <video
        ref={videoRef}
        src={src}
        className="w-full aspect-video pointer-events-none"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleVideoEnded}
        onContextMenu={(e) => e.preventDefault()}
        playsInline
        preload="metadata"
      />

      {/* Click overlay for play/pause */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={togglePlay}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Play button overlay when paused */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
            <svg className="w-7 h-7 text-foreground ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Controls bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-8 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div
          className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer mb-3 relative group/progress"
          onClick={handleProgressBarClick}
        >
          {/* Max reached indicator */}
          <div
            className="absolute top-0 left-0 h-full bg-white/20 rounded-full"
            style={{ width: `${maxReachedPercent}%` }}
          />
          {/* Current progress */}
          <div
            className="absolute top-0 left-0 h-full bg-primary rounded-full transition-[width] duration-100"
            style={{ width: `${progressPercent}%` }}
          />
          {/* Thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md opacity-0 group-hover/progress:opacity-100 transition-opacity"
            style={{ left: `${progressPercent}%`, transform: "translate(-50%, -50%)" }}
          />
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-3">
          {/* Play/Pause */}
          <button onClick={togglePlay} className="text-white hover:text-primary transition-colors" aria-label={isPlaying ? "Pausar" : "Reproducir"}>
            {isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Rewind 10s */}
          <button onClick={() => rewind(10)} className="text-white hover:text-primary transition-colors" aria-label="Retroceder 10 segundos">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" />
            </svg>
          </button>

          {/* Time display */}
          <span className="text-white/80 text-sm tabular-nums min-w-[90px]">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="flex-1" />

          {/* Volume */}
          <div className="flex items-center gap-2">
            <button onClick={toggleMute} className="text-white hover:text-primary transition-colors" aria-label={isMuted ? "Activar sonido" : "Silenciar"}>
              {isMuted || volume === 0 ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 accent-primary cursor-pointer"
              aria-label="Volumen"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
