import { Link } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'

export default function AGBPage() {
  return (
    <div className="bg-discord-bg text-white px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-discord-muted hover:text-white mb-8 text-sm transition">
          <FaArrowLeft /> Zurück
        </Link>

        <div className="bg-discord-sidebar rounded-2xl p-8 border border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-discord/20 rounded-xl flex items-center justify-center text-discord text-xl">📜</div>
            <h1 className="text-2xl font-bold">AGB / Nutzungsbedingungen</h1>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
            <p className="text-yellow-400 text-sm font-medium">⚠️ Nutzung auf eigene Gefahr</p>
            <p className="text-yellow-400/70 text-xs mt-1">
              Durch die Nutzung dieses Dienstes stimmst du diesen Bedingungen zu.
              Dieses Projekt dient ausschließlich Testzwecken.
            </p>
          </div>

          <div className="space-y-6 text-discord-muted text-sm leading-relaxed">
            <section>
              <h2 className="text-white font-semibold text-base mb-2">§ 1 Geltungsbereich</h2>
              <p>
                Diese Nutzungsbedingungen gelten für die Nutzung des Bot-Dashboards unter rls-nds.eu.
                Es handelt sich um ein privates Testprojekt ohne kommerziellen Zweck.
              </p>
            </section>

            <section>
              <h2 className="text-white font-semibold text-base mb-2">§ 2 Testzwecke</h2>
              <p>
                Dieses Projekt befindet sich in aktiver Entwicklung und dient ausschließlich zu Testzwecken.
                Es wird kein stabiler Betrieb, keine Datensicherheit und keine dauerhafte Verfügbarkeit garantiert.
                Jede Nutzung erfolgt auf eigene Gefahr.
              </p>
            </section>

            <section>
              <h2 className="text-white font-semibold text-base mb-2">§ 3 Haftungsausschluss</h2>
              <p>
                Der Betreiber haftet nicht für:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                <li>Datenverluste jeglicher Art</li>
                <li>Ausfälle oder Unterbrechungen des Dienstes</li>
                <li>Schäden durch Fehlfunktionen des Bots oder Dashboards</li>
                <li>Verluste durch falsche Konfiguration</li>
                <li>Handlungen Dritter</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white font-semibold text-base mb-2">§ 4 Verfügbarkeit</h2>
              <p>
                Ein Anspruch auf Verfügbarkeit des Dienstes besteht nicht.
                Der Dienst kann jederzeit ohne Vorankündigung geändert, eingeschränkt oder eingestellt werden.
              </p>
            </section>

            <section>
              <h2 className="text-white font-semibold text-base mb-2">§ 5 Nutzerpflichten</h2>
              <p>Nutzer verpflichten sich:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                <li>Den Dienst nicht für illegale Zwecke zu nutzen</li>
                <li>Die Discord-Nutzungsbedingungen einzuhalten</li>
                <li>Keine automatisierten Anfragen zu stellen</li>
                <li>Andere Nutzer nicht zu belästigen</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white font-semibold text-base mb-2">§ 6 Änderungen</h2>
              <p>
                Diese Nutzungsbedingungen können jederzeit ohne Vorankündigung geändert werden.
                Die weitere Nutzung des Dienstes gilt als Zustimmung zu den geänderten Bedingungen.
              </p>
            </section>

            <section>
              <h2 className="text-white font-semibold text-base mb-2">§ 7 Discord</h2>
              <p>
                Die Nutzung dieses Dienstes erfordert ein Discord-Konto. Es gelten zusätzlich die{' '}
                <a href="https://discord.com/terms" target="_blank" rel="noreferrer" className="text-discord hover:underline">
                  Nutzungsbedingungen von Discord
                </a>.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 text-discord-muted text-xs">
            Zuletzt aktualisiert: März 2026
          </div>
        </div>
      </div>
    </div>
  )
}

