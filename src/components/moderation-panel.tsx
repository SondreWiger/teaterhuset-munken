"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Report {
  id: string;
  reason: string;
  status: string;
  created_at: string;
  comment_id: string;
  comments?: {
    content: string;
    user_id: string;
    profiles?: { display_name: string | null };
    show_id: string;
  };
}

export function ModerationPanel() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then(setReports)
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async (reportId: string, status: string, deleteComment: boolean) => {
    const res = await fetch("/api/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: reportId, status, delete_comment: deleteComment }),
    });
    if (res.ok) {
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      toast.success(deleteComment ? "Kommentar slettet og rapport lukket" : "Rapport lukket");
    }
  };

  const pending = reports.filter((r) => r.status === "pending");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">
          Rapporterte kommentarer
          {pending.length > 0 && (
            <span className="ml-2 text-xs bg-danger/10 text-danger px-2 py-0.5 rounded-full">
              {pending.length} ventende
            </span>
          )}
        </h2>
      </div>

      {loading && <p className="text-sm text-muted">Laster...</p>}

      {!loading && pending.length === 0 && (
        <p className="text-sm text-muted text-center py-8">
          Ingen rapporter å håndtere.
        </p>
      )}

      <div className="space-y-3">
        {pending.map((report) => (
          <div key={report.id} className="glass-card rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-danger" />
                <span className="text-sm font-medium">
                  Rapportert av {report.comments?.profiles?.display_name || "Bruker"}
                </span>
              </div>
              <span className="text-xs text-muted">
                {new Date(report.created_at).toLocaleDateString("nb-NO")}
              </span>
            </div>

            <div className="rounded-lg bg-white/[0.03] border border-white/[0.04] p-3">
              <p className="text-xs text-muted mb-1">Kommentar:</p>
              <p className="text-sm">{report.comments?.content}</p>
            </div>

            <div className="rounded-lg bg-danger/[0.05] border border-danger/10 p-3">
              <p className="text-xs text-muted mb-1">Årsak:</p>
              <p className="text-sm text-danger">{report.reason}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleAction(report.id, "dismissed", false)}
                className="rounded-lg border border-white/[0.06] px-4 py-2 text-xs text-muted hover:text-foreground hover:border-gold/20 transition-all"
              >
                Avvis rapport
              </button>
              <button
                onClick={() => handleAction(report.id, "resolved", true)}
                className="rounded-lg bg-danger/10 border border-danger/20 px-4 py-2 text-xs text-danger hover:bg-danger/20 transition-all"
              >
                Slett kommentar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
