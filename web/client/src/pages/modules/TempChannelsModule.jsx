import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import ToggleSwitch from '../../components/ToggleSwitch'
import api from '../../api/client'

// Alle verfügbaren Voice-Commands mit Beschreibung
const VOICE_COMMANDS = [
  { key: 'rename',  cmd: '/voice-rename',  icon: '🏷️', desc: 'Kanal umbenennen',                      cat: 'Allgemein' },
  { key: 'limit',   cmd: '/voice-limit',   icon: '👥', desc: 'User-Limit setzen (0 = unbegrenzt)',    cat: 'Allgemein' },
  { key: 'lock',    cmd: '/voice-lock',    icon: '🔒', desc: 'Kanal sperren (kein Beitritt)',         cat: 'Allgemein' },
  { key: 'unlock',  cmd: '/voice-unlock',  icon: '🔓', desc: 'Kanal entsperren',                       cat: 'Allgemein' },
  { key: 'close',   cmd: '/voice-close',   icon: '🗑️', desc: 'Kanal löschen',                         cat: 'Allgemein' },
  { key: 'kick',    cmd: '/voice-kick',    icon: '👢', desc: 'Nutzer aus Kanal werfen',               cat: 'Moderation' },
  { key: 'ban',     cmd: '/voice-ban',     icon: '🚫', desc: 'Nutzer aus Kanal bannen',               cat: 'Moderation' },
  { key: 'unban',   cmd: '/voice-unban',   icon: '✅', desc: 'Bann eines Nutzers aufheben',           cat: 'Moderation' },
]

