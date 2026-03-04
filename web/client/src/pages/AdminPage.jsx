import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import toast from 'react-hot-toast'
import {
  FaShieldAlt, FaBan, FaTrash, FaPlus, FaCheck, FaTimes,
  FaExclamationTriangle, FaUsers, FaServer, FaCrown, FaChartBar,
  FaLock, FaUnlock, FaStar, FaCheckCircle, FaHourglass
} from 'react-icons/fa'

const PLANS = [
  { id: 'free',     label: 'Free',     color: 'bg-white/10 text-discord-muted',    icon: '🆓', features: ['5 Module', 'Basis-Befehle'] },
  { id: 'basic',    label: 'Basic',    color: 'bg-blue-500/20 text-blue-400',      icon: '⭐', features: ['15 Module', 'Leveling', 'Wirtschaft'] },
  { id: 'standard', label: 'Standard', color: 'bg-purple-500/20 text-purple-400',  icon: '💎', features: ['Alle Module', 'Musik', 'Tickets'] },
  { id: 'pro',      label: 'Pro',      color: 'bg-yellow-500/20 text-yellow-400',  icon: '👑', features: ['Alle Module', 'Priorität-Support', 'Custom Branding'] },
]

const STATUS_COLORS = {
  open:       'bg-red-500/20 text-red-400',
  inProgress: 'bg-yellow-500/20 text-yellow-400',
  resolved:   'bg-green-500/20 text-green-400'
}

