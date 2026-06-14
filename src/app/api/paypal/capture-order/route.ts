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

    const { orderId, videoId } = await request.json();

    const auth = Buffer.from(
      `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString("base64");

    const response = await fetch(
      `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`,
        },
      }
    );

    const data = await response.json();
    if (!response.ok) {
      console.error("PayPal capture error:", data);
      return NextResponse.json(
        { error: "Kunne ikke fullføre betaling" },
        { status: 500 }
      );
    }

    if (data.status === "COMPLETED") {
      const adminDb = createAdminClient();
      const capturedAmount =
        data.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value ?? "0";

      const { data: video } = await adminDb
        .from("videos")
        .select("price")
        .eq("id", videoId)
        .single();

      const { error: purchaseError } = await adminDb
        .from("purchases")
        .insert({
          user_id: user.id,
          video_id: videoId,
          price_paid: video?.price ?? parseFloat(capturedAmount),
        });

      if (purchaseError) {
        console.error("Purchase insert error:", purchaseError);
        return NextResponse.json(
          { error: "Kunne ikke registrere kjøp" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Betaling ikke fullført" },
      { status: 400 }
    );
  } catch (error) {
    console.error("PayPal capture error:", error);
    return NextResponse.json({ error: "Noe gikk galt" }, { status: 500 });
  }
}
