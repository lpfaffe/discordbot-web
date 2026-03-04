import { useState } from 'react'
import ToggleSwitch from '../../components/ToggleSwitch'

export default function TempChannelsModule({ config, onToggle, onSave, saving, botInfo }) {
  const voiceChannels = botInfo?.voiceChannels || botInfo?.channels?.filter(c => c.type === 2) || []
  const categories    = botInfo?.categories    || botInfo?.channels?.filter(c => c.type === 4) || []
  const [cfg, setCfg] = useState({
    categoryId:       config.categoryId       || '',
    triggerChannelId: config.triggerChannelId || '',
    channelName:      config.channelName      || "{user}'s Kanal",
    userLimit:        config.userLimit        || 0
  })

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
          <div>
            <label className="text-discord-muted text-sm block mb-1">
              🎯 Trigger-Kanal <span className="text-xs">(Beitreten = neuen Kanal erstellen)</span>
            </label>
            <select value={cfg.triggerChannelId} onChange={e => setCfg(p => ({ ...p, triggerChannelId: e.target.value }))}
              className="w-full bg-discord-sidebar text-white rounded-lg px-3 py-2 border border-white/10 outline-none text-sm">
              <option value="">— Kanal wählen —</option>
              {voiceChannels.map(c => <option key={c.id} value={c.id}>🔊 {c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-discord-muted text-sm block mb-1">
              📁 Kategorie für neue Kanäle
            </label>
            <select value={cfg.categoryId} onChange={e => setCfg(p => ({ ...p, categoryId: e.target.value }))}
              className="w-full bg-discord-sidebar text-white rounded-lg px-3 py-2 border border-white/10 outline-none text-sm">
              <option value="">— Keine Kategorie —</option>
              {categories.map(c => <option key={c.id} value={c.id}>📁 {c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-discord-muted text-sm block mb-1">
              ✏️ Kanalname <span className="text-xs text-discord-muted">(Platzhalter: {'{user}'}, {'{count}'})</span>
            </label>
            <input value={cfg.channelName} onChange={e => setCfg(p => ({ ...p, channelName: e.target.value }))}
              className="w-full bg-discord-sidebar text-white rounded-lg px-3 py-2 border border-white/10 outline-none text-sm" />
          </div>

          <div>
            <label className="text-discord-muted text-sm block mb-1">
              👥 User-Limit <span className="text-xs">(0 = unbegrenzt)</span>
            </label>
            <input type="number" min={0} max={99} value={cfg.userLimit}
              onChange={e => setCfg(p => ({ ...p, userLimit: +e.target.value }))}
              className="w-full bg-discord-sidebar text-white rounded-lg px-3 py-2 border border-white/10 outline-none text-sm" />
          </div>

          <button onClick={() => onSave(cfg)} disabled={saving}
            className="w-full bg-discord hover:bg-discord-dark disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition">
            {saving ? 'Speichere...' : '💾 Speichern'}
          </button>
        </div>
      )}
    </div>
  )
}
