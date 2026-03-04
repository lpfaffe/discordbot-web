import { useState, useEffect } from 'react'
import { FaCookieBite, FaShieldAlt, FaExternalLinkAlt, FaDiscord } from 'react-icons/fa'

const DISCORD_SUPPORT = 'https://discord.gg/Uc93Pj7hG3'

export default function CookieBanner() {
  const [show, setShow] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const accepted = localStorage.getItem('cookiesAccepted')
    if (!accepted) setShow(true)
  }, [])

  // Countdown wenn Ablehnen geklickt
  useEffect(() => {
    if (!showWarning) return
    if (countdown <= 0) {
      window.location.href = 'https://www.google.de'
      return
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [showWarning, countdown])

  const accept = () => {
    localStorage.setItem('cookiesAccepted', 'true')
    setShow(false)
  }

  const decline = () => {
    setShowWarning(true)
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-discord-sidebar rounded-2xl w-full max-w-lg border border-white/10 shadow-2xl overflow-hidden">

        {/* Warning-Overlay wenn Ablehnen geklickt */}
        {showWarning && (
          <div className="absolute inset-0 bg-red-900/95 rounded-2xl flex flex-col items-center justify-center p-8 text-center z-10">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-white font-bold text-xl mb-3">Ohne Akzeptieren geht es nicht weiter!</h2>
            <p className="text-red-200 text-sm leading-relaxed mb-4">
              Da du die Bedingungen nicht akzeptiert hast, kannst du diesen Dienst nicht nutzen.
              Der Betreiber übernimmt für nichts eine Garantie – weder für Schäden, Datenverluste noch sonstiges.
            </p>
            <div className="bg-red-800/50 rounded-xl px-6 py-4 mb-6 w-full">
              <p className="text-red-200 text-sm">Du wirst weitergeleitet zu:</p>
              <p className="text-white font-bold text-lg flex items-center justify-center gap-2 mt-1">
                <FaExternalLinkAlt className="text-sm" /> google.de
              </p>
              <p className="text-red-300 text-2xl font-bold mt-2">in {countdown} Sekunden...</p>
            </div>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => { setShowWarning(false); setCountdown(5) }}
                className="flex-1 py-3 rounded-xl border border-white/20 text-white text-sm hover:bg-white/10 transition"
              >
                ← Zurück
              </button>
              <button
                onClick={accept}
                className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-bold transition"
              >
                ✅ Doch akzeptieren
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-discord/10 border-b border-white/5 px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-discord/20 rounded-xl flex items-center justify-center">
            <FaCookieBite className="text-discord text-xl" />
          </div>
          <div>
            <h2 className="text-white font-bold">Cookie & Nutzungshinweis</h2>
            <p className="text-discord-muted text-xs">Bitte lies und akzeptiere vor der Nutzung</p>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4">
          {/* Testprojekt-Warnung */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <FaShieldAlt className="text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-yellow-400 text-sm font-bold">⚠️ Wichtiger Hinweis – Testprojekt</p>
                <p className="text-yellow-400/80 text-xs mt-1 leading-relaxed">
                  Dieses Projekt dient ausschließlich zu <strong>Testzwecken</strong>.
                  Der Betreiber übernimmt <strong>keinerlei Haftung</strong> für Schäden,
                  Datenverluste oder sonstiges. Nutzung auf eigene Gefahr.
                </p>
              </div>
            </div>
          </div>

          {/* Cookie-Info */}
          <div className="text-discord-muted text-sm space-y-2">
            <p>Wir verwenden technisch notwendige Cookies für:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
              <li>Session-Verwaltung (Login via Discord)</li>
              <li>Einstellungen speichern (z.B. diese Zustimmung)</li>
            </ul>
            <p className="text-xs">
              Es werden <strong className="text-white">keine Tracking-Cookies</strong> oder Werbe-Cookies gesetzt.
              Mit dem Klick auf „Akzeptieren" stimmst du unseren{' '}
              <a href="/agb" className="text-discord hover:underline">AGB</a>,{' '}
              <a href="/datenschutz" className="text-discord hover:underline">Datenschutzhinweisen</a>{' '}
              und der Nutzung von Cookies zu.
            </p>
          </div>

          {/* Ablehnen-Warnung */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <p className="text-red-400 text-xs">
              ❌ <strong>Ohne Akzeptieren</strong> kannst du diesen Dienst nicht nutzen und wirst zu Google weitergeleitet.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="px-6 pb-4 flex gap-3">
          <button
            onClick={decline}
            className="flex-1 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm transition"
          >
            ✕ Ablehnen & weiter zu Google
          </button>
          <button
            onClick={accept}
            className="flex-1 py-3 rounded-xl bg-discord hover:bg-discord-dark text-white text-sm font-bold transition shadow-lg shadow-discord/20"
          >
            ✅ Alles akzeptieren
          </button>
        </div>

        {/* Support Link */}
        <div className="px-6 pb-5 text-center">
          <a href={DISCORD_SUPPORT} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 text-discord hover:text-white text-xs transition">
            <FaDiscord />
            Bei Fragen oder Problemen → Discord Support beitreten
          </a>
        </div>
      </div>
    </div>
  )
}

