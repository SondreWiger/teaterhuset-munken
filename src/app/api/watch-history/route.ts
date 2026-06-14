import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminDb = createAdminClient();
  const { data, error } = await adminDb
    .from("watch_history")
    .select("*, videos(*, teams(*, shows(*)))")
    .eq("user_id", user.id)
    .order("last_watched_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { video_id, progress_seconds, duration_seconds } = await request.json();
  if (!video_id) return NextResponse.json({ error: "video_id required" }, { status: 400 });

  const completed = duration_seconds > 0 && progress_seconds >= duration_seconds * 0.9;

  const adminDb = createAdminClient();
  const { data, error } = await adminDb
    .from("watch_history")
    .upsert({
      user_id: user.id,
      video_id,
      progress_seconds,
      duration_seconds,
      completed,
      last_watched_at: new Date().toISOString(),
    }, { onConflict: "user_id,video_id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
