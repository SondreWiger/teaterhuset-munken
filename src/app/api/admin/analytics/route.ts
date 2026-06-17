import { NextResponse } from "next/server";
import { checkAdmin } from "@/lib/admin";

export async function GET() {
  const ctx = await checkAdmin();
  if (!ctx) return NextResponse.json({ error: "Ikke tilgang" }, { status: 403 });

  const [
    { count: totalUsers },
    { count: totalPurchases },
    { count: totalShows },
    { count: totalVideos },
    { data: recentPurchases },
    { data: watchStats },
    { data: subscriptionStats },
  ] = await Promise.all([
    ctx.adminDb.from("profiles").select("*", { count: "exact", head: true }),
    ctx.adminDb.from("purchases").select("*", { count: "exact", head: true }),
    ctx.adminDb.from("shows").select("*", { count: "exact", head: true }),
    ctx.adminDb.from("videos").select("*", { count: "exact", head: true }),
    ctx.adminDb
      .from("purchases")
      .select("id, price_paid, created_at, videos(title, teams(shows(title)))")
      .order("created_at", { ascending: false })
      .limit(10),
    ctx.adminDb
      .from("watch_history")
      .select("video_id, completed, videos(title)")
      .order("last_watched_at", { ascending: false })
      .limit(100),
    ctx.adminDb
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
