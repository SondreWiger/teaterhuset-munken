import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personvern — Teaterhuset Munken",
  description: "Hvordan vi behandler personopplysningene dine.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl sm:text-4xl font-bold mb-2">
        <span className="text-gradient-gold">Personvern</span>
      </h1>
      <p className="text-sm text-muted mb-10">Sist oppdatert: 14. juni 2026</p>

      <div className="space-y-10 text-muted leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">1. Innledning</h2>
          <p>
            Teaterhuset Munken («vi», «oss», «tjenesten») respekterer personvernet ditt. Denne
            personvernerklæringen forklarer hvordan vi samler inn, bruker og beskytter
            personopplysningene dine når du bruker plattformen vår.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">2. Opplysninger vi samler inn</h2>
          <p className="mb-3">Vi kan samle inn følgende opplysninger:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Kontoopplysninger:</strong> e-postadresse, navn og passord (kryptert) når du oppretter en konto.</li>
            <li><strong>Betalingsopplysninger:</strong> transaksjonsdetaljer gjennom PayPal og Vipps. Vi lagrer ikke kortnummer eller fullstendige betalingsdetaljer.</li>
            <li><strong>Bruksdata:</strong> informasjon om hvordan du bruker tjenesten, inkludert hvilke videoer du ser på og når.</li>
            <li><strong>Enhetsinformasjon:</strong> nettlesertype, operativsystem og IP-adresse.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">3. Hvordan vi bruker opplysningene</h2>
          <p className="mb-3">Vi bruker opplysningene til å:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Drifte og vedlikeholde tjenesten.</li>
            <li>Behandle betalinger og gi deg tilgang til kjøpt innhold.</li>
            <li>Kommunisere med deg om kontoen din eller tjenesten.</li>
            <li>Forbedre og utvikle nye funksjoner.</li>
            <li>Sikre at tjenesten brukes i samsvar med vilkårene våre.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">4. Deling av opplysninger</h2>
          <p>
            Vi deler ikke personopplysningene dine med tredjeparter, unntatt når det er nødvendig
            for å levere tjenesten (f.eks. betalingsleverandører som PayPal og Vipps), eller når
            vi er juridisk forpliktet til det.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">5. Lagring og sikkerhet</h2>
          <p>
            Opplysningene dine lagres sikkert hos Supabase (AWS). Vi bruker kryptering og
            tiltak for å beskytte dataene dine mot uautorisert tilgang. Vi lagrer
            personopplysninger så lenge kontoen din er aktiv, eller så lenge det er nødvendig
            for å levere tjenesten.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">6. Dine rettigheter</h2>
          <p className="mb-3">Du har rett til å:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Få tilgang til personopplysningene dine.</li>
            <li>Be om retting av feilaktige opplysninger.</li>
            <li>Be om sletting av personopplysningene dine.</li>
            <li>Motte deg mot behandling av opplysningene dine.</li>
            <li>Få opplysningene dine i et strukturert, maskinlesbart format.</li>
          </ul>
          <p className="mt-3">
            For å utøve disse rettighetene, kontakt oss på e-post.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">7. Informasjonskapsler</h2>
          <p>
            Vi bruker nødvendige informasjonskapsler for å drifte tjenesten (f.eks. innlogging).
            Vi bruker ikke sporingskapsler eller annonseringskapsler.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">8. Endringer i erklæringen</h2>
          <p>
            Vi kan oppdatere denne personvernerklæringen fra tid til annen. Vi vil varsle deg
            om vesentlige endringer ved å legge ut den oppdaterte versjonen på denne siden.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">9. Kontakt</h2>
          <p>
            Spørsmål om personvern? Kontakt oss via e-post eller gjennom plattformen.
          </p>
        </section>
      </div>
    </div>
  );
}
