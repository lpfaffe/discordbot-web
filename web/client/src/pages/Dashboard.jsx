import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import {
  FaPlus, FaCheckCircle, FaTimesCircle, FaSearch, FaCrown,
  FaShieldAlt, FaUsers, FaDiscord, FaSync, FaUserShield
} from 'react-icons/fa'

export default function Dashboard() {
  const { user, loading } = useAuth()
  const [search, setSearch] = useState('')

  const { data: guilds, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['guilds'],
    queryFn: () => api.get('/guilds').then(r => r.data),
    enabled: !!user,
    refetchInterval: 30000,
  })

  const filtered = useMemo(() => {
    if (!guilds) return []
    if (!search.trim()) return guilds
    return guilds.filter(g => g.name.toLowerCase().includes(search.toLowerCase()))
  }, [guilds, search])

  const botGuilds   = filtered.filter(g => g.botInServer)
  const noBotGuilds = filtered.filter(g => !g.botInServer)
  const teamGuilds  = filtered.filter(g => g.source === 'team')

  if (!loading && !user) return <Navigate to="/" />

  const clientId = import.meta.env.VITE_CLIENT_ID

  return (
    <div className="min-h-screen bg-discord-bg">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-discord/20 to-discord-sidebar border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-4 mb-6">
            {user?.avatar ? (
              <img src={user.avatar} className="w-14 h-14 rounded-full ring-2 ring-discord/50" alt="" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-discord/30 flex items-center justify-center text-2xl">👋</div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-white">Willkommen, {user?.username}!</h1>
              <p className="text-discord-muted">Wähle einen Server um ihn mit dem Bot zu verwalten.</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4 flex-wrap">
            <div className="bg-black/20 rounded-xl px-4 py-3 flex items-center gap-2">
              <FaDiscord className="text-discord text-lg" />
              <div>
                <p className="text-white font-bold text-lg leading-none">{guilds?.length || 0}</p>
                <p className="text-discord-muted text-xs">Server gesamt</p>
              </div>
            </div>
            <div className="bg-black/20 rounded-xl px-4 py-3 flex items-center gap-2">
              <FaCheckCircle className="text-green-400 text-lg" />
              <div>
                <p className="text-white font-bold text-lg leading-none">{botGuilds.length}</p>
                <p className="text-discord-muted text-xs">Bot aktiv</p>
              </div>
            </div>
            {teamGuilds.length > 0 && (
              <div className="bg-black/20 rounded-xl px-4 py-3 flex items-center gap-2">
                <FaUserShield className="text-purple-400 text-lg" />
                <div>
                  <p className="text-white font-bold text-lg leading-none">{teamGuilds.length}</p>
                  <p className="text-discord-muted text-xs">Team-Zugriff</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Suchleiste */}
        <div className="flex items-center gap-3 mb-8">
          <div className="relative flex-1 max-w-sm">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-discord-muted text-sm" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Server suchen..."
              className="w-full bg-discord-sidebar border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm outline-none focus:border-discord/50 transition placeholder-discord-muted"
            />
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 bg-discord-sidebar border border-white/10 hover:border-discord/50 text-discord-muted hover:text-white px-4 py-2.5 rounded-xl text-sm transition disabled:opacity-50"
          >
            <FaSync className={isFetching ? 'animate-spin' : ''} />
            Aktualisieren
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-3">
              <div className="animate-spin w-12 h-12 border-4 border-discord border-t-transparent rounded-full mx-auto" />
              <p className="text-discord-muted">Lade Server...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Bot aktiv */}
            {botGuilds.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xs font-bold text-discord-muted uppercase tracking-widest">Bot aktiv</h2>
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-xs text-green-400">{botGuilds.length} Server</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {botGuilds.map(guild => <GuildCard key={guild.id} guild={guild} clientId={clientId} refetch={refetch} />)}
                </div>
              </section>
            )}

            {/* Kein Bot */}
            {noBotGuilds.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xs font-bold text-discord-muted uppercase tracking-widest">Bot noch nicht eingeladen</h2>
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-xs text-discord-muted">{noBotGuilds.length} Server</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {noBotGuilds.map(guild => <GuildCard key={guild.id} guild={guild} clientId={clientId} refetch={refetch} />)}
                </div>
              </section>
            )}

            {filtered.length === 0 && (
              <div className="text-center py-16">
                <p className="text-5xl mb-4">🔍</p>
                <p className="text-white font-semibold">Kein Server gefunden</p>
                <p className="text-discord-muted text-sm mt-1">Versuche einen anderen Suchbegriff</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function GuildCard({ guild, clientId, refetch }) {
  const ROLE_BADGE = {
    admin:     { label: 'Admin',     color: 'bg-discord/20 text-discord border-discord/30' },
    moderator: { label: 'Moderator', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    viewer:    { label: 'Zuschauer', color: 'bg-white/10 text-discord-muted border-white/20' },
  }

  const roleBadge = guild.teamRole ? ROLE_BADGE[guild.teamRole] : null

  return (
    <div className={`bg-discord-sidebar rounded-2xl overflow-hidden border transition-all group
      ${guild.botInServer
        ? 'border-white/5 hover:border-discord/40 hover:shadow-lg hover:shadow-discord/10'
        : 'border-white/5 hover:border-white/20 opacity-75 hover:opacity-100'
      }`}
    >
      {/* Banner / Icon */}
      <div className="h-20 bg-gradient-to-br from-discord/20 to-discord-bg flex items-center justify-center relative">
        {guild.icon ? (
          <img src={guild.icon} alt={guild.name} className="w-14 h-14 rounded-2xl shadow-lg ring-2 ring-black/20" />
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-discord/30 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {guild.name[0]}
          </div>
        )}

        {/* Status */}
        <span className={`absolute top-2 right-2 flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium border
          ${guild.botInServer
            ? 'bg-green-500/20 text-green-400 border-green-500/30'
            : 'bg-red-500/10 text-red-400/80 border-red-500/20'
          }`}>
          {guild.botInServer ? '● Online' : '○ Kein Bot'}
        </span>

        {/* Team-Badge */}
        {guild.source === 'team' && (
          <span className="absolute top-2 left-2 flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <FaUserShield className="text-[10px]" /> Team
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-white font-semibold text-sm truncate mb-0.5">{guild.name}</h3>
        <div className="flex items-center gap-2 mb-3">
          {roleBadge ? (
            <span className={`text-xs px-2 py-0.5 rounded-full border ${roleBadge.color}`}>{roleBadge.label}</span>
          ) : (
            <span className="text-xs text-discord-muted flex items-center gap-1"><FaCrown className="text-yellow-400 text-[10px]" /> Eigentümer</span>
          )}
        </div>

        {guild.botInServer ? (
          <Link
            to={`/dashboard/${guild.id}`}
            className="w-full block text-center bg-discord hover:bg-discord-dark text-white text-sm py-2 rounded-xl transition font-medium"
          >
            Verwalten →
          </Link>
        ) : (
          <a
            href={`https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands&guild_id=${guild.id}`}
            target="_blank" rel="noreferrer"
            onClick={() => setTimeout(refetch, 5000)}
            className="w-full flex items-center justify-center gap-2 bg-green-600/80 hover:bg-green-600 text-white text-sm py-2 rounded-xl transition font-medium"
          >
            <FaPlus className="text-xs" /> Bot einladen
          </a>
        )}
      </div>
    </div>
  )
}
