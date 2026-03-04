import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/client'
import toast from 'react-hot-toast'
import { FaLock, FaCrown, FaStar, FaGem } from 'react-icons/fa'

const PLAN_INFO = {
  free:     { label: 'Free',     icon: '🆓', color: 'text-discord-muted',  bg: 'bg-white/10'         },
  basic:    { label: 'Basic',    icon: '⭐', color: 'text-blue-400',       bg: 'bg-blue-500/20'      },
  standard: { label: 'Standard', icon: '💎', color: 'text-purple-400',     bg: 'bg-purple-500/20'    },
  pro:      { label: 'Pro',      icon: '👑', color: 'text-yellow-400',     bg: 'bg-yellow-500/20'    },
}

const PLAN_LEVEL = { free: 0, basic: 1, standard: 2, pro: 3 }

export default function ModuleCard({
  title, desc, description, icon: Icon, enabled, guildId, moduleId,
  requiredPlan = 'free', currentPlan = 'free', planLevel = PLAN_LEVEL
}) {
  const qc = useQueryClient()
  const text = desc || description || ''

  const currentLevel  = planLevel[currentPlan]  ?? 0
  const requiredLevel = planLevel[requiredPlan] ?? 0
  const isLocked      = currentLevel < requiredLevel
  const planInfo      = PLAN_INFO[requiredPlan] || PLAN_INFO.free

  const toggleMutation = useMutation({
    mutationFn: () => api.post(`/modules/${guildId}/${moduleId}/toggle`),
    onSuccess: (res) => {
      toast.success(`${title} ${res.data.enabled ? 'aktiviert ✅' : 'deaktiviert'}`)
      qc.invalidateQueries({ queryKey: ['guild', guildId] })
      qc.invalidateQueries({ queryKey: ['module', guildId, moduleId] })
    },
    onError: () => toast.error('Fehler beim Umschalten')
  })

  const isLoading = toggleMutation.isPending

  // ── Gesperrte Karte ────────────────────────────────────────────
  if (isLocked) {
    return (
      <div className="relative rounded-xl border border-white/5 bg-discord-card overflow-hidden opacity-60 hover:opacity-80 transition-opacity">
        {/* Schloss-Overlay */}
        <div className="absolute inset-0 bg-discord-bg/40 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${planInfo.bg} ${planInfo.color} border border-white/10 shadow`}>
            <FaLock className="text-[10px]" />
            {planInfo.icon} {planInfo.label} erforderlich
          </div>
          <p className="text-discord-muted text-[11px]">Upgrade um dieses Modul freizuschalten</p>
        </div>

        {/* Ausgegrauter Inhalt dahinter */}
        <div className="p-4 filter grayscale">
          <div className="flex items-center gap-3 mb-2">
            {Icon && (
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-white/5 text-discord-muted">
                <Icon />
              </div>
            )}
            <h3 className="font-semibold text-sm flex-1 leading-tight text-discord-muted">{title}</h3>
            <div className="w-11 h-6 rounded-full bg-white/10" />
          </div>
          <p className="text-discord-muted/60 text-xs leading-relaxed mb-3 line-clamp-2">{text}</p>
          <div className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/5 text-discord-muted/50">
            ⚙️ Einstellungen
          </div>
        </div>
      </div>
    )
  }

  // ── Freigeschaltete Karte ──────────────────────────────────────
  return (
    <div className={`relative rounded-xl border transition-all duration-200 overflow-hidden group
      ${enabled
        ? 'bg-discord-card border-green-500/30 hover:border-green-500/60'
        : 'bg-discord-card border-white/5 hover:border-white/20'
      }`}>

      {/* Aktiv-Indikator */}
      {enabled && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 to-discord" />}

      {/* Plan-Badge (nur wenn nicht free) */}
      {requiredPlan !== 'free' && (
        <div className={`absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${planInfo.bg} ${planInfo.color}`}>
          {planInfo.icon}
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center gap-3 mb-2">
          {Icon && (
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-base transition-colors
              ${enabled ? 'bg-discord/30 text-discord' : 'bg-white/5 text-discord-muted'}`}>
              <Icon />
            </div>
          )}
          <h3 className={`font-semibold text-sm flex-1 leading-tight pr-6 transition-colors ${enabled ? 'text-white' : 'text-discord-muted'}`}>
            {title}
          </h3>

          {/* Toggle */}
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); if (!isLoading) toggleMutation.mutate() }}
            disabled={isLoading}
            className={`relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 disabled:opacity-50
              ${enabled ? 'bg-green-500' : 'bg-white/20 hover:bg-white/30'}`}
            title={enabled ? 'Deaktivieren' : 'Aktivieren'}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200
              ${enabled ? 'translate-x-[22px]' : 'translate-x-1'}`} />
            {isLoading && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-3 h-3 border-2 border-white/60 border-t-white rounded-full animate-spin" />
              </span>
            )}
          </button>
        </div>

        <p className="text-discord-muted text-xs leading-relaxed mb-3 line-clamp-2">{text}</p>

        <Link
          to={`/dashboard/${guildId}/module/${moduleId}`}
          className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors
            ${enabled
              ? 'bg-discord/20 text-discord hover:bg-discord/40'
              : 'bg-white/5 text-discord-muted hover:bg-white/10 hover:text-white'
            }`}
        >
          ⚙️ Einstellungen
        </Link>
      </div>
    </div>
  )
}
