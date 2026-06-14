"use client";

import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

type AuthMode = "login" | "signup";

function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name: name || email },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setSuccess(
          "Konto opprettet! Sjekk e-posten din for å bekrefte adressen."
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        const redirect = searchParams.get("redirect") || "/dashboard";
        router.push(redirect);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noe gikk galt");
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    setError(null);
    setSuccess(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      <div className="flex rounded-xl p-1 glass">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 rounded-lg px-4 py-3 sm:py-2.5 text-sm font-medium transition-all touch-target ${
            mode === "login"
              ? "btn-gold"
              : "text-muted hover:text-foreground"
          }`}
        >
          {mode === "login" && <span>Logg inn</span>}
          {mode !== "login" && "Logg inn"}
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 rounded-lg px-4 py-3 sm:py-2.5 text-sm font-medium transition-all touch-target ${
            mode === "signup"
              ? "btn-gold"
              : "text-muted hover:text-foreground"
          }`}
        >
          {mode === "signup" && <span>Opprett konto</span>}
          {mode !== "signup" && "Opprett konto"}
        </button>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2 text-foreground/80">
          E-post
        </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl input-glass px-4 py-3.5 sm:py-3 text-sm touch-target"
            placeholder="ola@example.com"
          />
      </div>

      {mode === "signup" && (
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2 text-foreground/80">
            Navn (valgfritt)
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl input-glass px-4 py-3.5 sm:py-3 text-sm touch-target"
            placeholder="Ola Nordmann"
          />
        </div>
      )}

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-2 text-foreground/80">
          Passord
        </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-xl input-glass px-4 py-3.5 sm:py-3 text-sm touch-target"
            placeholder="••••••••"
          />
      </div>

      {error && (
        <div className="rounded-xl bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl bg-success/10 border border-success/20 px-4 py-3 text-sm text-success">
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full btn-gold rounded-xl py-3.5 sm:py-3 text-sm font-semibold disabled:opacity-50 touch-target"
      >
        <span>
          {isLoading
            ? "Vent..."
            : mode === "login"
              ? "Logg inn"
              : "Opprett konto"}
        </span>
      </button>

      <button
        type="button"
        onClick={switchMode}
        className="w-full text-sm text-muted hover:text-gold transition-colors"
      >
        {mode === "login"
          ? "Har du ikke konto? Opprett en"
          : "Allerede konto? Logg inn"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[100dvh] flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/[0.06] via-background to-crimson/[0.04]" />
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-gold/[0.05] rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-crimson/[0.04] rounded-full blur-[100px]" />
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center text-background text-3xl font-black mb-8 shadow-lg shadow-gold/20">
              TP
            </div>
            <h2 className="text-3xl font-bold text-gradient-gold mb-4">
              Teaterhuset Munken
            </h2>
            <p className="text-muted max-w-sm leading-relaxed">
              Se teaterforestillinger på nett. Kjøp tilgang og se når det
              passer deg.
            </p>
            <div className="mt-12 flex items-center justify-center gap-3">
              <div className="w-2 h-2 rounded-full bg-gold/40 animate-float" />
              <div className="w-1.5 h-1.5 rounded-full bg-gold/20 animate-float" style={{ animationDelay: "1s" }} />
              <div className="w-1 h-1 rounded-full bg-gold/15 animate-float" style={{ animationDelay: "2s" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-8 sm:py-0">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          <div className="text-center lg:hidden">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center text-background text-xl font-black mx-auto mb-4">
              TP
            </div>
            <h1 className="text-2xl font-bold">Teaterhuset Munken</h1>
          </div>
          <div className="text-center hidden lg:block">
            <h1 className="text-2xl font-bold">
              Velkommen tilbake
            </h1>
            <p className="mt-2 text-sm text-muted">
              Logg inn eller opprett konto
            </p>
          </div>
          <Suspense
            fallback={
              <div className="text-center text-muted py-8">Laster...</div>
            }
          >
            <AuthForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
