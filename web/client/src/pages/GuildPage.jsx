import { useParams, Navigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import ModuleCard from '../components/ModuleCard'
import api from '../api/client'
import {
  FaShieldAlt, FaStar, FaRobot, FaMusic, FaDoorOpen,
  FaTicketAlt, FaHeart, FaCoins, FaTerminal, FaUserPlus,
  FaPoll, FaVolumeUp, FaBell, FaChartBar, FaTwitch, FaGift,
  FaBirthdayCake, FaTrophy, FaBolt, FaFileAlt, FaSearch,
  FaHeadphones, FaBitcoin, FaLock, FaDollarSign, FaHashtag,
  FaUsers, FaServer, FaCheckCircle, FaTimesCircle
} from 'react-icons/fa'

// Plan-Hierarchie: free < basic < standard < pro
const PLAN_LEVEL = { free: 0, basic: 1, standard: 2, pro: 3 }

// Alle einzigartigen Module mit eindeutiger ID + benötigter Plan
const ALL_MODULES = [
  // Grundlegendes
  { id: 'welcome',        title: 'Begrüßung',               desc: 'Willkommens- & Verabschiedungsnachrichten automatisch senden.',    icon: FaDoorOpen,     category: 'Grundlegendes',    plan: 'free'     },
  { id: 'welcomeChannel', title: 'Willkommenskanal',         desc: 'Spezieller Kanal zur Begrüßung neuer Mitglieder.',                 icon: FaHashtag,      category: 'Grundlegendes',    plan: 'standard' },
  { id: 'reactionRoles',  title: 'Reaktionsrollen',          desc: 'Rollen per Emoji-Reaktion auf Nachrichten vergeben.',             icon: FaHeart,        category: 'Grundlegendes',    plan: 'standard' },
  { id: 'moderation',     title: 'Moderator',                desc: 'Ban, Kick, Mute, Warn, Lock und mehr mit Logs.',                  icon: FaShieldAlt,    category: 'Grundlegendes',    plan: 'free'     },
  { id: 'leveling',       title: 'Level',                    desc: 'XP-System, Rangliste und Level-Rollen.',                          icon: FaStar,         category: 'Grundlegendes',    plan: 'basic'    },
  { id: 'achievements',   title: 'Errungenschaften',          desc: 'Mitglieder für Aktivität mit Abzeichen belohnen.',                icon: FaTrophy,       category: 'Grundlegendes',    plan: 'standard' },
  { id: 'starboard',      title: 'Starboard',                desc: 'Beliebte Nachrichten in einem Kanal hervorheben.',                icon: FaStar,         category: 'Grundlegendes',    plan: 'standard' },
  // Server-Verwaltung
  { id: 'automations',    title: 'Automatisierungen',         desc: 'Bot-Aktionen bei Ereignissen automatisch ausführen.',             icon: FaBolt,         category: 'Server-Verwaltung', plan: 'standard' },
  { id: 'automod',        title: 'Auto-Moderator',           desc: 'Automatischer Spam-, Link- und Wort-Filter.',                     icon: FaRobot,        category: 'Server-Verwaltung', plan: 'basic'    },
  { id: 'customCommands', title: 'Eigene Befehle',            desc: 'Erstelle eigene Textbefehle mit !name.',                          icon: FaTerminal,     category: 'Server-Verwaltung', plan: 'basic'    },
  { id: 'inviteTracking', title: 'Einladungsverfolgung',      desc: 'Verfolge wer wen eingeladen hat.',                                icon: FaUserPlus,     category: 'Server-Verwaltung', plan: 'basic'    },
  { id: 'tickets',        title: 'Ticketsystem',              desc: 'Support-Tickets für Mitglieder erstellen.',                      icon: FaTicketAlt,    category: 'Server-Verwaltung', plan: 'standard' },
  // Werkzeuge
  { id: 'music',          title: 'Musik',                    desc: 'YouTube Musik-Player im Sprachkanal.',                            icon: FaMusic,        category: 'Werkzeuge',         plan: 'standard' },
  { id: 'polls',          title: 'Umfragen',                  desc: 'Abstimmungen mit /poll erstellen.',                               icon: FaPoll,         category: 'Werkzeuge',         plan: 'basic'    },
  { id: 'embedBuilder',   title: 'Einbettungen',              desc: 'Schöne Embed-Nachrichten per Dashboard erstellen.',               icon: FaFileAlt,      category: 'Werkzeuge',         plan: 'basic'    },
  { id: 'search',         title: 'Suchen',                    desc: 'YouTube, Twitch, Anime & mehr suchen.',                           icon: FaSearch,       category: 'Werkzeuge',         plan: 'free'     },
  { id: 'reminders',      title: 'Erinnerungen',              desc: 'Automatische Nachrichten im Intervall senden.',                   icon: FaBell,         category: 'Werkzeuge',         plan: 'basic'    },
  { id: 'statChannels',   title: 'Statistik-Kanäle',          desc: 'Server-Statistiken in Sprachkanälen anzeigen.',                  icon: FaChartBar,     category: 'Werkzeuge',         plan: 'standard' },
  { id: 'tempChannels',   title: 'Temporäre Kanäle',          desc: 'Eigene Sprachkanäle für Mitglieder auf Knopfdruck.',              icon: FaVolumeUp,     category: 'Werkzeuge',         plan: 'standard' },
  // Spiele & Spaß
  { id: 'economy',        title: 'Wirtschaft',                desc: 'Coins-System mit daily, work und Rangliste.',                    icon: FaCoins,        category: 'Spiele & Spaß',     plan: 'basic'    },
  { id: 'giveaways',      title: 'Gewinnspiele',              desc: 'Gewinnspiele mit /giveaway starten.',                             icon: FaGift,         category: 'Spiele & Spaß',     plan: 'standard' },
  { id: 'birthdays',      title: 'Geburtstage',               desc: 'Automatische Geburtstagsnachrichten.',                           icon: FaBirthdayCake, category: 'Spiele & Spaß',     plan: 'basic'    },
  { id: 'musicQuiz',      title: 'Musik-Quiz',                desc: 'Lieder raten im Sprachkanal.',                                   icon: FaHeadphones,   category: 'Spiele & Spaß',     plan: 'standard' },
  // Soziales & Web3
  { id: 'notifications',  title: 'Benachrichtigungen',        desc: 'Twitch, YouTube, Reddit, TikTok, RSS & mehr.',                   icon: FaTwitch,       category: 'Soziales & Web3',   plan: 'pro'      },
  { id: 'crypto',         title: 'Krypto & NFT',              desc: 'Kryptopreise, NFT-Statistiken & Gas-Tracker.',                   icon: FaBitcoin,      category: 'Soziales & Web3',   plan: 'pro'      },
  { id: 'gating',         title: 'Gating',                    desc: 'NFT/Token-Inhabern Rollen automatisch vergeben.',                icon: FaLock,         category: 'Soziales & Web3',   plan: 'pro'      },
  { id: 'monetization',   title: 'Monetarisierung',           desc: 'Mit dem Server Geld verdienen.',                                  icon: FaDollarSign,   category: 'Soziales & Web3',   plan: 'pro'      },
]

const CATEGORIES = ['Grundlegendes', 'Server-Verwaltung', 'Werkzeuge', 'Spiele & Spaß', 'Soziales & Web3']

export default function GuildPage() {
  const { guildId } = useParams()
  const { user, loading } = useAuth()

  const { data, isLoading, error } = useQuery({
    queryKey: ['guild', guildId],
    queryFn: () => api.get(`/guilds/${guildId}`).then(r => r.data),
    enabled: !!user
  })

  if (!loading && !user) return <Navigate to="/" />
  if (isLoading) return (
    <div className="flex items-center justify-center bg-discord-bg">
      <div className="text-center space-y-3">
        <div className="animate-spin w-12 h-12 border-4 border-discord border-t-transparent rounded-full mx-auto" />
        <p className="text-discord-muted">Lade Server-Daten...</p>
      </div>
    </div>
  )
  if (error) return (
    <div className="flex items-center justify-center bg-discord-bg">
      <div className="text-center space-y-2">
        <p className="text-red-400 text-lg">❌ Fehler beim Laden</p>
        <p className="text-discord-muted text-sm">{error.message}</p>
      </div>
    </div>
  )

  const { guild, botInfo } = data || {}
  const modules = guild?.modules || {}
  const plan = guild?.plan?.type || 'free'

  const PLAN_STYLES = {
    free:     { label: '🆓 Free',     cls: 'bg-white/10 text-discord-muted' },
    basic:    { label: '⭐ Basic',    cls: 'bg-blue-500/20 text-blue-400' },
    standard: { label: '💎 Standard', cls: 'bg-purple-500/20 text-purple-400' },
    pro:      { label: '👑 Pro',      cls: 'bg-yellow-500/20 text-yellow-400' },
  }
  const planStyle = PLAN_STYLES[plan] || PLAN_STYLES.free

  const activeCount = ALL_MODULES.filter(m => modules[m.id]?.enabled).length
  const totalCount = ALL_MODULES.length

  return (
    <div className="flex bg-discord-bg">
      <Sidebar guildId={guildId} guildName={guild?.name || 'Server'} />
      <main className="flex-1 overflow-y-auto">

        {/* Header */}
        <div className="border-b border-white/5 bg-discord-sidebar/50">
          <div className="px-8 py-6 flex items-center gap-5">
            {(botInfo?.icon || guild?.icon) ? (
              <img src={botInfo?.icon || guild?.icon} className="w-16 h-16 rounded-2xl ring-2 ring-discord/30 shadow-lg" alt="" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-discord/20 flex items-center justify-center text-2xl">🤖</div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">{guild?.name || 'Server'}</h1>
              <p className="text-discord-muted text-sm mt-0.5">
                {botInfo?.memberCount ? `${botInfo.memberCount.toLocaleString()} Mitglieder` : 'Bot online ✅'}
              </p>
            </div>
            {/* Quick-Stats */}
            <div className="flex gap-3">
              <div className={`rounded-xl px-4 py-3 text-center min-w-[80px] border border-white/5 ${planStyle.cls}`}>
                <p className="font-bold text-lg leading-none">{planStyle.label.split(' ')[0]}</p>
                <p className="text-xs opacity-70 mt-1">{planStyle.label.split(' ')[1]}</p>
              </div>
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-center min-w-[80px]">
                <p className="text-green-400 font-bold text-xl">{activeCount}</p>
                <p className="text-green-400/70 text-xs">Aktiv</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center min-w-[80px]">
                <p className="text-white font-bold text-xl">{totalCount - activeCount}</p>
                <p className="text-discord-muted text-xs">Inaktiv</p>
              </div>
            </div>
          </div>
        </div>

        {/* Module nach Kategorien */}
        <div className="px-8 py-6 space-y-8">

          {/* Upgrade-Banner wenn nicht Pro */}
          {plan !== 'pro' && (
            <div className={`rounded-xl p-4 border flex items-center gap-4
              ${plan === 'free'     ? 'bg-blue-500/5 border-blue-500/20'   : ''}
              ${plan === 'basic'    ? 'bg-purple-500/5 border-purple-500/20' : ''}
              ${plan === 'standard' ? 'bg-yellow-500/5 border-yellow-500/20' : ''}
            `}>
              <div className="text-2xl">
                {plan === 'free' ? '⭐' : plan === 'basic' ? '💎' : '👑'}
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-semibold">
                  {plan === 'free'     && 'Upgrade auf Basic, Standard oder Pro'}
                  {plan === 'basic'    && 'Upgrade auf Standard oder Pro'}
                  {plan === 'standard' && 'Upgrade auf Pro'}
                </p>
                <p className="text-discord-muted text-xs mt-0.5">
                  {ALL_MODULES.filter(m => PLAN_LEVEL[m.plan] > PLAN_LEVEL[plan]).length} Module sind mit deinem aktuellen Plan gesperrt
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {plan === 'free' && <>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">⭐ Basic</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400">💎 Standard</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400">👑 Pro</span>
                </>}
                {plan === 'basic' && <>
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400">💎 Standard</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400">👑 Pro</span>
                </>}
                {plan === 'standard' && <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400">👑 Pro</span>}
              </div>
            </div>
          )}
          {CATEGORIES.map(cat => {
            const catMods = ALL_MODULES.filter(m => m.category === cat)
            const catActive = catMods.filter(m => modules[m.id]?.enabled).length
            return (
              <div key={cat}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xs font-bold text-discord-muted uppercase tracking-widest">{cat}</h2>
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-xs text-discord-muted">{catActive}/{catMods.length} aktiv</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {catMods.map(m => (
                    <ModuleCard
                      key={m.id}
                      title={m.title}
                      desc={m.desc}
                      icon={m.icon}
                      guildId={guildId}
                      moduleId={m.id}
                      enabled={modules[m.id]?.enabled || false}
                      requiredPlan={m.plan}
                      currentPlan={plan}
                      planLevel={PLAN_LEVEL}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
