"use client";

import { useState, useEffect } from "react";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: { display_name: string | null; avatar_url: string | null };
  replies?: Comment[];
}

export function CommentsSection({ showId }: { showId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reportedComments, setReportedComments] = useState<string[]>([]);
  const [reportingComment, setReportingComment] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");

  useEffect(() => {
    fetch(`/api/comments?show_id=${showId}`)
      .then((r) => r.json())
      .then((data) => setComments(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [showId]);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ show_id: showId, content }),
      });
      if (res.ok) {
        const data = await res.json();
        setComments((prev) => [{ ...data, replies: [] }, ...prev]);
        setContent("");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ show_id: showId, parent_id: parentId, content: replyContent }),
      });
      if (res.ok) {
        const data = await res.json();
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId ? { ...c, replies: [...(c.replies || []), data] } : c
          )
        );
        setReplyContent("");
        setReplyTo(null);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReport = async (commentId: string, reason: string) => {
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment_id: commentId, reason }),
    });
    if (res.ok) {
      setReportedComments((prev) => [...prev, commentId]);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/comments?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setComments((prev) =>
        prev.filter((c) => c.id !== id).map((c) => ({
          ...c,
          replies: c.replies?.filter((r) => r.id !== id) || [],
        }))
      );
    }
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return "nettopp";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min siden`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} t siden`;
    return date.toLocaleDateString("nb-NO");
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">
        Diskusjon
        {comments.length > 0 && (
          <span className="text-muted text-sm font-normal ml-2">({comments.length})</span>
        )}
      </h3>

      {/* Write comment */}
      <div className="glass-card rounded-xl p-4 space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Skriv en kommentar..."
          rows={3}
          className="w-full rounded-lg input-glass px-3 py-2 text-sm resize-none"
        />
        <button
          onClick={handleSubmit}
          disabled={submitting || !content.trim()}
          className="btn-gold rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {submitting ? "Sender..." : "Kommenter"}
        </button>
      </div>

      {loading && <p className="text-sm text-muted">Laster diskusjon...</p>}

      {!loading && comments.length === 0 && (
        <p className="text-sm text-muted text-center py-8">
          Ingen kommentarer ennå. Bli den første!
        </p>
      )}

      {/* Comments */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="space-y-3">
            <div className="glass-card rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-xs font-semibold text-gold">
                  {comment.profiles?.display_name?.[0] || "U"}
                </div>
                <span className="text-sm font-medium">
                  {comment.profiles?.display_name || "Anonym"}
                </span>
                <span className="text-xs text-muted ml-auto">
                  {formatDate(comment.created_at)}
                </span>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">{comment.content}</p>
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                  className="text-xs text-muted hover:text-gold transition-colors"
                >
                  Svar
                </button>
                {!reportedComments.includes(comment.id) ? (
                  <button
                    onClick={() => setReportingComment(reportingComment === comment.id ? null : comment.id)}
                    className="text-xs text-muted hover:text-danger transition-colors"
                  >
                    Rapporter
                  </button>
                ) : (
                  <span className="text-xs text-danger/60">Rapportert</span>
                )}
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-xs text-muted hover:text-danger transition-colors"
                >
                  Slett
                </button>
              </div>

              {/* Report form */}
              {reportingComment === comment.id && (
                <div className="mt-2 rounded-lg bg-danger/[0.05] border border-danger/10 p-3 space-y-2">
                  <p className="text-xs text-danger font-medium">Hvorfor rapporterer du denne?</p>
                  <div className="flex flex-wrap gap-2">
                    {["Uønsket innhold", "Sjikane", "Spam", "Feil informasjon"].map((reason) => (
                      <button
                        key={reason}
                        onClick={() => { handleReport(comment.id, reason); setReportingComment(null); }}
                        className="rounded-lg border border-white/[0.06] px-2.5 py-1 text-xs text-muted hover:text-foreground hover:border-danger/20 transition-all"
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Replies */}
            {comment.replies?.map((reply) => (
              <div key={reply.id} className="ml-8 glass-card rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center text-[10px] font-semibold text-gold">
                    {reply.profiles?.display_name?.[0] || "U"}
                  </div>
                  <span className="text-sm font-medium">
                    {reply.profiles?.display_name || "Anonym"}
                  </span>
                  <span className="text-xs text-muted ml-auto">
                    {formatDate(reply.created_at)}
                  </span>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{reply.content}</p>
                <button
                  onClick={() => handleDelete(reply.id)}
                  className="text-xs text-muted hover:text-danger transition-colors"
                >
                  Slett
                </button>
              </div>
            ))}

            {/* Reply input */}
            {replyTo === comment.id && (
              <div className="ml-8 glass-card rounded-xl p-3 space-y-2">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Skriv et svar..."
                  rows={2}
                  className="w-full rounded-lg input-glass px-3 py-2 text-sm resize-none"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReply(comment.id)}
                    disabled={submitting || !replyContent.trim()}
                    className="btn-gold rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                  >
                    Svar
                  </button>
                  <button
                    onClick={() => { setReplyTo(null); setReplyContent(""); }}
                    className="text-xs text-muted hover:text-foreground transition-colors px-3 py-1.5"
                  >
                    Avbryt
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
