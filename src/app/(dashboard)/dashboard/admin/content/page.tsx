import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { ContentManager } from "./content-manager";

export default async function AdminContentPage() {
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
    .select("*, teams(*, videos(*), team_roles(*, roles(*)))")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Administrer innhold</h1>
        <p className="mt-2 text-muted">
          Opprett og rediger forestillinger, lag og videoer
        </p>
      </div>

      <ContentManager shows={shows ?? []} />
    </div>
  );
}
