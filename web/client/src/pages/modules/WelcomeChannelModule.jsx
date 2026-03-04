import { useState } from 'react'
import ToggleSwitch from '../../components/ToggleSwitch'

export default function WelcomeChannelModule({ config, onToggle, onSave, saving, botInfo }) {
  const channels = botInfo?.textChannels || botInfo?.textChannels || botInfo?.channels?.filter(c => c.type === 0) || [] || []
  const [cfg, setCfg] = useState({
    channelId: config.channelId || '',
    description: config.description || 'Willkommen auf unserem Server!',
    rules: config.rules || '',
    showMemberCount: config.showMemberCount !== false
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-discord-card rounded-xl p-5">
        <div><h2 className="text-white font-semibold"># Willkommenskanal</h2><p className="text-discord-muted text-sm">Spezieller Kanal zur BegrÃ¼ÃŸung neuer Mitglieder</p></div>
        <ToggleSwitch enabled={config.enabled} onToggle={onToggle} />
      </div>
      {config.enabled && (
        <div className="bg-discord-card rounded-xl p-5 space-y-4">
          <div>
            <label className="text-discord-muted text-sm">Willkommenskanal</label>
            <select value={cfg.channelId} onChange={e => setCfg(p => ({ ...p, channelId: e.target.value }))} className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none">
              <option value="">â€” Kein Kanal â€”</option>
              {channels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-discord-muted text-sm">Server-Beschreibung</label>
            <textarea value={cfg.description} rows={3} onChange={e => setCfg(p => ({ ...p, description: e.target.value }))} className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none resize-none" />
          </div>
          <div>
            <label className="text-discord-muted text-sm">Regelwerk (optional)</label>
            <textarea value={cfg.rules} rows={4} onChange={e => setCfg(p => ({ ...p, rules: e.target.value }))} placeholder="1. Sei freundlich&#10;2. Kein Spam&#10;..." className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none resize-none" />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={cfg.showMemberCount} onChange={e => setCfg(p => ({ ...p, showMemberCount: e.target.checked }))} className="w-4 h-4" />
            <span className="text-white text-sm">Mitgliederanzahl anzeigen</span>
          </label>
          <button onClick={() => onSave(cfg)} disabled={saving} className="bg-discord hover:bg-discord-dark text-white px-6 py-2 rounded-lg transition disabled:opacity-50">
            {saving ? 'Speichern...' : 'Speichern'}
          </button>
        </div>
      )}
    </div>
  )
}


