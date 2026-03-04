import { useState } from 'react'
import ToggleSwitch from '../../components/ToggleSwitch'
import { FaMusic } from 'react-icons/fa'

export default function MusicModule({ config, onToggle, onSave, saving, botInfo }) {
  const [djRoleId, setDjRoleId] = useState(config.djRoleId || '')
  const [defaultVolume, setDefaultVolume] = useState(config.defaultVolume || 50)
  const [maxQueueSize, setMaxQueueSize] = useState(config.maxQueueSize || 100)

  const roles = botInfo?.roles || []

  const handleSave = () => {
    onSave({ djRoleId: djRoleId || null, defaultVolume: parseInt(defaultVolume), maxQueueSize: parseInt(maxQueueSize) })
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <FaMusic className="text-discord text-2xl" />
        <h1 className="text-2xl font-bold text-white">Musik</h1>
      </div>

      <div className="space-y-4">
        <ToggleSwitch enabled={config.enabled} onChange={onToggle}
          label="Musik aktivieren" description="YouTube Musik-Player mit Queue-System" />

        <div className="bg-discord-card rounded-xl p-5 space-y-4">
          <h2 className="text-white font-semibold">DJ-Rolle</h2>
          <select value={djRoleId} onChange={e => setDjRoleId(e.target.value)}
            className="w-full bg-discord-sidebar text-discord-text rounded-lg px-3 py-2 border border-white/10 focus:border-discord outline-none">
            <option value="">Jeder kann Musik steuern</option>
            {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <p className="text-discord-muted text-sm">Nur User mit dieser Rolle können Skip, Stop etc. nutzen.</p>
        </div>

        <div className="bg-discord-card rounded-xl p-5 space-y-4">
          <h2 className="text-white font-semibold">Einstellungen</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-discord-muted text-sm block mb-1">Standard-Lautstärke (%)</label>
              <input type="range" min={0} max={100} value={defaultVolume} onChange={e => setDefaultVolume(e.target.value)}
                className="w-full accent-discord" />
              <p className="text-discord text-sm mt-1">{defaultVolume}%</p>
            </div>
            <div>
              <label className="text-discord-muted text-sm block mb-1">Max. Queue-Größe</label>
              <input type="number" min={1} max={500} value={maxQueueSize} onChange={e => setMaxQueueSize(e.target.value)}
                className="w-full bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none" />
            </div>
          </div>
        </div>

        <div className="bg-discord-card rounded-xl p-5">
          <h2 className="text-white font-semibold mb-3">Verfügbare Commands</h2>
          <div className="grid grid-cols-3 gap-2">
            {['/play', '/skip', '/queue', '/pause', '/stop', '/volume'].map(cmd => (
              <span key={cmd} className="bg-discord/20 text-discord px-3 py-1 rounded-lg text-sm font-mono text-center">{cmd}</span>
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

