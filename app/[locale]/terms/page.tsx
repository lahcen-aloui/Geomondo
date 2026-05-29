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
  title: 'Terms of Service',
  description: 'The rules for using GeoMondo.',
};

// ─── Italian content ──────────────────────────────────────────────────────────

function TermsIT() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-background px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-foreground mb-3">Termini di Servizio</h1>
          <p className="text-muted text-sm">
            Data di entrata in vigore: <time dateTime="2026-05-29">29 maggio 2026</time>
          </p>
        </div>

        <div className="space-y-10 text-foreground/90 text-sm leading-relaxed">

          <section>
            <p>
              I presenti Termini di Servizio (&quot;Termini&quot;) disciplinano l&apos;accesso e l&apos;utilizzo
              di GeoMondo (&quot;il Servizio&quot;, &quot;noi&quot;). Giocando a
              GeoMondo o creando un account, accetti questi Termini. Se non li accetti, non
              utilizzare il Servizio.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">1. Requisiti di età</h2>
            <p>
              Devi avere almeno 16 anni per creare un account. Registrandoti, confermi di
              soddisfare questo requisito. Se veniamo a conoscenza che un account appartiene
              a un minore di 16 anni, lo elimineremo.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">2. Il tuo account</h2>
            <p className="mb-3">
              Sei responsabile della sicurezza delle credenziali del tuo account. Non puoi
              condividere il tuo account con altri o trasferirlo a terzi.
            </p>
            <p className="mb-3">
              Il tuo nome utente non deve impersonare un&apos;altra persona, contenere
              linguaggio d&apos;odio, insulti o contenuti sessualmente espliciti, violenti o
              altrimenti offensivi. Ci riserviamo il diritto di modificare o rimuovere un
              nome utente che violi queste regole senza preavviso.
            </p>
            <p>
              Puoi eliminare il tuo account in qualsiasi momento contattandoci a{' '}
              <a href="mailto:legal@geomondo.it" className="text-it-green hover:underline">
                legal@geomondo.it
              </a>. Elaboreremo le richieste di cancellazione entro 30 giorni.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">3. Uso consentito</h2>
            <p className="mb-3">Accetti di non:</p>
            <div className="space-y-2">
              {[
                'Utilizzare script automatizzati, bot o strumenti per inviare punteggi, manipolare la classifica o effettuare richieste API eccessive.',
                'Tentare di decompilare, fare reverse engineering o estrarre il dataset di coordinate o qualsiasi altro dato proprietario dal Servizio.',
                'Sfruttare bug o comportamenti non intenzionali per ottenere un vantaggio sleale. Se scopri una vulnerabilità, segnalacela.',
                'Utilizzare il Servizio in modo contrario a qualsiasi legge applicabile, incluse quelle relative alla privacy, alla proprietà intellettuale o all\'accesso informatico.',
                'Tentare di interrompere, sovraccaricare o interferire con il Servizio o la sua infrastruttura sottostante.',
                'Creare più account per aggirare un ban o un limite in classifica.',
              ].map(rule => (
                <div key={rule.slice(0, 30)} className="flex gap-3 bg-surface border border-border rounded-xl px-4 py-3">
                  <span className="text-it-red mt-0.5 flex-shrink-0">✕</span>
                  <p>{rule}</p>
                </div>
              ))}
            </div>
            <p className="mt-4">
              Le violazioni possono comportare la rimozione del punteggio, la sospensione
              dell&apos;account o un ban permanente a nostra discrezione.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">4. Punteggi e classifica</h2>
            <p className="mb-3">
              Tutti i punteggi sono calcolati lato server dai dati grezzi dei round inviati.
              Ci riserviamo il diritto di rimuovere qualsiasi punteggio ottenuto in modo
              fraudolento o tramite exploit tecnici, con o senza preavviso.
            </p>
            <p>
              Le classifiche sono a scopo di intrattenimento. Non hanno valore monetario e
              non possono essere trasferite, vendute o riscattate.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">5. Proprietà intellettuale</h2>
            <p className="mb-3">
              Il nome GeoMondo, il logo, il design e il codice originale sono di nostra
              proprietà intellettuale. Il motore di gioco principale è open source e ispirato
              a{' '}
              <a href="https://github.com/codergautam/worldguessr" target="_blank" rel="noopener noreferrer" className="text-it-green hover:underline">
                WorldGuessr
              </a>{' '}
              (licenza MIT).
            </p>
            <p className="mb-3">
              Le immagini Street View sono fornite da Google LLC e sono soggette ai{' '}
              <a href="https://maps.google.com/help/terms_maps/" target="_blank" rel="noopener noreferrer" className="text-it-green hover:underline">
                Termini di Servizio di Google Maps Platform
              </a>. Le immagini alternative sono fornite da Mapillary (Meta Platforms) con
              licenza Creative Commons CC BY-SA 4.0.
            </p>
            <p>
              Non puoi riprodurre, distribuire o creare opere derivate da contenuti di
              GeoMondo senza il nostro consenso scritto.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">6. Servizi di terze parti</h2>
            <p>
              GeoMondo si affida a fornitori terzi tra cui Google (Maps, OAuth), Supabase
              (database e autenticazione) e Vercel (hosting). L&apos;utilizzo del Servizio è
              soggetto anche ai termini di tali fornitori. Non siamo responsabili di
              modifiche, interruzioni o decisioni prese da tali terze parti.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">7. Esclusioni di garanzia</h2>
            <p className="mb-3">
              GeoMondo è fornito &quot;così com&apos;è&quot; e &quot;nella misura in cui è disponibile&quot; senza
              garanzie di alcun tipo, espresse o implicite. Non garantiamo che il Servizio
              sia ininterrotto, privo di errori o di componenti dannosi.
            </p>
            <p>
              I dati di localizzazione geografica sono utilizzati solo a scopo di
              intrattenimento. Non forniamo alcuna garanzia sulla loro accuratezza.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">8. Limitazione di responsabilità</h2>
            <p>
              Nella misura massima consentita dalla legge applicabile, non siamo responsabili
              per danni indiretti, incidentali, speciali o consequenziali derivanti dall&apos;uso
              — o dall&apos;impossibilità di usare — GeoMondo. Poiché il Servizio è fornito
              gratuitamente, la nostra responsabilità totale nei tuoi confronti per qualsiasi
              reclamo non supererà €10.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">9. Legge applicabile e controversie</h2>
            <p className="mb-3">
              I presenti Termini sono disciplinati dalla legge italiana e dalle normative UE
              applicabili. Qualsiasi controversia derivante da questi Termini o dall&apos;utilizzo
              di GeoMondo sarà soggetta alla giurisdizione esclusiva dei tribunali italiani,
              salvo che la legge obbligatoria a tutela dei consumatori del tuo paese di
              residenza non disponga diversamente.
            </p>
            <p>
              I residenti nell&apos;UE possono anche utilizzare la{' '}
              <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-it-green hover:underline">
                piattaforma di risoluzione online delle controversie
              </a>{' '}
              della Commissione europea.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">10. Modifiche ai Termini</h2>
            <p>
              Potremmo aggiornare questi Termini di volta in volta. In caso di modifiche
              sostanziali, aggiorneremo la data di entrata in vigore e notificheremo gli
              utenti registrati via email almeno 14 giorni prima che entrino in vigore. Il
              proseguimento dell&apos;utilizzo del Servizio dopo tale data costituisce
              accettazione dei Termini aggiornati.
            </p>
          </section>

          <section className="bg-surface border border-border rounded-2xl px-6 py-5">
            <h2 className="text-base font-bold text-foreground mb-2">Contatti</h2>
            <p className="mb-1"><strong>Gestore:</strong> GeoMondo</p>
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

