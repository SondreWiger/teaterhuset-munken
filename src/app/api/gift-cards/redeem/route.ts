import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = await request.json();
  if (!code) return NextResponse.json({ error: "code required" }, { status: 400 });

  const adminDb = createAdminClient();
  const { data: card } = await adminDb
    .from("gift_cards")
    .select("*")
    .eq("code", code.toUpperCase().trim())
    .single();

  if (!card) return NextResponse.json({ error: "Ugyldig kode" }, { status: 404 });

  if (card.expires_at && new Date(card.expires_at) < new Date()) {
    return NextResponse.json({ error: "Koden er utgått" }, { status: 400 });
  }

  if (card.max_uses && card.current_uses >= card.max_uses) {
    return NextResponse.json({ error: "Koden er brukt opp" }, { status: 400 });
  }

  // Direct update — safer than RPC which may not exist
  await adminDb
    .from("gift_cards")
    .update({ current_uses: card.current_uses + 1 })
    .eq("id", card.id)
    .eq("current_uses", card.current_uses);

  return NextResponse.json({
    success: true,
    credit_amount: card.credit_amount,
    discount_percentage: card.discount_percentage,
  });
}
