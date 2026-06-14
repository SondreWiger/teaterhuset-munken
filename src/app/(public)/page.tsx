import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function HomePage(props: {
  searchParams: Promise<{ year?: string }>;
}) {
  const searchParams = await props.searchParams;
  const adminDb = createAdminClient();
  const [showsResult, settingsResult] = await Promise.all([
    adminDb
      .from("shows")
      .select("*, teams(*, videos(*))")
      .eq("published", true)
      .order("year", { ascending: false })
      .order("created_at", { ascending: false }),
    adminDb.from("settings").select("*"),
  ]);

  const shows = showsResult.data ?? [];
  const settings: Record<string, string> = {};
  settingsResult.data?.forEach((s: any) => {
    settings[s.key] = s.value;
  });

  const heroImage = settings.hero_image_url;
  const heroTitle = settings.hero_title || "Teater på nett";
  const heroSubtitle =
    settings.hero_subtitle ||
    "Se våre magiske forestillinger når det passer deg.";

  const years = [...new Set(shows.map((s: any) => s.year))].sort(
    (a, b) => (b as number) - (a as number)
  );
  const activeYear = searchParams.year ? Number(searchParams.year) : null;
  const filteredShows = activeYear
    ? shows.filter((s: any) => s.year === activeYear)
    : shows;

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 hero-mesh" />
        {heroImage && (
          <div className="absolute inset-0">
            <img
              src={heroImage}
              alt=""
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/50" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent" />
          </div>
        )}
        {!heroImage && (
          <>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/[0.03] rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-crimson/[0.03] rounded-full blur-[100px]" />
          </>
        )}

        {/* Floating decorative elements */}
        <div className="absolute top-32 right-20 w-2 h-2 rounded-full bg-gold/30 animate-float" style={{ animationDelay: "0s" }} />
        <div className="absolute top-48 right-40 w-1.5 h-1.5 rounded-full bg-gold/20 animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-40 left-20 w-1 h-1 rounded-full bg-gold/25 animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-60 left-32 w-1.5 h-1.5 rounded-full bg-crimson/20 animate-float" style={{ animationDelay: "3s" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="max-w-3xl">
            <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
              <p className="text-gold font-semibold text-sm tracking-[0.2em] uppercase mb-6">
                Nå tilgjengelig på nett
              </p>
            </div>
            <div className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold tracking-tight leading-[0.95]">
                <span className="text-gradient-gold">{heroTitle}</span>
              </h1>
            </div>
            <div className="animate-fade-up" style={{ animationDelay: "0.35s" }}>
              <p className="mt-5 sm:mt-8 text-base sm:text-lg md:text-xl text-muted max-w-xl leading-relaxed">
                {heroSubtitle}
              </p>
            </div>
            <div className="mt-8 sm:mt-12 flex flex-wrap gap-3 sm:gap-4 animate-fade-up" style={{ animationDelay: "0.5s" }}>
              <Link
                href="/login"
                className="btn-gold rounded-xl px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold inline-flex items-center touch-target"
              >
                <span className="flex items-center gap-2">
                  Kom i gang
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              <Link
                href="#forestillinger"
                className="btn-outline-glass rounded-xl px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-foreground inline-flex items-center touch-target"
              >
                Se forestillinger ↓
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom fade line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/10 to-transparent" />
      </section>

      {/* Stats */}
      {shows.length > 0 && (
        <section className="relative spotlight">
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 stagger">
              {[
                { value: shows.length, label: "Forestillinger", icon: "🎭" },
                {
                  value: shows.reduce(
                    (acc: number, s: any) => acc + (s.teams?.length ?? 0),
                    0
                  ),
                  label: "Lag",
                  icon: "👥",
                },
                {
                  value: shows.reduce(
                    (acc: number, s: any) =>
                      acc +
                      (s.teams?.reduce(
                        (a: number, t: any) => a + (t.videos?.length ?? 0),
                        0
                      ) ?? 0),
                    0
                  ),
                  label: "Videoer",
                  icon: "🎬",
                },
                { value: "HD", label: "Kvalitet", icon: "✨" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="glass-card rounded-2xl p-6 text-center"
                >
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div className="text-3xl font-bold text-gradient-gold">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-muted">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Shows grid */}
      <section
        id="forestillinger"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28"
      >
        <div className="text-center mb-14">
          <p className="text-gold font-semibold text-sm tracking-[0.2em] uppercase mb-4">
            Utvalgte
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
            Våre{" "}
            <span className="text-gradient-gold">forestillinger</span>
          </h2>
          <p className="mt-5 text-muted max-w-2xl mx-auto leading-relaxed">
            Hver forestilling har flere lag med unike fremføringer. Velg den du
            vil se.
          </p>
        </div>

        {/* Year filter */}
        {years.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-14">
            <Link
              href="/"
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                !activeYear ? "pill-active" : "pill text-muted hover:text-foreground"
              }`}
            >
              Alle
            </Link>
            {years.map((year) => (
              <Link
                key={year}
                href={`/?year=${year}`}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeYear === year
                    ? "pill-active"
                    : "pill text-muted hover:text-foreground"
                }`}
              >
                {year}
              </Link>
            ))}
          </div>
        )}

        {!shows.length && (
          <div className="text-center py-32">
            <div className="text-7xl mb-8 animate-float">🎭</div>
            <p className="text-xl text-muted">
              Ingen forestillinger tilgjengelig ennå.
            </p>
            <p className="mt-3 text-sm text-muted/60">
              Kom tilbake snart — det er noe spennende på vei.
            </p>
          </div>
        )}

        {shows.length > 0 && filteredShows.length === 0 && (
          <div className="text-center py-32">
            <p className="text-xl text-muted">
              Ingen forestillinger for {activeYear}.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center text-gold hover:text-gold-light text-sm transition-colors"
            >
              ← Se alle
            </Link>
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 stagger">
          {filteredShows.map((show: any) => {
            const totalVideos = show.teams?.reduce(
              (acc: number, t: any) => acc + (t.videos?.length ?? 0),
              0
            );
            const lowestPrice = show.teams
              ?.flatMap((t: any) => t.videos ?? [])
              .reduce(
                (min: number, v: any) => (v.price < min ? v.price : min),
                Infinity
              );
            return (
              <Link
                key={show.id}
                href={`/shows/${show.id}`}
                className="group glass-card rounded-2xl overflow-hidden"
              >
                <div className="aspect-[16/10] relative overflow-hidden">
                  {show.image_url ? (
                    <img
                      src={show.image_url}
                      alt={show.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gold/10 via-gold/5 to-transparent flex items-center justify-center">
                      <span className="text-7xl opacity-30 group-hover:opacity-50 transition-opacity duration-500">
                        🎭
                      </span>
                    </div>
                  )}
                  {/* Cinematic overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Year badge */}
                  <div className="absolute top-4 left-4">
                    <span className="inline-block rounded-full bg-black/40 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-gold-light border border-gold/10">
                      {show.year}
                    </span>
                  </div>

                  {/* Title area */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-bold text-white group-hover:text-gradient-gold transition-all duration-300">
                      {show.title}
                    </h3>
                    {show.description && (
                      <p className="mt-2 text-sm text-white/50 line-clamp-2 leading-relaxed">
                        {show.description}
                      </p>
                    )}
                  </div>

                  {/* Hover glow line */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="px-6 py-5 flex items-center justify-between text-sm border-t border-white/[0.03]">
                  <div className="flex items-center gap-4 text-muted">
                    <span className="flex items-center gap-1.5">
                      <svg
                        className="w-4 h-4 text-gold/60"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {show.teams?.length ?? 0} lag
                    </span>
                    <span className="text-border">·</span>
                    <span>
                      {totalVideos} video{totalVideos !== 1 ? "er" : ""}
                    </span>
                  </div>
                  {lowestPrice !== Infinity && lowestPrice >= 0 && (
                    <span className="font-semibold text-gradient-gold">
                      Fra {lowestPrice} kr
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 hero-mesh opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/[0.04] rounded-full blur-[150px]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-28 md:py-36 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-gold/[0.08] border border-gold/10 px-4 py-2 mb-8">
            <div className="w-2 h-2 rounded-full bg-gold animate-glow-pulse" />
            <span className="text-sm text-gold font-medium">Klar for å begynne?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight">
            Se <span className="text-gradient-gold">teater</span>
            <br />
            når det passer deg
          </h2>
          <p className="mt-6 text-lg text-muted max-w-xl mx-auto leading-relaxed">
            Opprett en konto og kjøp tilgang til våre forestillinger. Se når
            det passer deg, så mange ganger du vil.
          </p>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link
              href="/login"
              className="btn-gold rounded-xl px-8 py-4 text-base font-semibold inline-flex items-center"
            >
              <span>Opprett konto</span>
            </Link>
            <Link
              href="/login"
              className="btn-outline-glass rounded-xl px-8 py-4 text-base font-semibold text-foreground inline-flex items-center"
            >
              <span>Logg inn</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
