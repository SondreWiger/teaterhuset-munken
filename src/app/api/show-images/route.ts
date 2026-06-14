import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const showId = url.searchParams.get("show_id");

  const adminDb = createAdminClient();
  let query = adminDb.from("show_images").select("*").order("sort_order");

  if (showId) query = query.eq("show_id", showId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminDb = createAdminClient();
  const { data: profiles } = await adminDb.from("profiles").select("role").eq("id", user.id);
  if (!profiles?.[0] || profiles[0].role !== "admin") {
    return NextResponse.json({ error: "Ikke tilgang" }, { status: 403 });
  }

  const { show_id, image_url, caption, sort_order } = await request.json();
  if (!show_id || !image_url) return NextResponse.json({ error: "show_id and image_url required" }, { status: 400 });

  const { data, error } = await adminDb
    .from("show_images")
    .insert({ show_id, image_url, caption: caption || null, sort_order: sort_order || 0 })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminDb = createAdminClient();
  const { data: profiles } = await adminDb.from("profiles").select("role").eq("id", user.id);
  if (!profiles?.[0] || profiles[0].role !== "admin") {
    return NextResponse.json({ error: "Ikke tilgang" }, { status: 403 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await adminDb.from("show_images").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
