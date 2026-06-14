import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { VideoCard } from "@/components/video-card";

export default async function SearchPage(props: {
  searchParams: Promise<{ q?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams.q?.trim() || "";
  const adminDb = createAdminClient();

  let shows: any[] = [];
  let roles: any[] = [];

  if (query) {
    const now = new Date().toISOString();
    const [showsResult, rolesResult] = await Promise.all([
      adminDb
        .from("shows")
        .select("*, teams(*, videos(*, team_roles(*, roles(*))))")
        .eq("published", true)
        .or(`publish_at.is.null,publish_at.lte.${now},title.ilike.%${query}%,description.ilike.%${query}%`),
      adminDb
        .from("roles")
        .select("*")
        .ilike("name", `%${query}%`),
    ]);
    shows = showsResult.data ?? [];
    roles = rolesResult.data ?? [];
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let purchasedVideoIds = new Set<string>();
  if (user) {
    const { data: purchases } = await adminDb
      .from("purchases")
      .select("video_id")
      .eq("user_id", user.id);
    purchases?.forEach((p: any) => {
      if (p.video_id) purchasedVideoIds.add(p.video_id);
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold">
          Søk
        </h1>
        {query && (
          <p className="mt-2 text-muted">
            Resultater for &quot;{query}&quot;
          </p>
        )}
      </div>

      {!query && (
        <div className="text-center py-28">
          <div className="text-6xl mb-6">🔍</div>
          <p className="text-xl text-muted mb-2">Søk etter forestillinger, videoer og roller</p>
          <p className="text-sm text-muted/60">Bruk søkefeltet i navigasjonen</p>
        </div>
      )}

      {query && shows.length === 0 && roles.length === 0 && (
        <div className="text-center py-28">
          <div className="text-6xl mb-6">😔</div>
          <p className="text-xl text-muted mb-2">Ingen resultater</p>
          <p className="text-sm text-muted/60">Prøv et annet søk</p>
        </div>
      )}

      {/* Roles results */}
      {roles.length > 0 && (
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-gold to-gold-light" />
            <h2 className="text-xl font-bold">Roller</h2>
            <span className="text-sm text-muted">· {roles.length}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {roles.map((role) => (
              <Link
                key={role.id}
                href={`/roles/${role.id}`}
                className="flex items-center gap-3 p-4 rounded-xl glass-card group"
              >
                {role.image_url ? (
                  <img
                    src={role.image_url}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover border border-white/[0.06]"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold/15 to-gold/5 flex items-center justify-center border border-white/[0.04]">
                    <span className="text-lg font-bold text-gradient-gold">
                      {role.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium group-hover:text-gold transition-colors">
                    {role.name}
                  </p>
                  {role.description && (
                    <p className="text-xs text-muted line-clamp-1">{role.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Shows results */}
      {shows.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-gold to-gold-light" />
            <h2 className="text-xl font-bold">Forestillinger</h2>
            <span className="text-sm text-muted">· {shows.length}</span>
          </div>
          <div className="space-y-14">
            {shows.map((show) => (
              <section key={show.id}>
                <div className="flex items-center gap-3 mb-6">
                  <Link
                    href={`/shows/${show.id}`}
                    className="text-lg font-semibold hover:text-gold transition-colors"
                  >
                    {show.title}
                  </Link>
                  {show.year && (
                    <span className="text-xs text-gold/60">{show.year}</span>
                  )}
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {show.teams?.flatMap((team: any) =>
                    (team.videos ?? [])
                      .filter((v: any) => v.published)
                      .sort((a: any, b: any) => a.sort_order - b.sort_order)
                      .map((video: any) => (
                        <VideoCard
                          key={video.id}
                          video={video}
                          hasAccess={purchasedVideoIds.has(video.id)}
                          teamColor={team.color}
                        />
                      ))
                  )}
                </div>
              </section>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
