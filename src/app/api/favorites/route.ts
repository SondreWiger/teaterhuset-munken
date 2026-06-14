import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminDb = createAdminClient();
  const { data, error } = await adminDb
    .from("favorites")
    .select("*, videos(*, teams(*, shows(*)))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { video_id } = await request.json();

  if (!video_id) {
    return NextResponse.json({ error: "video_id required" }, { status: 400 });
  }

  const adminDb = createAdminClient();

  // Check if already favorited
  const { data: existing } = await adminDb
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("video_id", video_id)
    .single();

  if (existing) {
    // Remove favorite
    const { error } = await adminDb
      .from("favorites")
      .delete()
      .eq("id", existing.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ favorited: false });
  }

  // Add favorite
  const { data, error } = await adminDb
    .from("favorites")
    .insert({ user_id: user.id, video_id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ favorited: true, data });
}
