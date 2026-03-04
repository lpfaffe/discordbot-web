import { useState } from 'react'
import ToggleSwitch from '../../components/ToggleSwitch'

export default function InviteTrackingModule({ config, onToggle, onSave, saving, botInfo }) {
  const channels = botInfo?.textChannels || botInfo?.textChannels || botInfo?.channels?.filter(c => c.type === 0) || [] || []
  const [cfg, setCfg] = useState({ channelId: config.channelId||'', message: config.message||'{user} wurde von {inviter} eingeladen! ({inviter} hat jetzt {count} Einladungen)' })
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-discord-card rounded-xl p-5">
        <div><h2 className="text-white font-semibold">ðŸ“¨ Einladungsverfolgung</h2><p className="text-discord-muted text-sm">Verfolge wer wen eingeladen hat</p></div>
        <ToggleSwitch enabled={config.enabled} onToggle={onToggle} />
      </div>
      {config.enabled && (
        <div className="bg-discord-card rounded-xl p-5 space-y-4">
          <div><label className="text-discord-muted text-sm">Benachrichtigungs-Kanal</label>
            <select value={cfg.channelId} onChange={e=>setCfg(p=>({...p,channelId:e.target.value}))} className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none">
              <option value="">â€” Kein Kanal â€”</option>{channels.map(c=><option key={c.id} value={c.id}>#{c.name}</option>)}
            </select></div>
          <div>
            <label className="text-discord-muted text-sm">Nachricht</label>
            <p className="text-discord-muted text-xs mb-1">Platzhalter: {'{user}'} {'{inviter}'} {'{count}'} {'{server}'}</p>
            <textarea value={cfg.message} rows={2} onChange={e=>setCfg(p=>({...p,message:e.target.value}))} className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none resize-none" />
          </div>
          <button onClick={() => onSave(cfg)} disabled={saving} className="bg-discord hover:bg-discord-dark text-white px-6 py-2 rounded-lg transition disabled:opacity-50">{saving?'Speichern...':'Speichern'}</button>
        </div>
      )}
    </div>
  )
}


