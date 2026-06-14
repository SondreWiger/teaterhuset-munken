"use client";

import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">⚠️</div>
        <h2 className="text-2xl font-bold mb-3">Noe gikk galt</h2>
        <p className="text-muted mb-8">
          {error.message || "Kunne ikke laste dashbordet. Prøv igjen."}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="btn-gold rounded-xl px-6 py-3 text-sm font-semibold"
          >
            Prøv igjen
          </button>
          <Link
            href="/"
            className="btn-outline-glass rounded-xl px-6 py-3 text-sm font-semibold text-foreground"
          >
            Tilbake
          </Link>
        </div>
      </div>
    </div>
  );
}
