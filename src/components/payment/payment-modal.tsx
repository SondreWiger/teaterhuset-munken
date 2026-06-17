"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

export function PaymentModal({
  video,
  onClose,
}: {
  video: { id: string; title: string; price: number };
  onClose: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleDevBypass = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/dev-bypass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId: video.id }),
      });
      if (res.ok) {
        router.push("/library?bypass=true");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-sm sm:rounded-3xl rounded-t-3xl border border-white/[0.08] shadow-2xl shadow-black/50 bg-[#0f0f15] safe-bottom"
        style={{ backdropFilter: "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-white/[0.12]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 pb-0">
          <h2 className="text-lg font-semibold">Kjøp tilgang</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-muted hover:text-foreground hover:bg-white/[0.06] transition-colors touch-target"
            aria-label="Lukk betalingsvindu"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Video info */}
        <div className="px-5 sm:px-6 pt-4 pb-5 sm:pb-6">
          <p className="text-muted text-sm mb-2">{video.title}</p>
          <p className="text-4xl font-bold text-gradient-gold">
            {video.price}{" "}
            <span className="text-lg font-normal text-muted">kr</span>
          </p>
        </div>

        <div className="mx-5 sm:mx-6 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        {/* Payment methods */}
        <div className="p-5 sm:p-6 space-y-3">
          {/* Vipps */}
          <button
            disabled={loading}
            className="w-full rounded-xl bg-[#ff5b24] px-4 py-4 sm:py-3.5 text-sm font-semibold text-white hover:bg-[#e04e1e] transition-colors disabled:opacity-50 flex items-center justify-center gap-2.5 touch-target"
          >
            <VippsLogo />
            Betal med Vipps
          </button>

          {/* PayPal */}
          <PayPalInline
            amount={video.price}
            videoId={video.id}
            onSuccess={() => {
              router.push("/library?paypal=success");
              router.refresh();
            }}
          />

          {/* Divider */}
          <div className="relative py-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#0f0f15] px-3 text-xs text-muted">
                eller
              </span>
            </div>
          </div>

          {/* Dev bypass */}
          <button
            onClick={handleDevBypass}
            disabled={loading}
            className="w-full rounded-xl border border-dashed border-white/[0.06] px-4 py-4 sm:py-3 text-sm text-muted hover:text-foreground hover:border-gold/20 hover:bg-gold/[0.03] transition-all disabled:opacity-50 touch-target"
          >
            Dev bypass
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

function VippsLogo() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
        fill="currentColor"
      />
    </svg>
  );
}

function PayPalInline({
  amount,
  videoId,
  onSuccess,
}: {
  amount: number;
  videoId: string;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  const handlePayPal = async () => {
    setLoading(true);
    setError(null);

    try {
      const createRes = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, amount }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error);

      const paypalUrl = `https://www.paypal.com/checkoutnow?token=${createData.id}`;
      window.open(paypalUrl, "_blank", "width=500,height=700");

      setTimeout(() => {
        onSuccess();
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "PayPal-feil");
    } finally {
      setLoading(false);
    }
  };

  if (!clientId || clientId === "your-paypal-client-id") {
    return (
      <button
        disabled
        className="w-full rounded-xl border border-white/[0.04] px-4 py-4 sm:py-3.5 text-sm font-medium text-muted/40 cursor-not-allowed flex items-center justify-center gap-2.5 touch-target"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 00-.794.68l-.04.22-.63 3.993-.032.17a.804.804 0 01-.794.679H7.72a.483.483 0 01-.477-.558l.001-.01.43-2.726a.806.806 0 01.794-.679h.5c3.238 0 5.774-1.314 6.514-5.12.34-1.545.255-2.764-.468-3.622a3.446 3.446 0 00-.32-.323l.001-.001-.004-.004zM14.876 5.178H8.34a.806.806 0 00-.794.679L6.59 10.99a.483.483 0 00.477.558h.733c1.912 0 3.33-.574 4.038-1.69.16-.253.293-.537.399-.847.566-1.645.466-3.025-.74-3.853z" />
        </svg>
        PayPal ikke konfigurert
      </button>
    );
  }

  return (
    <div className="space-y-1.5">
      <button
        onClick={handlePayPal}
        disabled={loading}
        className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-4 sm:py-3.5 text-sm font-medium text-foreground hover:bg-white/[0.06] transition-colors disabled:opacity-50 flex items-center justify-center gap-2.5 touch-target"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 00-.794.68l-.04.22-.63 3.993-.032.17a.804.804 0 01-.794.679H7.72a.483.483 0 01-.477-.558l.001-.01.43-2.726a.806.806 0 01.794-.679h.5c3.238 0 5.774-1.314 6.514-5.12.34-1.545.255-2.764-.468-3.622a3.446 3.446 0 00-.32-.323l.001-.001-.004-.004zM14.876 5.178H8.34a.806.806 0 00-.794.679L6.59 10.99a.483.483 0 00.477.558h.733c1.912 0 3.33-.574 4.038-1.69.16-.253.293-.537.399-.847.566-1.645.466-3.025-.74-3.853z" />
        </svg>
        {loading ? "Vent..." : "Betal med PayPal"}
      </button>
      {error && (
        <p className="text-xs text-danger px-1">{error}</p>
      )}
    </div>
  );
}
