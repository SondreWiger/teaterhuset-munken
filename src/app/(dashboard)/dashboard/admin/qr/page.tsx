import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { QrGenerator } from "./qr-generator";

export default async function QrPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const adminDb = createAdminClient();
  const { data: profiles } = await adminDb
    .from("profiles")
    .select("role")
    .eq("id", user.id);

  const profile = profiles?.[0];
  if (!profile || profile.role !== "admin") redirect("/dashboard");

  const { data: shows } = await adminDb
    .from("shows")
    .select("*, teams(*, videos(*))")
    .eq("published", true)
    .order("created_at", { ascending: false });

  const { data: qrCodes } = await adminDb
    .from("qr_codes")
    .select("*, videos(title)")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Generer QR-kode</h1>
        <p className="mt-2 text-muted">
          Lag rabattkoder eller gratis tilgang til videoer
        </p>
      </div>

      <QrGenerator shows={shows ?? []} qrCodes={qrCodes ?? []} />
    </div>
  );
}
