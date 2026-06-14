import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function RedeemPage(props: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await props.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/redeem/${code}`);
  }

  const adminDb = createAdminClient();
  const { data: qrCode } = await adminDb
    .from("qr_codes")
    .select("*")
    .eq("code", code)
    .single();

  if (!qrCode) redirect("/?error=ugyldig-kode");

  if (qrCode.expires_at && new Date(qrCode.expires_at) < new Date()) {
    redirect("/?error=kode-utlopt");
  }

  if (qrCode.max_uses && qrCode.current_uses >= qrCode.max_uses) {
    redirect("/?error=kode-brukt");
  }

  const { data: existingPurchase } = await adminDb
    .from("purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("video_id", qrCode.video_id)
    .maybeSingle();

  if (!existingPurchase) {
    const { data: video } = await adminDb
      .from("videos")
      .select("price")
      .eq("id", qrCode.video_id)
      .single();

    const pricePaid = qrCode.is_free
      ? 0
      : Math.round((video?.price ?? 0) * (1 - qrCode.discount_percentage / 100));

    const { error: purchaseError } = await adminDb
      .from("purchases")
      .insert({
        user_id: user.id,
        video_id: qrCode.video_id,
        qr_code_id: qrCode.id,
        price_paid: pricePaid,
      });

    if (purchaseError) {
      console.error("Redeem purchase error:", purchaseError);
      redirect("/?error=kunne-ikke-lose-inn");
    }

    await adminDb
      .from("qr_codes")
      .update({ current_uses: qrCode.current_uses + 1 })
      .eq("id", qrCode.id);
  }

  redirect("/library?redeemed=true");
}
