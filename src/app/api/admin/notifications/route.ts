import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminDb = createAdminClient();
  const { data: profiles } = await adminDb.from("profiles").select("role").eq("id", user.id);
  if (!profiles?.[0] || profiles[0].role !== "admin") {
    return NextResponse.json({ error: "Ikke tilgang" }, { status: 403 });
  }

  const { subject, body, type } = await request.json();
  if (!subject || !body) return NextResponse.json({ error: "subject and body required" }, { status: 400 });

  // Get all active subscribers
  const { data: subscribers } = await adminDb
    .from("newsletter_subscribers")
    .select("email")
    .eq("active", true);

  if (!subscribers?.length) {
    return NextResponse.json({ message: "Ingen abonnenter å sende til" });
  }

  // Log each notification (in production, integrate with email service)
  const notifications = subscribers.map((sub: any) => ({
    recipient_email: sub.email,
    subject,
    body,
    type: type || "manual",
  }));

  const { error } = await adminDb
    .from("email_notifications")
    .insert(notifications);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    message: `Sendt til ${subscribers.length} abonnenter`,
    count: subscribers.length,
  });
}

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
    .from("email_notifications")
    .select("*")
    .order("sent_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
