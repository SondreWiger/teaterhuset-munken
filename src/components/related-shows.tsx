import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

export async function RelatedShows({ showId, tags }: { showId: string; tags: string[] }) {
  if (!tags.length) return null;

  const adminDb = createAdminClient();

  // Find shows with matching tags (excluding current)
  const { data: tagMatches } = await adminDb
    .from("show_tags")
    .select("show_id")
    .in("tag", tags)
    .neq("show_id", showId);

  const relatedIds = [...new Set(tagMatches?.map((t: any) => t.show_id) || [])].slice(0, 4);
  if (!relatedIds.length) return null;

  const { data: relatedShows } = await adminDb
    .from("shows")
    .select("id, title, image_url, year, teams(videos(count))")
    .in("id", relatedIds)
    .eq("published", true);

  if (!relatedShows?.length) return null;

  return (
    <section className="relative border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-6 rounded-full bg-gradient-to-b from-gold to-gold-light" />
          <h2 className="text-xl font-bold">Relaterte forestillinger</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {relatedShows.map((show: any) => (
            <Link
              key={show.id}
              href={`/shows/${show.id}`}
              className="group glass-card rounded-xl overflow-hidden"
            >
              <div className="aspect-[16/10] relative overflow-hidden">
                {show.image_url ? (
                  <img
                    src={show.image_url}
                    alt={show.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gold/10 to-transparent flex items-center justify-center">
                    <span className="text-3xl opacity-30">🎭</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="text-sm font-semibold text-white group-hover:text-gold transition-colors line-clamp-1">
                    {show.title}
                  </h3>
                  {show.year && (
                    <span className="text-xs text-white/50">{show.year}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
