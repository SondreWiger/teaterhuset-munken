"use client";

import { useState } from "react";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!email.includes("@")) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Takk for påmelding!");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Noe gikk galt");
      }
    } catch {
      setStatus("error");
      setMessage("Nettverksfeil");
    }
  };

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 hero-mesh opacity-30" />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-gold/[0.08] border border-gold/10 px-4 py-2 mb-6">
          <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
          <span className="text-sm text-gold font-medium">Nyhetsbrev</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Hold deg <span className="text-gradient-gold">oppdatert</span>
        </h2>
        <p className="text-muted max-w-lg mx-auto mb-8">
          Få beskjed når nye forestillinger og videoer legges ut. Ingen spam — bare teater.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }}
            placeholder="Din e-postadresse"
            className="flex-1 rounded-xl input-glass px-4 py-3 text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <button
            onClick={handleSubmit}
            disabled={status === "loading" || !email.includes("@")}
            className="btn-gold rounded-xl px-6 py-3 text-sm font-semibold disabled:opacity-50 shrink-0"
          >
            {status === "loading" ? "Melder på..." : "Meld på"}
          </button>
        </div>
        {status !== "idle" && message && (
          <p className={`mt-4 text-sm ${status === "success" ? "text-success" : "text-danger"}`}>
            {message}
          </p>
        )}
      </div>
    </section>
  );
}
