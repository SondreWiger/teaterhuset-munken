import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function RolePage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const adminDb = createAdminClient();

  const { data: role } = await adminDb
    .from("roles")
    .select("*")
    .eq("id", id)
    .single();

  if (!role) notFound();

  // Fetch all team_roles for this role, with team -> show -> videos
  const { data: teamRoles } = await adminDb
    .from("team_roles")
    .select("*, teams(*, shows(*, teams(id)))")
    .eq("role_id", id);

  // Fetch all video_actor_overrides for this role
  const { data: overrides } = await adminDb
    .from("video_actor_overrides")
    .select("*")
    .eq("role_id", id);

  const overrideMap: Record<string, string> = {};
  overrides?.forEach((o: any) => {
    overrideMap[o.video_id] = o.character_name;
  });

  // Group by show -> team -> videos
  const appearancesByShow: Record<
    string,
    {
      show: any;
      teams: Map<
        string,
        {
          team: any;
          character_name: string | null;
          videos: any[];
        }
      >;
    }
  > = {};

  teamRoles?.forEach((tr: any) => {
    const team = tr.teams;
    const show = team?.shows;
    if (!show || !team) return;

    if (!appearancesByShow[show.id]) {
      appearancesByShow[show.id] = { show, teams: new Map() };
    }

    const showData = appearancesByShow[show.id];
    if (!showData.teams.has(team.id)) {
      showData.teams.set(team.id, {
        team,
        character_name: tr.character_name,
        videos: [],
      });
    }
  });

  // Now fetch videos for each team in each show
  for (const showId of Object.keys(appearancesByShow)) {
    const showData = appearancesByShow[showId];
    const teamIds = Array.from(showData.teams.keys());

    if (teamIds.length === 0) continue;

    const { data: videos } = await adminDb
      .from("videos")
      .select("id, title, price, sort_order, published")
      .in("team_id", teamIds)
      .eq("published", true)
      .order("sort_order");

    videos?.forEach((v: any) => {
      const teamData = showData.teams.get(v.team_id);
      if (teamData) {
        teamData.videos.push({
          ...v,
          actor_override: overrideMap[v.id] || null,
        });
      }
    });
  }

  // Convert to sorted array
  const appearances = Object.values(appearancesByShow)
    .sort((a, b) => (b.show.year ?? 0) - (a.show.year ?? 0))
    .map(({ show, teams }) => ({
      show,
      teams: Array.from(teams.values()),
    }));

  const totalAppearances = appearances.length;
  const totalVideos = appearances.reduce(
    (acc, { teams }) =>
      acc + teams.reduce((a, t) => a + t.videos.length, 0),
    0
  );

  return (
    <div className="relative">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 hero-mesh" />
        {role.image_url && (
          <div className="absolute inset-0">
            <img
              src={role.image_url}
              alt=""
              className="w-full h-80 object-cover opacity-15"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/60" />
          </div>
        )}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gold/[0.04] rounded-full blur-[120px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          <Link
            href="/forestillinger"
            className="inline-flex items-center text-sm text-muted hover:text-foreground transition-colors mb-10 group"
          >
            <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Tilbake
          </Link>

          <div className="flex items-start gap-8">
            <div className="shrink-0">
              {role.image_url ? (
                <img
                  src={role.image_url}
                  alt={role.name}
                  className="w-28 h-28 rounded-2xl object-cover border-2 border-gold/20 shadow-lg shadow-gold/10"
                />
              ) : (
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center border border-gold/10">
                  <span className="text-4xl font-bold text-gradient-gold">
                    {role.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold">{role.name}</h1>
              {role.description && (
                <p className="mt-3 text-muted max-w-2xl leading-relaxed">
                  {role.description}
                </p>
              )}
              <div className="mt-4 flex items-center gap-6 text-sm text-muted">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gold/60" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 0v.375" />
                  </svg>
                  {totalAppearances} forestilling{totalAppearances !== 1 ? "er" : ""}
                </span>
                <span className="text-border">·</span>
                <span>{totalVideos} video{totalVideos !== 1 ? "er" : ""}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Appearances with videos */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {appearances.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6 animate-float">🎭</div>
            <p className="text-xl text-muted">Ingen opptredener ennå</p>
            <p className="mt-2 text-sm text-muted/60">
              Denne rollen er ikke knyttet til noen forestillinger.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            <h2 className="text-2xl font-bold">
              Opptredener for{" "}
              <span className="text-gradient-gold">{role.name}</span>
            </h2>

            <div className="space-y-14">
              {appearances.map(({ show, teams }) => (
                <section key={show.id}>
                  <Link
                    href={`/shows/${show.id}`}
                    className="group flex items-center gap-3 mb-6"
                  >
                    {show.image_url && (
                      <img
                        src={show.image_url}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover border border-white/[0.06]"
                      />
                    )}
                    <div>
                      <h3 className="text-xl font-bold group-hover:text-gold transition-colors">
                        {show.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-muted">
                        {show.year && <span>{show.year}</span>}
                        {show.description && (
                          <>
                            <span className="text-border">·</span>
                            <span className="line-clamp-1">{show.description}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>

                  <div className="space-y-6 ml-0 sm:ml-[3.5rem]">
                    {teams.map(({ team, character_name, videos }) => (
                      <div key={team.id}>
                        {/* Team header */}
                        <div className="flex items-center gap-2.5 mb-3">
                          <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{
                              backgroundColor: team.color,
                              boxShadow: `0 0 10px ${team.color}40`,
                            }}
                          />
                          <span
                            className="font-semibold text-sm"
                            style={{ color: team.color }}
                          >
                            {team.name}
                          </span>
                          {character_name && (
                            <span className="text-xs text-muted">
                              · Spiller {character_name}
                            </span>
                          )}
                        </div>

                        {/* Videos for this team */}
                        {videos.length > 0 ? (
                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {videos.map((video: any) => (
                              <Link
                                key={video.id}
                                href={`/shows/${show.id}`}
                                className="glass-card rounded-xl px-4 py-3 flex items-center gap-3 group/video hover:border-gold/15 transition-colors"
                              >
                                <div className="w-8 h-8 rounded-lg bg-gold/[0.08] flex items-center justify-center shrink-0 group-hover/video:bg-gold/[0.12] transition-colors">
                                  <svg className="w-4 h-4 text-gold/60" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                                  </svg>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium truncate group-hover/video:text-foreground transition-colors">
                                    {video.title}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs text-muted">
                                    {video.actor_override ? (
                                      <span className="text-gold">
                                        {video.actor_override} (vikar)
                                      </span>
                                      ) : character_name ? (
                                        <span>{character_name}</span>
                                    ) : null}
                                    {video.price > 0 && (
                                      <>
                                        <span className="text-border">·</span>
                                        <span>{video.price} kr</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted/60 ml-[1.625rem]">
                            Ingen videoer ennå
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
