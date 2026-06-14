"use client";

import { useState, useEffect } from "react";

interface Review {
  id: string;
  user_id: string;
  video_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles?: { display_name: string | null; avatar_url: string | null };
}

export function ReviewsSection({ videoId }: { videoId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myRating, setMyRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/reviews?video_id=${videoId}`)
      .then((r) => r.json())
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [videoId]);

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const handleSubmit = async () => {
    if (!myRating) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_id: videoId, rating: myRating, comment: comment || undefined }),
      });
      if (res.ok) {
        const data = await res.json();
        setReviews((prev) => {
          const existing = prev.find((r) => r.user_id === data.user_id);
          if (existing) return prev.map((r) => (r.user_id === data.user_id ? data : r));
          return [data, ...prev];
        });
        setComment("");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Average rating */}
      <div className="flex items-center gap-3">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={`w-5 h-5 ${star <= Math.round(avgRating) ? "text-gold" : "text-muted/30"}`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>
        <span className="text-sm text-muted">
          {avgRating.toFixed(1)} ({reviews.length} anmeldelse{reviews.length !== 1 ? "r" : ""})
        </span>
      </div>

      {/* Write review */}
      <div className="glass-card rounded-xl p-4 space-y-3">
        <p className="text-sm font-medium">Gi din vurdering</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setMyRating(star)}
              className="touch-target"
            >
              <svg
                className={`w-6 h-6 transition-colors ${
                  star <= (hoverRating || myRating) ? "text-gold" : "text-muted/30"
                }`}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Kommentar (valgfritt)"
          rows={2}
          className="w-full rounded-lg input-glass px-3 py-2 text-sm resize-none"
        />
        <button
          onClick={handleSubmit}
          disabled={submitting || !myRating}
          className="btn-gold rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {submitting ? "Sender..." : "Send"}
        </button>
      </div>

      {/* Reviews list */}
      {loading && <p className="text-sm text-muted">Laster anmeldelser...</p>}
      {!loading && reviews.length === 0 && (
        <p className="text-sm text-muted">Ingen anmeldelser ennå.</p>
      )}
      {reviews.map((review) => (
        <div key={review.id} className="glass-card rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-xs font-semibold text-gold">
              {review.profiles?.display_name?.[0] || "U"}
            </div>
            <span className="text-sm font-medium">
              {review.profiles?.display_name || "Anonym"}
            </span>
            <div className="flex gap-0.5 ml-auto">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-3.5 h-3.5 ${star <= review.rating ? "text-gold" : "text-muted/30"}`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
          </div>
          {review.comment && (
            <p className="text-sm text-muted leading-relaxed">{review.comment}</p>
          )}
        </div>
      ))}
    </div>
  );
}
