import { useState } from 'react'
import ToggleSwitch from '../../components/ToggleSwitch'

export default function BirthdayModule({ config, onToggle, onSave, saving, botInfo }) {
  const channels = botInfo?.textChannels || botInfo?.textChannels || botInfo?.channels?.filter(c => c.type === 0) || [] || []
  const roles = botInfo?.roles||[]
  const [cfg, setCfg] = useState({ channelId: config.channelId||'', roleId: config.roleId||'', message: config.message||'ðŸŽ‚ Alles Gute zum Geburtstag {user}!' })
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-discord-card rounded-xl p-5">
        <div><h2 className="text-white font-semibold">ðŸŽ‚ Geburtstage</h2><p className="text-discord-muted text-sm">Automatische Geburtstagsnachrichten</p></div>
        <ToggleSwitch enabled={config.enabled} onToggle={onToggle} />
      </div>
      {config.enabled && (
        <div className="bg-discord-card rounded-xl p-5 space-y-4">
          <div><label className="text-discord-muted text-sm">GlÃ¼ckwunsch-Kanal</label>
            <select value={cfg.channelId} onChange={e=>setCfg(p=>({...p,channelId:e.target.value}))} className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none">
              <option value="">â€” Kein Kanal â€”</option>{channels.map(c=><option key={c.id} value={c.id}>#{c.name}</option>)}
            </select></div>
          <div><label className="text-discord-muted text-sm">Geburtstags-Rolle (optional, fÃ¼r 24h)</label>
            <select value={cfg.roleId} onChange={e=>setCfg(p=>({...p,roleId:e.target.value}))} className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none">
              <option value="">â€” Keine Rolle â€”</option>{roles.map(r=><option key={r.id} value={r.id}>@{r.name}</option>)}
            </select></div>
          <div><label className="text-discord-muted text-sm">Nachricht <span className="text-xs text-discord-muted">(Platzhalter: {'{user}'})</span></label>
            <input value={cfg.message} onChange={e=>setCfg(p=>({...p,message:e.target.value}))} className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none" /></div>
          <button onClick={()=>onSave(cfg)} disabled={saving} className="bg-discord hover:bg-discord-dark text-white px-6 py-2 rounded-lg transition disabled:opacity-50">{saving?'Speichern...':'Speichern'}</button>
        </div>
      )}
      <div className="bg-discord-card rounded-xl p-4"><h3 className="text-white font-semibold mb-2">Befehle</h3><div className="text-sm text-discord-muted font-mono"><p>/birthday set [tag] [monat] Â· /birthday get [nutzer]</p></div></div>
    </div>
  )
}


