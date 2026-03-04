import { useState } from 'react'
import ToggleSwitch from '../../components/ToggleSwitch'

export default function EconomyModule({ config, onToggle, onSave, saving }) {
  const [cfg, setCfg] = useState({ currencyName: config.currencyName||'Coins', currencyEmoji: config.currencyEmoji||'🪙', dailyAmount: config.dailyAmount||100, workAmount: config.workAmount||50, startBalance: config.startBalance||0 })
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-discord-card rounded-xl p-5">
        <div><h2 className="text-white font-semibold">💰 Wirtschaft</h2><p className="text-discord-muted text-sm">Coins-System mit /economy</p></div>
        <ToggleSwitch enabled={config.enabled} onToggle={onToggle} />
      </div>
      {config.enabled && (
        <div className="bg-discord-card rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-discord-muted text-sm">Währungsname</label><input value={cfg.currencyName} onChange={e=>setCfg(p=>({...p,currencyName:e.target.value}))} className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none" /></div>
            <div><label className="text-discord-muted text-sm">Emoji</label><input value={cfg.currencyEmoji} onChange={e=>setCfg(p=>({...p,currencyEmoji:e.target.value}))} className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none" /></div>
            <div><label className="text-discord-muted text-sm">Tägliche Coins (/daily)</label><input type="number" value={cfg.dailyAmount} onChange={e=>setCfg(p=>({...p,dailyAmount:+e.target.value}))} className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none" /></div>
            <div><label className="text-discord-muted text-sm">Arbeits-Coins (/work)</label><input type="number" value={cfg.workAmount} onChange={e=>setCfg(p=>({...p,workAmount:+e.target.value}))} className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none" /></div>
            <div><label className="text-discord-muted text-sm">Startguthaben</label><input type="number" value={cfg.startBalance} onChange={e=>setCfg(p=>({...p,startBalance:+e.target.value}))} className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none" /></div>
          </div>
          <button onClick={()=>onSave(cfg)} disabled={saving} className="bg-discord hover:bg-discord-dark text-white px-6 py-2 rounded-lg transition disabled:opacity-50">{saving?'Speichern...':'Speichern'}</button>
        </div>
      )}
      <div className="bg-discord-card rounded-xl p-4"><h3 className="text-white font-semibold mb-2">Befehle</h3><div className="text-sm text-discord-muted font-mono"><p>/economy balance · daily · work · pay · leaderboard</p></div></div>
    </div>
  )
}

