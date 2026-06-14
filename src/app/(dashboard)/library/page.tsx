import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { VideoCard } from "@/components/video-card";

export default async function LibraryPage(props: {
  searchParams: Promise<{ year?: string; page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const adminDb = createAdminClient();
  const { data: purchases } = await adminDb
    .from("purchases")
    .select("*, videos(*, teams(*, shows(*)))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const hasSubscription = false;

  const years = [
    ...new Set(
      purchases?.map((p: any) => p.videos?.teams?.shows?.year).filter(Boolean)
    ),
  ].sort((a, b) => (b as number) - (a as number)) as number[];

  const activeYear = searchParams.year ? Number(searchParams.year) : null;
  const filteredPurchases = activeYear
    ? purchases?.filter(
        (p: any) => p.videos?.teams?.shows?.year === activeYear
      )
    : purchases;

  // Group by show, then by team
  const grouped: Record<
    string,
    {
      show: any;
      teams: Record<string, { team: any; videos: any[] }>;
    }
  > = {};

  filteredPurchases?.forEach((purchase: any) => {
    const video = purchase.videos;
    if (!video) return;
    const team = video.teams;
    const show = team?.shows;
    if (!show || !team) return;

    if (!grouped[show.id]) {
      grouped[show.id] = { show, teams: {} };
    }
    if (!grouped[show.id].teams[team.id]) {
      grouped[show.id].teams[team.id] = { team, videos: [] };
    }
    grouped[show.id].teams[team.id].videos.push(video);
  });

  const showGroups = Object.values(grouped).sort(
    (a, b) => (b.show.year ?? 0) - (a.show.year ?? 0)
  );

  const PAGE_SIZE = 6;
  const page = Math.max(1, Number(searchParams.page) || 1);
  const totalShows = showGroups.length;
  const totalPages = Math.ceil(totalShows / PAGE_SIZE);
  const paginatedShows = showGroups.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold">
          Mitt <span className="text-gradient-gold">bibliotek</span>
        </h1>
        <p className="mt-2 text-muted">
          Videoer du har tilgang til
        </p>
      </div>

      {hasSubscription && (
        <div className="rounded-2xl border border-success/20 bg-success/[0.05] p-5 mb-8 glass-card">
          <p className="text-sm text-success font-medium flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Du har aktivt abonnement — du har tilgang til alle videoer.
          </p>
        </div>
      )}

      {!filteredPurchases?.length && !hasSubscription && (
        <div className="text-center py-28">
          <div className="text-7xl mb-6 animate-float">🎭</div>
          <p className="text-xl text-muted mb-2">
            Biblioteket er tomt
          </p>
          <p className="text-sm text-muted/60 mb-8">
            Kjøp tilgang til en forestilling for å komme i gang.
          </p>
          <Link
            href="/"
            className="btn-gold rounded-xl px-6 py-3 text-sm font-medium inline-flex items-center"
          >
            <span>Utforsk forestillinger</span>
          </Link>
        </div>
      )}

      {years.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-12">
          <Link
            href="/library"
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              !activeYear ? "pill-active" : "pill text-muted hover:text-foreground"
            }`}
          >
            Alle
          </Link>
          {years.map((year) => (
            <Link
              key={year}
              href={`/library?year=${year}`}
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

      <div className="space-y-16">
        {paginatedShows.map(({ show, teams }) => {
          const teamEntries = Object.values(teams);
          const totalVideos = teamEntries.reduce(
            (acc, t) => acc + t.videos.length,
            0
          );

          return (
            <section key={show.id}>
              {/* Show header */}
              <div className="relative mb-8">
                {show.image_url && (
                  <div className="absolute inset-0 -mx-4 sm:-mx-6 lg:-mx-8 -mt-6 overflow-hidden rounded-2xl">
                    <img
                      src={show.image_url}
                      alt=""
                      className="w-full h-full object-cover opacity-15"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/60" />
                    <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent" />
                  </div>
                )}
                <div className="relative flex items-end justify-between gap-4 pb-6 border-b border-white/[0.04]">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Link
                        href={`/shows/${show.id}`}
                        className="text-2xl sm:text-3xl font-bold hover:text-gold transition-colors"
                      >
                        {show.title}
                      </Link>
                      {show.year && (
                        <span className="inline-flex items-center rounded-full bg-gold/[0.08] border border-gold/15 px-3 py-1 text-xs font-semibold text-gold-light">
                          {show.year}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted">
                      <span>
                        {teamEntries.length} lag
                      </span>
                      <span className="text-border">·</span>
                      <span>
                        {totalVideos} video{totalVideos !== 1 ? "er" : ""}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/shows/${show.id}`}
                    className="shrink-0 text-sm text-muted hover:text-gold transition-colors flex items-center gap-1"
                  >
                    Se alle
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* All videos from this show in one horizontal row */}
              <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                {teamEntries.flatMap(({ team, videos }) =>
                  videos.map((video: any) => (
                    <div key={video.id} className="shrink-0 w-72 snap-start">
                      <VideoCard
                        video={video}
                        hasAccess={true}
                        teamColor={team.color}
                      />
                      <div className="px-1 pt-2 flex items-center gap-1.5 text-xs text-muted">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: team.color }}
                        />
                        <span style={{ color: team.color }}>{team.name}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-16">
          {page > 1 && (
            <Link
              href={`/library?${activeYear ? `year=${activeYear}&` : ""}page=${page - 1}`}
              className="px-4 py-2 rounded-xl text-sm text-muted hover:text-foreground pill transition-all"
            >
              ← Forrige
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/library?${activeYear ? `year=${activeYear}&` : ""}page=${p}`}
              className={`w-10 h-10 rounded-xl text-sm font-medium flex items-center justify-center transition-all ${
                p === page ? "pill-active" : "pill text-muted hover:text-foreground"
              }`}
            >
              {p}
            </Link>
          ))}
          {page < totalPages && (
            <Link
              href={`/library?${activeYear ? `year=${activeYear}&` : ""}page=${page + 1}`}
              className="px-4 py-2 rounded-xl text-sm text-muted hover:text-foreground pill transition-all"
            >
              Neste →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
