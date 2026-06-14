"use client";

import { useState, useEffect } from "react";

export function FavoriteButton({
  videoId,
  initialFavorited = false,
}: {
  videoId: string;
  initialFavorited?: boolean;
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_id: videoId }),
      });
      const data = await res.json();
      setFavorited(data.favorited);
    } catch {}
    setLoading(false);
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }}
      disabled={loading}
      className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-white/[0.06]"
      title={favorited ? "Fjern fra favoritter" : "Legg til favoritt"}
    >
      <svg
        className={`w-4 h-4 transition-colors ${
          favorited ? "text-crimson fill-crimson" : "text-muted hover:text-foreground"
        }`}
        fill={favorited ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  );
}
