import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    const videoId = searchParams.get("videoId");

    if (!orderId || !videoId) {
      return NextResponse.redirect(
        new URL("/?error=manglende-parametre", request.url)
      );
    }

    // Verify payment with Vipps API
    if (
      process.env.VIPPS_CLIENT_ID &&
      process.env.VIPPS_CLIENT_SECRET !== "your-vipps-secret"
    ) {
      const tokenRes = await fetch(
        "https://api.vipps.no/access-management-1.0/access/oauth2/token",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "client_credentials",
            client_secret: process.env.VIPPS_CLIENT_SECRET!,
          }),
        }
      );
      const tokenData = await tokenRes.json();

      if (tokenRes.ok) {
        const accessToken = tokenData.access_token;
        const statusRes = await fetch(
          `https://api.vipps.no/epayment/v1/payments/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Ocp-Apim-Subscription-Key":
                process.env.VIPPS_SUBSCRIPTION_KEY || "",
              "Merchant-Serial-Number": process.env.VIPPS_MERCHANT_SERIAL!,
            },
          }
        );
        const statusData = await statusRes.json();

        if (
          statusData.status === "AUTHORIZED" ||
          statusData.status === "CAPTURED"
        ) {
          // Get the user from the session (Vipps doesn't have session, need order lookup)
          // For now, redirect to library - the purchase will be created by the webhook
          return NextResponse.redirect(
            new URL(`/library?vipps_pending=${orderId}`, request.url)
          );
        }
      }
    }

    // If Vipps verification is not configured, redirect to library
    const adminDb = createAdminClient();
    const { data: purchases } = await adminDb
      .from("purchases")
      .select("user_id")
      .eq("video_id", videoId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (purchases?.[0]) {
      return NextResponse.redirect(
        new URL("/library?vipps=success", request.url)
      );
    }

    return NextResponse.redirect(
      new URL("/?error=betaling-ikke-godkjent", request.url)
    );
  } catch (error) {
    console.error("Vipps callback error:", error);
    return NextResponse.redirect(new URL("/?error=noe-gikk-galt", request.url));
  }
}
