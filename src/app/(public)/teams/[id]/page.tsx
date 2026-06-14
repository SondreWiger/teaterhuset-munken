import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { VideoCard } from "@/components/video-card";

export default async function TeamPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const adminDb = createAdminClient();

  const { data: team } = await adminDb
    .from("teams")
    .select("*, shows(*), videos(*), team_roles(*, roles(*))")
    .eq("id", id)
    .single();

  if (!team) notFound();

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

  const show = team.shows;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">
          Forsiden
        </Link>
        <span>·</span>
        <Link href={`/shows/${show.id}`} className="hover:text-foreground transition-colors">
          {show.title}
        </Link>
        <span>·</span>
        <span className="text-foreground">{team.name}</span>
      </div>

      {/* Team header */}
      <div className="relative mb-12">
        <div
          className="absolute -top-24 left-0 w-80 h-80 rounded-full blur-[140px] opacity-[0.07]"
          style={{ background: team.color }}
        />
        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-5 h-5 rounded-full"
              style={{
                backgroundColor: team.color,
                boxShadow: `0 0 24px ${team.color}50`,
              }}
            />
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight"
              style={{ color: team.color }}
            >
              {team.name}
            </h1>
          </div>
          {team.description && (
            <p className="text-muted ml-9 text-lg max-w-2xl leading-relaxed">
              {team.description}
            </p>
          )}
        </div>
      </div>

      {/* Roles in this team */}
      {team.team_roles && team.team_roles.length > 0 && (
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-gold to-gold-light" />
            <h2 className="text-xl font-bold">Roller</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {team.team_roles
              .filter((tr: any) => tr.roles)
              .map((tr: any) => (
                <Link
                  key={tr.id}
                  href={`/roles/${tr.roles.id}`}
                  className="flex items-center gap-3 p-4 rounded-xl glass-card group"
                >
                  {tr.roles.image_url ? (
                    <img
                      src={tr.roles.image_url}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover border border-white/[0.06]"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold/15 to-gold/5 flex items-center justify-center border border-white/[0.04]">
                      <span className="text-lg font-bold text-gradient-gold">
                        {tr.roles.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium group-hover:text-gold transition-colors">
                      {tr.roles.name}
                    </p>
                    {tr.actor_name && (
                      <p className="text-xs text-muted">{tr.actor_name}</p>
                    )}
                  </div>
                </Link>
              ))}
          </div>
        </section>
      )}

      {/* Videos */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-6 rounded-full bg-gradient-to-b from-gold to-gold-light" />
          <h2 className="text-xl font-bold">
            Videoer
            <span className="text-sm text-muted ml-2">
              · {team.videos?.filter((v: any) => v.published).length ?? 0}
            </span>
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {team.videos
            ?.filter((v: any) => v.published)
            .sort((a: any, b: any) => a.sort_order - b.sort_order)
            .map((video: any) => {
              const hasAccess = purchasedVideoIds.has(video.id);
              return (
                <VideoCard
                  key={video.id}
                  video={video}
                  hasAccess={hasAccess}
                  teamColor={team.color}
                />
              );
            })}
        </div>
      </section>
    </div>
  );
}
