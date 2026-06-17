import { NextResponse } from "next/server";
import { checkAdmin } from "@/lib/admin";

export async function PUT(request: Request) {
  try {
    const ctx = await checkAdmin();
    if (!ctx) return NextResponse.json({ error: "Ikke tilgang" }, { status: 403 });

    const body = await request.json();
    const allowedKeys = [
      "site_name",
      "hero_title",
      "hero_subtitle",
      "hero_image",
      "primary_color",
      "accent_color",
    ];

    const updates: Record<string, string> = {};
    for (const key of allowedKeys) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Ingen data å oppdatere" }, { status: 400 });
    }

    const { error } = await ctx.adminDb.from("settings").upsert(
      Object.entries(updates).map(([key, value]) => ({ key, value })),
      { onConflict: "key" }
    );

    if (error) {
      console.error("Settings update error:", error);
      return NextResponse.json({ error: "Kunne ikke oppdatere innstillinger" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Settings error:", error);
    return NextResponse.json({ error: "Noe gikk galt" }, { status: 500 });
  }
}
