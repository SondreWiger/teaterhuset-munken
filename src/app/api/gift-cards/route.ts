import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminDb = createAdminClient();
  const { data: profiles } = await adminDb.from("profiles").select("role").eq("id", user.id);
  if (!profiles?.[0] || profiles[0].role !== "admin") {
    return NextResponse.json({ error: "Ikke tilgang" }, { status: 403 });
  }

  const { data, error } = await adminDb
    .from("gift_cards")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminDb = createAdminClient();
  const { data: profiles } = await adminDb.from("profiles").select("role").eq("id", user.id);
  if (!profiles?.[0] || profiles[0].role !== "admin") {
    return NextResponse.json({ error: "Ikke tilgang" }, { status: 403 });
  }

  const { credit_amount, discount_percentage, max_uses, expires_at } = await request.json();

  const code = `GC-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

  const { data, error } = await adminDb
    .from("gift_cards")
    .insert({
      code,
      credit_amount: credit_amount || 0,
      discount_percentage: discount_percentage || 0,
      max_uses: max_uses || null,
      expires_at: expires_at || null,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminDb = createAdminClient();
  const { data: profiles } = await adminDb.from("profiles").select("role").eq("id", user.id);
  if (!profiles?.[0] || profiles[0].role !== "admin") {
    return NextResponse.json({ error: "Ikke tilgang" }, { status: 403 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await adminDb.from("gift_cards").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
