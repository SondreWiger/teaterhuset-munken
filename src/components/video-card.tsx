"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ReviewsSection } from "@/components/reviews-section";
import { ChaptersSection } from "@/components/chapters-section";

function extractYoutubeId(url: string): string | null {
  const match = url?.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/
  );
  return match?.[1] ?? null;
}

function extractVimeoId(url: string): string | null {
  const match = url?.match(/vimeo\.com\/(\d+)/);
  return match?.[1] ?? null;
}

function getVideoThumbnail(
  youtubeUrl: string | null,
  vimeoUrl: string | null
): string | null {
  if (youtubeUrl) {
    const id = extractYoutubeId(youtubeUrl);
    if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  }
  return null;
}

function getEmbedUrl(
  youtubeUrl: string | null,
  vimeoUrl: string | null
): string | null {
  if (youtubeUrl) {
    const id = extractYoutubeId(youtubeUrl);
    if (id) return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&enablejsapi=1`;
  }
  if (vimeoUrl) {
    const id = extractVimeoId(vimeoUrl);
    if (id) return `https://player.vimeo.com/video/${id}?autoplay=1`;
  }
  return null;
}

function CastButton({ youtubeUrl, vimeoUrl }: { youtubeUrl: string | null; vimeoUrl: string | null }) {
  const [castAvailable, setCastAvailable] = useState(false);
  const [casting, setCasting] = useState(false);

  useEffect(() => {
    // Check if Chrome Cast is available
    if (typeof window !== "undefined" && (window as any).chrome?.cast) {
      setCastAvailable(true);
    }

    // Listen for Cast API availability
    const onCastReady = () => setCastAvailable(true);
    window.__onGCastApiAvailable = onCastReady;

    // Load Google Cast SDK
    if (!document.getElementById("chromecast-sdk")) {
      const script = document.createElement("script");
      script.id = "chromecast-sdk";
      script.src = "https://www.gstatic.com/cv2/sender/cast_sender.js?loadCastFramework=1";
      script.onload = () => {
        if (window.cast) {
          setCastAvailable(true);
        }
      };
      document.head.appendChild(script);
    }

    return () => {
      delete window.__onGCastApiAvailable;
    };
  }, []);

  const startCast = useCallback(() => {
    const videoUrl = youtubeUrl || vimeoUrl;
    if (!videoUrl) return;

    if ((window as any).cast) {
      const castSession = (window as any).cast?.framework?.CastContext?.getInstance?.();
      if (castSession) {
        castSession.requestSession().then((session: any) => {
          const mediaInfo = new (window as any).cast.media.MediaInfo(videoUrl, "video/mp4");
          const request = new (window as any).cast.media.LoadRequest(mediaInfo);
          session.getCurrentMediaSession()?.loadMedia(request);
          setCasting(true);
        }).catch(() => {});
      }
    }
  }, [youtubeUrl, vimeoUrl]);

  // Fallback: cast the entire tab via Chrome's built-in cast
  const castTab = useCallback(() => {
    // This triggers Chrome's native "Cast tab" dialog
    // Works universally with any content
    const event = new CustomEvent("cast-tab");
    window.dispatchEvent(event);
    setCasting(true);
  }, []);

  if (!castAvailable) return null;

  return (
    <button
      onClick={startCast}
      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border ${
        casting
          ? "bg-gold/20 border-gold/30 text-gold"
          : "bg-white/[0.06] border-white/[0.06] text-muted hover:text-foreground hover:bg-white/[0.12]"
      }`}
      title="Cast til Chromecast"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d="M1 18v3h3c0-1.66-1.34-3-3-3z" fill="currentColor" />
        <path d="M1 14v2c2.76 0 5 2.24 5 5h2c0-3.87-3.13-7-7-7z" fill="currentColor" />
        <path d="M1 10v2c4.97 0 9 4.03 9 9h2c0-6.08-4.93-11-11-11z" fill="currentColor" />
        <path d="M21 3H3c-1.1 0-2 .9-2 2v3h2V5h18v14h-7v2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" fill="currentColor" />
      </svg>
    </button>
  );
}

function AirPlayButton({ iframeRef }: { iframeRef: React.RefObject<HTMLDivElement | null> }) {
  const [airPlayAvailable, setAirPlayAvailable] = useState(false);

  useEffect(() => {
    // AirPlay is available on iOS Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    setAirPlayAvailable(isIOS && isSafari);
  }, []);

  if (!airPlayAvailable) return null;

  return null; // AirPlay button is shown natively in iOS Safari video controls
}

export function VideoCard({
  video,
  hasAccess,
  teamColor,
  children,
}: {
  video: {
    id: string;
    title: string;
    description: string | null;
    youtube_url: string | null;
    vimeo_url: string | null;
    trailer_url: string | null;
    price: number;
  };
  hasAccess: boolean;
  teamColor: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [hovered, setHovered] = useState(false);
  const thumbnail = getVideoThumbnail(video.youtube_url, video.vimeo_url);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    },
    []
  );

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, handleEscape]);

  return (
    <>
      {/* Card */}
      <div
        className="glass-card rounded-2xl overflow-hidden group film-strip"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="aspect-video relative overflow-hidden">
          {hasAccess ? (
            <button
              onClick={() => setOpen(true)}
              className="w-full h-full relative"
            >
              {thumbnail ? (
                <img
                  src={thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              ) : (
                <div
                  className="w-full h-full"
                  style={{
                    background: `linear-gradient(135deg, ${teamColor}20, ${teamColor}08)`,
                  }}
                />
              )}
              {/* Cinematic letterbox bars */}
              <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-black/40 to-transparent" />

              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Glow ring */}
                  <div className="absolute inset-0 rounded-full bg-gold/20 blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/10 group-hover:bg-gold/90 group-hover:border-gold group-hover:scale-110 transition-all duration-300">
                    <svg
                      className="w-6 h-6 text-white ml-1 group-hover:text-background transition-colors"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Team color accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-0.5"
                style={{ background: teamColor }}
              />
            </button>
          ) : (
            <div
              className="w-full h-full flex flex-col items-center justify-center relative"
              style={{
                background: `linear-gradient(135deg, ${teamColor}10, ${teamColor}03)`,
              }}
            >
              {thumbnail && (
                <img
                  src={thumbnail}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-20 blur-md scale-110"
                />
              )}
              <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px]" />
              <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/[0.04] flex items-center justify-center border border-white/[0.06]">
                  <svg
                    className="w-7 h-7 text-muted"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium text-muted">
                  Låst
                </span>
                {video.trailer_url && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTrailer(true);
                      setOpen(true);
                    }}
                    className="text-xs text-gold hover:text-gold-light transition-colors mt-2"
                  >
                    Se smakebit →
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="p-4 sm:p-5">
          <h3 className="font-semibold text-foreground/90 text-sm sm:text-base">{video.title}</h3>
          {video.description && (
            <div
              className={`mt-1.5 text-sm text-muted leading-relaxed overflow-hidden transition-all duration-300 ${
                hovered ? "max-h-20 line-clamp-4" : "max-h-10 line-clamp-2"
              }`}
            >
              {video.description}
            </div>
          )}
          <div className="mt-3 sm:mt-4 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground/70">
              {hasAccess ? (
                <span className="flex items-center gap-1.5 text-success">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Tilgang
                </span>
              ) : (
                <span className="text-gradient-gold font-semibold">{video.price} kr</span>
              )}
            </span>
            {children}
          </div>
        </div>
      </div>

      {/* Fullscreen player modal */}
      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md p-2 sm:p-4 md:p-8 animate-fade-in"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`Spiller ${video.title}`}
        >
          <div
            ref={modalRef}
            className="w-full max-w-5xl animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between mb-2 sm:mb-4 gap-2">
              <h3 className="text-white font-medium truncate pr-2 text-sm sm:text-base">
                {video.title}
              </h3>
              <div className="flex items-center gap-2 shrink-0">
                <CastButton
                  youtubeUrl={video.youtube_url}
                  vimeoUrl={video.vimeo_url}
                />
                <button
                  onClick={() => setOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center text-white hover:bg-white/[0.12] transition-colors border border-white/[0.06]"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Video */}
            <div className="relative w-full aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-black border border-white/[0.06]">
              {(() => {
                const embedUrl = showTrailer && video.trailer_url
                  ? getEmbedUrl(
                      video.trailer_url.includes("youtube") ? video.trailer_url : null,
                      video.trailer_url.includes("vimeo") ? video.trailer_url : null
                    )
                  : getEmbedUrl(video.youtube_url, video.vimeo_url);
                return embedUrl ? (
                  <iframe
                    src={embedUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; display-capture; airplay"
                    allowFullScreen
                  />
                ) : null;
              })()}
              {/* AirPlay hint on iOS */}
              <AirPlayButton iframeRef={modalRef} />
            </div>

            {/* Reviews */}
            {hasAccess && (
              <div className="mt-4 sm:mt-6">
                <ChaptersSection videoId={video.id} />
                <ReviewsSection videoId={video.id} />
              </div>
            )}

            {/* Mobile: swipe hint */}
            <p className="text-center text-muted/40 text-xs mt-3 sm:hidden">
              Trykk utenfor for å lukke
            </p>
          </div>
        </div>
      )}
    </>
  );
}

// Extend Window for Cast API
declare global {
  interface Window {
    __onGCastApiAvailable?: (available: boolean) => void;
    cast?: any;
    chrome?: { cast?: any };
  }
}
