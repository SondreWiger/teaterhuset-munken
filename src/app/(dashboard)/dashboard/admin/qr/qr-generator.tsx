"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import type { Show, Team, Video } from "@/lib/supabase/types";

interface ShowWithRelations extends Show {
  teams: (Team & { videos: Video[] })[];
}

export function QrGenerator({
  shows,
  qrCodes,
}: {
  shows: ShowWithRelations[];
  qrCodes: { id: string; code: string; discount_percentage: number; is_free: boolean; max_uses: number | null; current_uses: number; expires_at: string | null; videos: { title: string } | null }[];
}) {
  const [selectedVideoId, setSelectedVideoId] = useState("");
  const [discount, setDiscount] = useState(100);
  const [isFree, setIsFree] = useState(true);
  const [maxUses, setMaxUses] = useState(100);
  const [expiresDays, setExpiresDays] = useState(30);
  const [generating, setGenerating] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedVideo = shows
    .flatMap((s) => s.teams)
    .flatMap((t) => t.videos)
    .find((v) => v.id === selectedVideoId);

  const handleGenerate = async () => {
    if (!selectedVideoId) return;
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: selectedVideoId,
          discountPercentage: discount,
          isFree,
          maxUses,
          expiresAt: expiresDays > 0
            ? new Date(Date.now() + expiresDays * 86400000).toISOString()
            : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setQrCode(data.code);

      const url = `${window.location.origin}/redeem/${data.code}`;
      const dataUrl = await QRCode.toDataURL(url, {
        width: 400,
        margin: 2,
        color: { dark: "#ffffff", light: "#0a0a0a" },
      });
      setQrDataUrl(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noe gikk galt");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl || !selectedVideo) return;
    const link = document.createElement("a");
    link.download = `qr-${selectedVideo.title.replace(/\s+/g, "-").toLowerCase()}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground/80">
            Velg video
          </label>
          <select
            value={selectedVideoId}
            onChange={(e) => setSelectedVideoId(e.target.value)}
            className="w-full rounded-xl input-glass px-4 py-3 text-sm"
          >
            <option value="">Velg video...</option>
            {shows.map((show) => (
              <optgroup key={show.id} label={show.title}>
                {show.teams.map((team) =>
                  team.videos.map((video) => (
                    <option key={video.id} value={video.id}>
                      {show.title} — {team.name} — {video.title} ({video.price} kr)
                    </option>
                  ))
                )}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isFree"
            checked={isFree}
            onChange={(e) => {
              setIsFree(e.target.checked);
              if (e.target.checked) setDiscount(100);
            }}
            className="rounded border-border"
          />
          <label htmlFor="isFree" className="text-sm">
            Gratis tilgang (100% rabatt)
          </label>
        </div>

        {!isFree && (
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground/80">
              Rabattprosent
            </label>
            <input
              type="number"
              min={0}
              max={99}
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="w-full rounded-xl input-glass px-4 py-3 text-sm"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2 text-foreground/80">
            Maks antall bruk
          </label>
          <input
            type="number"
            min={1}
            value={maxUses}
            onChange={(e) => setMaxUses(Number(e.target.value))}
            className="w-full rounded-xl input-glass px-4 py-3 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-foreground/80">
            Utløper om (dager)
          </label>
          <input
            type="number"
            min={0}
            value={expiresDays}
            onChange={(e) => setExpiresDays(Number(e.target.value))}
            className="w-full rounded-xl input-glass px-4 py-3 text-sm"
          />
          <p className="mt-1 text-xs text-muted">
            Sett 0 for ingen utløpsdato
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating || !selectedVideoId}
          className="w-full btn-gold rounded-xl py-3 text-sm font-semibold disabled:opacity-50"
        >
          <span>{generating ? "Genererer..." : "Generer QR-kode"}</span>
        </button>

        {error && (
          <div className="rounded-lg bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}
      </div>

      <div className="space-y-6">
        {qrDataUrl && (
          <div className="glass-card rounded-2xl p-8 text-center space-y-4">
            <h3 className="text-lg font-semibold text-foreground/90">QR-kode</h3>
            <img
              src={qrDataUrl}
              alt="QR Code"
              className="mx-auto w-64 h-64"
            />
            <p className="text-sm text-muted">
              Kode: <span className="font-mono text-foreground">{qrCode}</span>
            </p>
            {selectedVideo && (
              <p className="text-sm text-muted">
                Gjelder: {selectedVideo.title}
                {isFree ? " (gratis)" : ` (${discount}% rabatt)`}
              </p>
            )}
            <button
              onClick={handleDownload}
              className="btn-gold rounded-xl px-6 py-2.5 text-sm font-semibold"
            >
              <span>Last ned PNG</span>
            </button>
          </div>
        )}

        {qrCodes.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground/90">Nylige QR-koder</h3>
            <div className="space-y-2">
              {qrCodes.map((qr) => (
                <div
                  key={qr.id}
                  className="glass-card rounded-xl px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono">{qr.code}</span>
                    <span className="text-xs text-muted">
                      {qr.is_free ? "Gratis" : `${qr.discount_percentage}%`} ·{" "}
                      {qr.current_uses}/{qr.max_uses ?? "∞"} bruk
                    </span>
                  </div>
                  {qr.videos && (
                    <p className="text-xs text-muted mt-1">
                      {qr.videos.title}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
