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

    if (!process.env.VIPPS_CLIENT_ID || !process.env.VIPPS_CLIENT_SECRET || !process.env.VIPPS_MERCHANT_SERIAL) {
      return NextResponse.json({ error: "Vipps ikke konfigurert" }, { status: 501 });
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

    // Vipps OAuth2 — client_id in body, not headers
    const tokenRes = await fetch("https://api.vipps.no/access-management-1.0/access/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.VIPPS_CLIENT_ID,
        client_secret: process.env.VIPPS_CLIENT_SECRET,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error("Vipps token error:", tokenData);
      return NextResponse.json({ error: "Kunne ikke autentisere med Vipps" }, { status: 500 });
    }

    const accessToken = tokenData.access_token;
    const orderId = `vipps_${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`;

    const paymentRes = await fetch("https://api.vipps.no/epayment/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": process.env.VIPPS_SUBSCRIPTION_KEY || "",
        "Merchant-Serial-Number": process.env.VIPPS_MERCHANT_SERIAL,
      },
      body: JSON.stringify({
        amount: {
          currency: "NOK",
          value: Math.round(amount * 100),
        },
        paymentMethod: { type: "WALLET" },
        reference: orderId,
        returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/vipps/callback?orderId=${orderId}&videoId=${videoId}`,
        paymentDescription: `Kjøp: ${video.title}`,
        shipping: { useDefault: false },
        customer: { phoneNumber: "" },
      }),
    });

    const paymentData = await paymentRes.json();
    if (!paymentRes.ok) {
      console.error("Vipps payment error:", paymentData);
      return NextResponse.json({ error: "Kunne ikke opprette Vipps-betaling" }, { status: 500 });
    }

    return NextResponse.json({ redirectUrl: paymentData.redirectUrl, orderId });
  } catch (error) {
    console.error("Vipps payment error:", error);
    return NextResponse.json({ error: "Noe gikk galt" }, { status: 500 });
  }
}
