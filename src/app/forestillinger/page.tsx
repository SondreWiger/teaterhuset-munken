import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function ForestillingerPage(props: {
  searchParams: Promise<{ year?: string }>;
}) {
  const searchParams = await props.searchParams;
  const adminDb = createAdminClient();
  const now = new Date().toISOString();

  const { data: shows } = await adminDb
    .from("shows")
    .select("*, teams(*, videos(*))")
    .eq("published", true)
    .or(`publish_at.is.null,publish_at.lte.${now}`)
    .order("year", { ascending: false })
    .order("created_at", { ascending: false });

  const allShows = shows ?? [];
  const years = [...new Set(allShows.map((s: any) => s.year))].sort(
    (a, b) => (b as number) - (a as number)
  );
  const activeYear = searchParams.year ? Number(searchParams.year) : null;
  const filteredShows = activeYear
    ? allShows.filter((s: any) => s.year === activeYear)
    : allShows;

  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="animate-fade-up">
          <p className="text-gold font-semibold text-sm tracking-[0.2em] uppercase mb-4">
            Alle forestillinger
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Våre{" "}
            <span className="text-gradient-gold">forestillinger</span>
          </h1>
          <p className="mt-4 text-muted max-w-xl leading-relaxed">
            Utforsk vårt repertoar. Hver forestilling har flere lag med unike
            fremføringer.
          </p>
        </div>
      </div>

      {/* Year filter */}
      {years.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/forestillinger"
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                !activeYear ? "pill-active" : "pill text-muted hover:text-foreground"
              }`}
            >
              Alle år
            </Link>
            {years.map((year) => (
              <Link
                key={year}
                href={`/forestillinger?year=${year}`}
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
        </div>
      )}

      {/* Empty states */}
      {!allShows.length && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-32">
            <div className="text-7xl mb-8 animate-float">🎭</div>
            <p className="text-xl text-muted">
              Ingen forestillinger tilgjengelig ennå.
            </p>
            <p className="mt-3 text-sm text-muted/60">
              Kom tilbake snart — det er noe spennende på vei.
            </p>
          </div>
        </div>
      )}

      {allShows.length > 0 && filteredShows.length === 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-32">
            <p className="text-xl text-muted">
              Ingen forestillinger for {activeYear}.
            </p>
            <Link
              href="/forestillinger"
              className="mt-6 inline-flex items-center text-gold hover:text-gold-light text-sm transition-colors"
            >
              ← Se alle
            </Link>
          </div>
        </div>
      )}

      {/* Shows grid */}
      {filteredShows.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 stagger">
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
        </div>
      )}
    </div>
  );
}
