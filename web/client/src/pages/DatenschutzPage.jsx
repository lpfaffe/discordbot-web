import { Link } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'

export default function DatenschutzPage() {
  return (
    <div className="bg-discord-bg text-white px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-discord-muted hover:text-white mb-8 text-sm transition">
          <FaArrowLeft /> Zurück
        </Link>

        <div className="bg-discord-sidebar rounded-2xl p-8 border border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-discord/20 rounded-xl flex items-center justify-center text-discord text-xl">🔒</div>
            <h1 className="text-2xl font-bold">Datenschutzerklärung</h1>
          </div>

          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
            <p className="text-red-400 text-sm font-medium">⚠️ Kein Datenschutz garantiert</p>
            <p className="text-red-400/70 text-xs mt-1">
              Dieses Projekt ist ein Testprojekt. Es wird keinerlei Datenschutz garantiert.
              Nutze diesen Dienst nur wenn du damit einverstanden bist.
            </p>
          </div>

          <div className="space-y-6 text-discord-muted text-sm leading-relaxed">
            <section>
              <h2 className="text-white font-semibold text-base mb-2">1. Welche Daten werden gespeichert?</h2>
              <p>Bei der Nutzung dieses Dienstes werden folgende Daten über dein Discord-Konto gespeichert:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                <li>Discord-Benutzer-ID</li>
                <li>Discord-Benutzername</li>
                <li>Discord-Avatar</li>
                <li>Liste deiner Discord-Server</li>
                <li>OAuth2 Access Token (temporär)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white font-semibold text-base mb-2">2. Zweck der Datenspeicherung</h2>
              <p>Die Daten werden ausschließlich für die Funktion des Bot-Dashboards verwendet (Login, Servereinstellungen). Eine Weitergabe an Dritte findet nicht statt.</p>
            </section>

            <section>
              <h2 className="text-white font-semibold text-base mb-2">3. Cookies & Sessions</h2>
              <p>Für die Anmeldung werden Session-Cookies verwendet. Diese sind technisch notwendig und werden nach dem Logout oder nach 7 Tagen gelöscht.</p>
            </section>

            <section>
              <h2 className="text-white font-semibold text-base mb-2">4. Keine Garantie</h2>
              <p>
                Da es sich um ein Testprojekt handelt, wird <strong className="text-white">keinerlei Datenschutz garantiert</strong>.
                Daten können jederzeit verloren gehen, eingesehen oder gelöscht werden.
                Nutze diesen Dienst nur mit diesem Wissen.
              </p>
            </section>

            <section>
              <h2 className="text-white font-semibold text-base mb-2">5. Datenlöschung</h2>
              <p>Du kannst jederzeit die Löschung deiner Daten verlangen, indem du dich über Discord an den Betreiber wendest.</p>
            </section>

            <section>
              <h2 className="text-white font-semibold text-base mb-2">6. Discord</h2>
              <p>
                Für die Anmeldung wird Discord OAuth2 genutzt. Dabei gelten zusätzlich die{' '}
                <a href="https://discord.com/privacy" target="_blank" rel="noreferrer" className="text-discord hover:underline">
                  Datenschutzrichtlinien von Discord
                </a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

