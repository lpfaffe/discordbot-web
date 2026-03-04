import { useState } from 'react'
import ToggleSwitch from '../../components/ToggleSwitch'

export default function ReactionRolesModule({ config, onToggle, onSave, saving, botInfo }) {
  const channels = botInfo?.textChannels || botInfo?.textChannels || botInfo?.channels?.filter(c => c.type === 0) || [] || []
  const roles = botInfo?.roles || []
  const [menus, setMenus] = useState(config.menus || [])
  const [newMenu, setNewMenu] = useState({ messageId: '', channelId: '', roles: [] })
  const [newRole, setNewRole] = useState({ emoji: '', roleId: '', description: '' })

  const addRoleToMenu = () => {
    if (!newRole.emoji || !newRole.roleId) return
    setNewMenu(p => ({ ...p, roles: [...p.roles, { ...newRole }] }))
    setNewRole({ emoji: '', roleId: '', description: '' })
  }
  const addMenu = () => {
    if (!newMenu.messageId || !newMenu.channelId || newMenu.roles.length === 0) return
    setMenus(p => [...p, { ...newMenu }])
    setNewMenu({ messageId: '', channelId: '', roles: [] })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-discord-card rounded-xl p-5">
        <div><h2 className="text-white font-semibold">â¤ï¸ Reaktionsrollen</h2><p className="text-discord-muted text-sm">Rollen per Emoji-Reaktion vergeben</p></div>
        <ToggleSwitch enabled={config.enabled} onToggle={onToggle} />
      </div>
      {config.enabled && (
        <>
          <div className="bg-discord-card rounded-xl p-5 space-y-4">
            <h3 className="text-white font-semibold">Neues Reaktionsrollen-MenÃ¼</h3>
            <p className="text-discord-muted text-xs">Sende zuerst eine Nachricht im Discord, dann kopiere die Nachrichten-ID (Rechtsklick â†’ ID kopieren).</p>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-discord-muted text-xs">Nachrichten-ID</label>
                <input value={newMenu.messageId} onChange={e=>setNewMenu(p=>({...p,messageId:e.target.value}))} placeholder="123456789..." className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none text-sm" /></div>
              <div><label className="text-discord-muted text-xs">Kanal</label>
                <select value={newMenu.channelId} onChange={e=>setNewMenu(p=>({...p,channelId:e.target.value}))} className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none text-sm">
                  <option value="">â€” Kanal â€”</option>{channels.map(c=><option key={c.id} value={c.id}>#{c.name}</option>)}
                </select></div>
            </div>
            <div className="space-y-2">
              <h4 className="text-white text-sm font-medium">Rollen hinzufÃ¼gen:</h4>
              {newMenu.roles.map((r,i) => (
                <div key={i} className="flex items-center gap-2 bg-discord-sidebar rounded p-2 text-sm">
                  <span className="text-xl">{r.emoji}</span>
                  <span className="text-white flex-1">@{roles.find(ro=>ro.id===r.roleId)?.name||r.roleId}</span>
                  <button onClick={()=>setNewMenu(p=>({...p,roles:p.roles.filter((_,idx)=>idx!==i)}))} className="text-red-400 text-xs">âœ•</button>
                </div>
              ))}
              <div className="grid grid-cols-3 gap-2">
                <div><label className="text-discord-muted text-xs">Emoji</label><input value={newRole.emoji} onChange={e=>setNewRole(p=>({...p,emoji:e.target.value}))} placeholder="â­" className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none text-sm" /></div>
                <div><label className="text-discord-muted text-xs">Rolle</label>
                  <select value={newRole.roleId} onChange={e=>setNewRole(p=>({...p,roleId:e.target.value}))} className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none text-sm">
                    <option value="">â€” Rolle â€”</option>{roles.map(r=><option key={r.id} value={r.id}>@{r.name}</option>)}
                  </select></div>
                <div><label className="text-discord-muted text-xs">Beschreibung</label><input value={newRole.description} onChange={e=>setNewRole(p=>({...p,description:e.target.value}))} placeholder="Optional" className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none text-sm" /></div>
              </div>
              <button onClick={addRoleToMenu} className="bg-green-700 hover:bg-green-800 text-white px-3 py-1.5 rounded text-sm">+ Rolle hinzufÃ¼gen</button>
            </div>
            <button onClick={addMenu} className="bg-discord hover:bg-discord-dark text-white px-4 py-2 rounded-lg text-sm">MenÃ¼ erstellen</button>
          </div>

          <div className="bg-discord-card rounded-xl p-5 space-y-3">
            <h3 className="text-white font-semibold">Konfigurierte MenÃ¼s ({menus.length})</h3>
            {menus.length === 0 && <p className="text-discord-muted text-sm">Noch keine Reaktionsrollen-MenÃ¼s.</p>}
            {menus.map((menu, i) => (
              <div key={i} className="bg-discord-sidebar rounded-lg p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-white text-sm font-mono">#{channels.find(c=>c.id===menu.channelId)?.name||menu.channelId} â†’ ID: {menu.messageId}</p>
                  <button onClick={()=>setMenus(p=>p.filter((_,idx)=>idx!==i))} className="text-red-400 text-xs">LÃ¶schen</button>
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {menu.roles.map((r,j) => <span key={j} className="text-xs bg-discord/30 text-white rounded px-2 py-0.5">{r.emoji} @{roles.find(ro=>ro.id===r.roleId)?.name||r.roleId}</span>)}
                </div>
              </div>
            ))}
            {menus.length > 0 && <button onClick={() => onSave({ menus })} disabled={saving} className="bg-discord hover:bg-discord-dark text-white px-6 py-2 rounded-lg transition disabled:opacity-50">{saving?'Speichern...':'Speichern'}</button>}
          </div>
        </>
      )}
    </div>
  )
}


