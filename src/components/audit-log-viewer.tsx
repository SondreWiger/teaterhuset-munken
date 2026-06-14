"use client";

import { useState, useEffect } from "react";

interface AuditEntry {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: any;
  created_at: string;
  profiles?: { display_name: string | null; email: string } | null;
}

const ACTION_LABELS: Record<string, string> = {
  create: "Opprettet",
  update: "Oppdatert",
  delete: "Slettet",
  login: "Logget inn",
  purchase: "Kjøpte",
  report: "Rapporterte",
};

const ENTITY_LABELS: Record<string, string> = {
  show: "Forestilling",
  team: "Lag",
  video: "Video",
  comment: "Kommentar",
  user: "Bruker",
  qr_code: "QR-kode",
  gift_card: "Gavekort",
  subscription: "Abonnement",
  review: "Anmeldelse",
  role: "Rolle",
};

export function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch("/api/admin/audit-log")
      .then((r) => r.json())
      .then((data) => setLogs(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter
    ? logs.filter((l) => l.entity_type === filter || l.action === filter)
    : logs;

  const formatDate = (d: string) => {
    return new Date(d).toLocaleString("nb-NO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {["", "show", "team", "video", "comment", "user"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === f ? "btn-gold" : "pill text-muted hover:text-foreground"
            }`}
          >
            {f ? ENTITY_LABELS[f] || f : "Alle"}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-muted">Laster logg...</p>}

      {!loading && filtered.length === 0 && (
        <p className="text-sm text-muted text-center py-8">Ingen oppføringer ennå.</p>
      )}

      <div className="space-y-2">
        {filtered.map((log) => (
          <div
            key={log.id}
            className="glass-card rounded-xl px-4 py-3 flex items-center gap-4"
          >
            <div className="w-2 h-2 rounded-full bg-gold/40 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">
                  {log.profiles?.display_name || log.profiles?.email || "System"}
                </span>
                <span className="text-xs text-muted">
                  {ACTION_LABELS[log.action] || log.action}
                </span>
                <span className="text-xs text-gold">
                  {ENTITY_LABELS[log.entity_type] || log.entity_type}
                </span>
              </div>
              {log.details && (
                <p className="text-xs text-muted mt-0.5 line-clamp-1">
                  {typeof log.details === "string" ? log.details : JSON.stringify(log.details)}
                </p>
              )}
            </div>
            <span className="text-xs text-muted shrink-0">{formatDate(log.created_at)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
