import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminDb = createAdminClient();
  const { data, error } = await adminDb
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .eq("active", true)
    .order("end_date", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const active = data?.find((s: any) => new Date(s.end_date) > new Date());
  return NextResponse.json({ active: !!active, subscription: active || null });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type } = await request.json();
  if (!type || !["monthly", "yearly"].includes(type)) {
    return NextResponse.json({ error: "type must be monthly or yearly" }, { status: 400 });
  }

  const now = new Date();
  const endDate = new Date(now);
  if (type === "monthly") endDate.setMonth(endDate.getMonth() + 1);
  if (type === "yearly") endDate.setFullYear(endDate.getFullYear() + 1);

  const price = type === "monthly" ? 99 : 990;

  const adminDb = createAdminClient();

  // Deactivate any existing subscriptions
  await adminDb
    .from("subscriptions")
    .update({ active: false })
    .eq("user_id", user.id)
    .eq("active", true);

  const { data, error } = await adminDb
    .from("subscriptions")
    .insert({
      user_id: user.id,
      type,
      start_date: now.toISOString(),
      end_date: endDate.toISOString(),
      active: true,
      price,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