function TermsEN() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-background px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-foreground mb-3">Terms of Service</h1>
          <p className="text-muted text-sm">
            Effective date: <time dateTime="2026-05-29">29 May 2026</time>
          </p>
        </div>

        <div className="space-y-10 text-foreground/90 text-sm leading-relaxed">

          <section>
            <p>
              These Terms of Service (&quot;Terms&quot;) govern your access to and use of GeoMondo
              (&quot;the Service&quot;, &quot;we&quot;, &quot;us&quot;). By playing GeoMondo
              or creating an account, you agree to these Terms. If you do not agree, do not
              use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">1. Eligibility</h2>
            <p>
              You must be at least 16 years old to create an account. By registering, you
              confirm that you meet this requirement. If we become aware that an account
              belongs to someone under 16, we will delete it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">2. Your account</h2>
            <p className="mb-3">
              You are responsible for keeping your account credentials secure. You may not
              share your account with others or transfer it to anyone else.
            </p>
            <p className="mb-3">
              Your username must not impersonate another person, contain hate speech, slurs,
              or content that is sexually explicit, violent, or otherwise offensive. We may
              change or remove a username that violates these rules without notice.
            </p>
            <p>
              You may delete your account at any time by contacting us at{' '}
              <a href="mailto:legal@geomondo.it" className="text-it-green hover:underline">
                legal@geomondo.it
              </a>. We will process deletion requests within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">3. Acceptable use</h2>
            <p className="mb-3">You agree not to:</p>
            <div className="space-y-2">
              {[
                'Use automated scripts, bots, or tools to submit game scores, manipulate the leaderboard, or make excessive API requests.',
                'Attempt to reverse-engineer, decompile, or extract the coordinate dataset or any other proprietary data from the Service.',
                'Exploit bugs or unintended behaviour to gain an unfair advantage. If you find a vulnerability, please report it to us instead.',
                'Use the Service in a way that violates any applicable law, including laws relating to privacy, intellectual property, or computer access.',
                'Attempt to disrupt, overload, or interfere with the Service or its underlying infrastructure.',
                'Create multiple accounts to circumvent a ban or leaderboard limit.',
              ].map(rule => (
                <div key={rule.slice(0, 30)} className="flex gap-3 bg-surface border border-border rounded-xl px-4 py-3">
                  <span className="text-it-red mt-0.5 flex-shrink-0">✕</span>
                  <p>{rule}</p>
                </div>
              ))}
            </div>
            <p className="mt-4">
              Violations may result in score removal, account suspension, or a permanent
              ban at our discretion.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">4. Scores and leaderboard</h2>
            <p className="mb-3">
              All scores are calculated server-side from the raw round data you submit. We
              reserve the right to remove any score that we determine was achieved
              fraudulently or through a technical exploit, with or without prior notice.
            </p>
            <p>
              Leaderboard rankings are for entertainment purposes only. They carry no
              monetary value and cannot be transferred, sold, or redeemed.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">5. Intellectual property</h2>
            <p className="mb-3">
              The GeoMondo name, logo, design, and original code are our intellectual
              property. The core game engine is open source and inspired by{' '}
              <a href="https://github.com/codergautam/worldguessr" target="_blank" rel="noopener noreferrer" className="text-it-green hover:underline">
                WorldGuessr
              </a>{' '}
              (MIT licence).
            </p>
            <p className="mb-3">
              Street View imagery is provided by Google LLC and is subject to{' '}
              <a href="https://maps.google.com/help/terms_maps/" target="_blank" rel="noopener noreferrer" className="text-it-green hover:underline">
                Google Maps Platform Terms of Service
              </a>. Alternative imagery is provided by Mapillary (Meta Platforms) under a
              Creative Commons CC BY-SA 4.0 licence.
            </p>
            <p>
              You may not reproduce, distribute, or create derivative works from any
              GeoMondo content without our written permission.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">6. Third-party services</h2>
            <p>
              GeoMondo relies on third-party providers including Google (Maps, OAuth),
              Supabase (database and authentication), and Vercel (hosting). Your use of the
              Service is also subject to the terms of those providers. We are not responsible
              for any changes, outages, or decisions made by those third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">7. Disclaimers</h2>
            <p className="mb-3">
              GeoMondo is provided <strong>&quot;as is&quot;</strong> and{' '}
              <strong>&quot;as available&quot;</strong> without warranties of any kind. We do not
              guarantee that the Service will be uninterrupted, error-free, or free of
              harmful components.
            </p>
            <p>Geographic location data is used for entertainment purposes only. We make no representations about its accuracy.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">8. Limitation of liability</h2>
            <p>
              To the fullest extent permitted by applicable law, we are not liable for any
              indirect, incidental, special, or consequential damages arising from your use
              of — or inability to use — GeoMondo. Because the Service is provided free of
              charge, our total liability to you for any claim shall not exceed €10.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">9. Governing law and disputes</h2>
            <p className="mb-3">
              These Terms are governed by Italian law and applicable EU regulations. Any
              dispute arising from these Terms or your use of GeoMondo shall be subject to
              the exclusive jurisdiction of the courts of Italy, unless mandatory consumer
              protection law in your country of residence provides otherwise.
            </p>
            <p>
              EU residents may also use the European Commission&apos;s{' '}
              <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-it-green hover:underline">
                Online Dispute Resolution platform
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">10. Changes to these Terms</h2>
            <p>
              We may update these Terms from time to time. If the changes are material, we
              will update the effective date at the top and notify registered users by email
              at least 14 days before they take effect. Continued use of the Service after
              that date constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section className="bg-surface border border-border rounded-2xl px-6 py-5">
            <h2 className="text-base font-bold text-foreground mb-2">Contact</h2>
            <p className="mb-1"><strong>Operator:</strong> GeoMondo</p>
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return locale === 'it' ? <TermsIT /> : <TermsEN />;
}
