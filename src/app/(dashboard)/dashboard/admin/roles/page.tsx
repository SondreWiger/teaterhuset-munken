import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminRolesPage() {
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

  const { data: roles } = await adminDb
    .from("roles")
    .select("*, team_roles(id)")
    .order("name");

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Roller</h1>
        <p className="mt-2 text-muted">
          Administrer roller som kan tildeles lag i forestillinger
        </p>
      </div>

      <div className="space-y-3">
        {(!roles || roles.length === 0) && (
          <p className="text-center text-muted py-12">
            Ingen roller opprettet ennå. Roller opprettes fra innholdssiden når du redigerer et lag.
          </p>
        )}

        {roles?.map((role: any) => (
          <Link
            key={role.id}
            href={`/roles/${role.id}`}
            className="glass-card rounded-xl p-4 flex items-center gap-4 group"
          >
            {role.image_url ? (
              <img
                src={role.image_url}
                alt=""
                className="w-12 h-12 rounded-xl object-cover border border-white/[0.06]"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center border border-white/[0.04]">
                <span className="text-lg font-bold text-gradient-gold">
                  {role.name.charAt(0)}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold group-hover:text-gold transition-colors">
                {role.name}
              </h3>
              {role.description && (
                <p className="text-xs text-muted truncate">{role.description}</p>
              )}
            </div>
            <span className="text-xs text-muted shrink-0">
              {role.team_roles?.length ?? 0} opptreden{(role.team_roles?.length ?? 0) !== 1 ? "er" : ""}
            </span>
            <svg className="w-4 h-4 text-muted group-hover:text-gold group-hover:translate-x-1 transition-all shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
