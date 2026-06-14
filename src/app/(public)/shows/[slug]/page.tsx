import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { BuyButton } from "./buy-button";
import { VideoCard } from "@/components/video-card";
import { ShareButton } from "@/components/share-button";
import { CommentsSection } from "@/components/comments-section";
import { GallerySection } from "@/components/gallery-section";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const adminDb = createAdminClient();

  const now = new Date().toISOString();
  const { data: show } = await adminDb
    .from("shows")
    .select("title, description, image_url")
    .eq("id", slug)
    .eq("published", true)
    .or(`publish_at.is.null,publish_at.lte.${now}`)
    .single();

  if (!show) return { title: "Forestilling ikke funnet" };

  return {
    title: `${show.title} — Teaterhuset Munken`,
    description: show.description || `Se ${show.title} på Teaterhuset Munken.`,
    openGraph: {
      title: show.title,
      description: show.description || undefined,
      images: show.image_url ? [show.image_url] : [],
      type: "website",
    },
  };
}

export default async function ShowPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const supabase = await createClient();
  const adminDb = createAdminClient();

  const now = new Date().toISOString();
  const { data: show } = await adminDb
    .from("shows")
    .select("*, teams(*, videos(*), team_roles(*, roles(*)))")
    .eq("id", slug)
    .eq("published", true)
    .or(`publish_at.is.null,publish_at.lte.${now}`)
    .single();

  if (!show) notFound();

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

  const totalVideos = show.teams?.reduce(
    (acc: number, t: any) =>
      acc + (t.videos?.filter((v: any) => v.published)?.length ?? 0),
    0
  );

  const allRoles = show.teams?.flatMap((t: any) =>
    (t.team_roles ?? [])
      .filter((tr: any) => tr.roles)
      .map((tr: any) => ({
        ...tr,
        team_color: t.color,
        team_name: t.name,
      }))
  );

  const { data: showImages } = await adminDb
    .from("show_images")
    .select("*")
    .eq("show_id", slug)
    .order("sort_order");

  return (
    <div className="relative">
      {/* Cinematic hero header */}
      <div className="relative overflow-hidden min-h-[42vh] flex items-end">
        {show.image_url ? (
          <div className="absolute inset-0">
            <img
              src={show.image_url}
              alt=""
              className="w-full h-full object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/50 to-transparent" />
          </div>
        ) : (
          <>
            <div className="absolute inset-0 hero-mesh" />
            <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-gold/[0.04] rounded-full blur-[150px]" />
          </>
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 w-full">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted hover:text-foreground transition-colors mb-8 group"
          >
            <svg
              className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Tilbake
          </Link>

          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                {show.title}
              </h1>
              {show.year && (
                <span className="inline-flex items-center rounded-full bg-gold/[0.1] border border-gold/15 px-4 py-1.5 text-sm font-semibold text-gold-light">
                  {show.year}
                </span>
              )}
            </div>
            {show.description && (
              <p className="mt-3 text-lg text-muted max-w-2xl leading-relaxed">
                {show.description}
              </p>
            )}
            <div className="mt-6 flex items-center gap-5 text-sm text-muted">
              <span className="flex items-center gap-2">
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
              {allRoles && allRoles.length > 0 && (
                <>
                  <span className="text-border">·</span>
                  <span>
                    {allRoles.length} rolle{allRoles.length !== 1 ? "r" : ""}
                  </span>
                </>
              )}
              <span className="text-border">·</span>
              <ShareButton title={show.title} />
            </div>
          </div>
        </div>
      </div>

      {/* Teams & Videos — side by side */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-14">
          {show.teams?.map((team: any) => (
            <section key={team.id} className="relative min-w-0">
              <div
                className="absolute -top-20 left-0 w-72 h-72 rounded-full blur-[130px] opacity-[0.06]"
                style={{ background: team.color }}
              />
              <div className="relative">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: team.color,
                      boxShadow: `0 0 18px ${team.color}50`,
                    }}
                  />
                  <h2
                    className="text-xl sm:text-2xl font-bold tracking-tight truncate"
                    style={{ color: team.color }}
                  >
                    {team.name}
                  </h2>
                </div>
                {team.description && (
                  <p className="text-muted ml-6 mb-6 leading-relaxed text-sm line-clamp-2">
                    {team.description}
                  </p>
                )}

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 ml-6">
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
                        >
                          {!hasAccess && (
                            <BuyButton video={video} user={user} />
                          )}
                        </VideoCard>
                      );
                    })}
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Cast & Roles — name list */}
      {allRoles && allRoles.length > 0 && (
        <section className="relative border-t border-white/[0.04]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-6 rounded-full bg-gradient-to-b from-gold to-gold-light" />
              <h2 className="text-xl font-bold">Medvirkende</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3">
              {allRoles.map((tr: any) => (
                <Link
                  key={tr.id}
                  href={`/roles/${tr.roles.id}`}
                  className="flex items-center gap-3 py-2.5 px-3 -mx-3 rounded-xl group hover:bg-white/[0.03] transition-colors"
                >
                  {tr.roles.image_url ? (
                    <img
                      src={tr.roles.image_url}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border border-white/[0.06] shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/15 to-gold/5 flex items-center justify-center border border-white/[0.04] shrink-0">
                      <span className="text-sm font-bold text-gradient-gold">
                        {tr.roles.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium text-foreground/80 group-hover:text-gold transition-colors">
                      {tr.roles.name}
                    </span>
                    {tr.actor_name && (
                      <span className="text-sm text-muted ml-2">
                        {tr.actor_name}
                      </span>
                    )}
                  </div>
                  <div
                    className="w-2 h-2 rounded-full shrink-0 opacity-60"
                    style={{
                      backgroundColor: tr.team_color,
                      boxShadow: `0 0 6px ${tr.team_color}40`,
                    }}
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {showImages && showImages.length > 0 && (
        <section className="relative border-t border-white/[0.04]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-6 rounded-full bg-gradient-to-b from-gold to-gold-light" />
              <h2 className="text-xl font-bold">Bilder</h2>
            </div>
            <GallerySection images={showImages} />
          </div>
        </section>
      )}

      {/* Comments */}
      <section className="relative border-t border-white/[0.04]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-gold to-gold-light" />
            <h2 className="text-xl font-bold">Diskusjon</h2>
          </div>
          <CommentsSection showId={show.id} />
        </div>
      </section>
    </div>
  );
}
