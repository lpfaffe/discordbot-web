import { Link } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'

export default function ImpressumPage() {
  return (
    <div className="bg-discord-bg text-white px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-discord-muted hover:text-white mb-8 text-sm transition">
          <FaArrowLeft /> Zurück
        </Link>

        <div className="bg-discord-sidebar rounded-2xl p-8 border border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-discord/20 rounded-xl flex items-center justify-center text-discord text-xl">📋</div>
            <h1 className="text-2xl font-bold">Impressum</h1>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
            <p className="text-yellow-400 text-sm font-medium">⚠️ Dieses Projekt ist ein privates Testprojekt</p>
            <p className="text-yellow-400/70 text-xs mt-1">Es handelt sich um kein kommerzielles Angebot. Nutzung auf eigene Gefahr.</p>
          </div>

          <div className="space-y-6 text-discord-muted text-sm leading-relaxed">
            <section>
              <h2 className="text-white font-semibold text-base mb-2">Angaben gemäß § 5 TMG</h2>
              <p>Dieses Projekt wird privat betrieben und dient ausschließlich zu Testzwecken und zur persönlichen Weiterentwicklung.</p>
            </section>

            <section>
              <h2 className="text-white font-semibold text-base mb-2">Kontakt</h2>
              <p>Für Anfragen wende dich bitte über Discord an den Betreiber.</p>
            </section>

            <section>
              <h2 className="text-white font-semibold text-base mb-2">Haftungsausschluss</h2>
              <p>
                Dieses Projekt befindet sich in aktiver Entwicklung. Alle Inhalte, Funktionen und Daten können sich jederzeit ohne Vorankündigung ändern oder entfernt werden.
                Der Betreiber übernimmt keinerlei Haftung für Schäden, Datenverluste oder sonstige Nachteile, die durch die Nutzung dieses Dienstes entstehen.
              </p>
            </section>

            <section>
              <h2 className="text-white font-semibold text-base mb-2">Verfügbarkeit</h2>
              <p>
                Es wird keine Garantie für die Verfügbarkeit, Richtigkeit oder Vollständigkeit der angebotenen Dienste übernommen.
                Der Dienst kann jederzeit ohne Vorankündigung eingestellt werden.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

