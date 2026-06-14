"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

export function NotificationManager() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscriberCount, setSubscriberCount] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/notifications").then((r) => r.json()),
      fetch("/api/newsletter").then((r) => r.json()),
    ]).then(([notifs, subs]) => {
      setHistory(notifs || []);
      setSubscriberCount(Array.isArray(subs) ? subs.filter((s: any) => s.active).length : 0);
      setLoading(false);
    });
  }, []);

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body, type: "manual" }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Sendt!");
        setSubject("");
        setBody("");
        // Refresh history
        const notifs = await fetch("/api/admin/notifications").then((r) => r.json());
        setHistory(notifs || []);
      } else {
        toast.error(data.error || "Feil");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Send varsling</h2>
          <span className="text-sm text-muted">
            {subscriberCount} abonnenter
          </span>
        </div>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Emne"
          className="w-full rounded-xl input-glass px-4 py-3 text-sm"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Melding..."
          rows={5}
          className="w-full rounded-xl input-glass px-4 py-3 text-sm resize-none"
        />
        <button
          onClick={handleSend}
          disabled={sending || !subject.trim() || !body.trim()}
          className="btn-gold rounded-xl px-6 py-2.5 text-sm font-semibold disabled:opacity-50"
        >
          {sending ? "Sender..." : `Send til ${subscriberCount} abonnenter`}
        </button>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">Sendte varslinger</h2>
        {loading && <p className="text-sm text-muted">Laster...</p>}
        {!loading && history.length === 0 && (
          <p className="text-sm text-muted">Ingen varslinger sendt ennå.</p>
        )}
        <div className="space-y-2">
          {history.map((n: any) => (
            <div key={n.id} className="rounded-xl bg-white/[0.03] px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{n.subject}</span>
                <span className="text-xs text-muted">
                  {new Date(n.sent_at).toLocaleDateString("nb-NO")}
                </span>
              </div>
              <p className="text-xs text-muted mt-1 line-clamp-2">{n.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
