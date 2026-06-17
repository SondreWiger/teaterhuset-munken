import { NextResponse } from "next/server";
import { checkAdmin } from "@/lib/admin";

export async function POST(request: Request) {
  const ctx = await checkAdmin();
  if (!ctx)
    return NextResponse.json({ error: "Ikke tilgang" }, { status: 403 });

  const body = await request.json();
  if (!body.team_id || !body.role_id)
    return NextResponse.json(
      { error: "team_id og role_id er påkrevd" },
      { status: 400 }
    );

  const { data, error } = await ctx.adminDb
    .from("team_roles")
    .insert({
      team_id: body.team_id,
      role_id: body.role_id,
      actor_name: body.actor_name || null,
      sort_order: body.sort_order ?? 0,
    })
    .select()
    .single();

  if (error) {
    console.error("Create team_role error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const ctx = await checkAdmin();
  if (!ctx)
    return NextResponse.json({ error: "Ikke tilgang" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id)
    return NextResponse.json({ error: "Manglende ID" }, { status: 400 });

  const { error } = await ctx.adminDb.from("team_roles").delete().eq("id", id);

  if (error) {
    console.error("Delete team_role error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
