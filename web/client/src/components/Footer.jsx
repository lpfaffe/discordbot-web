import { Link } from 'react-router-dom'
import { FaDiscord, FaGithub, FaShieldAlt } from 'react-icons/fa'

const DISCORD_SUPPORT = 'https://discord.gg/Uc93Pj7hG3'

export default function Footer() {
  return (
    <footer className="bg-discord-sidebar border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

          {/* Branding */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FaDiscord className="text-discord text-2xl" />
              <span className="text-white font-bold text-lg">Bot Dashboard</span>
            </div>
            <p className="text-discord-muted text-sm leading-relaxed">
              Ein Discord Bot Dashboard für Testzwecke.<br />
              Nutzung auf eigene Gefahr.
            </p>
            <div className="mt-4 flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
              <FaShieldAlt className="text-yellow-400 text-xs flex-shrink-0" />
              <span className="text-yellow-400 text-xs">Nur für Testzwecke – keine Garantien</span>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Rechtliches</h3>
            <ul className="space-y-2">
              <li><Link to="/impressum" className="text-discord-muted hover:text-white text-sm transition">Impressum</Link></li>
              <li><Link to="/datenschutz" className="text-discord-muted hover:text-white text-sm transition">Datenschutz</Link></li>
              <li><Link to="/agb" className="text-discord-muted hover:text-white text-sm transition">AGB / Nutzungsbedingungen</Link></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-discord-muted hover:text-white text-sm transition">Startseite</Link></li>
              <li><Link to="/dashboard" className="text-discord-muted hover:text-white text-sm transition">Dashboard</Link></li>
              <li>
                <a href={DISCORD_SUPPORT} target="_blank" rel="noreferrer"
                  className="text-discord hover:text-white text-sm transition flex items-center gap-1 font-medium">
                  <FaDiscord /> Support-Server
                </a>
              </li>
              <li>
                <a href="https://github.com/lpfaffe/discordbot-web" target="_blank" rel="noreferrer"
                  className="text-discord-muted hover:text-white text-sm transition flex items-center gap-1">
                  <FaGithub className="text-xs" /> GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-discord-muted text-xs">
            © {new Date().getFullYear()} Bot Dashboard – Alle Rechte vorbehalten
          </p>
          <a href={DISCORD_SUPPORT} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 bg-discord/10 hover:bg-discord/20 border border-discord/30 text-discord px-4 py-2 rounded-full text-xs font-medium transition">
            <FaDiscord className="text-sm" />
            Bei Problemen → Discord Support
          </a>
          <p className="text-discord-muted text-xs text-center">
            ⚠️ Nur Testzwecke – Nutzung auf eigene Gefahr
          </p>
        </div>
      </div>
    </footer>
  )
}

