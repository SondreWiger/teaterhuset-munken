import { NextResponse } from "next/server";
import { checkAdmin } from "@/lib/admin";

export async function POST(request: Request) {
  const ctx = await checkAdmin();
  if (!ctx)
    return NextResponse.json({ error: "Ikke tilgang" }, { status: 403 });

  const body = await request.json();
  if (!body.name || !body.show_id)
    return NextResponse.json(
      { error: "Navn og forestilling er påkrevd" },
      { status: 400 }
    );

  const { data, error } = await ctx.adminDb
    .from("teams")
    .insert({
      show_id: body.show_id,
      name: body.name,
      color: body.color || "#a855f7",
      description: body.description || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Create team error:", error);
    return NextResponse.json(
      { error: "Kunne ikke opprette lag" },
      { status: 500 }
    );
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

  const { error } = await ctx.adminDb.from("teams").delete().eq("id", id);

  if (error) {
    console.error("Delete team error:", error);
    return NextResponse.json(
      { error: "Kunne ikke slette lag" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
