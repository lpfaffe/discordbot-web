import { useState } from 'react'
import ToggleSwitch from '../../components/ToggleSwitch'

const ACHIEVEMENT_TYPES = [
  { value: 'messages', label: 'ðŸ’¬ Nachrichten senden' },
  { value: 'level',    label: 'â­ Level erreichen' },
  { value: 'invites',  label: 'ðŸ“¨ Einladungen' },
  { value: 'voice',    label: 'ðŸ”Š Zeit im Voice-Kanal (Min)' },
]

export default function AchievementsModule({ config, onToggle, onSave, saving, botInfo }) {
  const roles = botInfo?.roles || []
  const channels = botInfo?.textChannels || botInfo?.textChannels || botInfo?.channels?.filter(c => c.type === 0) || [] || []
  const [achievements, setAchievements] = useState(config.achievements || [])
  const [ann, setAnn] = useState(config.announcementChannelId || '')
  const [newA, setNewA] = useState({ name: '', description: '', type: 'messages', threshold: 100, roleId: '', emoji: 'ðŸ†' })

  const add = () => {
    if (!newA.name) return
    setAchievements(p => [...p, { ...newA, id: Date.now().toString() }])
    setNewA({ name: '', description: '', type: 'messages', threshold: 100, roleId: '', emoji: 'ðŸ†' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-discord-card rounded-xl p-5">
        <div><h2 className="text-white font-semibold">ðŸ† Errungenschaften</h2><p className="text-discord-muted text-sm">Belohne Mitglieder fÃ¼r ihre AktivitÃ¤t</p></div>
        <ToggleSwitch enabled={config.enabled} onToggle={onToggle} />
      </div>
      {config.enabled && (
        <>
          <div className="bg-discord-card rounded-xl p-5 space-y-3">
            <h3 className="text-white font-semibold">AnkÃ¼ndigungs-Kanal</h3>
            <select value={ann} onChange={e=>setAnn(e.target.value)} className="w-full bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none">
              <option value="">â€” Kein Kanal â€”</option>{channels.map(c=><option key={c.id} value={c.id}>#{c.name}</option>)}
            </select>
          </div>
          <div className="bg-discord-card rounded-xl p-5 space-y-3">
            <h3 className="text-white font-semibold">Neue Errungenschaft</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-discord-muted text-xs">Name</label><input value={newA.name} onChange={e=>setNewA(p=>({...p,name:e.target.value}))} placeholder="Vielschreiber" className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none text-sm" /></div>
              <div><label className="text-discord-muted text-xs">Emoji</label><input value={newA.emoji} onChange={e=>setNewA(p=>({...p,emoji:e.target.value}))} className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none text-sm" /></div>
              <div><label className="text-discord-muted text-xs">Typ</label>
                <select value={newA.type} onChange={e=>setNewA(p=>({...p,type:e.target.value}))} className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none text-sm">
                  {ACHIEVEMENT_TYPES.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}
                </select></div>
              <div><label className="text-discord-muted text-xs">Schwellenwert</label><input type="number" min={1} value={newA.threshold} onChange={e=>setNewA(p=>({...p,threshold:+e.target.value}))} className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none text-sm" /></div>
              <div className="col-span-2"><label className="text-discord-muted text-xs">Beschreibung</label><input value={newA.description} onChange={e=>setNewA(p=>({...p,description:e.target.value}))} placeholder="Sende 100 Nachrichten" className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none text-sm" /></div>
              <div className="col-span-2"><label className="text-discord-muted text-xs">Belohnungs-Rolle (optional)</label>
                <select value={newA.roleId} onChange={e=>setNewA(p=>({...p,roleId:e.target.value}))} className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none text-sm">
                  <option value="">â€” Keine Rolle â€”</option>{roles.map(r=><option key={r.id} value={r.id}>@{r.name}</option>)}
                </select></div>
            </div>
            <button onClick={add} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm">+ HinzufÃ¼gen</button>
          </div>
          <div className="bg-discord-card rounded-xl p-5 space-y-3">
            <h3 className="text-white font-semibold">Errungenschaften ({achievements.length})</h3>
            {achievements.length === 0 && <p className="text-discord-muted text-sm">Noch keine Errungenschaften.</p>}
            {achievements.map((a,i) => (
              <div key={i} className="flex items-center justify-between bg-discord-sidebar rounded-lg p-3">
                <div><p className="text-white text-sm">{a.emoji} {a.name} â€” {ACHIEVEMENT_TYPES.find(t=>t.value===a.type)?.label} â‰¥ {a.threshold}</p><p className="text-discord-muted text-xs">{a.description}</p></div>
                <button onClick={()=>setAchievements(p=>p.filter((_,idx)=>idx!==i))} className="text-red-400 text-xs ml-4">âœ•</button>
              </div>
            ))}
            <button onClick={()=>onSave({ achievements, announcementChannelId: ann })} disabled={saving} className="bg-discord hover:bg-discord-dark text-white px-6 py-2 rounded-lg transition disabled:opacity-50">{saving?'Speichern...':'Speichern'}</button>
          </div>
        </>
      )}
    </div>
  )
}


