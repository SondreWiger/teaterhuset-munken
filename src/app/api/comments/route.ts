import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const showId = url.searchParams.get("show_id");
  if (!showId) return NextResponse.json({ error: "show_id required" }, { status: 400 });

  const adminDb = createAdminClient();
  const { data, error } = await adminDb
    .from("comments")
    .select("*, profiles:user_id(display_name, avatar_url)")
    .eq("show_id", showId)
    .is("parent_id", null)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Fetch replies for each comment
  const commentsWithReplies = await Promise.all(
    (data || []).map(async (comment: any) => {
      const { data: replies } = await adminDb
        .from("comments")
        .select("*, profiles:user_id(display_name, avatar_url)")
        .eq("parent_id", comment.id)
        .order("created_at", { ascending: true });
      return { ...comment, replies: replies || [] };
    })
  );

  return NextResponse.json(commentsWithReplies);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { show_id, parent_id, content } = await request.json();
  if (!show_id || !content?.trim()) return NextResponse.json({ error: "show_id and content required" }, { status: 400 });

  const adminDb = createAdminClient();
  const { data, error } = await adminDb
    .from("comments")
    .insert({
      user_id: user.id,
      show_id,
      parent_id: parent_id || null,
      content: content.trim(),
    })
    .select("*, profiles:user_id(display_name, avatar_url)")
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
    .from("comments")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
