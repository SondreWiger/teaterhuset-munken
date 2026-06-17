import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AuthButton } from "./auth-button";
import { MobileNav } from "./mobile-nav";
import { SearchInput } from "./search-input";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: string | null = null;
  if (user) {
    const adminDb = createAdminClient();
    const { data: profiles } = await adminDb
      .from("profiles")
      .select("role")
      .eq("id", user.id);

    role = (profiles?.[0] as { role: string } | undefined)?.role ?? null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/[0.04]" role="navigation" aria-label="Hovedmeny">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="text-lg font-bold tracking-tight hidden sm:block">
                Teaterhuset Munken
              </span>
            </Link>
            <div className="hidden sm:flex items-center gap-1">
              <Link
                href="/forestillinger"
                className="px-4 py-2 text-sm text-muted hover:text-foreground rounded-lg hover:bg-white/[0.04] transition-all"
              >
                Forestillinger
              </Link>
              {user && (
                <Link
                  href="/library"
                  className="px-4 py-2 text-sm text-muted hover:text-foreground rounded-lg hover:bg-white/[0.04] transition-all"
                >
                  Mitt bibliotek
                </Link>
              )}
              {user && role === "admin" && (
                <Link
                  href="/dashboard/admin"
                  className="px-4 py-2 text-sm text-primary/80 hover:text-primary rounded-lg hover:bg-primary/[0.06] transition-all"
                >
                  Admin
                </Link>
              )}
              {user && (
                <Link
                  href="/dashboard/profile"
                  className="px-4 py-2 text-sm text-muted hover:text-foreground rounded-lg hover:bg-white/[0.04] transition-all"
                >
                  Profil
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SearchInput />
            <div className="hidden sm:flex items-center gap-3">
              <AuthButton user={user} />
            </div>
            <MobileNav user={user} role={role} />
          </div>
        </div>
      </div>
    </nav>
  );
}
