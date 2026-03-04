import { useState } from 'react'
import ToggleSwitch from '../../components/ToggleSwitch'

export default function CryptoModule({ config, onToggle, onSave, saving, botInfo }) {
  const channels = botInfo?.textChannels || botInfo?.textChannels || botInfo?.channels?.filter(c => c.type === 0) || [] || []
  const [cfg, setCfg] = useState({ alertChannelId: config.alertChannelId||'', trackedCoins: config.trackedCoins||['BTC','ETH','SOL'] })
  const [coin, setCoin] = useState('')
  const addCoin = () => { if(coin&&!cfg.trackedCoins.includes(coin.toUpperCase())){setCfg(p=>({...p,trackedCoins:[...p.trackedCoins,coin.toUpperCase()]}));setCoin('')} }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-discord-card rounded-xl p-5">
        <div><h2 className="text-white font-semibold">â‚¿ Krypto & NFT</h2><p className="text-discord-muted text-sm">KryptowÃ¤hrungspreise und NFT-Statistiken</p></div>
        <ToggleSwitch enabled={config.enabled} onToggle={onToggle} />
      </div>
      {config.enabled && (
        <div className="bg-discord-card rounded-xl p-5 space-y-4">
          <div><label className="text-discord-muted text-sm">Alert-Kanal</label>
            <select value={cfg.alertChannelId} onChange={e=>setCfg(p=>({...p,alertChannelId:e.target.value}))} className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none">
              <option value="">â€” Kein Kanal â€”</option>{channels.map(c=><option key={c.id} value={c.id}>#{c.name}</option>)}
            </select></div>
          <div>
            <label className="text-discord-muted text-sm">Verfolgte Coins</label>
            <div className="flex flex-wrap gap-2 mt-2 mb-2">
              {cfg.trackedCoins.map(c=>(
                <span key={c} className="flex items-center gap-1 bg-discord/30 text-white text-xs px-2 py-1 rounded-full">
                  {c}<button onClick={()=>setCfg(p=>({...p,trackedCoins:p.trackedCoins.filter(x=>x!==c)}))} className="text-red-400 ml-1">âœ•</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2"><input value={coin} onChange={e=>setCoin(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addCoin()} placeholder="BTC, ETH, SOL..." className="flex-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none text-sm" />
            <button onClick={addCoin} className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm">+</button></div>
          </div>
          <button onClick={()=>onSave(cfg)} disabled={saving} className="bg-discord hover:bg-discord-dark text-white px-6 py-2 rounded-lg transition disabled:opacity-50">{saving?'Speichern...':'Speichern'}</button>
        </div>
      )}
      <div className="bg-discord-card rounded-xl p-4"><h3 className="text-white font-semibold mb-2">Befehle</h3><div className="text-sm text-discord-muted font-mono space-y-1"><p>/crypto [symbol] â€” Krypto-Preis abfragen</p><p>/gas â€” ETH Gas-Preis abfragen</p><p>/nft [collection] â€” NFT-Sammlung abfragen</p></div></div>
    </div>
  )
}


