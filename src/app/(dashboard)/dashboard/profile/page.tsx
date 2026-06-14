import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";
import Link from "next/link";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const adminDb = createAdminClient();
  const { data: profile } = await adminDb
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  const { data: subscriptions } = await adminDb
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .eq("active", true)
    .order("end_date", { ascending: false });

  const activeSubscription = subscriptions?.find((s: any) => new Date(s.end_date) > new Date());

  const { count: purchaseCount } = await adminDb
    .from("purchases")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { count: watchCount } = await adminDb
    .from("watch_history")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold">
          Min <span className="text-gradient-gold">profil</span>
        </h1>
        <p className="mt-2 text-muted">Administrer din profil og abonnement</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-gradient-gold">{purchaseCount ?? 0}</p>
          <p className="text-xs text-muted mt-1">Kjøp</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-gradient-gold">{watchCount ?? 0}</p>
          <p className="text-xs text-muted mt-1">Sett</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-gradient-gold">
            {activeSubscription ? "Ja" : "Nei"}
          </p>
          <p className="text-xs text-muted mt-1">Abonnement</p>
        </div>
      </div>

      {/* Subscription */}
      {activeSubscription ? (
        <div className="glass-card rounded-2xl p-6 mb-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-success animate-glow-pulse" />
            <h2 className="font-semibold">Aktivt abonnement</h2>
          </div>
          <p className="text-sm text-muted">
            {activeSubscription.type === "monthly" ? "Månedlig" : "Årlig"} ·
            Gyldig til {new Date(activeSubscription.end_date).toLocaleDateString("nb-NO")}
          </p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-6 mb-10">
          <h2 className="font-semibold mb-2">Ingen abonnement</h2>
          <p className="text-sm text-muted mb-4">
            Få ubegrenset tilgang til alle videoer med et abonnement.
          </p>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="btn-gold rounded-xl px-5 py-2.5 text-sm font-medium"
            >
              Se abonnementer
            </Link>
          </div>
        </div>
      )}

      {/* Profile form */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="font-semibold mb-6">Profilinnstillinger</h2>
        <ProfileForm profile={profile} />
      </div>
    </div>
  );
}
