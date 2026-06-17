import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const showId = url.searchParams.get("show_id");
  if (!showId) return NextResponse.json({ error: "show_id required" }, { status: 400 });

  const adminDb = createAdminClient();

  // Fetch all comments for this show in one query (top-level + replies)
  const { data: allComments, error } = await adminDb
    .from("comments")
    .select("*, profiles:user_id(display_name, avatar_url)")
    .eq("show_id", showId)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Group: top-level comments with nested replies
  const topLevel = (allComments || []).filter((c: any) => !c.parent_id);
  const replies = (allComments || []).filter((c: any) => c.parent_id);
  const repliesByParent = new Map<string, any[]>();
  replies.forEach((r: any) => {
    const list = repliesByParent.get(r.parent_id) || [];
    list.push(r);
    repliesByParent.set(r.parent_id, list);
  });

  const commentsWithReplies = topLevel
    .map((c: any) => ({
      ...c,
      replies: repliesByParent.get(c.id) || [],
    }))
    .reverse(); // newest first

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

  // Verify ownership before delete
  const { data: comment } = await adminDb
    .from("comments")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!comment || comment.user_id !== user.id) {
    return NextResponse.json({ error: "Ikke tilgang" }, { status: 403 });
  }

  const { error } = await adminDb
    .from("comments")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
