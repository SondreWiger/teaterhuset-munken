import { NextResponse } from "next/server";
import { checkAdmin } from "@/lib/admin";

export async function POST(request: Request) {
  const ctx = await checkAdmin();
  if (!ctx)
    return NextResponse.json({ error: "Ikke tilgang" }, { status: 403 });

  const body = await request.json();
  if (!body.title)
    return NextResponse.json({ error: "Tittel er påkrevd" }, { status: 400 });

  const { data, error } = await ctx.adminDb
    .from("shows")
    .insert({
      title: body.title,
      description: body.description || null,
      image_url: body.image_url || null,
      year: body.year || new Date().getFullYear(),
      published: body.published ?? false,
      publish_at: body.publish_at || null,
      bundle_price: body.bundle_price || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Create show error:", error);
    return NextResponse.json(
      { error: "Kunne ikke opprette forestilling" },
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
    .from("shows")
    .update({
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.image_url !== undefined && { image_url: body.image_url }),
      ...(body.year !== undefined && { year: body.year }),
      ...(body.published !== undefined && { published: body.published }),
      ...(body.publish_at !== undefined && { publish_at: body.publish_at }),
      ...(body.bundle_price !== undefined && { bundle_price: body.bundle_price }),
    })
    .eq("id", body.id);

  if (error) {
    console.error("Update show error:", error);
    return NextResponse.json(
      { error: "Kunne ikke oppdatere forestilling" },
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

  const { error } = await ctx.adminDb.from("shows").delete().eq("id", id);

  if (error) {
    console.error("Delete show error:", error);
    return NextResponse.json(
      { error: "Kunne ikke slette forestilling" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
