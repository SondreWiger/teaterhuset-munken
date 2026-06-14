import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const adminDb = createAdminClient();
  const { data: profiles } = await adminDb.from("profiles").select("role").eq("id", user.id);
  if (!profiles?.[0] || profiles[0].role !== "admin") redirect("/dashboard");

  const [
    { count: totalUsers },
    { count: totalPurchases },
    { count: totalShows },
    { count: totalVideos },
    { data: recentPurchases },
    { data: watchStats },
    { count: activeSubs },
    { count: totalReviews },
  ] = await Promise.all([
    adminDb.from("profiles").select("*", { count: "exact", head: true }),
    adminDb.from("purchases").select("*", { count: "exact", head: true }),
    adminDb.from("shows").select("*", { count: "exact", head: true }),
    adminDb.from("videos").select("*", { count: "exact", head: true }),
    adminDb
      .from("purchases")
      .select("id, price_paid, created_at, videos(title, teams(shows(title)))")
      .order("created_at", { ascending: false })
      .limit(10),
    adminDb
      .from("watch_history")
      .select("video_id, completed"),
    adminDb
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("active", true),
    adminDb
      .from("reviews")
      .select("*", { count: "exact", head: true }),
  ]);

  const totalRevenue = recentPurchases?.reduce((sum: number, p: any) => sum + (p.price_paid || 0), 0) || 0;
  const videosWatched = watchStats?.length || 0;
  const videosCompleted = watchStats?.filter((w: any) => w.completed).length || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold">
          <span className="text-gradient-gold">Analyse</span> og statistikk
        </h1>
        <p className="mt-2 text-muted">Oversikt over plattformaktivitet</p>
      </div>

      {/* Main stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10 stagger">
        {[
          { label: "Brukere", value: totalUsers ?? 0, color: "gold", icon: "👤" },
          { label: "Kjøp", value: totalPurchases ?? 0, color: "success", icon: "🛒" },
          { label: "Forestillinger", value: totalShows ?? 0, color: "crimson", icon: "🎭" },
          { label: "Videoer", value: totalVideos ?? 0, color: "primary", icon: "🎬" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{stat.icon}</span>
              <span className="text-sm text-muted">{stat.label}</span>
            </div>
            <p className="text-3xl font-bold text-gradient-gold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Secondary stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10 stagger">
        <div className="glass-card rounded-2xl p-5">
          <p className="text-sm text-muted mb-1">Videoer sett</p>
          <p className="text-2xl font-bold text-gradient-gold">{videosWatched}</p>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <p className="text-sm text-muted mb-1">Videoer fullført</p>
          <p className="text-2xl font-bold text-gradient-gold">{videosCompleted}</p>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <p className="text-sm text-muted mb-1">Aktive abonnementer</p>
          <p className="text-2xl font-bold text-gradient-gold">{activeSubs ?? 0}</p>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <p className="text-sm text-muted mb-1">Anmeldelser</p>
          <p className="text-2xl font-bold text-gradient-gold">{totalReviews ?? 0}</p>
        </div>
      </div>

      {/* Revenue */}
      <div className="glass-card rounded-2xl p-6 mb-10">
        <h2 className="text-lg font-semibold mb-4">Estimert inntekt (siste 10 kjøp)</h2>
        <p className="text-4xl font-bold text-gradient-gold">{totalRevenue} kr</p>
      </div>

      {/* Recent purchases */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">Siste kjøp</h2>
        {(!recentPurchases || recentPurchases.length === 0) ? (
          <p className="text-sm text-muted">Ingen kjøp ennå.</p>
        ) : (
          <div className="space-y-3">
            {recentPurchases.map((purchase: any) => (
              <div
                key={purchase.id}
                className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {purchase.videos?.title || "Ukjent video"}
                  </p>
                  <p className="text-xs text-muted">
                    {purchase.videos?.teams?.shows?.title || ""}
                    {new Date(purchase.created_at).toLocaleDateString("nb-NO")}
                  </p>
                </div>
                <span className="text-sm font-semibold text-gradient-gold">
                  {purchase.price_paid} kr
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
