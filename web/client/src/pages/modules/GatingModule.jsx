import { useState } from 'react'
import ToggleSwitch from '../../components/ToggleSwitch'

export default function GatingModule({ config, onToggle, onSave, saving, botInfo }) {
  const roles = botInfo?.roles||[]
  const [rules, setRules] = useState(config.rules||[])
  const [newRule, setNewRule] = useState({ type:'nft', collection:'', minAmount:1, roleId:'' })

  const add = () => {
    if(!newRule.collection||!newRule.roleId) return
    setRules(p=>[...p,{...newRule}])
    setNewRule({ type:'nft', collection:'', minAmount:1, roleId:'' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-discord-card rounded-xl p-5">
        <div><h2 className="text-white font-semibold">🔐 Gating</h2><p className="text-discord-muted text-sm">NFT/Token-Inhabern automatisch Rollen geben</p></div>
        <ToggleSwitch enabled={config.enabled} onToggle={onToggle} />
      </div>
      {config.enabled && (
        <>
          <div className="bg-discord-card rounded-xl p-5 space-y-3">
            <h3 className="text-white font-semibold">Neue Gating-Regel</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-discord-muted text-xs">Typ</label>
                <select value={newRule.type} onChange={e=>setNewRule(p=>({...p,type:e.target.value}))} className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none text-sm">
                  <option value="nft">NFT-Sammlung</option>
                  <option value="token">ERC-20 Token</option>
                  <option value="eth">ETH-Guthaben</option>
                </select></div>
              <div><label className="text-discord-muted text-xs">Mindestmenge</label><input type="number" min={1} value={newRule.minAmount} onChange={e=>setNewRule(p=>({...p,minAmount:+e.target.value}))} className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none text-sm" /></div>
              <div className="col-span-2"><label className="text-discord-muted text-xs">Collection/Contract-Adresse</label><input value={newRule.collection} onChange={e=>setNewRule(p=>({...p,collection:e.target.value}))} placeholder="0x..." className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none text-sm" /></div>
              <div className="col-span-2"><label className="text-discord-muted text-xs">Zu vergebende Rolle</label>
                <select value={newRule.roleId} onChange={e=>setNewRule(p=>({...p,roleId:e.target.value}))} className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none text-sm">
                  <option value="">— Rolle —</option>{roles.map(r=><option key={r.id} value={r.id}>@{r.name}</option>)}
                </select></div>
            </div>
            <button onClick={add} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm">+ Regel hinzufügen</button>
          </div>
          <div className="bg-discord-card rounded-xl p-5 space-y-3">
            <h3 className="text-white font-semibold">Regeln ({rules.length})</h3>
            {rules.length===0&&<p className="text-discord-muted text-sm">Keine Gating-Regeln.</p>}
            {rules.map((r,i)=>(
              <div key={i} className="flex items-center justify-between bg-discord-sidebar rounded-lg p-3">
                <div><p className="text-white text-sm">{r.type.toUpperCase()} ≥{r.minAmount} → @{roles.find(ro=>ro.id===r.roleId)?.name||r.roleId}</p><p className="text-discord-muted text-xs font-mono">{r.collection}</p></div>
                <button onClick={()=>setRules(p=>p.filter((_,idx)=>idx!==i))} className="text-red-400 text-xs ml-4">✕</button>
              </div>
            ))}
            {rules.length>0&&<button onClick={()=>onSave({rules})} disabled={saving} className="bg-discord hover:bg-discord-dark text-white px-6 py-2 rounded-lg transition disabled:opacity-50">{saving?'Speichern...':'Speichern'}</button>}
          </div>
          <div className="bg-discord-card rounded-xl p-4 text-discord-muted text-xs"><p>ℹ️ Mitglieder verknüpfen ihre Wallet mit <code className="text-discord">/wallet connect</code>. Der Bot prüft dann automatisch ihr Guthaben.</p></div>
        </>
      )}
    </div>
  )
}

