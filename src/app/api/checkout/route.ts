import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
    }

    const { videoId } = await request.json();
    if (!videoId) {
      return NextResponse.json(
        { error: "Manglende video ID" },
        { status: 400 }
      );
    }

    const { data: video } = await supabase
      .from("videos")
      .select("*")
      .eq("id", videoId)
      .single();

    if (!video) {
      return NextResponse.json(
        { error: "Video ikke funnet" },
        { status: 404 }
      );
    }

    const { data: existingPurchase } = await supabase
      .from("purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("video_id", videoId)
      .maybeSingle();

    if (existingPurchase) {
      return NextResponse.json(
        { error: "Du har allerede tilgang til denne videoen" },
        { status: 409 }
      );
    }

    return NextResponse.json({
      video,
      amount: video.price,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Noe gikk galt" },
      { status: 500 }
    );
  }
}
