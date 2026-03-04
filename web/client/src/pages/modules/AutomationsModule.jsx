import { useState } from 'react'
import ToggleSwitch from '../../components/ToggleSwitch'

const TRIGGER_TYPES = [
  { value: 'messageCreate', label: 'ðŸ’¬ Nachricht gesendet' },
  { value: 'memberJoin',    label: 'ðŸ‘‹ Mitglied beigetreten' },
  { value: 'memberLeave',   label: 'ðŸšª Mitglied verlassen' },
  { value: 'reactionAdd',   label: 'â¤ï¸ Reaktion hinzugefÃ¼gt' },
  { value: 'levelUp',       label: 'â­ Level-Aufstieg' },
]
const ACTION_TYPES = [
  { value: 'sendMessage',   label: 'ðŸ’¬ Nachricht senden' },
  { value: 'addRole',       label: 'âž• Rolle hinzufÃ¼gen' },
  { value: 'removeRole',    label: 'âž– Rolle entfernen' },
  { value: 'dmUser',        label: 'ðŸ“© DM senden' },
]

export default function AutomationsModule({ config, onToggle, onSave, saving, botInfo }) {
  const channels = botInfo?.textChannels || botInfo?.textChannels || botInfo?.channels?.filter(c => c.type === 0) || [] || []
  const roles = botInfo?.roles||[]
  const [automations, setAutomations] = useState(config.automations||[])
  const [newAuto, setNewAuto] = useState({ name:'', trigger:'messageCreate', triggerValue:'', action:'sendMessage', actionValue:'', channelId:'', roleId:'' })

  const add = () => {
    if (!newAuto.name || !newAuto.actionValue) return
    setAutomations(p=>[...p,{...newAuto,enabled:true}])
    setNewAuto({ name:'',trigger:'messageCreate',triggerValue:'',action:'sendMessage',actionValue:'',channelId:'',roleId:'' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-discord-card rounded-xl p-5">
        <div><h2 className="text-white font-semibold">âš¡ Automatisierungen</h2><p className="text-discord-muted text-sm">Automatische Bot-Aktionen bei Ereignissen</p></div>
        <ToggleSwitch enabled={config.enabled} onToggle={onToggle} />
      </div>
      {config.enabled && (
        <>
          <div className="bg-discord-card rounded-xl p-5 space-y-3">
            <h3 className="text-white font-semibold">Neue Automatisierung</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><label className="text-discord-muted text-xs">Name</label><input value={newAuto.name} onChange={e=>setNewAuto(p=>({...p,name:e.target.value}))} placeholder="Bsp: BegrÃ¼ÃŸe neue Member" className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none text-sm" /></div>
              <div><label className="text-discord-muted text-xs">AuslÃ¶ser (Trigger)</label>
                <select value={newAuto.trigger} onChange={e=>setNewAuto(p=>({...p,trigger:e.target.value}))} className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none text-sm">
                  {TRIGGER_TYPES.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}
                </select></div>
              <div><label className="text-discord-muted text-xs">Aktion</label>
                <select value={newAuto.action} onChange={e=>setNewAuto(p=>({...p,action:e.target.value}))} className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none text-sm">
                  {ACTION_TYPES.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}
                </select></div>
              {(newAuto.action==='sendMessage'||newAuto.action==='dmUser') && (
                <div className="col-span-2"><label className="text-discord-muted text-xs">Nachricht</label><textarea value={newAuto.actionValue} onChange={e=>setNewAuto(p=>({...p,actionValue:e.target.value}))} rows={2} placeholder="Willkommen {user}!" className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none resize-none text-sm" /></div>
              )}
              {(newAuto.action==='sendMessage') && (
                <div className="col-span-2"><label className="text-discord-muted text-xs">Ziel-Kanal</label>
                  <select value={newAuto.channelId} onChange={e=>setNewAuto(p=>({...p,channelId:e.target.value}))} className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none text-sm">
                    <option value="">â€” Kanal â€”</option>{channels.map(c=><option key={c.id} value={c.id}>#{c.name}</option>)}
                  </select></div>
              )}
              {(newAuto.action==='addRole'||newAuto.action==='removeRole') && (
                <div className="col-span-2"><label className="text-discord-muted text-xs">Rolle</label>
                  <select value={newAuto.roleId} onChange={e=>setNewAuto(p=>({...p,roleId:e.target.value,actionValue:e.target.value}))} className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none text-sm">
                    <option value="">â€” Rolle â€”</option>{roles.map(r=><option key={r.id} value={r.id}>@{r.name}</option>)}
                  </select></div>
              )}
            </div>
            <button onClick={add} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm">+ Automatisierung erstellen</button>
          </div>
          <div className="bg-discord-card rounded-xl p-5 space-y-3">
            <h3 className="text-white font-semibold">Aktive Automatisierungen ({automations.length})</h3>
            {automations.length===0 && <p className="text-discord-muted text-sm">Keine Automatisierungen.</p>}
            {automations.map((a,i)=>(
              <div key={i} className="flex items-center justify-between bg-discord-sidebar rounded-lg p-3">
                <div><p className="text-white text-sm font-semibold">{a.name}</p><p className="text-discord-muted text-xs">{TRIGGER_TYPES.find(t=>t.value===a.trigger)?.label} â†’ {ACTION_TYPES.find(t=>t.value===a.action)?.label}</p></div>
                <button onClick={()=>setAutomations(p=>p.filter((_,idx)=>idx!==i))} className="text-red-400 text-xs ml-4">âœ•</button>
              </div>
            ))}
            {automations.length>0 && <button onClick={()=>onSave({automations})} disabled={saving} className="bg-discord hover:bg-discord-dark text-white px-6 py-2 rounded-lg transition disabled:opacity-50">{saving?'Speichern...':'Speichern'}</button>}
          </div>
        </>
      )}
    </div>
  )
}


