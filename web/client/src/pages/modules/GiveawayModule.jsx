import { useState } from 'react'
import ToggleSwitch from '../../components/ToggleSwitch'

export default function GiveawayModule({ config, onToggle, onSave, saving }) {
  const [cfg, setCfg] = useState({ defaultDuration: config.defaultDuration||86400, defaultWinners: config.defaultWinners||1 })
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-discord-card rounded-xl p-5">
        <div><h2 className="text-white font-semibold">🎉 Gewinnspiele</h2><p className="text-discord-muted text-sm">Starte Gewinnspiele mit /giveaway start</p></div>
        <ToggleSwitch enabled={config.enabled} onToggle={onToggle} />
      </div>
      {config.enabled && (
        <div className="bg-discord-card rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-discord-muted text-sm">Standard-Dauer (Sekunden)</label><input type="number" value={cfg.defaultDuration} onChange={e=>setCfg(p=>({...p,defaultDuration:+e.target.value}))} className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none" /></div>
            <div><label className="text-discord-muted text-sm">Standard-Gewinner</label><input type="number" min={1} value={cfg.defaultWinners} onChange={e=>setCfg(p=>({...p,defaultWinners:+e.target.value}))} className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none" /></div>
          </div>
          <button onClick={()=>onSave(cfg)} disabled={saving} className="bg-discord hover:bg-discord-dark text-white px-6 py-2 rounded-lg transition disabled:opacity-50">{saving?'Speichern...':'Speichern'}</button>
        </div>
      )}
      <div className="bg-discord-card rounded-xl p-4"><h3 className="text-white font-semibold mb-2">Befehle</h3><div className="text-sm text-discord-muted font-mono space-y-1"><p>/giveaway start [preis] [dauer_min] [gewinner]</p><p>/giveaway end [message_id]</p><p>/giveaway reroll [message_id]</p></div></div>
    </div>
  )
}

