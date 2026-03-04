import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import api from '../api/client'
import toast from 'react-hot-toast'
import { FaUserShield, FaTrash, FaPlus, FaCrown, FaShieldAlt, FaEye } from 'react-icons/fa'

const ROLES = [
  { value: 'admin',     label: 'Admin',      desc: 'Kann alles – Module, Einstellungen, Team verwalten', icon: FaCrown,     color: 'text-discord' },
  { value: 'moderator', label: 'Moderator',  desc: 'Kann Module aktivieren und Einstellungen ändern',    icon: FaShieldAlt, color: 'text-purple-400' },
  { value: 'viewer',    label: 'Zuschauer',  desc: 'Kann nur lesen, nichts ändern',                       icon: FaEye,       color: 'text-discord-muted' },
]

export default function TeamPage() {
  const { guildId } = useParams()
  const { user } = useAuth()
  const qc = useQueryClient()
  const [newId, setNewId]     = useState('')
  const [newRole, setNewRole] = useState('moderator')
  const [adding, setAdding]   = useState(false)

  const { data: guildData } = useQuery({
    queryKey: ['guild', guildId],
    queryFn: () => api.get(`/guilds/${guildId}`).then(r => r.data),
    enabled: !!user
  })

  const { data: teamData, isLoading } = useQuery({
    queryKey: ['team', guildId],
    queryFn: () => api.get(`/guilds/${guildId}/team`).then(r => r.data),
    enabled: !!user
  })

  const addMutation = useMutation({
    mutationFn: () => api.post(`/guilds/${guildId}/team`, { discordId: newId.trim(), role: newRole }),
    onSuccess: (res) => {
      toast.success(`✅ ${res.data.member?.username || newId} hinzugefügt!`)
      setNewId(''); setAdding(false)
      qc.invalidateQueries({ queryKey: ['team', guildId] })
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Fehler beim Hinzufügen')
  })

  const removeMutation = useMutation({
    mutationFn: (memberId) => api.delete(`/guilds/${guildId}/team/${memberId}`),
    onSuccess: () => { toast.success('Team-Mitglied entfernt'); qc.invalidateQueries({ queryKey: ['team', guildId] }) },
    onError: () => toast.error('Fehler beim Entfernen')
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ memberId, role }) => api.patch(`/guilds/${guildId}/team/${memberId}`, { role }),
    onSuccess: () => { toast.success('Rolle aktualisiert'); qc.invalidateQueries({ queryKey: ['team', guildId] }) },
    onError: () => toast.error('Fehler beim Aktualisieren')
  })

  const guild      = guildData?.guild
  const team       = teamData?.team || []
  const myRole     = guildData?.teamRole || 'admin'
  const canManage  = myRole === 'admin'

  return (
    <div className="flex min-h-screen bg-discord-bg">
      <Sidebar guildId={guildId} guildName={guild?.name || '...'} />
      <main className="flex-1 overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 z-10 bg-discord-bg/95 backdrop-blur border-b border-white/5 px-8 py-3 flex items-center gap-2 text-sm">
          <Link to={`/dashboard/${guildId}`} className="text-discord-muted hover:text-white transition">
            {guild?.name || 'Server'}
          </Link>
          <span className="text-white/20">›</span>
          <span className="text-white font-medium flex items-center gap-1.5">
            <FaUserShield className="text-purple-400" /> Team-Verwaltung
          </span>
          <span className={`ml-auto text-xs px-2.5 py-1 rounded-full border
            ${myRole === 'admin' ? 'bg-discord/20 text-discord border-discord/30' : 'bg-purple-500/20 text-purple-400 border-purple-500/30'}`}>
            Deine Rolle: {ROLES.find(r => r.value === myRole)?.label || myRole}
          </span>
        </div>

        <div className="p-8 max-w-2xl space-y-6">

          {/* Info */}
          <div className="bg-discord-card rounded-xl p-5">
            <h2 className="text-white font-bold text-lg flex items-center gap-2 mb-1">
              <FaUserShield className="text-purple-400" /> Team-Verwaltung
            </h2>
            <p className="text-discord-muted text-sm">
              Füge anderen Discord-Nutzern Zugriff auf dieses Dashboard hinzu.
              Sie müssen nur mit Discord eingeloggt sein – keine Admin-Rechte auf dem Server nötig!
            </p>
          </div>

          {/* Rollen-Erklärung */}
          <div className="bg-discord-card rounded-xl p-5 space-y-3">
            <h3 className="text-white font-semibold text-sm">📋 Rollen-Übersicht</h3>
            {ROLES.map(r => (
              <div key={r.value} className="flex items-start gap-3">
                <r.icon className={`${r.color} mt-0.5 shrink-0`} />
                <div>
                  <p className="text-white text-sm font-medium">{r.label}</p>
                  <p className="text-discord-muted text-xs">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Mitglied hinzufügen */}
          {canManage && (
            <div className="bg-discord-card rounded-xl p-5 space-y-4">
              <h3 className="text-white font-semibold">➕ Mitglied hinzufügen</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-discord-muted text-xs block mb-1">Discord-ID</label>
                  <input
                    value={newId}
                    onChange={e => setNewId(e.target.value)}
                    placeholder="z.B. 123456789012345678"
                    className="w-full bg-discord-bg text-white rounded-lg px-3 py-2 border border-white/10 outline-none focus:border-discord/50 text-sm font-mono"
                  />
                  <p className="text-discord-muted text-xs mt-1">Rechtsklick auf Nutzer → ID kopieren</p>
                </div>
                <div>
                  <label className="text-discord-muted text-xs block mb-1">Rolle</label>
                  <select
                    value={newRole}
                    onChange={e => setNewRole(e.target.value)}
                    className="w-full bg-discord-bg text-white rounded-lg px-3 py-2 border border-white/10 outline-none text-sm"
                  >
                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
              </div>
              <button
                onClick={() => addMutation.mutate()}
                disabled={!newId.trim() || addMutation.isPending}
                className="flex items-center gap-2 bg-discord hover:bg-discord-dark disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
              >
                <FaPlus className="text-xs" />
                {addMutation.isPending ? 'Hinzufügen...' : 'Hinzufügen'}
              </button>
            </div>
          )}

          {/* Team-Liste */}
          <div className="bg-discord-card rounded-xl p-5 space-y-3">
            <h3 className="text-white font-semibold">👥 Team ({team.length} Mitglieder)</h3>

            {isLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin w-8 h-8 border-2 border-discord border-t-transparent rounded-full" />
              </div>
            ) : team.length === 0 ? (
              <p className="text-discord-muted text-sm text-center py-4">Noch keine Team-Mitglieder</p>
            ) : (
              team.map(member => {
                const roleInfo = ROLES.find(r => r.value === member.role) || ROLES[1]
                const isMe = member.discordId === user?.discordId
                return (
                  <div key={member.discordId} className="flex items-center gap-3 bg-discord-bg rounded-lg p-3 border border-white/5">
                    {member.avatar ? (
                      <img src={member.avatar} className="w-10 h-10 rounded-full" alt="" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-discord/30 flex items-center justify-center text-white font-bold">
                        {member.username?.[0] || '?'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {member.username || member.discordId}
                        {isMe && <span className="ml-2 text-xs text-discord-muted">(Du)</span>}
                      </p>
                      <p className="text-discord-muted text-xs">{member.discordId}</p>
                    </div>

                    {canManage && !isMe ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={member.role}
                          onChange={e => updateRoleMutation.mutate({ memberId: member.discordId, role: e.target.value })}
                          className="bg-discord-sidebar text-white text-xs rounded px-2 py-1 border border-white/10 outline-none"
                        >
                          {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                        <button
                          onClick={() => { if (confirm(`${member.username} entfernen?`)) removeMutation.mutate(member.discordId) }}
                          className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-500/10 rounded transition"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    ) : (
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        member.role === 'admin' ? 'bg-discord/20 text-discord border-discord/30' :
                        member.role === 'moderator' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                        'bg-white/10 text-discord-muted border-white/20'
                      }`}>{roleInfo.label}</span>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

