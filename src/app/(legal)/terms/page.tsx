import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vilkår for bruk — Teaterhuset Munken",
  description: "Vilkårene for bruk av Teaterhuset Munken.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl sm:text-4xl font-bold mb-2">
        <span className="text-gradient-gold">Vilkår for bruk</span>
      </h1>
      <p className="text-sm text-muted mb-10">Sist oppdatert: 14. juni 2026</p>

      <div className="space-y-10 text-muted leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">1. Godkjenning</h2>
          <p>
            Ved å bruke Teaterhuset Munken godtar du disse vilkårene. Hvis du ikke godtar
            vilkårene, skal du ikke bruke tjenesten.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">2. Konto</h2>
          <p className="mb-3">
            For å kjøpe og se videoer må du opprette en konto. Du er ansvarlig for å:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Holde innloggingsinformasjonen din hemmelig.</li>
            <li>Varsle oss umiddelbart hvis du mistenker uautorisert tilgang til kontoen din.</li>
            <li>Sørge for at informasjonen din er korrekt og oppdatert.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">3. Kjøp og tilgang</h2>
          <p className="mb-3">
            Når du kjøper tilgang til en video, får du permanent tilgang til å se den videoen.
            Dette inkluderer:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Ubegrenset antall visninger av den kjøpte videoen.</li>
            <li>Tilgang så lenge tjenesten er tilgjengelig.</li>
          </ul>
          <p className="mt-3">
            Priser er oppgitt i norske kroner (NOK) og inkluderer merverdiavgift der det er aktuelt.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">4. Betaingsvilkår</h2>
          <p className="mb-3">
            Betaling skjer via PayPal eller Vipps. Vi lagrer ikke betalingskortopplysninger.
            Alle transaksjoner er sikret av betalingsleverandørene.
          </p>
          <p>
            Refusjon: Vi tilbyr refusjon hvis du har problemer med å se en video du har kjøpt.
            Kontakt oss så hjelper vi deg.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">5. Immaterielle rettigheter</h2>
          <p>
            Alt innhold på plattformen, inkludert videoer, bilder, tekst og design, tilhører
            Teaterhuset Munken eller rettighetshaverne. Du får en begrenset, ikke-eksklusiv
            lisens til å se innholdet for personlig bruk.
          </p>
          <p className="mt-3">
            Det er ikke tillatt å:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
            <li>Kopiere, dele eller distribuere innholdet.</li>
            <li>Strømme, laste ned eller gjengi innholdet uten tillatelse.</li>
            <li>Fjerne eller endre opphavsrettsmerker eller annen eiendomsinformasjon.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">6. Akseptabel bruk</h2>
          <p className="mb-3">Du skal ikke:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Bruke tjenesten til ulovlige formål.</li>
            <li>Prøve å få uautorisert tilgang til systemene våre.</li>
            <li>Bruke automatiserte verktøy for å hente innhold fra plattformen.</li>
            <li>Forstyrre driften av tjenesten.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">7. Ansvarsbegrensning</h2>
          <p>
            Tjenesten leveres «som den er». Vi garanterer ikke at tjenesten vil være feilfri
            eller uavbrutt. Vi er ikke ansvarlige for tap som følge av bruk av tjenesten,
            med mindre annet følger av norsk lov.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">8. Endringer i vilkårene</h2>
          <p>
            Vi kan oppdatere disse vilkårene fra tid til annen. Vesentlige endringer vil bli
            kommunisert via plattformen. Fortsatt bruk av tjenesten etter endringer betyr
            at du godtar de oppdaterte vilkårene.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">9. Gjeldende lov</h2>
          <p>
            Disse vilkårene reguleres av norsk lov. Eventuelle tvister skal løses ved
            de norske domstolene.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">10. Kontakt</h2>
          <p>
            Spørsmål om vilkårene? Kontakt oss via e-post eller gjennom plattformen.
          </p>
        </section>
      </div>
    </div>
  );
}
