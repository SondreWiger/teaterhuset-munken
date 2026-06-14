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

    let videoId: string;

    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await request.json();
      videoId = body.videoId;
    } else {
      const formData = await request.formData();
      videoId = formData.get("videoId") as string;
    }

    if (!videoId) {
      return NextResponse.json(
        { error: "Manglende video ID" },
        { status: 400 }
      );
    }

    const adminDb = createAdminClient();

    const { data: existingPurchase } = await adminDb
      .from("purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("video_id", videoId)
      .maybeSingle();

    if (!existingPurchase) {
      await adminDb.from("purchases").insert({
        user_id: user.id,
        video_id: videoId,
        price_paid: 0,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Dev bypass error:", error);
    return NextResponse.json({ error: "Bypass feilet" }, { status: 500 });
  }
}
