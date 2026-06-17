import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface AdminContext {
  user: { id: string; email?: string };
  adminDb: SupabaseClient;
}

export async function checkAdmin(): Promise<AdminContext | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const adminDb = createAdminClient();
  const { data: profiles } = await adminDb
    .from("profiles")
    .select("role")
    .eq("id", user.id);
  const profile = profiles?.[0];
  if (!profile || profile.role !== "admin") return null;

  return { user, adminDb };
}
