import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';

type Props = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How GeoMondo collects, uses, and protects your personal data.',
};

// ─── Italian content ──────────────────────────────────────────────────────────

function PrivacyIT() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-background px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-foreground mb-3">Informativa sulla Privacy</h1>
          <p className="text-muted text-sm">
            Data di entrata in vigore: <time dateTime="2026-05-29">29 maggio 2026</time>
          </p>
        </div>

        <div className="space-y-10 text-foreground/90 text-sm leading-relaxed">

          <section>
            <p>
              GeoMondo (&quot;noi&quot;) è un gioco di geografia gratuito con sede nell&apos;Unione Europea. Questa informativa spiega quali dati personali
              raccogliamo quando utilizzi GeoMondo, perché li raccogliamo e quali diritti hai
              su di essi.
            </p>
            <p className="mt-3">
              Siamo soggetti al Regolamento Generale sulla Protezione dei Dati dell&apos;UE (GDPR).
              Per domande o richieste riguardanti i tuoi dati, contattaci all&apos;indirizzo{' '}
              <a href="mailto:legal@geomondo.it" className="text-it-green hover:underline">
                legal@geomondo.it
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">1. Dati che raccogliamo</h2>

            <h3 className="font-semibold text-foreground mb-1">Dati dell&apos;account</h3>
            <p className="mb-4">
              Se crei un account, conserviamo il tuo indirizzo email e un nome utente. Se
              accedi con Google, riceviamo anche il tuo nome visualizzato su Google e l&apos;URL
              della foto del profilo, che utilizziamo per popolare il tuo profilo. Non
              riceviamo la tua password Google.
            </p>

            <h3 className="font-semibold text-foreground mb-1">Cronologia delle partite</h3>
            <p className="mb-4">
              Quando completi una partita come utente registrato, registriamo le coordinate
              geografiche di ciascun luogo mostrato, le coordinate della tua risposta, la
              distanza e il punteggio risultanti, il tempo impiegato per ogni round, la
              modalità di gioco e la data. Questi dati vengono utilizzati per costruire il
              tuo profilo e la classifica globale.
            </p>

            <h3 className="font-semibold text-foreground mb-1">Dati tecnici</h3>
            <p>
              Il nostro provider di hosting (Vercel) e di database (Supabase) raccolgono
              automaticamente log standard del server, inclusi indirizzi IP, tipo di browser
              e timestamp delle richieste. Non raccogliamo direttamente questi dati, ma i
              nostri fornitori li conservano fino a 90 giorni per scopi di sicurezza e
              prevenzione degli abusi.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">2. Perché raccogliamo i dati e base giuridica</h2>
            <div className="space-y-3">
              <div className="bg-surface border border-border rounded-xl px-4 py-3">
                <p className="font-semibold text-foreground text-xs uppercase tracking-wider mb-1">
                  Esecuzione del contratto — Art. 6(1)(b) GDPR
                </p>
                <p>
                  I dati dell&apos;account e la cronologia delle partite sono necessari per fornire
                  il servizio a cui ti sei iscritto: salvare i tuoi punteggi, mostrare il
                  tuo profilo e visualizzare la classifica.
                </p>
              </div>
              <div className="bg-surface border border-border rounded-xl px-4 py-3">
                <p className="font-semibold text-foreground text-xs uppercase tracking-wider mb-1">
                  Legittimo interesse — Art. 6(1)(f) GDPR
                </p>
                <p>
                  Elaboriamo i dati tecnici dei log per proteggere il servizio dagli abusi,
                  rilevare frodi e mantenere la sicurezza. Questo interesse non prevale sui
                  tuoi diritti.
                </p>
              </div>
              <div className="bg-surface border border-border rounded-xl px-4 py-3">
                <p className="font-semibold text-foreground text-xs uppercase tracking-wider mb-1">
                  Consenso — Art. 6(1)(a) GDPR
                </p>
                <p>
                  Se in futuro introdurremo pubblicità o analytics, ti chiederemo il consenso
                  prima di impostare cookie di tracciamento. Puoi revocare il consenso in
                  qualsiasi momento.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">3. Chi vede i tuoi dati</h2>
            <p className="mb-4">
              Non vendiamo i tuoi dati. Li condividiamo solo con i fornitori di servizi
              (&quot;responsabili del trattamento&quot;) necessari per gestire GeoMondo:
            </p>
            <div className="space-y-2">
              {[
                { name: 'Supabase Inc.', role: 'Database e autenticazione', location: 'Stati Uniti', note: 'Coperto da Clausole Contrattuali Standard (SCC)' },
                { name: 'Vercel Inc.', role: 'Hosting web e rete edge', location: 'Stati Uniti', note: 'Coperto da Clausole Contrattuali Standard (SCC)' },
                { name: 'Google LLC', role: 'Immagini Street View (Maps API) e accesso con Google', location: 'Stati Uniti', note: 'Coperto da Clausole Contrattuali Standard (SCC)' },
                { name: 'Meta Platforms (Mapillary)', role: 'Immagini stradali alternative', location: 'Stati Uniti', note: 'Coperto da Clausole Contrattuali Standard (SCC)' },
              ].map(p => (
                <div key={p.name} className="bg-surface border border-border rounded-xl px-4 py-3 flex flex-col gap-0.5">
                  <span className="font-semibold text-foreground">{p.name}</span>
                  <span className="text-muted text-xs">{p.role} · {p.location}</span>
                  <span className="text-muted text-xs">{p.note}</span>
                </div>
              ))}
            </div>
            <p className="mt-4">
              Potremmo anche divulgare i dati se richiesto dalla legge, da un ordine del
              tribunale o per proteggere i diritti e la sicurezza degli utenti.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">4. Per quanto tempo conserviamo i tuoi dati</h2>
            <p className="mb-2">
              I dati dell&apos;account (email, nome utente, avatar) vengono conservati fino
              all&apos;eliminazione dell&apos;account.
            </p>
            <p className="mb-2">
              La cronologia delle partite viene conservata per un massimo di 24 mesi, o fino
              all&apos;eliminazione dell&apos;account, a seconda di quale evento si verifichi prima.
            </p>
            <p>
              I log del server tenuti dai nostri fornitori (Vercel, Supabase) vengono
              conservati fino a 90 giorni.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">5. Cookie</h2>
            <p className="mb-3">GeoMondo utilizza attualmente una categoria di cookie:</p>
            <div className="bg-surface border border-border rounded-xl px-4 py-3 mb-3">
              <p className="font-semibold text-foreground mb-1">Cookie di sessione (strettamente necessari)</p>
              <p>
                Impostati da Supabase per mantenerti connesso. Questo cookie è essenziale per
                il funzionamento del servizio. Il GDPR non richiede il consenso per i cookie
                strettamente necessari.
              </p>
            </div>
            <p>
              Se aggiungeremo pubblicità (Google AdSense) o analytics in futuro, comparirà
              un banner di consenso ai cookie e nessun cookie di tracciamento verrà
              impostato prima che tu accetti.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">6. I tuoi diritti ai sensi del GDPR</h2>
            <p className="mb-4">
              In quanto residente nell&apos;UE, hai i seguenti diritti. Per esercitarli,
              scrivici a{' '}
              <a href="mailto:legal@geomondo.it" className="text-it-green hover:underline">
                legal@geomondo.it
              </a>{' '}
              e risponderemo entro 30 giorni.
            </p>
            <div className="space-y-2">
              {[
                ['Accesso (Art. 15)', 'Richiedere una copia dei dati personali che conserviamo su di te.'],
                ['Rettifica (Art. 16)', 'Chiederci di correggere dati inesatti o incompleti.'],
                ['Cancellazione (Art. 17)', 'Richiedere la cancellazione del tuo account e di tutti i dati associati. Elaboreremo le richieste di cancellazione entro 30 giorni.'],
                ['Limitazione (Art. 18)', 'Chiederci di sospendere temporaneamente il trattamento dei tuoi dati mentre viene risolta una controversia.'],
                ['Portabilità (Art. 20)', 'Ricevere la cronologia delle tue partite in un formato leggibile da un computer (JSON).'],
                ['Opposizione (Art. 21)', 'Opporti al trattamento basato su legittimo interesse. Interromperemo il trattamento salvo motivi cogenti.'],
                ['Revoca del consenso (Art. 7)', 'Dove il trattamento si basa sul consenso (es. cookie pubblicitari), revocarlo in qualsiasi momento senza pregiudicare il trattamento precedente.'],
              ].map(([right, desc]) => (
                <div key={right} className="bg-surface border border-border rounded-xl px-4 py-3">
                  <p className="font-semibold text-foreground mb-0.5">{right}</p>
                  <p className="text-muted text-xs">{desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-4">
              Hai anche il diritto di proporre reclamo all&apos;autorità italiana per la
              protezione dei dati:{' '}
              <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" className="text-it-green hover:underline">
                Garante per la protezione dei dati personali
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">7. Minori</h2>
            <p>
              GeoMondo non è rivolto a minori di 16 anni. Non raccogliamo consapevolmente
              dati personali di minori. Se ritieni che un minore ci abbia fornito dati
              personali, contattaci e li elimineremo tempestivamente.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">8. Modifiche a questa informativa</h2>
            <p>
              In caso di modifiche sostanziali, aggiorneremo la data di entrata in vigore e,
              ove richiesto dalla legge, ti invieremo una notifica via email prima che le
              modifiche entrino in vigore.
            </p>
          </section>

          <section className="bg-surface border border-border rounded-2xl px-6 py-5">
            <h2 className="text-base font-bold text-foreground mb-2">Contatti</h2>
            <p className="mb-1"><strong>Titolare del trattamento:</strong> GeoMondo</p>
            <p>
              <strong>Email:</strong>{' '}
              <a href="mailto:legal@geomondo.it" className="text-it-green hover:underline">
                legal@geomondo.it
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

// ─── English content ──────────────────────────────────────────────────────────

function PrivacyEN() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-background px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-foreground mb-3">Privacy Policy</h1>
          <p className="text-muted text-sm">
            Effective date: <time dateTime="2026-05-29">29 May 2026</time>
          </p>
        </div>

        <div className="space-y-10 text-foreground/90 text-sm leading-relaxed">

          <section>
            <p>
              GeoMondo (&quot;we&quot;, &quot;us&quot;) is a free geography guessing game based in the European Union.
              This policy explains what personal data we
              collect when you use GeoMondo, why we collect it, and what rights you have
              over it.
            </p>
            <p className="mt-3">
              We are subject to the EU General Data Protection Regulation (GDPR). If you
              have questions or requests about your data, contact us at{' '}
              <a href="mailto:legal@geomondo.it" className="text-it-green hover:underline">
                legal@geomondo.it
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">1. What we collect</h2>
            <h3 className="font-semibold text-foreground mb-1">Account data</h3>
            <p className="mb-4">
              If you create an account, we store your email address and a username. If you
              sign in with Google, we also receive your Google display name and profile
              picture URL, which we use to populate your profile. We do not receive your
              Google password.
            </p>
            <h3 className="font-semibold text-foreground mb-1">Game history</h3>
            <p className="mb-4">
              When you complete a game as a logged-in user, we record the geographic
              coordinates of each location shown, the coordinates of your guess, the
              resulting distance and score, the time you spent on each round, the game mode,
              and the timestamp. This data is used to build your profile and the global
              leaderboard.
            </p>
            <h3 className="font-semibold text-foreground mb-1">Technical data</h3>
            <p>
              Our hosting provider (Vercel) and database provider (Supabase) automatically
              collect standard server logs including IP addresses, browser type, and request
              timestamps. We do not collect this data ourselves, but our processors retain
              it for up to 90 days for security and abuse prevention purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">2. Why we collect it and our legal basis</h2>
            <div className="space-y-3">
              <div className="bg-surface border border-border rounded-xl px-4 py-3">
                <p className="font-semibold text-foreground text-xs uppercase tracking-wider mb-1">Contract performance — Art. 6(1)(b) GDPR</p>
                <p>Account data and game history are necessary to provide the service you signed up for: saving your scores, showing your profile, and displaying the leaderboard.</p>
              </div>
              <div className="bg-surface border border-border rounded-xl px-4 py-3">
                <p className="font-semibold text-foreground text-xs uppercase tracking-wider mb-1">Legitimate interest — Art. 6(1)(f) GDPR</p>
                <p>We process technical log data to protect the service from abuse, detect fraud, and maintain security. This interest does not override your rights.</p>
              </div>
              <div className="bg-surface border border-border rounded-xl px-4 py-3">
                <p className="font-semibold text-foreground text-xs uppercase tracking-wider mb-1">Consent — Art. 6(1)(a) GDPR</p>
                <p>If we introduce advertising or analytics in the future, we will ask for your consent before any tracking cookies are set. You can withdraw consent at any time.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">3. Who sees your data</h2>
            <p className="mb-4">We do not sell your data. We share it only with the service providers necessary to run GeoMondo:</p>
            <div className="space-y-2">
              {[
                { name: 'Supabase Inc.', role: 'Database and authentication', location: 'United States', note: 'Covered by Standard Contractual Clauses (SCCs)' },
                { name: 'Vercel Inc.', role: 'Web hosting and edge network', location: 'United States', note: 'Covered by Standard Contractual Clauses (SCCs)' },
                { name: 'Google LLC', role: 'Street View imagery (Maps API) and Google sign-in', location: 'United States', note: 'Covered by Standard Contractual Clauses (SCCs)' },
                { name: 'Meta Platforms (Mapillary)', role: 'Alternative street imagery', location: 'United States', note: 'Covered by Standard Contractual Clauses (SCCs)' },
              ].map(p => (
                <div key={p.name} className="bg-surface border border-border rounded-xl px-4 py-3 flex flex-col gap-0.5">
                  <span className="font-semibold text-foreground">{p.name}</span>
                  <span className="text-muted text-xs">{p.role} · {p.location}</span>
                  <span className="text-muted text-xs">{p.note}</span>
                </div>
              ))}
            </div>
            <p className="mt-4">We may also disclose data if required by law, court order, or to protect the rights and safety of users.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">4. How long we keep your data</h2>
            <p className="mb-2">Account data (email, username, avatar) is retained until you delete your account.</p>
            <p className="mb-2">Game history is retained for up to 24 months, or until you delete your account — whichever comes first.</p>
            <p>Server logs held by our processors (Vercel, Supabase) are retained for up to 90 days.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">5. Cookies</h2>
            <p className="mb-3">GeoMondo currently uses one category of cookie:</p>
            <div className="bg-surface border border-border rounded-xl px-4 py-3 mb-3">
              <p className="font-semibold text-foreground mb-1">Session cookie (strictly necessary)</p>
              <p>Set by Supabase to keep you logged in. This cookie is essential for the service to function. No consent is required under GDPR for strictly necessary cookies.</p>
            </div>
            <p>If we add advertising (Google AdSense) or analytics in the future, a cookie consent banner will appear and no tracking cookies will be set until you accept.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">6. Your rights under GDPR</h2>
            <p className="mb-4">
              As an EU resident you have the following rights. To exercise any of them, email us at{' '}
              <a href="mailto:legal@geomondo.it" className="text-it-green hover:underline">legal@geomondo.it</a>{' '}
              and we will respond within 30 days.
            </p>
            <div className="space-y-2">
              {[
                ['Access (Art. 15)', 'Request a copy of the personal data we hold about you.'],
                ['Rectification (Art. 16)', 'Ask us to correct inaccurate or incomplete data.'],
                ['Erasure (Art. 17)', 'Request that we delete your account and all associated data. We will process erasure requests within 30 days.'],
                ['Restriction (Art. 18)', 'Ask us to temporarily stop processing your data while a dispute is resolved.'],
                ['Portability (Art. 20)', 'Receive your game history in a machine-readable format (JSON).'],
                ['Object (Art. 21)', 'Object to processing based on legitimate interests. We will stop unless we have compelling grounds.'],
                ['Withdraw consent (Art. 7)', 'Where processing is based on consent (e.g. advertising cookies), withdraw at any time without affecting previous processing.'],
              ].map(([right, desc]) => (
                <div key={right} className="bg-surface border border-border rounded-xl px-4 py-3">
                  <p className="font-semibold text-foreground mb-0.5">{right}</p>
                  <p className="text-muted text-xs">{desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-4">
              You also have the right to lodge a complaint with the Italian data protection authority:{' '}
              <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" className="text-it-green hover:underline">
                Garante per la protezione dei dati personali
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">7. Children</h2>
            <p>GeoMondo is not directed at children under 16. We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, please contact us and we will delete it promptly.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">8. Changes to this policy</h2>
            <p>If we make material changes to this policy, we will update the effective date at the top and, where required by law, notify you by email before the changes take effect.</p>
          </section>

          <section className="bg-surface border border-border rounded-2xl px-6 py-5">
            <h2 className="text-base font-bold text-foreground mb-2">Contact</h2>
            <p className="mb-1"><strong>Data controller:</strong> GeoMondo</p>
            <p>
              <strong>Email:</strong>{' '}
              <a href="mailto:legal@geomondo.it" className="text-it-green hover:underline">legal@geomondo.it</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return locale === 'it' ? <PrivacyIT /> : <PrivacyEN />;
}
