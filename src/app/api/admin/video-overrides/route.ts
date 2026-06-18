import { NextResponse } from "next/server";
import { checkAdmin } from "@/lib/admin";

export async function GET(request: Request) {
  const ctx = await checkAdmin();
  if (!ctx) return NextResponse.json({ error: "Ikke tilgang" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("video_id");
  const roleId = searchParams.get("role_id");

  let query = ctx.adminDb
    .from("video_actor_overrides")
    .select("*");

  if (videoId) query = query.eq("video_id", videoId);
  if (roleId) query = query.eq("role_id", roleId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const ctx = await checkAdmin();
  if (!ctx) return NextResponse.json({ error: "Ikke tilgang" }, { status: 403 });

  const { video_id, role_id, character_name } = await request.json();
  if (!video_id || !role_id) {
    return NextResponse.json({ error: "video_id and role_id required" }, { status: 400 });
  }

  // Upsert: if override exists, update it; otherwise insert
  const { data, error } = await ctx.adminDb
    .from("video_actor_overrides")
    .upsert(
      { video_id, role_id, character_name: character_name || "" },
      { onConflict: "video_id,role_id" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const ctx = await checkAdmin();
  if (!ctx) return NextResponse.json({ error: "Ikke tilgang" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("video_id");
  const roleId = searchParams.get("role_id");
  if (!videoId || !roleId) {
    return NextResponse.json({ error: "video_id and role_id required" }, { status: 400 });
  }

  const { error } = await ctx.adminDb
    .from("video_actor_overrides")
    .delete()
    .eq("video_id", videoId)
    .eq("role_id", roleId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
