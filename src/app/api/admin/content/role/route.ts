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

export async function GET() {
  const adminDb = createAdminClient();
  const { data, error } = await adminDb
    .from("roles")
    .select("*")
    .order("name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const ctx = await checkAdmin();
  if (!ctx)
    return NextResponse.json({ error: "Ikke tilgang" }, { status: 403 });

  const body = await request.json();
  if (!body.name)
    return NextResponse.json({ error: "Navn er påkrevd" }, { status: 400 });

  const { data, error } = await ctx.adminDb
    .from("roles")
    .insert({
      name: body.name,
      description: body.description || null,
      image_url: body.image_url || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Create role error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
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
    .from("roles")
    .update({
      ...(body.name !== undefined && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.image_url !== undefined && { image_url: body.image_url }),
    })
    .eq("id", body.id);

  if (error) {
    console.error("Update role error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
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

  const { error } = await ctx.adminDb.from("roles").delete().eq("id", id);

  if (error) {
    console.error("Delete role error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
