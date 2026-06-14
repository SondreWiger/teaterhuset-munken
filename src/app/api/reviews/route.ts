import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const videoId = url.searchParams.get("video_id");

  const adminDb = createAdminClient();
  let query = adminDb
    .from("reviews")
    .select("*, profiles:user_id(display_name, avatar_url)")
    .order("created_at", { ascending: false });

  if (videoId) query = query.eq("video_id", videoId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { video_id, rating, comment } = await request.json();
  if (!video_id || !rating) return NextResponse.json({ error: "video_id and rating required" }, { status: 400 });
  if (rating < 1 || rating > 5) return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });

  const adminDb = createAdminClient();
  const { data, error } = await adminDb
    .from("reviews")
    .upsert({
      user_id: user.id,
      video_id,
      rating,
      comment: comment || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,video_id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const adminDb = createAdminClient();
  const { error } = await adminDb
    .from("reviews")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
