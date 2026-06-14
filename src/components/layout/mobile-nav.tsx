"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthButton } from "./auth-button";

export function MobileNav({
  user,
  role,
}: {
  user: any;
  role: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger button — visible on sm only */}
      <button
        onClick={() => setOpen(!open)}
        className="sm:hidden w-10 h-10 rounded-lg flex items-center justify-center text-muted hover:text-foreground hover:bg-white/[0.04] transition-all"
        aria-label="Meny"
      >
        {open ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
          </svg>
        )}
      </button>

      {/* Mobile overlay menu */}
      {open && (
        <div
          className="fixed inset-0 z-[55] sm:hidden"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />
          <div
            className="absolute top-16 left-0 right-0 glass border-b border-white/[0.06] animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="px-4 py-3 text-sm text-muted hover:text-foreground rounded-xl hover:bg-white/[0.04] transition-all"
              >
                Forestillinger
              </Link>
              {user && (
                <Link
                  href="/library"
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 text-sm text-muted hover:text-foreground rounded-xl hover:bg-white/[0.04] transition-all"
                >
                  Mitt bibliotek
                </Link>
              )}
              {user && role === "admin" && (
                <Link
                  href="/dashboard/admin"
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 text-sm text-primary/80 hover:text-primary rounded-xl hover:bg-primary/[0.06] transition-all"
                >
                  Admin
                </Link>
              )}
              <div className="border-t border-white/[0.04] mt-2 pt-3">
                <AuthButton user={user} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
