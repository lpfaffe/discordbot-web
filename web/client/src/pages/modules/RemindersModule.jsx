import { useState } from 'react'
import ToggleSwitch from '../../components/ToggleSwitch'

export default function RemindersModule({ config, onToggle, onSave, saving, botInfo }) {
  const channels = botInfo?.textChannels || botInfo?.textChannels || botInfo?.channels?.filter(c => c.type === 0) || [] || []
  const [items, setItems] = useState(config.items || [])
  const [newItem, setNewItem] = useState({ channelId: '', message: '', interval: 60 })

  const addItem = () => {
    if (!newItem.channelId || !newItem.message) return
    setItems(p => [...p, { ...newItem, interval: newItem.interval * 60000, active: true }])
    setNewItem({ channelId: '', message: '', interval: 60 })
  }
  const removeItem = (i) => setItems(p => p.filter((_, idx) => idx !== i))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-discord-card rounded-xl p-5">
        <div><h2 className="text-white font-semibold">â° Erinnerungen</h2><p className="text-discord-muted text-sm">Automatische Nachrichten im Intervall</p></div>
        <ToggleSwitch enabled={config.enabled} onToggle={onToggle} />
      </div>
      {config.enabled && (
        <>
          <div className="bg-discord-card rounded-xl p-5 space-y-3">
            <h3 className="text-white font-semibold">Neue Erinnerung</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-discord-muted text-xs">Kanal</label>
                <select value={newItem.channelId} onChange={e=>setNewItem(p=>({...p,channelId:e.target.value}))} className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none text-sm">
                  <option value="">â€” Kanal wÃ¤hlen â€”</option>{channels.map(c=><option key={c.id} value={c.id}>#{c.name}</option>)}
                </select></div>
              <div><label className="text-discord-muted text-xs">Interval (Minuten)</label>
                <input type="number" min={1} value={newItem.interval} onChange={e=>setNewItem(p=>({...p,interval:+e.target.value}))} className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none text-sm" /></div>
            </div>
            <div><label className="text-discord-muted text-xs">Nachricht</label>
              <textarea value={newItem.message} rows={2} onChange={e=>setNewItem(p=>({...p,message:e.target.value}))} className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none resize-none text-sm" /></div>
            <button onClick={addItem} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition">+ HinzufÃ¼gen</button>
          </div>
          <div className="bg-discord-card rounded-xl p-5 space-y-3">
            <h3 className="text-white font-semibold">Aktive Erinnerungen ({items.length})</h3>
            {items.length === 0 && <p className="text-discord-muted text-sm">Keine Erinnerungen konfiguriert.</p>}
            {items.map((item, i) => (
              <div key={i} className="flex items-start justify-between bg-discord-sidebar rounded-lg p-3">
                <div>
                  <p className="text-white text-sm">Alle {Math.round(item.interval/60000)} Min in <span className="text-discord font-mono">#{channels.find(c=>c.id===item.channelId)?.name || item.channelId}</span></p>
                  <p className="text-discord-muted text-xs mt-1">{item.message}</p>
                </div>
                <button onClick={()=>removeItem(i)} className="text-red-400 hover:text-red-300 text-xs ml-4 shrink-0">LÃ¶schen</button>
              </div>
            ))}
            {items.length > 0 && <button onClick={() => onSave({ items })} disabled={saving} className="bg-discord hover:bg-discord-dark text-white px-6 py-2 rounded-lg transition disabled:opacity-50">{saving?'Speichern...':'Speichern'}</button>}
          </div>
        </>
      )}
    </div>
  )
}


