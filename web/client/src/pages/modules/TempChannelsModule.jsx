import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import ToggleSwitch from '../../components/ToggleSwitch'
import api from '../../api/client'

export default function TempChannelsModule({ config, onToggle, onSave, saving, botInfo, guildId }) {
  // Frische Kanal-Daten direkt von der Bot-API holen
  const { data: channelData, isLoading: channelsLoading } = useQuery({
    queryKey: ['guild-channels', guildId],
    queryFn: () => api.get(`/guilds/${guildId}/channels`).then(r => r.data),
    enabled: !!guildId,
    staleTime: 30_000, // 30s cachen
  })

  // Fallback auf botInfo wenn frische Daten nicht verfügbar
  const voiceChannels = channelData?.voiceChannels
    ?? botInfo?.voiceChannels
    ?? botInfo?.channels?.filter(c => [2, 13].includes(c.type))
    ?? []

  const categories = channelData?.categories
    ?? botInfo?.categories
    ?? botInfo?.channels?.filter(c => c.type === 4)
    ?? []

  const botNotReachable = channelData?.error && voiceChannels.length === 0

  const [cfg, setCfg] = useState({
    categoryId:       config.categoryId       || '',
    triggerChannelId: config.triggerChannelId || '',
    channelName:      config.channelName      || "{user}'s Kanal",
    userLimit:        config.userLimit        || 0
  })

  // Config-Updates übernehmen wenn sich config von außen ändert
  useEffect(() => {
    setCfg({
      categoryId:       config.categoryId       || '',
      triggerChannelId: config.triggerChannelId || '',
      channelName:      config.channelName      || "{user}'s Kanal",
      userLimit:        config.userLimit        || 0
    })
  }, [config.categoryId, config.triggerChannelId, config.channelName, config.userLimit])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-discord-card rounded-xl p-5">
        <div>
          <h2 className="text-white font-semibold">🔊 Temporäre Kanäle</h2>
          <p className="text-discord-muted text-sm">Eigene Sprachkanäle auf Knopfdruck erstellen</p>
        </div>
        <ToggleSwitch enabled={config.enabled} onToggle={onToggle} />
      </div>

      {config.enabled && (
        <div className="bg-discord-card rounded-xl p-5 space-y-4">

          {/* Bot nicht erreichbar */}
          {botNotReachable && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-sm text-yellow-400">
              ⚠️ Der Bot ist nicht auf diesem Server oder die Bot-API ist nicht erreichbar.
              Kanäle und Kategorien können nicht geladen werden.
            </div>
          )}

          {/* Trigger-Kanal */}
          <div>
            <label className="text-discord-muted text-sm block mb-1">
              🎯 Trigger-Kanal <span className="text-xs">(Beitreten = neuen Kanal erstellen)</span>
            </label>
            <select
              value={cfg.triggerChannelId}
              onChange={e => setCfg(p => ({ ...p, triggerChannelId: e.target.value }))}
              disabled={channelsLoading}
              className="w-full bg-discord-sidebar text-white rounded-lg px-3 py-2 border border-white/10 outline-none text-sm disabled:opacity-60"
            >
              <option value="">— Kanal wählen —</option>
              {channelsLoading && <option disabled>⏳ Lade Kanäle...</option>}
              {voiceChannels.map(c => (
                <option key={c.id} value={c.id}>🔊 {c.name}</option>
              ))}
            </select>
            {!channelsLoading && voiceChannels.length === 0 && !botNotReachable && (
              <p className="text-discord-muted text-xs mt-1">Keine Voice-Kanäle gefunden.</p>
            )}
          </div>

          {/* Kategorie */}
          <div>
            <label className="text-discord-muted text-sm block mb-1">
              📁 Kategorie für neue Kanäle
            </label>
            <select
              value={cfg.categoryId}
              onChange={e => setCfg(p => ({ ...p, categoryId: e.target.value }))}
              disabled={channelsLoading}
              className="w-full bg-discord-sidebar text-white rounded-lg px-3 py-2 border border-white/10 outline-none text-sm disabled:opacity-60"
            >
              <option value="">— Keine Kategorie —</option>
              {channelsLoading && <option disabled>⏳ Lade Kategorien...</option>}
              {categories.map(c => (
                <option key={c.id} value={c.id}>📁 {c.name}</option>
              ))}
            </select>
            {!channelsLoading && categories.length === 0 && !botNotReachable && (
              <p className="text-discord-muted text-xs mt-1">Keine Kategorien gefunden.</p>
            )}
          </div>

          {/* Kanalname */}
          <div>
            <label className="text-discord-muted text-sm block mb-1">
              ✏️ Kanalname{' '}
              <span className="text-xs text-discord-muted">(Platzhalter: {'{user}'}, {'{count}'})</span>
            </label>
            <input
              value={cfg.channelName}
              onChange={e => setCfg(p => ({ ...p, channelName: e.target.value }))}
              className="w-full bg-discord-sidebar text-white rounded-lg px-3 py-2 border border-white/10 outline-none text-sm"
            />
          </div>

          {/* User-Limit */}
          <div>
            <label className="text-discord-muted text-sm block mb-1">
              👥 User-Limit <span className="text-xs">(0 = unbegrenzt)</span>
            </label>
            <input
              type="number"
              min={0}
              max={99}
              value={cfg.userLimit}
              onChange={e => setCfg(p => ({ ...p, userLimit: +e.target.value }))}
              className="w-full bg-discord-sidebar text-white rounded-lg px-3 py-2 border border-white/10 outline-none text-sm"
            />
          </div>

          {/* Speichern */}
          <button
            onClick={() => onSave(cfg)}
            disabled={saving}
            className="w-full bg-discord hover:bg-discord-dark disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition"
          >
            {saving ? 'Speichere...' : '💾 Speichern'}
          </button>
        </div>
      )}
    </div>
  )
}
