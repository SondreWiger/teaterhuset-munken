"use client";

import { useState, useEffect } from "react";

interface Chapter {
  id: string;
  title: string;
  start_seconds: number;
  sort_order: number;
}

export function ChaptersSection({
  videoId,
  onSeek,
}: {
  videoId: string;
  onSeek?: (seconds: number) => void;
}) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/chapters?video_id=${videoId}`)
      .then((r) => r.json())
      .then(setChapters)
      .finally(() => setLoading(false));
  }, [videoId]);

  if (loading || chapters.length === 0) return null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-2 mt-3">
      <p className="text-xs font-medium text-muted uppercase tracking-wider">Kapitler</p>
      <div className="flex flex-wrap gap-2">
        {chapters.map((ch) => (
          <button
            key={ch.id}
            onClick={() => onSeek?.(ch.start_seconds)}
            className="inline-flex items-center gap-2 rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 py-1.5 text-xs hover:bg-gold/[0.08] hover:border-gold/20 transition-all"
          >
            <span className="text-gold font-mono">{formatTime(ch.start_seconds)}</span>
            <span className="text-foreground/70">{ch.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