export default function AdminPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [tab, setTab] = useState('stats')
  const [newBanId, setNewBanId] = useState('')
  const [newBanReason, setNewBanReason] = useState('')
  const [planGuildId, setPlanGuildId] = useState('')
  const [newAdminId, setNewAdminId] = useState('')

  // Admin-Check
  const { data: adminData, isLoading: checkingAdmin } = useQuery({
    queryKey: ['adminMe'],
    queryFn: () => api.get('/admin/me').then(r => r.data),
    enabled: !!user
  })

  const { data: stats }   = useQuery({ queryKey: ['adminStats'],   queryFn: () => api.get('/admin/stats').then(r => r.data),   enabled: adminData?.isAdmin })
  const { data: banned }  = useQuery({ queryKey: ['adminBanned'],  queryFn: () => api.get('/admin/banned').then(r => r.data),  enabled: adminData?.isAdmin && tab === 'banned' })
  const { data: reports } = useQuery({ queryKey: ['adminReports'], queryFn: () => api.get('/admin/reports').then(r => r.data), enabled: adminData?.isAdmin && tab === 'reports' })
  const { data: plans }   = useQuery({ queryKey: ['adminPlans'],   queryFn: () => api.get('/admin/plans').then(r => r.data),   enabled: adminData?.isAdmin && tab === 'plans' })
  const { data: admins }  = useQuery({ queryKey: ['adminAdmins'],  queryFn: () => api.get('/admin/admins').then(r => r.data),  enabled: adminData?.isAdmin && tab === 'admins' })

  const banMutation = useMutation({
    mutationFn: () => api.post('/admin/banned', { discordId: newBanId, reason: newBanReason }),
    onSuccess: () => { toast.success('Nutzer gesperrt'); setNewBanId(''); setNewBanReason(''); qc.invalidateQueries({ queryKey: ['adminBanned'] }) },
    onError: e => toast.error(e.response?.data?.error || 'Fehler')
  })
  const unbanMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/banned/${id}`),
    onSuccess: () => { toast.success('Entsperrt'); qc.invalidateQueries({ queryKey: ['adminBanned'] }) }
  })
  const setPlanMutation = useMutation({
    mutationFn: ({ guildId, type }) => api.patch(`/admin/plan/${guildId}`, { type }),
    onSuccess: () => { toast.success('Plan gesetzt'); qc.invalidateQueries({ queryKey: ['adminPlans'] }) },
    onError: e => toast.error(e.response?.data?.error || 'Fehler')
  })
  const reportStatusMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/admin/reports/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminReports'] })
  })
  const deleteReportMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/reports/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminReports'] })
  })
  const addAdminMutation = useMutation({
    mutationFn: () => api.post('/admin/admins', { discordId: newAdminId }),
    onSuccess: () => { toast.success('Admin hinzugefügt'); setNewAdminId(''); qc.invalidateQueries({ queryKey: ['adminAdmins'] }) }
  })
  const removeAdminMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/admins/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminAdmins'] })
  })

  if (checkingAdmin) return <div className="flex items-center justify-center h-screen"><div className="animate-spin w-10 h-10 border-4 border-discord border-t-transparent rounded-full"/></div>
  if (!adminData?.isAdmin) return <Navigate to="/dashboard" />

  const TABS = [
    { id: 'stats',   label: '📊 Statistiken' },
    { id: 'reports', label: `🐛 Fehler-Reports${stats?.openReports > 0 ? ` (${stats.openReports})` : ''}` },
    { id: 'banned',  label: '🔒 Gesperrte Nutzer' },
    { id: 'plans',   label: '💎 Pläne' },
    { id: 'admins',  label: '👑 Super-Admins' },
  ]

  return (
    <div className="min-h-screen bg-discord-bg">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900/30 to-discord-sidebar border-b border-white/5 px-8 py-6">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
            <FaShieldAlt className="text-red-400 text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              🛡️ Super-Admin Panel
            </h1>
            <p className="text-discord-muted text-sm">Eingeloggt als {user?.username} ({user?.discordId})</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === t.id ? 'bg-discord text-white' : 'bg-discord-sidebar text-discord-muted hover:text-white'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Statistiken ── */}
        {tab === 'stats' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Server', value: stats.guilds, icon: FaServer, color: 'text-discord' },
                { label: 'Nutzer', value: stats.users, icon: FaUsers, color: 'text-blue-400' },
                { label: 'Gesperrt', value: stats.bannedUsers, icon: FaBan, color: 'text-red-400' },
                { label: 'Offene Reports', value: stats.openReports, icon: FaExclamationTriangle, color: 'text-yellow-400' },
              ].map(s => (
                <div key={s.label} className="bg-discord-card rounded-xl p-5">
                  <s.icon className={`${s.color} text-2xl mb-2`} />
                  <p className="text-white text-2xl font-bold">{s.value}</p>
                  <p className="text-discord-muted text-sm">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="bg-discord-card rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4">💎 Plan-Verteilung</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {PLANS.map(p => (
                  <div key={p.id} className={`rounded-lg p-3 border border-white/5 ${p.color}`}>
                    <p className="text-lg font-bold">{stats.plans?.[p.id] || 0}</p>
                    <p className="text-sm">{p.icon} {p.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Fehler-Reports ── */}
        {tab === 'reports' && (
          <div className="space-y-4">
            {reports?.reports?.length === 0 && <p className="text-discord-muted text-center py-10">Keine Reports vorhanden 🎉</p>}
            {reports?.reports?.map(r => (
              <div key={r.reportId} className="bg-discord-card rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-discord-muted text-xs font-mono">#{r.reportId}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[r.status]}`}>{r.status}</span>
                      <span className="text-discord-muted text-xs">{new Date(r.createdAt).toLocaleString('de-DE')}</span>
                    </div>
                    <p className="text-white font-medium">{r.message}</p>
                    {r.url && <p className="text-discord-muted text-xs mt-1">📍 {r.url}</p>}
                    <p className="text-discord-muted text-xs mt-1">👤 {r.username} ({r.userId})</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <select value={r.status}
                      onChange={e => reportStatusMutation.mutate({ id: r.reportId, status: e.target.value })}
                      className="bg-discord-sidebar text-white text-xs rounded px-2 py-1 border border-white/10 outline-none">
                      <option value="open">Offen</option>
                      <option value="inProgress">In Arbeit</option>
                      <option value="resolved">Gelöst</option>
                    </select>
                    <button onClick={() => deleteReportMutation.mutate(r.reportId)}
                      className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-500/10 rounded transition">
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Gesperrte Nutzer ── */}
        {tab === 'banned' && (
          <div className="space-y-4">
            <div className="bg-discord-card rounded-xl p-5 space-y-3">
              <h3 className="text-white font-semibold">🔒 Nutzer sperren</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input value={newBanId} onChange={e => setNewBanId(e.target.value)} placeholder="Discord-ID"
                  className="bg-discord-sidebar text-white rounded-lg px-3 py-2 border border-white/10 outline-none text-sm font-mono" />
                <input value={newBanReason} onChange={e => setNewBanReason(e.target.value)} placeholder="Grund"
                  className="bg-discord-sidebar text-white rounded-lg px-3 py-2 border border-white/10 outline-none text-sm" />
                <button onClick={() => banMutation.mutate()} disabled={!newBanId || banMutation.isPending}
                  className="flex items-center justify-center gap-2 bg-red-600/80 hover:bg-red-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm transition">
                  <FaBan /> Sperren
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {banned?.banned?.length === 0 && <p className="text-discord-muted text-center py-6">Keine gesperrten Nutzer</p>}
              {banned?.banned?.map(b => (
                <div key={b.discordId} className="bg-discord-card rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{b.username}</p>
                    <p className="text-discord-muted text-xs">{b.discordId} • Grund: {b.reason}</p>
                    <p className="text-discord-muted text-xs">{new Date(b.bannedAt).toLocaleString('de-DE')}</p>
                  </div>
                  <button onClick={() => unbanMutation.mutate(b.discordId)}
                    className="flex items-center gap-1 text-green-400 hover:text-green-300 text-sm hover:bg-green-500/10 px-3 py-1.5 rounded-lg transition">
                    <FaUnlock className="text-xs" /> Entsperren
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Plan-Verwaltung ── */}
        {tab === 'plans' && (
          <div className="space-y-6">
            {/* Plan-Übersicht */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {PLANS.map(p => (
                <div key={p.id} className={`rounded-xl p-4 border border-white/5 ${p.color}`}>
                  <p className="text-2xl mb-1">{p.icon}</p>
                  <p className="font-bold text-lg">{p.label}</p>
                  <ul className="mt-2 space-y-1">
                    {p.features.map(f => <li key={f} className="text-xs opacity-80">✓ {f}</li>)}
                  </ul>
                </div>
              ))}
            </div>

            {/* Plan setzen */}
            <div className="bg-discord-card rounded-xl p-5 space-y-3">
              <h3 className="text-white font-semibold">🔧 Plan für Server setzen</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-discord-muted text-xs block mb-1">Guild-ID</label>
                  <input value={planGuildId} onChange={e => setPlanGuildId(e.target.value)} placeholder="123456789..."
                    className="w-full bg-discord-sidebar text-white rounded-lg px-3 py-2 border border-white/10 outline-none text-sm font-mono" />
                </div>
                <div className="md:col-span-2 grid grid-cols-4 gap-2">
                  {PLANS.map(p => (
                    <button key={p.id} onClick={() => setPlanMutation.mutate({ guildId: planGuildId, type: p.id })}
                      disabled={!planGuildId || setPlanMutation.isPending}
                      className={`py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 border border-white/10 hover:border-discord/50 bg-discord-sidebar text-white`}>
                      {p.icon} {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Alle Server mit Plänen */}
            <div className="bg-discord-card rounded-xl p-5">
              <h3 className="text-white font-semibold mb-3">📋 Alle Server</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {plans?.guilds?.map(g => {
                  const plan = PLANS.find(p => p.id === (g.plan?.type || 'free'))
                  return (
                    <div key={g.guildId} className="flex items-center justify-between bg-discord-sidebar rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        {g.icon ? <img src={g.icon} className="w-8 h-8 rounded-full" alt="" /> : <div className="w-8 h-8 rounded-full bg-discord/30 flex items-center justify-center text-white text-sm">{g.name?.[0]}</div>}
                        <div>
                          <p className="text-white text-sm font-medium">{g.name}</p>
                          <p className="text-discord-muted text-xs font-mono">{g.guildId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${plan?.color}`}>{plan?.icon} {plan?.label}</span>
                        <select value={g.plan?.type || 'free'}
                          onChange={e => setPlanMutation.mutate({ guildId: g.guildId, type: e.target.value })}
                          className="bg-discord-bg text-white text-xs rounded px-2 py-1 border border-white/10 outline-none">
                          {PLANS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                        </select>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Super-Admins ── */}
        {tab === 'admins' && (
          <div className="space-y-4">
            <div className="bg-discord-card rounded-xl p-5 space-y-3">
              <h3 className="text-white font-semibold">👑 Super-Admin hinzufügen</h3>
              <div className="flex gap-3">
                <input value={newAdminId} onChange={e => setNewAdminId(e.target.value)} placeholder="Discord-ID"
                  className="flex-1 bg-discord-sidebar text-white rounded-lg px-3 py-2 border border-white/10 outline-none text-sm font-mono" />
                <button onClick={() => addAdminMutation.mutate()} disabled={!newAdminId || addAdminMutation.isPending}
                  className="flex items-center gap-2 bg-discord hover:bg-discord-dark disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm transition">
                  <FaPlus /> Hinzufügen
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {admins?.admins?.length === 0 && <p className="text-discord-muted text-center py-4">Keine Super-Admins konfiguriert (alle eingeloggten Nutzer sind Admins)</p>}
              {admins?.admins?.map(id => (
                <div key={id} className="bg-discord-card rounded-xl p-4 flex items-center justify-between">
                  <p className="text-white font-mono text-sm">{id} {id === user?.discordId && <span className="text-discord text-xs">(Du)</span>}</p>
                  {id !== user?.discordId && (
                    <button onClick={() => removeAdminMutation.mutate(id)}
                      className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-500/10 rounded transition">
                      <FaTrash className="text-xs" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

