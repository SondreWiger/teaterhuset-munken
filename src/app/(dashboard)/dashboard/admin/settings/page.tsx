import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { SettingsForm } from "./settings-form";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const adminDb = createAdminClient();
  const { data: profiles } = await adminDb
    .from("profiles")
    .select("*")
    .eq("id", user.id);

  const profile = profiles?.[0];
  if (!profile || profile.role !== "admin") redirect("/dashboard");

  const { data: settings } = await adminDb
    .from("settings")
    .select("*");

  const settingsMap: Record<string, string> = {};
  settings?.forEach((s: any) => {
    settingsMap[s.key] = s.value;
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Innstillinger</h1>
        <p className="mt-2 text-muted">
          Konfigurer landingssiden og andre innstillinger
        </p>
      </div>

      <SettingsForm settings={settingsMap} />
    </div>
  );
}
