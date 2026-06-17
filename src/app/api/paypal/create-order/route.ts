import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });

    const { videoId } = await request.json();
    if (!videoId) return NextResponse.json({ error: "videoId required" }, { status: 400 });

    if (!process.env.PAYPAL_CLIENT_SECRET || process.env.PAYPAL_CLIENT_SECRET === "your-paypal-secret") {
      return NextResponse.json({ error: "PayPal ikke konfigurert" }, { status: 501 });
    }

    // Look up actual price from DB — never trust client
    const adminDb = createAdminClient();
    const { data: video } = await adminDb
      .from("videos")
      .select("price, title")
      .eq("id", videoId)
      .single();

    if (!video) return NextResponse.json({ error: "Video ikke funnet" }, { status: 404 });

    const amount = video.price;

    const auth = Buffer.from(
      `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString("base64");

    const response = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "NOK",
              value: amount.toString(),
            },
            custom_id: videoId,
            description: `Kjøp: ${video.title}`,
          },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("PayPal create order error:", data);
      return NextResponse.json({ error: "Kunne ikke opprette PayPal-betaling" }, { status: 500 });
    }

    return NextResponse.json({ id: data.id });
  } catch (error) {
    console.error("PayPal create order error:", error);
    return NextResponse.json({ error: "Noe gikk galt" }, { status: 500 });
  }
}
