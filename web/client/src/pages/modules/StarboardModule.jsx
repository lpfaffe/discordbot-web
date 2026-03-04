import { useState } from 'react'
import ToggleSwitch from '../../components/ToggleSwitch'

export default function StarboardModule({ config, onToggle, onSave, saving, botInfo }) {
  const channels = botInfo?.textChannels || botInfo?.textChannels || botInfo?.channels?.filter(c => c.type === 0) || [] || []
  const [cfg, setCfg] = useState({ channelId: config.channelId||'', emoji: config.emoji||'â­', threshold: config.threshold||3, ignoreBots: config.ignoreBots!==false })
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-discord-card rounded-xl p-5">
        <div><h2 className="text-white font-semibold">â­ Starboard</h2><p className="text-discord-muted text-sm">Beliebte Nachrichten in einem Kanal hervorheben</p></div>
        <ToggleSwitch enabled={config.enabled} onToggle={onToggle} />
      </div>
      {config.enabled && (
        <div className="bg-discord-card rounded-xl p-5 space-y-4">
          <div><label className="text-discord-muted text-sm">Starboard-Kanal</label>
            <select value={cfg.channelId} onChange={e=>setCfg(p=>({...p,channelId:e.target.value}))} className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none">
              <option value="">â€” Kein Kanal â€”</option>{channels.map(c=><option key={c.id} value={c.id}>#{c.name}</option>)}
            </select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-discord-muted text-sm">Emoji</label><input value={cfg.emoji} onChange={e=>setCfg(p=>({...p,emoji:e.target.value}))} className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none" /></div>
            <div><label className="text-discord-muted text-sm">Mindest-Reaktionen</label><input type="number" min={1} value={cfg.threshold} onChange={e=>setCfg(p=>({...p,threshold:+e.target.value}))} className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none" /></div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={cfg.ignoreBots} onChange={e=>setCfg(p=>({...p,ignoreBots:e.target.checked}))} className="w-4 h-4" /><span className="text-white text-sm">Bot-Nachrichten ignorieren</span></label>
          <button onClick={()=>onSave(cfg)} disabled={saving} className="bg-discord hover:bg-discord-dark text-white px-6 py-2 rounded-lg transition disabled:opacity-50">{saving?'Speichern...':'Speichern'}</button>
        </div>
      )}
    </div>
  )
}


