import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function checkAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const adminDb = createAdminClient();
  const { data: profiles } = await adminDb
    .from("profiles")
    .select("role")
    .eq("id", user.id);
  const profile = profiles?.[0];
  if (!profile || profile.role !== "admin") return null;

  return { user, adminDb };
}

export async function POST(request: Request) {
  const ctx = await checkAdmin();
  if (!ctx)
    return NextResponse.json({ error: "Ikke tilgang" }, { status: 403 });

  const body = await request.json();
  if (!body.title || !body.team_id)
    return NextResponse.json(
      { error: "Tittel og lag er påkrevd" },
      { status: 400 }
    );

  const { data, error } = await ctx.adminDb
    .from("videos")
    .insert({
      team_id: body.team_id,
      title: body.title,
      description: body.description || null,
      youtube_url: body.youtube_url || null,
      vimeo_url: body.vimeo_url || null,
      price: body.price ?? 0,
      sort_order: body.sort_order ?? 0,
      published: body.published ?? false,
    })
    .select()
    .single();

  if (error) {
    console.error("Create video error:", error);
    return NextResponse.json(
      { error: "Kunne ikke opprette video" },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const ctx = await checkAdmin();
  if (!ctx)
    return NextResponse.json({ error: "Ikke tilgang" }, { status: 403 });

  const body = await request.json();
  if (!body.id)
    return NextResponse.json({ error: "Manglende ID" }, { status: 400 });

  const { error } = await ctx.adminDb
    .from("videos")
    .update({
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.youtube_url !== undefined && { youtube_url: body.youtube_url }),
      ...(body.vimeo_url !== undefined && { vimeo_url: body.vimeo_url }),
      ...(body.price !== undefined && { price: body.price }),
      ...(body.sort_order !== undefined && { sort_order: body.sort_order }),
      ...(body.published !== undefined && { published: body.published }),
    })
    .eq("id", body.id);

  if (error) {
    console.error("Update video error:", error);
    return NextResponse.json(
      { error: "Kunne ikke oppdatere video" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const ctx = await checkAdmin();
  if (!ctx)
    return NextResponse.json({ error: "Ikke tilgang" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id)
    return NextResponse.json({ error: "Manglende ID" }, { status: 400 });

  const { error } = await ctx.adminDb.from("videos").delete().eq("id", id);

  if (error) {
    console.error("Delete video error:", error);
    return NextResponse.json(
      { error: "Kunne ikke slette video" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
