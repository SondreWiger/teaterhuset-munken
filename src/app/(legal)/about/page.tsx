import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Om oss — Teaterhuset Munken",
  description: "Lær om Teaterhuset Munken og hva vi driver med.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl sm:text-4xl font-bold mb-2">
        <span className="text-gradient-gold">Om oss</span>
      </h1>
      <p className="text-sm text-muted mb-10">Teaterhuset Munken</p>

      <div className="space-y-10 text-muted leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Hva er Teaterhuset Munken?</h2>
          <p>
            Teaterhuset Munken er en digital plattform for teaterforestillinger. Vi gir
            publikum muligheten til å se teaterforestillingene når det passer dem — hjemme
            i sofaen, på hygga eller hvor som helst.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Vår visjon</h2>
          <p>
            Vi tror at teater skal være tilgjengelig for alle, uavhengig av geografi og
            tidspunkt. Ved å tilby forestillingene våre på nett, når vi ut til et større
            publikum og gir deg fleksibiliteten til å se når det passer deg.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Hvordan fungerer det?</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-gold/[0.08] flex items-center justify-center text-gold font-bold">1</div>
              <div>
                <h3 className="font-medium text-foreground">Utforsk</h3>
                <p>Blant våre forestillinger og finn noe du liker.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-gold/[0.08] flex items-center justify-center text-gold font-bold">2</div>
              <div>
                <h3 className="font-medium text-foreground">Kjøp tilgang</h3>
                <p>Betal enkelt med Vipps eller PayPal. Du får permanent tilgang.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-gold/[0.08] flex items-center justify-center text-gold font-bold">3</div>
              <div>
                <h3 className="font-medium text-foreground">Se og nyt</h3>
                <p>Se forestillingen så mange ganger du vil, når du vil.</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Kontakt oss</h2>
          <p>
            Har du spørsmål, tilbakemeldinger eller ønsker å samarbeide? Ta kontakt med oss
            gjennom plattformen. Vi hører gjerne fra deg!
          </p>
        </section>
      </div>
    </div>
  );
}
