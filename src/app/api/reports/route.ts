import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { comment_id, reason } = await request.json();
  if (!comment_id || !reason?.trim()) return NextResponse.json({ error: "comment_id and reason required" }, { status: 400 });

  const adminDb = createAdminClient();
  const { data, error } = await adminDb
    .from("comment_reports")
    .insert({ comment_id, user_id: user.id, reason: reason.trim() })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Du har allerede rapportert denne kommentaren" }, { status: 400 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminDb = createAdminClient();
  const { data: profiles } = await adminDb.from("profiles").select("role").eq("id", user.id);
  if (!profiles?.[0] || profiles[0].role !== "admin") {
    return NextResponse.json({ error: "Ikke tilgang" }, { status: 403 });
  }

  const { data, error } = await adminDb
    .from("comment_reports")
    .select("*, comments(*, profiles:user_id(display_name), show_id)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminDb = createAdminClient();
  const { data: profiles } = await adminDb.from("profiles").select("role").eq("id", user.id);
  if (!profiles?.[0] || profiles[0].role !== "admin") {
    return NextResponse.json({ error: "Ikke tilgang" }, { status: 403 });
  }

  const { id, status, delete_comment } = await request.json();
  if (!id || !status) return NextResponse.json({ error: "id and status required" }, { status: 400 });

  const { error } = await adminDb
    .from("comment_reports")
    .update({ status })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // If admin wants to delete the reported comment
  if (delete_comment) {
    const { data: report } = await adminDb
      .from("comment_reports")
      .select("comment_id")
      .eq("id", id)
      .single();

    if (report) {
      await adminDb.from("comments").delete().eq("id", report.comment_id);
    }
  }

  return NextResponse.json({ success: true });
}
