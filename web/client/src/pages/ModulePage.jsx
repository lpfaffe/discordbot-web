import { useParams, Link, Navigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import api from '../api/client'
import toast from 'react-hot-toast'
import ModerationModule from './modules/ModerationModule'
import LevelingModule from './modules/LevelingModule'
import AutomodModule from './modules/AutomodModule'
import WelcomeModule from './modules/WelcomeModule'
import MusicModule from './modules/MusicModule'
import GiveawayModule from './modules/GiveawayModule'
import EconomyModule from './modules/EconomyModule'
import BirthdayModule from './modules/BirthdayModule'
import StarboardModule from './modules/StarboardModule'
import TicketsModule from './modules/TicketsModule'
import CustomCommandsModule from './modules/CustomCommandsModule'
import InviteTrackingModule from './modules/InviteTrackingModule'
import PollsModule from './modules/PollsModule'
import RemindersModule from './modules/RemindersModule'
import TempChannelsModule from './modules/TempChannelsModule'
import StatChannelsModule from './modules/StatChannelsModule'
import NotificationsModule from './modules/NotificationsModule'
import ReactionRolesModule from './modules/ReactionRolesModule'
import AchievementsModule from './modules/AchievementsModule'
import AutomationsModule from './modules/AutomationsModule'
import EmbedBuilderModule from './modules/EmbedBuilderModule'
import SearchModule from './modules/SearchModule'
import MusicQuizModule from './modules/MusicQuizModule'
import CryptoModule from './modules/CryptoModule'
import GatingModule from './modules/GatingModule'
import WelcomeChannelModule from './modules/WelcomeChannelModule'
import MonetizationModule from './modules/MonetizationModule'

const moduleComponents = {
  moderation: ModerationModule,
  leveling: LevelingModule,
  automod: AutomodModule,
  welcome: WelcomeModule,
  music: MusicModule,
  giveaways: GiveawayModule,
  economy: EconomyModule,
  birthdays: BirthdayModule,
  starboard: StarboardModule,
  tickets: TicketsModule,
  customCommands: CustomCommandsModule,
  inviteTracking: InviteTrackingModule,
  polls: PollsModule,
  reminders: RemindersModule,
  tempChannels: TempChannelsModule,
  statChannels: StatChannelsModule,
  notifications: NotificationsModule,
  reactionRoles: ReactionRolesModule,
  achievements: AchievementsModule,
  automations: AutomationsModule,
  embedBuilder: EmbedBuilderModule,
  search: SearchModule,
  musicQuiz: MusicQuizModule,
  crypto: CryptoModule,
  gating: GatingModule,
  welcomeChannel: WelcomeChannelModule,
  monetization: MonetizationModule,
}

const moduleLabels = {
  moderation: 'Moderator', leveling: 'Level', automod: 'Auto-Moderator',
  welcome: 'Begrüßung', music: 'Musik', giveaways: 'Gewinnspiele',
  economy: 'Wirtschaft', birthdays: 'Geburtstage', starboard: 'Starboard',
  tickets: 'Ticketsystem', customCommands: 'Eigene Befehle',
  inviteTracking: 'Einladungen', polls: 'Umfragen', reminders: 'Erinnerungen',
  tempChannels: 'Temp. Kanäle', statChannels: 'Statistik-Kanäle',
  notifications: 'Benachrichtigungen', reactionRoles: 'Reaktionsrollen',
  achievements: 'Errungenschaften', automations: 'Automatisierungen',
  embedBuilder: 'Einbettungen', search: 'Suchen', musicQuiz: 'Musik-Quiz',
  crypto: 'Krypto & NFT', gating: 'Gating', welcomeChannel: 'Willkommenskanal',
  monetization: 'Monetarisierung',
}

// Plan-Zuordnung (identisch mit GuildPage)
const MODULE_PLANS = {
  welcome: 'free', moderation: 'free', search: 'free',
  leveling: 'basic', automod: 'basic', polls: 'basic', embedBuilder: 'basic',
  reminders: 'basic', customCommands: 'basic', inviteTracking: 'basic',
  economy: 'basic', birthdays: 'basic',
  welcomeChannel: 'standard', reactionRoles: 'standard', achievements: 'standard',
  starboard: 'standard', automations: 'standard', tickets: 'standard',
  music: 'standard', statChannels: 'standard', tempChannels: 'standard',
  giveaways: 'standard', musicQuiz: 'standard',
  notifications: 'pro', crypto: 'pro', gating: 'pro', monetization: 'pro',
}
const PLAN_LEVEL = { free: 0, basic: 1, standard: 2, pro: 3 }
const PLAN_INFO = {
  free:     { label: 'Free',     icon: '🆓', color: 'text-discord-muted', bg: 'bg-white/10'       },
  basic:    { label: 'Basic',    icon: '⭐', color: 'text-blue-400',     bg: 'bg-blue-500/20'    },
  standard: { label: 'Standard', icon: '💎', color: 'text-purple-400',   bg: 'bg-purple-500/20'  },
  pro:      { label: 'Pro',      icon: '👑', color: 'text-yellow-400',   bg: 'bg-yellow-500/20'  },
}

export default function ModulePage() {
  const { guildId, module } = useParams()
  const { user, loading } = useAuth()
  const qc = useQueryClient()

  const { data: guildData } = useQuery({
    queryKey: ['guild', guildId],
    queryFn: () => api.get(`/guilds/${guildId}`).then(r => r.data),
    enabled: !!user
  })

  const { data: moduleData, isLoading } = useQuery({
    queryKey: ['module', guildId, module],
    queryFn: () => api.get(`/modules/${guildId}/${module}`).then(r => r.data),
    enabled: !!user
  })

  const toggleMutation = useMutation({
    mutationFn: () => api.post(`/modules/${guildId}/${module}/toggle`),
    onSuccess: (res) => {
      toast.success(`Modul ${res.data.enabled ? 'aktiviert ✅' : 'deaktiviert'}`)
      qc.invalidateQueries({ queryKey: ['module', guildId, module] })
      qc.invalidateQueries({ queryKey: ['guild', guildId] })
    },
    onError: () => toast.error('Fehler beim Umschalten')
  })

  const saveMutation = useMutation({
    mutationFn: (updates) => api.patch(`/modules/${guildId}/${module}`, updates),
    onSuccess: () => {
      toast.success('✅ Gespeichert!')
      qc.invalidateQueries({ queryKey: ['module', guildId, module] })
    },
    onError: () => toast.error('Speichern fehlgeschlagen')
  })

  if (!loading && !user) return <Navigate to="/" />

  const ModuleComponent = moduleComponents[module]
  const config = moduleData?.config || {}
  const guild  = guildData?.guild
  const label  = moduleLabels[module] || module

  // Plan-Check
  const currentPlan    = guild?.plan?.type || 'free'
  const requiredPlan   = MODULE_PLANS[module] || 'free'
  const isLocked       = (PLAN_LEVEL[currentPlan] ?? 0) < (PLAN_LEVEL[requiredPlan] ?? 0)
  const reqPlanInfo    = PLAN_INFO[requiredPlan] || PLAN_INFO.free

  // botInfo normalisieren: egal ob API schon getrennte Arrays liefert oder noch alles in channels[]
  const rawBotInfo = guildData?.botInfo
  const botInfo = rawBotInfo ? {
    ...rawBotInfo,
    // Kategorien (type 4)
    categories:   rawBotInfo.categories   ?? rawBotInfo.channels?.filter(c => c.type === 4) ?? [],
    // Text-Kanäle (type 0, 5, 15)
    textChannels: rawBotInfo.textChannels ?? rawBotInfo.channels?.filter(c => [0,5,15].includes(c.type)) ?? [],
    // Voice-Kanäle (type 2, 13)
    voiceChannels: rawBotInfo.voiceChannels ?? rawBotInfo.channels?.filter(c => [2,13].includes(c.type)) ?? [],
    // channels bleibt als kombiniertes Array für Rückwärtskompatibilität
    channels: rawBotInfo.channels ?? [
      ...(rawBotInfo.categories   ?? []),
      ...(rawBotInfo.textChannels ?? []),
      ...(rawBotInfo.voiceChannels ?? []),
    ],
    roles:   rawBotInfo.roles   ?? [],
    emojis:  rawBotInfo.emojis  ?? [],
  } : null

  return (
    <div className="flex min-h-screen bg-discord-bg">
      <Sidebar guildId={guildId} guildName={guild?.name || '...'} />
      <main className="flex-1 overflow-y-auto">
        {/* Breadcrumb-Header */}
        <div className="sticky top-0 z-10 bg-discord-bg/95 backdrop-blur border-b border-white/5 px-8 py-3 flex items-center gap-2 text-sm">
          <Link to={`/dashboard/${guildId}`} className="text-discord-muted hover:text-white transition truncate max-w-[120px]">
            {guild?.name || 'Server'}
          </Link>
          <span className="text-white/20">›</span>
          <span className="text-white font-medium">{label}</span>

          {/* Modul-Status Badge */}
          {moduleData && (
            <span className={`ml-auto text-xs px-2.5 py-1 rounded-full font-medium ${
              config.enabled ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-discord-muted'
            }`}>
              {config.enabled ? '● Aktiv' : '○ Inaktiv'}
            </span>
          )}
        </div>

        {/* Inhalt */}
        <div className="p-8 max-w-3xl">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[50vh]">
              <div className="text-center space-y-3">
                <div className="animate-spin w-10 h-10 border-4 border-discord border-t-transparent rounded-full mx-auto" />
                <p className="text-discord-muted text-sm">Lade {label}...</p>
              </div>
            </div>
          ) : isLocked ? (
            /* ── Plan-Sperre ── */
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl ${reqPlanInfo.bg}`}>
                🔒
              </div>
              <div>
                <h2 className="text-white text-2xl font-bold mb-2">Upgrade erforderlich</h2>
                <p className="text-discord-muted max-w-sm">
                  Das Modul <strong className="text-white">{label}</strong> ist nur im{' '}
                  <span className={`font-bold ${reqPlanInfo.color}`}>{reqPlanInfo.icon} {reqPlanInfo.label}-Plan</span> verfügbar.
                </p>
              </div>
              <div className={`px-6 py-4 rounded-xl border border-white/10 ${reqPlanInfo.bg}`}>
                <p className={`font-bold text-lg ${reqPlanInfo.color}`}>{reqPlanInfo.icon} {reqPlanInfo.label}-Plan</p>
                <p className="text-discord-muted text-sm mt-1">Kontaktiere einen Admin um deinen Plan zu upgraden.</p>
              </div>
              <div className="flex gap-4 text-sm text-discord-muted">
                <div className="flex items-center gap-1"><span className="text-white/20">🆓</span> Free</div>
                <span className="text-white/20">→</span>
                <div className={`flex items-center gap-1 ${PLAN_LEVEL[currentPlan] >= 1 ? 'text-blue-400' : 'text-white/20'}`}>⭐ Basic</div>
                <span className="text-white/20">→</span>
                <div className={`flex items-center gap-1 ${PLAN_LEVEL[currentPlan] >= 2 ? 'text-purple-400' : 'text-white/20'}`}>💎 Standard</div>
                <span className="text-white/20">→</span>
                <div className={`flex items-center gap-1 ${PLAN_LEVEL[currentPlan] >= 3 ? 'text-yellow-400' : 'text-white/20'}`}>👑 Pro</div>
              </div>
              <Link to={`/dashboard/${guildId}`}
                className="text-discord hover:underline text-sm">← Zurück zur Übersicht</Link>
            </div>
          ) : !ModuleComponent ? (
            <div className="bg-discord-card rounded-xl p-8 text-center">
              <p className="text-4xl mb-3">🔧</p>
              <p className="text-white font-semibold">Modul nicht gefunden</p>
              <p className="text-discord-muted text-sm mt-1">Das Modul <code className="text-discord">"{module}"</code> existiert nicht.</p>
              <Link to={`/dashboard/${guildId}`} className="mt-4 inline-block text-discord hover:underline text-sm">← Zurück zur Übersicht</Link>
            </div>
          ) : (
            <ModuleComponent
              config={config}
              onToggle={() => toggleMutation.mutate()}
              onSave={(updates) => saveMutation.mutate(updates)}
              saving={saveMutation.isPending}
              toggling={toggleMutation.isPending}
              botInfo={botInfo}
              guildId={guildId}
            />
          )}
        </div>
      </main>
    </div>
  )
}
