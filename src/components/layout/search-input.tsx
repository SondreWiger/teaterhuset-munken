"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export function SearchInput() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setExpanded(false);
      inputRef.current?.blur();
    }
  };

  return (
    <>
      {/* Desktop search */}
      <form onSubmit={handleSubmit} className="relative hidden sm:block">
        <div
          className={`flex items-center rounded-xl border transition-all duration-300 ${
            focused
              ? "border-gold/30 bg-white/[0.04] shadow-[0_0_20px_-5px_rgba(212,168,67,0.1)]"
              : "border-white/[0.06] bg-white/[0.02]"
          }`}
        >
          <svg
            className="w-4 h-4 text-muted ml-3 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Søk..."
            className="bg-transparent border-0 outline-none text-sm py-2 px-2 w-40 focus:w-56 transition-all duration-300 text-foreground placeholder:text-muted/50"
          />
        </div>
      </form>

      {/* Mobile search toggle */}
      <button
        onClick={() => {
          setExpanded(!expanded);
          if (!expanded) {
            setTimeout(() => inputRef.current?.focus(), 100);
          }
        }}
        className="sm:hidden w-10 h-10 rounded-lg flex items-center justify-center text-muted hover:text-foreground hover:bg-white/[0.04] transition-all"
        aria-label="Søk"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      </button>

      {/* Mobile search expanded */}
      {expanded && (
        <div className="sm:hidden fixed top-16 left-0 right-0 z-[56] glass border-b border-white/[0.06] animate-fade-in">
          <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3">
            <div className="flex-1 flex items-center rounded-xl border border-gold/30 bg-white/[0.04]">
              <svg
                className="w-4 h-4 text-muted ml-3 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Søk forestillinger, roller..."
                className="flex-1 bg-transparent border-0 outline-none text-sm py-3 px-2 text-foreground placeholder:text-muted/50"
                autoFocus
              />
            </div>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="shrink-0 px-3 py-3 text-sm text-muted hover:text-foreground transition-colors"
            >
              Avbryt
            </button>
          </form>
        </div>
      )}
    </>
  );
}
