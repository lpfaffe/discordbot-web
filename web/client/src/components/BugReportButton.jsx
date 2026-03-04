import { useState } from 'react'
import { FaBug, FaTimes, FaPaperPlane, FaDiscord } from 'react-icons/fa'
import api from '../api/client'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const DISCORD_SUPPORT = 'https://discord.gg/Uc93Pj7hG3'

export default function BugReportButton() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [msg, setMsg] = useState('')
  const [sending, setSending] = useState(false)

  const send = async () => {
    if (!msg.trim()) return
    setSending(true)
    try {
      const res = await api.post('/admin/reports', {
        message: msg,
        url: window.location.href
      })
      toast.success(`✅ Report #${res.data.reportId} eingereicht! Danke.`)
      setMsg('')
      setOpen(false)
    } catch {
      toast.error('Fehler beim Senden. Bitte melde dich direkt auf Discord!')
    }
    setSending(false)
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-discord-sidebar hover:bg-discord border border-white/10 hover:border-discord/50 text-discord-muted hover:text-white px-4 py-2.5 rounded-full shadow-lg transition-all group"
        title="Fehler melden"
      >
        <FaBug className="text-sm group-hover:text-white" />
        <span className="text-sm hidden sm:block">Fehler melden</span>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-discord-sidebar rounded-2xl w-full max-w-md p-6 border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold flex items-center gap-2">
                <FaBug className="text-discord" /> Fehler melden
              </h2>
              <button onClick={() => setOpen(false)} className="text-discord-muted hover:text-white transition">
                <FaTimes />
              </button>
            </div>

            {/* Discord Support immer sichtbar */}
            <a href={DISCORD_SUPPORT} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 bg-discord/10 hover:bg-discord/20 border border-discord/30 text-discord px-4 py-2.5 rounded-xl text-sm font-medium transition mb-4">
              <FaDiscord className="text-base" />
              Direkt auf Discord melden → discord.gg/Uc93Pj7hG3
            </a>

            {user ? (
              <>
                <p className="text-discord-muted text-sm mb-3">
                  Oder hier direkt einreichen:
                </p>
                <textarea
                  value={msg}
                  onChange={e => setMsg(e.target.value)}
                  placeholder="Was ist passiert? Welche Aktion hast du ausgeführt?"
                  rows={4}
                  className="w-full bg-discord-bg text-white rounded-xl px-4 py-3 border border-white/10 outline-none focus:border-discord/50 text-sm resize-none placeholder-discord-muted"
                />
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setOpen(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-discord-muted hover:text-white text-sm transition">
                    Abbrechen
                  </button>
                  <button onClick={send} disabled={!msg.trim() || sending}
                    className="flex-1 flex items-center justify-center gap-2 bg-discord hover:bg-discord-dark disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-medium transition">
                    <FaPaperPlane className="text-xs" />
                    {sending ? 'Sende...' : 'Senden'}
                  </button>
                </div>
                <p className="text-discord-muted text-xs text-center mt-3">
                  📍 Seite: <code className="text-discord/80">{window.location.pathname}</code>
                </p>
              </>
            ) : (
              <p className="text-discord-muted text-sm text-center">
                Für das Einreichen über die Webseite bitte zuerst einloggen,<br />
                oder direkt auf Discord melden.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  )
}

