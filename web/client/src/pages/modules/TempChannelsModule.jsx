import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import ToggleSwitch from '../../components/ToggleSwitch'
import api from '../../api/client'

export default function TempChannelsModule({ config, onToggle, onSave, saving, botInfo, guildId }) {
  const qc = useQueryClient()

  // Immer frische Daten holen – staleTime 0 damit jedes Mal neu geladen wird
  const {
    data: channelData,
    isLoading: channelsLoading,
    refetch,
    isError,
  } = useQuery({
    queryKey: ['guild-channels', guildId],
    queryFn: async () => {
      const r = await api.get(`/guilds/${guildId}/channels`)
      return r.data
    },
    enabled: !!guildId,
    staleTime: 0,        // immer neu laden
    retry: 2,
    throwOnError: false,
  })

  // Kanäle aus frischen Daten ODER Fallback aus botInfo
  const voiceChannels =
    (channelData && !channelData.error ? channelData.voiceChannels : null) ??
    botInfo?.voiceChannels ??
    botInfo?.channels?.filter(c => [2, 13].includes(c.type)) ??
    []

  const textChannels =
    (channelData && !channelData.error ? channelData.textChannels : null) ??
    botInfo?.textChannels ??
    botInfo?.channels?.filter(c => c.type === 0) ??
    []

  const categories =
    (channelData && !channelData.error ? channelData.categories : null) ??
    botInfo?.categories ??
    botInfo?.channels?.filter(c => c.type === 4) ??
    []

  const botNotReachable = !channelsLoading && (isError || channelData?.error) && voiceChannels.length === 0

  const [cfg, setCfg] = useState({
    categoryId:       config.categoryId       || '',
    triggerChannelId: config.triggerChannelId || '',
    controlChannelId: config.controlChannelId || '',
    channelName:      config.channelName      || "{user}'s Kanal",
    userLimit:        config.userLimit        || 0,
  })

  // Config-Updates übernehmen wenn sich config von außen ändert
  useEffect(() => {
    setCfg({
      categoryId:       config.categoryId       || '',
      triggerChannelId: config.triggerChannelId || '',
      controlChannelId: config.controlChannelId || '',
      channelName:      config.channelName      || "{user}'s Kanal",
      userLimit:        config.userLimit        || 0,
    })
  }, [config.categoryId, config.triggerChannelId, config.controlChannelId, config.channelName, config.userLimit])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-discord-card rounded-xl p-5">
        <div>
          <h2 className="text-white font-semibold">🔊 Temporäre Kanäle</h2>
          <p className="text-discord-muted text-sm">Eigene Sprachkanäle auf Knopfdruck erstellen</p>
        </div>
        <ToggleSwitch enabled={config.enabled} onToggle={onToggle} />
      </div>

      {config.enabled && (
        <div className="bg-discord-card rounded-xl p-5 space-y-4">

          {/* Status-Zeile: Lade-Spinner oder Reload-Button */}
          <div className="flex items-center justify-between">
            <span className="text-discord-muted text-xs">
              {channelsLoading
                ? '⏳ Lade Kanäle vom Server...'
                : botNotReachable
                  ? `⚠️ Bot-API nicht erreichbar: ${channelData?.error || 'Timeout'}`
                  : `✅ ${voiceChannels.length} Voice-Kanal(e), ${categories.length} Kategorie(n) geladen`
              }
            </span>
            <button
              onClick={() => { qc.invalidateQueries({ queryKey: ['guild-channels', guildId] }); refetch(); }}
              disabled={channelsLoading}
              className="text-xs text-discord hover:underline disabled:opacity-40"
            >
              🔄 Neu laden
            </button>
          </div>

          {/* Bot nicht erreichbar */}
          {botNotReachable && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-sm text-yellow-400">
              ⚠️ Der Bot ist nicht auf diesem Server erreichbar oder läuft nicht.
              Kanäle können nicht geladen werden. Stelle sicher, dass der Bot läuft und auf dem Server ist.
            </div>
          )}

          {/* Trigger-Kanal */}
          <div>
            <label className="text-discord-muted text-sm block mb-1">
              🎯 Trigger-Kanal{' '}
              <span className="text-xs">(Beitreten = neuen Kanal erstellen)</span>
            </label>
            <select
              value={cfg.triggerChannelId}
              onChange={e => setCfg(p => ({ ...p, triggerChannelId: e.target.value }))}
              disabled={channelsLoading}
              className="w-full bg-discord-sidebar text-white rounded-lg px-3 py-2 border border-white/10 outline-none text-sm disabled:opacity-60"
            >
              <option value="">— Kanal wählen —</option>
              {voiceChannels.map(c => (
                <option key={c.id} value={c.id}>🔊 {c.name}</option>
              ))}
            </select>
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
              {categories.map(c => (
                <option key={c.id} value={c.id}>📁 {c.name}</option>
              ))}
            </select>
          </div>

          {/* Control-Channel */}
          <div>
            <label className="text-discord-muted text-sm block mb-1">
              🎮 Voice-Control-Channel{' '}
              <span className="text-xs">(Text-Kanal wo /voice-* Commands erlaubt sind)</span>
            </label>
            <select
              value={cfg.controlChannelId}
              onChange={e => setCfg(p => ({ ...p, controlChannelId: e.target.value }))}
              disabled={channelsLoading}
              className="w-full bg-discord-sidebar text-white rounded-lg px-3 py-2 border border-white/10 outline-none text-sm disabled:opacity-60"
            >
              <option value="">— Kein Control-Channel (überall erlaubt) —</option>
              {textChannels.map(c => (
                <option key={c.id} value={c.id}>💬 {c.name}</option>
              ))}
            </select>
            <p className="text-xs text-discord-muted mt-1">
              💡 Wenn gesetzt, können /voice-rename, /voice-lock etc. nur in diesem Kanal genutzt werden.
              Beim Erstellen eines Temp-Kanals erscheint dort eine Übersicht aller Commands.
            </p>
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
