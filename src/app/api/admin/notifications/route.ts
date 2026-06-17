import { NextResponse } from "next/server";
import { checkAdmin } from "@/lib/admin";

export async function POST(request: Request) {
  const ctx = await checkAdmin();
  if (!ctx) return NextResponse.json({ error: "Ikke tilgang" }, { status: 403 });

  const { subject, body, type } = await request.json();
  if (!subject || !body) return NextResponse.json({ error: "subject and body required" }, { status: 400 });

  const { data: subscribers } = await ctx.adminDb
    .from("newsletter_subscribers")
    .select("email")
    .eq("active", true);

  if (!subscribers?.length) {
    return NextResponse.json({ message: "Ingen abonnenter å sende til" });
  }

  const notifications = subscribers.map((sub: any) => ({
    recipient_email: sub.email,
    subject,
    body,
    type: type || "manual",
  }));

  const { error } = await ctx.adminDb
    .from("email_notifications")
    .insert(notifications);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    message: `Sendt til ${subscribers.length} abonnenter`,
    count: subscribers.length,
  });
}

export async function GET() {
  const ctx = await checkAdmin();
  if (!ctx) return NextResponse.json({ error: "Ikke tilgang" }, { status: 403 });

  const { data, error } = await ctx.adminDb
    .from("email_notifications")
    .select("*")
    .order("sent_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
