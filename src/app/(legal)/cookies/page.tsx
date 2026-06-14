import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Informasjonskapsler — Teaterhuset Munken",
  description: "Hvordan vi bruker informasjonskapsler (cookies).",
};

export default function CookiesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl sm:text-4xl font-bold mb-2">
        <span className="text-gradient-gold">Informasjonskapsler</span>
      </h1>
      <p className="text-sm text-muted mb-10">Sist oppdatert: 14. juni 2026</p>

      <div className="space-y-10 text-muted leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Hva er informasjonskapsler?</h2>
          <p>
            Informasjonskapsler (cookies) er små tekstfiler som lagres på enheten din når
            du besøker en nettside. De brukes til å huske innstillingene dine og gi en
            bedre opplevelse.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Hvilke kapsler vi bruker</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left py-3 pr-4 text-foreground font-medium">Kapsel</th>
                  <th className="text-left py-3 pr-4 text-foreground font-medium">Formål</th>
                  <th className="text-left py-3 text-foreground font-medium">Varighet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                <tr>
                  <td className="py-3 pr-4 font-mono text-xs text-gold">sb-*</td>
                  <td className="py-3 pr-4">Supabase autentisering — husker at du er logget inn</td>
                  <td className="py-3">Økt / 1 år</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-mono text-xs text-gold">csrf_token</td>
                  <td className="py-3 pr-4">Sikkerhet — beskytter mot CSRF-angrep</td>
                  <td className="py-3">Økt</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Tredjepartskapsler</h2>
          <p>
            Vi bruker ikke sporingskapsler fra tredjeparter, annonseringskapsler eller
            analysetjenester som Google Analytics. De eneste kapslene som brukes er de som
            er nødvendige for at tjenesten skal fungere.
          </p>
          <p className="mt-3">
            Når du ser en video via YouTube- eller Vimeo-embed, kan disse tjenestene sette
            egne kapsler. Dette er utenfor vår kontroll. Se deres respektive
            personvernerklæringer for mer informasjon.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Håndtering av kapsler</h2>
          <p>
            Du kan blokkere eller slette informasjonskapsler gjennom innstillingene i
            nettleseren din. Vær oppmerksom på at hvis du blokkerer nødvendige kapsler,
            kan det hende at enkelte funksjoner på plattformen ikke fungerer som de skal.
          </p>
          <p className="mt-3">
            Slik administrerer du kapsler i de vanligste nettleserne:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
            <li><strong>Chrome:</strong> Innstillinger → Personvern og sikkerhet → Informasjonskapsler</li>
            <li><strong>Firefox:</strong> Innstillinger → Personvern og sikkerhet → Informasjonskapsler</li>
            <li><strong>Safari:</strong> Innstillinger → Personvern → Administrer informasjonskapsler</li>
            <li><strong>Edge:</strong> Innstillinger → Personvern → Informasjonskapsler</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Endringer</h2>
          <p>
            Vi kan oppdatere denne erklæringen om informasjonskapsler fra tid til annen.
            Endringer vil bli lagt ut på denne siden.
          </p>
        </section>
      </div>
    </div>
  );
}
