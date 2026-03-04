import { useState } from 'react'
import ToggleSwitch from '../../components/ToggleSwitch'

export default function CustomCommandsModule({ config, onToggle, onSave, saving, botInfo }) {
  const roles = botInfo?.roles || []
  const [commands, setCommands] = useState(config.commands || [])
  const [newCmd, setNewCmd] = useState({ name: '', response: '', description: '', roleId: '' })

  const addCmd = () => {
    if (!newCmd.name || !newCmd.response) return
    setCommands(p => [...p, { ...newCmd }])
    setNewCmd({ name: '', response: '', description: '', roleId: '' })
  }
  const removeCmd = (i) => setCommands(p => p.filter((_, idx) => idx !== i))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-discord-card rounded-xl p-5">
        <div><h2 className="text-white font-semibold">⌨️ Eigene Befehle</h2><p className="text-discord-muted text-sm">Eigene Text-Befehle mit !befehl</p></div>
        <ToggleSwitch enabled={config.enabled} onToggle={onToggle} />
      </div>
      {config.enabled && (
        <>
          <div className="bg-discord-card rounded-xl p-5 space-y-3">
            <h3 className="text-white font-semibold">Neuer Befehl</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-discord-muted text-xs">Name (ohne !)</label><input value={newCmd.name} onChange={e=>setNewCmd(p=>({...p,name:e.target.value}))} placeholder="befehl" className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none text-sm" /></div>
              <div><label className="text-discord-muted text-xs">Beschreibung</label><input value={newCmd.description} onChange={e=>setNewCmd(p=>({...p,description:e.target.value}))} placeholder="Optional" className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none text-sm" /></div>
            </div>
            <div><label className="text-discord-muted text-xs">Antwort</label><textarea value={newCmd.response} onChange={e=>setNewCmd(p=>({...p,response:e.target.value}))} rows={2} placeholder="Bot-Antwort..." className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none resize-none text-sm" /></div>
            <div><label className="text-discord-muted text-xs">Nur für Rolle (optional)</label>
              <select value={newCmd.roleId} onChange={e=>setNewCmd(p=>({...p,roleId:e.target.value}))} className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none text-sm">
                <option value="">— Alle —</option>{roles.map(r=><option key={r.id} value={r.id}>@{r.name}</option>)}
              </select></div>
            <button onClick={addCmd} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition">+ Hinzufügen</button>
          </div>
          <div className="bg-discord-card rounded-xl p-5 space-y-3">
            <h3 className="text-white font-semibold">Befehle ({commands.length})</h3>
            {commands.length === 0 && <p className="text-discord-muted text-sm">Noch keine eigenen Befehle.</p>}
            {commands.map((cmd, i) => (
              <div key={i} className="flex items-start justify-between bg-discord-sidebar rounded-lg p-3">
                <div><p className="text-white text-sm font-mono">!{cmd.name}</p><p className="text-discord-muted text-xs">{cmd.response}</p></div>
                <button onClick={()=>removeCmd(i)} className="text-red-400 hover:text-red-300 text-xs ml-4">Löschen</button>
              </div>
            ))}
            {commands.length > 0 && <button onClick={() => onSave({ commands })} disabled={saving} className="bg-discord hover:bg-discord-dark text-white px-6 py-2 rounded-lg transition disabled:opacity-50">{saving?'Speichern...':'Speichern'}</button>}
          </div>
        </>
      )}
    </div>
  )
}

