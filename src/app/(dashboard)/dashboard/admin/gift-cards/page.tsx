import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { GiftCardManager } from "@/components/gift-card-manager";

export default async function GiftCardsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const adminDb = createAdminClient();
  const { data: profiles } = await adminDb.from("profiles").select("role").eq("id", user.id);
  if (!profiles?.[0] || profiles[0].role !== "admin") redirect("/dashboard");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold">
          <span className="text-gradient-gold">Gavekort</span> og rabattkoder
        </h1>
        <p className="mt-2 text-muted">Generer gavekort med kreditt eller rabatt</p>
      </div>
      <GiftCardManager />
    </div>
  );
}
