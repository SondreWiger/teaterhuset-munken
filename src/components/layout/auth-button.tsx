"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function AuthButton({ user }: { user: User | null }) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (!user) {
    return (
      <a
        href="/login"
        className="btn-gold rounded-lg px-5 py-2 text-sm inline-flex items-center"
      >
        <span>Logg inn</span>
      </a>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg glass">
        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
        <span className="text-sm text-muted">{user.email}</span>
      </div>
      <button
        onClick={handleSignOut}
        className="text-sm text-muted hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-white/[0.04]"
      >
        Logg ut
      </button>
    </div>
  );
}
