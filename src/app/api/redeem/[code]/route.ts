import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(
        new URL(`/login?redirect=/redeem/${code}`)
      );
    }

    const adminDb = createAdminClient();
    const { data: qrCode } = await adminDb
      .from("qr_codes")
      .select("*")
      .eq("code", code)
      .single();

    if (!qrCode) {
      return NextResponse.redirect(
        new URL("/?error=ugyldig-kode")
      );
    }

    if (qrCode.expires_at && new Date(qrCode.expires_at) < new Date()) {
      return NextResponse.redirect(
        new URL("/?error=kode-utlopt")
      );
    }

    if (qrCode.max_uses && qrCode.current_uses >= qrCode.max_uses) {
      return NextResponse.redirect(
        new URL("/?error=kode-brukt")
      );
    }

    const { data: existingPurchase } = await adminDb
      .from("purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("video_id", qrCode.video_id)
      .maybeSingle();

    if (!existingPurchase) {
      const { error: purchaseError } = await adminDb
        .from("purchases")
        .insert({
          user_id: user.id,
          video_id: qrCode.video_id,
          qr_code_id: qrCode.id,
          price_paid: qrCode.is_free
            ? 0
            : Math.round(
                (await getVideoPrice(adminDb, qrCode.video_id)) *
                  (1 - qrCode.discount_percentage / 100)
              ),
        });

      if (purchaseError) {
        console.error("Redeem purchase error:", purchaseError);
        return NextResponse.json(
          { error: "Kunne ikke løse inn kode" },
          { status: 500 }
        );
      }

      await adminDb
        .from("qr_codes")
        .update({ current_uses: qrCode.current_uses + 1 })
        .eq("id", qrCode.id);
    }

    return NextResponse.redirect(new URL("/library?redeemed=true"));
  } catch (error) {
    console.error("Redeem error:", error);
    return NextResponse.redirect(new URL("/?error=noe-gikk-galt"));
  }
}

async function getVideoPrice(
  adminDb: ReturnType<typeof createAdminClient>,
  videoId: string
): Promise<number> {
  const { data } = await adminDb
    .from("videos")
    .select("price")
    .eq("id", videoId)
    .single();
  return data?.price ?? 0;
}
