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
  return NextResponse.json(
    { error: "Abonnement kjøpes gjennom betalingsløsningen. Bruk dev bypass for testing." },
    { status: 403 }
  );
}
