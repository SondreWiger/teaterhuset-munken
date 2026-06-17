import { NextResponse } from "next/server";
import { checkAdmin } from "@/lib/admin";

export async function PATCH(request: Request) {
  const ctx = await checkAdmin();
  if (!ctx) return NextResponse.json({ error: "Ikke tilgang" }, { status: 403 });

  const { orders } = await request.json();
  if (!Array.isArray(orders)) {
    return NextResponse.json({ error: "orders array required" }, { status: 400 });
  }

  const updates = orders.map(({ id, sort_order }: { id: string; sort_order: number }) =>
    ctx.adminDb.from("videos").update({ sort_order }).eq("id", id)
  );

  const results = await Promise.all(updates);
  const error = results.find((r) => r.error);
  if (error) return NextResponse.json({ error: error.error?.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
