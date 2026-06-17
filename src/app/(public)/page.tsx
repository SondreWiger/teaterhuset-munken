import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { NewsletterSignup } from "@/components/newsletter-signup";

export default async function HomePage() {
  const adminDb = createAdminClient();
  const now = new Date().toISOString();

  const { data: shows } = await adminDb
    .from("shows")
    .select("*, teams(*, videos(*))")
    .eq("published", true)
    .or(`publish_at.is.null,publish_at.lte.${now}`)
    .order("year", { ascending: false })
    .order("created_at", { ascending: false });

  const allShows = shows ?? [];

  const settingsResult = await adminDb.from("settings").select("*");
  const settings: Record<string, string> = {};
  settingsResult.data?.forEach((s: any) => {
    settings[s.key] = s.value;
  });

  const heroImage = settings.hero_image_url;
  const heroTitle = settings.hero_title || "Teaterhuset Munken";
  const heroSubtitle =
    settings.hero_subtitle ||
    "Barne- og ungdomsteater i Larvik. Se våre forestillinger når det passer deg.";

  const totalVideos = allShows.reduce(
    (acc: number, s: any) =>
      acc +
      (s.teams?.reduce(
        (a: number, t: any) => a + (t.videos?.length ?? 0),
        0
      ) ?? 0),
    0
  );

  const featuredShows = allShows.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[100dvh] flex items-center overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 hero-mesh" />
        {heroImage && (
          <div className="absolute inset-0">
            <img
              src={heroImage}
              alt=""
              className="w-full h-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent" />
          </div>
        )}
        {!heroImage && (
          <>
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gold/[0.04] rounded-full blur-[150px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-crimson/[0.03] rounded-full blur-[120px]" />
          </>
        )}

        {/* Floating particles */}
        <div className="absolute top-32 right-20 w-2 h-2 rounded-full bg-gold/30 animate-float" style={{ animationDelay: "0s" }} />
        <div className="absolute top-48 right-40 w-1.5 h-1.5 rounded-full bg-gold/20 animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-40 left-20 w-1 h-1 rounded-full bg-gold/25 animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-60 left-32 w-1.5 h-1.5 rounded-full bg-crimson/20 animate-float" style={{ animationDelay: "3s" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="max-w-3xl">
            <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
              <p className="text-gold font-semibold text-sm tracking-[0.2em] uppercase mb-6">
                Nå tilgjengelig på nett
              </p>
            </div>
            <div className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.92]">
                <span className="text-gradient-gold">{heroTitle}</span>
              </h1>
            </div>
            <div className="animate-fade-up" style={{ animationDelay: "0.35s" }}>
              <p className="mt-6 sm:mt-8 text-lg sm:text-xl md:text-2xl text-muted max-w-xl leading-relaxed">
                {heroSubtitle}
              </p>
            </div>
            <div className="mt-10 sm:mt-14 flex flex-wrap gap-4 animate-fade-up" style={{ animationDelay: "0.5s" }}>
              <Link
                href="/forestillinger"
                className="btn-gold rounded-xl px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-semibold inline-flex items-center touch-target"
              >
                <span className="flex items-center gap-2.5">
                  Se forestillinger
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              <Link
                href="/login"
                className="btn-outline-glass rounded-xl px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-semibold text-foreground inline-flex items-center touch-target"
              >
                Logg inn
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-up" style={{ animationDelay: "1s" }}>
          <div className="w-6 h-10 rounded-full border-2 border-white/10 flex items-start justify-center p-1.5">
            <div className="w-1 h-2.5 rounded-full bg-gold/40 animate-float" />
          </div>
        </div>

        {/* Bottom fade line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/10 to-transparent" />
      </section>

      {/* Stats strip */}
      {allShows.length > 0 && (
        <section className="relative border-y border-white/[0.04]">
          <div className="absolute inset-0 hero-mesh opacity-30" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-3 divide-x divide-white/[0.04]">
              {[
                { value: allShows.length, label: "Forestillinger" },
                {
                  value: allShows.reduce(
                    (acc: number, s: any) => acc + (s.teams?.length ?? 0),
                    0
                  ),
                  label: "Lag",
                },
                { value: totalVideos, label: "Videoer" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="py-8 sm:py-10 text-center"
                >
                  <div className="text-2xl sm:text-3xl font-bold text-gradient-gold">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-xs sm:text-sm text-muted uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured shows */}
      {featuredShows.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-gold font-semibold text-sm tracking-[0.2em] uppercase mb-3">
                Siste
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold">
                Utvalgte{" "}
                <span className="text-gradient-gold">forestillinger</span>
              </h2>
            </div>
            <Link
              href="/forestillinger"
              className="hidden sm:inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
            >
              Se alle
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 stagger">
            {featuredShows.map((show: any) => {
              const totalVids = show.teams?.reduce(
                (acc: number, t: any) => acc + (t.videos?.length ?? 0),
                0
              );
              return (
                <Link
                  key={show.id}
                  href={`/shows/${show.id}`}
                  className="group glass-card rounded-2xl overflow-hidden"
                >
                  <div className="aspect-[16/10] relative overflow-hidden">
                    {show.image_url ? (
                      <img
                        src={show.image_url}
                        alt={show.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gold/10 via-gold/5 to-transparent flex items-center justify-center">
                        <span className="text-6xl opacity-30 group-hover:opacity-50 transition-opacity duration-500">
                          🎭
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute top-4 left-4">
                      <span className="inline-block rounded-full bg-black/40 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-gold-light border border-gold/10">
                        {show.year}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-xl font-bold text-white group-hover:text-gradient-gold transition-all duration-300">
                        {show.title}
                      </h3>
                      {show.description && (
                        <p className="mt-2 text-sm text-white/50 line-clamp-2 leading-relaxed">
                          {show.description}
                        </p>
                      )}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <div className="px-6 py-4 flex items-center gap-4 text-sm text-muted border-t border-white/[0.03]">
                    <span>{show.teams?.length ?? 0} lag</span>
                    <span className="text-border">·</span>
                    <span>
                      {totalVids} video{totalVids !== 1 ? "er" : ""}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-10 text-center sm:hidden">
            <Link
              href="/forestillinger"
              className="inline-flex items-center gap-2 text-sm text-gold hover:text-gold-light transition-colors"
            >
              Se alle forestillinger
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="relative overflow-hidden border-y border-white/[0.04]">
        <div className="absolute inset-0 hero-mesh opacity-20" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center mb-16">
            <p className="text-gold font-semibold text-sm tracking-[0.2em] uppercase mb-3">
              Slik fungerer det
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold">
              Tre steg til <span className="text-gradient-gold">teateropplevelsen</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 stagger">
            {[
              {
                step: "01",
                title: "Opprett konto",
                desc: "Lag en gratis konto med e-post eller Google.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                ),
              },
              {
                step: "02",
                title: "Velg forestilling",
                desc: "Utforsk vårt repertoar og finn det du vil se.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 0v.375" />
                  </svg>
                ),
              },
              {
                step: "03",
                title: "Se når du vil",
                desc: "Kjøp tilgang og stream på alle enheter.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div
                key={item.step}
                className="glass-card rounded-2xl p-8 text-center group"
              >
                <div className="w-14 h-14 rounded-xl bg-gold/[0.08] border border-gold/10 flex items-center justify-center text-gold mx-auto mb-5 group-hover:bg-gold/[0.12] transition-colors">
                  {item.icon}
                </div>
                <div className="text-xs font-bold text-gold/40 tracking-widest mb-3">
                  STEG {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterSignup />

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 hero-mesh opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/[0.04] rounded-full blur-[150px]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-28 md:py-36 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-gold/[0.08] border border-gold/10 px-4 py-2 mb-8">
            <div className="w-2 h-2 rounded-full bg-gold animate-glow-pulse" />
            <span className="text-sm text-gold font-medium">Klar for å begynne?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight">
            Se <span className="text-gradient-gold">teater</span>
            <br />
            når det passer deg
          </h2>
          <p className="mt-6 text-lg text-muted max-w-xl mx-auto leading-relaxed">
            Opprett en konto og kjøp tilgang til våre forestillinger. Se når
            det passer deg, så mange ganger du vil.
          </p>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link
              href="/forestillinger"
              className="btn-gold rounded-xl px-8 py-4 text-base font-semibold inline-flex items-center"
            >
              <span>Utforsk forestillinger</span>
            </Link>
            <Link
              href="/login"
              className="btn-outline-glass rounded-xl px-8 py-4 text-base font-semibold text-foreground inline-flex items-center"
            >
              <span>Logg inn</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
