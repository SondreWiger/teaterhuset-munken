import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(request: Request) {
  const adminDb = createAdminClient();
  const { orders } = await request.json();

  if (!Array.isArray(orders)) {
    return NextResponse.json({ error: "orders array required" }, { status: 400 });
  }

  const updates = orders.map(({ id, sort_order }: { id: string; sort_order: number }) =>
    adminDb.from("videos").update({ sort_order }).eq("id", id)
  );

  const results = await Promise.all(updates);

  const error = results.find((r) => r.error);
  if (error) {
    return NextResponse.json({ error: error.error?.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
