import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { FaDiscord, FaShieldAlt, FaStar, FaRobot, FaMusic } from 'react-icons/fa'

const features = [
  { icon: FaShieldAlt, title: 'Moderation', desc: 'Ban, Kick, Mute, Warn, Purge mit Auto-Aktionen und Log-Channel.' },
  { icon: FaStar, title: 'Leveling', desc: 'XP-System, Level-Rollen und individuelle Leaderboards für deinen Server.' },
  { icon: FaRobot, title: 'Auto-Moderator', desc: 'Anti-Spam, Link-Filter, Wort-Filter und Caps-Filter vollautomatisch.' },
  { icon: FaMusic, title: 'Musik', desc: 'YouTube Musik-Player mit Queue, Loop und Lautstärkeregelung.' },
]

export default function Home() {
  const { user, login } = useAuth()

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="text-center py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-discord rounded-2xl flex items-center justify-center">
              <FaDiscord className="text-white text-5xl" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Dein Discord Bot <span className="text-discord">Dashboard</span>
          </h1>
          <p className="text-discord-muted text-xl mb-8">
            Verwalte deinen Bot mit einem übersichtlichen Dashboard. Moderation, Leveling, Auto-Mod und mehr – alles an einem Ort.
          </p>
          {user ? (
            <Link to="/dashboard" className="inline-flex items-center gap-2 bg-discord hover:bg-discord-dark text-white font-bold px-8 py-4 rounded-xl text-lg transition">
              Zum Dashboard →
            </Link>
          ) : (
            <button onClick={login} className="inline-flex items-center gap-3 bg-discord hover:bg-discord-dark text-white font-bold px-8 py-4 rounded-xl text-lg transition">
              <FaDiscord className="text-2xl" />
              Mit Discord anmelden
            </button>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 pb-24">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Alle Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map(f => (
            <div key={f.title} className="bg-discord-sidebar rounded-xl p-6 flex gap-4 border border-white/5">
              <div className="w-12 h-12 bg-discord/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <f.icon className="text-discord text-xl" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">{f.title}</h3>
                <p className="text-discord-muted mt-1">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

