import { NextResponse } from "next/server";
import { checkAdmin } from "@/lib/admin";

export async function GET() {
  const ctx = await checkAdmin();
  if (!ctx) return NextResponse.json({ error: "Ikke tilgang" }, { status: 403 });

  const { data, error } = await ctx.adminDb
    .from("audit_log")
    .select("*, profiles:user_id(display_name, email)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
