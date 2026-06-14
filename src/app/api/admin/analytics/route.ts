import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminDb = createAdminClient();
  const { data: profiles } = await adminDb.from("profiles").select("role").eq("id", user.id);
  if (!profiles?.[0] || profiles[0].role !== "admin") {
    return NextResponse.json({ error: "Ikke tilgang" }, { status: 403 });
  }

  const [
    { count: totalUsers },
    { count: totalPurchases },
    { count: totalShows },
    { count: totalVideos },
    { data: recentPurchases },
    { data: watchStats },
    { data: subscriptionStats },
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
      .select("video_id, completed, videos(title)")
      .order("last_watched_at", { ascending: false })
      .limit(100),
    adminDb
      .from("subscriptions")
      .select("id, active, type, price, end_date")
      .eq("active", true),
  ]);

  const totalRevenue = recentPurchases?.reduce((sum: number, p: any) => sum + (p.price_paid || 0), 0) || 0;

  const videosWatched = watchStats?.length || 0;
  const videosCompleted = watchStats?.filter((w: any) => w.completed).length || 0;

  const activeSubscriptions = subscriptionStats?.length || 0;

  return NextResponse.json({
    totalUsers: totalUsers || 0,
    totalPurchases: totalPurchases || 0,
    totalShows: totalShows || 0,
    totalVideos: totalVideos || 0,
    totalRevenue,
    recentPurchases: recentPurchases || [],
    videosWatched,
    videosCompleted,
    activeSubscriptions,
  });
}
