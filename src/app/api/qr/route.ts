import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
    }

    const adminDb = createAdminClient();
    const { data: profiles } = await adminDb
      .from("profiles")
      .select("role")
      .eq("id", user.id);

    const profile = profiles?.[0];
    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Ikke tilgang" }, { status: 403 });
    }

    const { videoId, discountPercentage, isFree, maxUses, expiresAt } =
      await request.json();

    if (!videoId) {
      return NextResponse.json(
        { error: "Manglende video ID" },
        { status: 400 }
      );
    }

    const code = `QR-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    const { data: qrCode, error } = await adminDb
      .from("qr_codes")
      .insert({
        video_id: videoId,
        code,
        discount_percentage: discountPercentage,
        is_free: isFree,
        max_uses: maxUses ?? null,
        expires_at: expiresAt ?? null,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("QR creation error:", error);
      return NextResponse.json(
        { error: "Kunne ikke opprette QR-kode" },
        { status: 500 }
      );
    }

    return NextResponse.json(qrCode);
  } catch (error) {
    console.error("QR API error:", error);
    return NextResponse.json(
      { error: "Noe gikk galt" },
      { status: 500 }
    );
  }
}
