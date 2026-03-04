import { useState } from 'react'
import ToggleSwitch from '../../components/ToggleSwitch'

const STAT_TYPES = [
  { value: 'members',  label: '👥 Mitglieder gesamt',  example: '👥 Mitglieder: {value}' },
  { value: 'online',   label: '🟢 Online-Mitglieder',  example: '🟢 Online: {value}' },
  { value: 'bots',     label: '🤖 Bots',               example: '🤖 Bots: {value}' },
  { value: 'channels', label: '📝 Kanäle',              example: '📝 Kanäle: {value}' },
  { value: 'roles',    label: '🎭 Rollen',              example: '🎭 Rollen: {value}' },
  { value: 'boosts',   label: '💎 Boosts',              example: '💎 Boosts: {value}' },
]

export default function StatChannelsModule({ config, onToggle, onSave, saving, botInfo }) {
  const voiceChannels = botInfo?.voiceChannels || botInfo?.channels?.filter(c => c.type === 2) || []
  const [channels, setChannels] = useState(config.channels || [])
  const [newStat, setNewStat] = useState({ type: 'members', channelId: '', name: '👥 Mitglieder: {value}' })

  const addStat = () => {
    if (!newStat.channelId) return
    setChannels(p => [...p, { ...newStat }])
    setNewStat({ type: 'members', channelId: '', name: '👥 Mitglieder: {value}' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-discord-card rounded-xl p-5">
        <div>
          <h2 className="text-white font-semibold">📊 Statistik-Kanäle</h2>
          <p className="text-discord-muted text-sm">Server-Statistiken in Sprachkanälen anzeigen</p>
        </div>
        <ToggleSwitch enabled={config.enabled} onToggle={onToggle} />
      </div>

      {config.enabled && (
        <>
          <div className="bg-discord-card rounded-xl p-5 space-y-3">
            <h3 className="text-white font-semibold">➕ Neuer Statistik-Kanal</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-discord-muted text-xs block mb-1">Statistik-Typ</label>
                <select value={newStat.type} onChange={e => {
                  const t = STAT_TYPES.find(s => s.value === e.target.value)
                  setNewStat(p => ({ ...p, type: e.target.value, name: t?.example || p.name }))
                }} className="w-full bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none text-sm">
                  {STAT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-discord-muted text-xs block mb-1">Sprachkanal</label>
                <select value={newStat.channelId} onChange={e => setNewStat(p => ({ ...p, channelId: e.target.value }))}
                  className="w-full bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none text-sm">
                  <option value="">— Kanal wählen —</option>
                  {voiceChannels.map(c => <option key={c.id} value={c.id}>🔊 {c.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-discord-muted text-xs block mb-1">Kanalname-Format <span>(Platzhalter: {'{value}'})</span></label>
              <input value={newStat.name} onChange={e => setNewStat(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none text-sm" />
            </div>
            <button onClick={addStat} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition">
              + Hinzufügen
            </button>
          </div>

          <div className="bg-discord-card rounded-xl p-5 space-y-3">
            <h3 className="text-white font-semibold">Konfigurierte Kanäle ({channels.length})</h3>
            {channels.length === 0 && <p className="text-discord-muted text-sm">Noch keine Statistik-Kanäle konfiguriert.</p>}
            {channels.map((sc, i) => (
              <div key={i} className="flex items-center justify-between bg-discord-sidebar rounded-lg p-3">
                <div>
                  <p className="text-white text-sm font-medium">{sc.name}</p>
                  <p className="text-discord-muted text-xs">
                    {STAT_TYPES.find(t => t.value === sc.type)?.label} → {voiceChannels.find(c => c.id === sc.channelId)?.name || sc.channelId}
                  </p>
                </div>
                <button onClick={() => setChannels(p => p.filter((_, idx) => idx !== i))}
                  className="text-red-400 hover:text-red-300 text-xs ml-4 hover:bg-red-500/10 px-2 py-1 rounded">
                  🗑 Löschen
                </button>
              </div>
            ))}
            {channels.length > 0 && (
              <button onClick={() => onSave({ channels })} disabled={saving}
                className="bg-discord hover:bg-discord-dark text-white px-6 py-2 rounded-lg transition disabled:opacity-50">
                {saving ? 'Speichere...' : '💾 Speichern'}
              </button>
            )}
          </div>
          <p className="text-discord-muted text-xs px-1">
            ⚠️ Der Bot braucht die Berechtigung "Kanal verwalten". Aktualisierung alle 10 Minuten.
          </p>
        </>
      )}
    </div>
  )
}
