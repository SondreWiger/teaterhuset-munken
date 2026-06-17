"use client";

import { useState, useEffect } from "react";

export function DisclaimerModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("disclaimer-seen");
    if (!seen) {
      setOpen(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem("disclaimer-seen", "1");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={dismiss} />
      <div className="relative glass-card rounded-2xl max-w-lg w-full p-8 sm:p-10 animate-fade-up">
        <div className="w-12 h-12 rounded-xl bg-gold/[0.1] border border-gold/15 flex items-center justify-center mb-6">
          <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-3">Utviklingsversjon</h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          Dette er <strong className="text-foreground">ikke</strong> den offisielle nettsiden til Teaterhuset Munken. Siden er under aktiv utvikling.
        </p>
        <p className="text-sm text-muted leading-relaxed mb-6">
          Under utvikling bør du alltid bruke <strong className="text-gold">dev bypass</strong> ved kjøp på appen. Ikke legg inn ekte betalingsinformasjon.
        </p>
        <button
          onClick={dismiss}
          className="w-full btn-gold rounded-xl px-6 py-3.5 text-sm font-semibold touch-target"
        >
          Jeg forstår
        </button>
      </div>
    </div>
  );
}
