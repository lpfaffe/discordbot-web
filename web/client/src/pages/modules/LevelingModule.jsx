import { useState } from 'react'
import ToggleSwitch from '../../components/ToggleSwitch'
import { FaStar } from 'react-icons/fa'

export default function LevelingModule({ config, onToggle, onSave, saving, botInfo }) {
  const [xpPerMessage, setXpPerMessage] = useState(config.xpPerMessage || 15)
  const [xpCooldown, setXpCooldown] = useState(config.xpCooldown || 60)
  const [levelUpChannelId, setLevelUpChannelId] = useState(config.levelUpChannelId || '')
  const [levelUpMessage, setLevelUpMessage] = useState(config.levelUpMessage || 'GlÃ¼ckwunsch {user}! Du bist auf Level {level} aufgestiegen!')

  const channels = botInfo?.textChannels || botInfo?.textChannels || botInfo?.channels?.filter(c => c.type === 0) || [] || []
  const roles = botInfo?.roles || []

  const handleSave = () => {
    onSave({
      xpPerMessage: parseInt(xpPerMessage),
      xpCooldown: parseInt(xpCooldown),
      levelUpChannelId: levelUpChannelId || null,
      levelUpMessage
    })
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <FaStar className="text-discord-yellow text-2xl" />
        <h1 className="text-2xl font-bold text-white">Leveling</h1>
      </div>

      <div className="space-y-4">
        <ToggleSwitch
          enabled={config.enabled}
          onChange={onToggle}
          label="Leveling aktivieren"
          description="User erhalten XP fÃ¼r Nachrichten und steigen Level auf"
        />

        <div className="bg-discord-card rounded-xl p-5 space-y-4">
          <h2 className="text-white font-semibold">XP-Einstellungen</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-discord-muted text-sm block mb-1">XP pro Nachricht (max)</label>
              <input type="number" min={1} max={100} value={xpPerMessage}
                onChange={e => setXpPerMessage(e.target.value)}
                className="w-full bg-discord-sidebar text-discord-text rounded-lg px-3 py-2 border border-white/10 focus:border-discord outline-none" />
            </div>
            <div>
              <label className="text-discord-muted text-sm block mb-1">XP-Cooldown (Sekunden)</label>
              <input type="number" min={5} max={3600} value={xpCooldown}
                onChange={e => setXpCooldown(e.target.value)}
                className="w-full bg-discord-sidebar text-discord-text rounded-lg px-3 py-2 border border-white/10 focus:border-discord outline-none" />
            </div>
          </div>
        </div>

        <div className="bg-discord-card rounded-xl p-5 space-y-4">
          <h2 className="text-white font-semibold">Level-Up Nachricht</h2>
          <select value={levelUpChannelId} onChange={e => setLevelUpChannelId(e.target.value)}
            className="w-full bg-discord-sidebar text-discord-text rounded-lg px-3 py-2 border border-white/10 focus:border-discord outline-none">
            <option value="">Im selben Channel wie die Nachricht</option>
            {channels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
          </select>
          <div>
            <label className="text-discord-muted text-sm block mb-1">Nachricht</label>
            <textarea value={levelUpMessage} onChange={e => setLevelUpMessage(e.target.value)} rows={3}
              className="w-full bg-discord-sidebar text-discord-text rounded-lg px-3 py-2 border border-white/10 focus:border-discord outline-none resize-none" />
            <p className="text-discord-muted text-xs mt-1">Platzhalter: {'{user}'}, {'{level}'}, {'{server}'}</p>
          </div>
        </div>

        <div className="bg-discord-card rounded-xl p-5">
          <h2 className="text-white font-semibold mb-3">VerfÃ¼gbare Commands</h2>
          <div className="flex flex-wrap gap-2">
            {['/rank', '/leaderboard'].map(cmd => (
              <span key={cmd} className="bg-discord/20 text-discord px-3 py-1 rounded-lg text-sm font-mono">{cmd}</span>
            ))}
          </div>
        </div>

        <button onClick={handleSave} disabled={saving}
          className="w-full bg-discord hover:bg-discord-dark disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition">
          {saving ? 'Speichere...' : 'Speichern'}
        </button>
      </div>
    </div>
  )
}


