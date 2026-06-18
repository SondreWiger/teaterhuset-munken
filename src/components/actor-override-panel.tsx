"use client";

import { useState, useEffect } from "react";

interface Override {
  video_id: string;
  role_id: string;
  character_name: string;
}

interface TeamVideo {
  video_id: string;
  video_title: string;
  team_id: string;
  team_name: string;
  team_color: string;
  role_id: string;
  role_name: string;
  default_character: string | null;
}

export function ActorOverridePanel({
  teamRoles,
  showId,
}: {
  teamRoles: TeamVideo[];
  showId: string;
}) {
  const [overrides, setOverrides] = useState<Override[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/video-overrides")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setOverrides(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getOverride = (videoId: string, roleId: string) =>
    overrides.find((o) => o.video_id === videoId && o.role_id === roleId);

  const setOverride = async (
    videoId: string,
    roleId: string,
    actorName: string
  ) => {
    setSaving(`${videoId}-${roleId}`);
    try {
      if (!actorName) {
        // Delete override (revert to default)
        await fetch(
          `/api/admin/video-overrides?video_id=${videoId}&role_id=${roleId}`,
          { method: "DELETE" }
        );
        setOverrides((prev) =>
          prev.filter(
            (o) => !(o.video_id === videoId && o.role_id === roleId)
          )
        );
      } else {
        const res = await fetch("/api/admin/video-overrides", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            video_id: videoId,
            role_id: roleId,
            character_name: actorName,
          }),
        });
        const data = await res.json();
        if (data.error) return;
        setOverrides((prev) => {
          const existing = prev.findIndex(
            (o) => o.video_id === videoId && o.role_id === roleId
          );
          if (existing >= 0) {
            const copy = [...prev];
            copy[existing] = data;
            return copy;
          }
          return [...prev, data];
        });
      }
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="text-sm text-muted py-4">Laster roller...</div>
    );
  }

  // Group by team
  const byTeam = new Map<string, TeamVideo[]>();
  teamRoles.forEach((tr) => {
    const list = byTeam.get(tr.team_id) || [];
    list.push(tr);
    byTeam.set(tr.team_id, list);
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-1">
          Karakter-overridinger per video
        </h3>
        <p className="text-xs text-muted">
          Hvis en skuespiller var syk en dag, kan du sette en vikar for den
          enkelte videoen her. Skriv inn rollens navn (f.eks. «Romeo»).
        </p>
      </div>

      {Array.from(byTeam.entries()).map(([teamId, entries]) => {
        const team = entries[0];
        return (
          <div key={teamId} className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: team.team_color,
                  boxShadow: `0 0 8px ${team.team_color}40`,
                }}
              />
              <span
                className="text-sm font-semibold"
                style={{ color: team.team_color }}
              >
                {team.team_name}
              </span>
            </div>

            <div className="space-y-2">
              {entries.map((entry) => {
                const override = getOverride(
                  entry.video_id,
                  entry.role_id
                );
                const isSaving =
                  saving === `${entry.video_id}-${entry.role_id}`;

                return (
                  <div
                    key={`${entry.video_id}-${entry.role_id}`}
                    className="flex items-center gap-3 py-2 border-t border-white/[0.04] first:border-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {entry.video_title}
                      </p>
                      <p className="text-xs text-muted">
                        {entry.role_name}
                        {entry.default_character
                          ? ` (${entry.default_character})`
                          : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="text"
                        placeholder={
                          entry.default_character || "Karakternavn"
                        }
                        defaultValue={override?.character_name || ""}
                        onBlur={(e) => {
                          const val = e.target.value.trim();
                          const currentOverride =
                            override?.character_name || "";
                          if (val !== currentOverride) {
                            setOverride(
                              entry.video_id,
                              entry.role_id,
                              val
                            );
                          }
                        }}
                        disabled={isSaving}
                        className="w-36 rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 py-1.5 text-xs text-foreground placeholder:text-muted/40 focus:border-gold/30 focus:outline-none transition-colors disabled:opacity-50"
                      />
                      {override && (
                        <button
                          onClick={() =>
                            setOverride(
                              entry.video_id,
                              entry.role_id,
                              ""
                            )
                          }
                          disabled={isSaving}
                          className="text-xs text-danger/70 hover:text-danger transition-colors px-1"
                          aria-label="Fjern overridng"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