export default function TempChannelsModule({ config, onToggle, onSave, saving, botInfo, guildId }) {
  const qc = useQueryClient()

  const { data: channelData, isLoading: channelsLoading, refetch, isError } = useQuery({
    queryKey: ['guild-channels', guildId],
    queryFn: async () => {
      const r = await api.get(`/guilds/${guildId}/channels`)
      return r.data
    },
    enabled: !!guildId,
    staleTime: 0,
    retry: 2,
    throwOnError: false,
  })

  const voiceChannels =
    (channelData && !channelData.error ? channelData.voiceChannels : null) ??
    botInfo?.voiceChannels ?? botInfo?.channels?.filter(c => [2,13].includes(c.type)) ?? []

  const textChannels =
    (channelData && !channelData.error ? channelData.textChannels : null) ??
    botInfo?.textChannels ?? botInfo?.channels?.filter(c => c.type === 0) ?? []

  const categories =
    (channelData && !channelData.error ? channelData.categories : null) ??
    botInfo?.categories ?? botInfo?.channels?.filter(c => c.type === 4) ?? []

  const botNotReachable = !channelsLoading && (isError || channelData?.error) && voiceChannels.length === 0

  // Standard: alle Commands aktiviert
  const defaultCmds = Object.fromEntries(VOICE_COMMANDS.map(c => [c.key, true]))

  const [cfg, setCfg] = useState({
    categoryId:       config.categoryId       || '',
    triggerChannelId: config.triggerChannelId || '',
    controlChannelId: config.controlChannelId || '',
    channelName:      config.channelName      || "{user}'s Kanal",
    userLimit:        config.userLimit        || 0,
    enabledCommands:  config.enabledCommands  || defaultCmds,
  })

  useEffect(() => {
    setCfg({
      categoryId:       config.categoryId       || '',
      triggerChannelId: config.triggerChannelId || '',
      controlChannelId: config.controlChannelId || '',
      channelName:      config.channelName      || "{user}'s Kanal",
      userLimit:        config.userLimit        || 0,
      enabledCommands:  config.enabledCommands  || defaultCmds,
    })
  }, [config.categoryId, config.triggerChannelId, config.controlChannelId,
      config.channelName, config.userLimit, config.enabledCommands])

  const toggleCmd = (key) => {
    setCfg(p => ({
      ...p,
      enabledCommands: { ...p.enabledCommands, [key]: !p.enabledCommands[key] }
    }))
  }

  // Gruppiert nach Kategorie
  const cmdGroups = VOICE_COMMANDS.reduce((acc, c) => {
    if (!acc[c.cat]) acc[c.cat] = []
    acc[c.cat].push(c)
    return acc
  }, {})

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
        <>
          {/* ── Kanal-Einstellungen ── */}
          <div className="bg-discord-card rounded-xl p-5 space-y-4">
            <h3 className="text-white font-medium text-sm">⚙️ Kanal-Einstellungen</h3>

            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-discord-muted text-xs">
                {channelsLoading ? '⏳ Lade Kanäle...'
                  : botNotReachable ? `⚠️ Bot-API nicht erreichbar`
                  : `✅ ${voiceChannels.length} Voice, ${categories.length} Kategorien, ${textChannels.length} Text`}
              </span>
              <button onClick={() => { qc.invalidateQueries({ queryKey: ['guild-channels', guildId] }); refetch() }}
                disabled={channelsLoading}
                className="text-xs text-discord hover:underline disabled:opacity-40">🔄 Neu laden</button>
            </div>

            {botNotReachable && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-sm text-yellow-400">
                ⚠️ Bot nicht erreichbar – Kanäle können nicht geladen werden.
              </div>
            )}

            {/* Trigger-Kanal */}
            <div>
              <label className="text-discord-muted text-sm block mb-1">🎯 Trigger-Kanal <span className="text-xs">(Beitreten = neuen Kanal erstellen)</span></label>
              <select value={cfg.triggerChannelId} onChange={e => setCfg(p => ({ ...p, triggerChannelId: e.target.value }))}
                disabled={channelsLoading}
                className="w-full bg-discord-sidebar text-white rounded-lg px-3 py-2 border border-white/10 outline-none text-sm disabled:opacity-60">
                <option value="">— Kanal wählen —</option>
                {voiceChannels.map(c => <option key={c.id} value={c.id}>🔊 {c.name}</option>)}
              </select>
            </div>

            {/* Kategorie */}
            <div>
              <label className="text-discord-muted text-sm block mb-1">📁 Kategorie für neue Kanäle</label>
              <select value={cfg.categoryId} onChange={e => setCfg(p => ({ ...p, categoryId: e.target.value }))}
                disabled={channelsLoading}
                className="w-full bg-discord-sidebar text-white rounded-lg px-3 py-2 border border-white/10 outline-none text-sm disabled:opacity-60">
                <option value="">— Keine Kategorie —</option>
                {categories.map(c => <option key={c.id} value={c.id}>📁 {c.name}</option>)}
              </select>
            </div>

            {/* Control-Channel */}
            <div>
              <label className="text-discord-muted text-sm block mb-1">
                🎮 Voice-Control-Channel <span className="text-xs">(nur hier laufen /voice-* Commands)</span>
              </label>
              <select value={cfg.controlChannelId} onChange={e => setCfg(p => ({ ...p, controlChannelId: e.target.value }))}
                disabled={channelsLoading}
                className="w-full bg-discord-sidebar text-white rounded-lg px-3 py-2 border border-white/10 outline-none text-sm disabled:opacity-60">
                <option value="">— Überall erlaubt —</option>
                {textChannels.map(c => <option key={c.id} value={c.id}>💬 {c.name}</option>)}
              </select>
              <p className="text-xs text-discord-muted mt-1">
                💡 Empfehlung: Einen eigenen Kanal z.B. <code>#voice-control</code> erstellen
              </p>
            </div>

            {/* Kanalname */}
            <div>
              <label className="text-discord-muted text-sm block mb-1">
                ✏️ Kanalname <span className="text-xs text-discord-muted">(Platzhalter: {'{user}'}, {'{count}'})</span>
              </label>
              <input value={cfg.channelName} onChange={e => setCfg(p => ({ ...p, channelName: e.target.value }))}
                className="w-full bg-discord-sidebar text-white rounded-lg px-3 py-2 border border-white/10 outline-none text-sm" />
            </div>

            {/* User-Limit */}
            <div>
              <label className="text-discord-muted text-sm block mb-1">👥 Standard User-Limit <span className="text-xs">(0 = unbegrenzt)</span></label>
              <input type="number" min={0} max={99} value={cfg.userLimit}
                onChange={e => setCfg(p => ({ ...p, userLimit: +e.target.value }))}
                className="w-full bg-discord-sidebar text-white rounded-lg px-3 py-2 border border-white/10 outline-none text-sm" />
            </div>
          </div>

          {/* ── Voice-Commands Aktivierung ── */}
          <div className="bg-discord-card rounded-xl p-5 space-y-4">
            <div>
              <h3 className="text-white font-medium text-sm">🎛️ Voice-Commands</h3>
              <p className="text-discord-muted text-xs mt-1">
                Aktiviere oder deaktiviere einzelne /voice-* Commands.<br/>
                Nutze <code className="text-discord">/voice-help</code> im Discord um alle aktiven Commands zu sehen.
              </p>
            </div>

            {Object.entries(cmdGroups).map(([cat, cmds]) => (
              <div key={cat}>
                <p className="text-discord-muted text-xs font-semibold uppercase tracking-wide mb-2">
                  {cat === 'Allgemein' ? '⚙️ Allgemeine Commands' : '🛡️ Moderations-Commands'}
                </p>
                <div className="space-y-2">
                  {cmds.map(c => (
                    <div key={c.key} className="flex items-center justify-between bg-discord-sidebar rounded-lg px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{c.icon}</span>
                        <div>
                          <span className="text-white text-sm font-mono">{c.cmd}</span>
                          <p className="text-discord-muted text-xs">{c.desc}</p>
                        </div>
                      </div>
                      <ToggleSwitch
                        enabled={cfg.enabledCommands?.[c.key] !== false}
                        onToggle={() => toggleCmd(c.key)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ── Speichern ── */}
          <button onClick={() => onSave(cfg)} disabled={saving}
            className="w-full bg-discord hover:bg-discord-dark disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition">
            {saving ? 'Speichere...' : '💾 Speichern'}
          </button>
        </>
      )}
    </div>
  )
}
