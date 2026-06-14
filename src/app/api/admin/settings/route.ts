import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
    }

    const adminDb = createAdminClient();
    const { data: profileList } = await adminDb
      .from("profiles")
      .select("role")
      .eq("id", user.id);

    const profile = profileList?.[0];
    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Ikke tilgang" }, { status: 403 });
    }

    const body = await request.json();
    const allowedKeys = [
      "site_name",
      "hero_title",
      "hero_subtitle",
      "hero_image_url",
    ];

    for (const key of allowedKeys) {
      if (body[key] !== undefined) {
        const { error } = await adminDb.from("settings").upsert(
          { key, value: String(body[key]) },
          { onConflict: "key" }
        );
        if (error) {
          console.error(`Error saving setting ${key}:`, error);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Settings API error:", error);
    return NextResponse.json({ error: "Noe gikk galt" }, { status: 500 });
  }
}
