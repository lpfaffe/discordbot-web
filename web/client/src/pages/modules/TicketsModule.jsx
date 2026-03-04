import { useState } from 'react'
import ToggleSwitch from '../../components/ToggleSwitch'

const COLORS = ['#5865F2','#57F287','#FEE75C','#ED4245','#EB459E','#9B59B6','#E67E22','#1ABC9C']

function PanelEditor({ panel, onChange, channels, categories, roles }) {
  const [activeType, setActiveType] = useState(null)

  const updatePanel = (key, val) => onChange({ ...panel, [key]: val })
  const updateType = (idx, key, val) => {
    const types = [...(panel.types || [])]
    types[idx] = { ...types[idx], [key]: val }
    onChange({ ...panel, types })
  }
  const addType = () => {
    const types = [...(panel.types || []), { id: `type${Date.now()}`, label: 'Neuer Typ', emoji: 'ðŸŽ«', description: '', prefix: 'ticket', categoryId: '', extraRoleId: '', message: '', color: '#5865F2' }]
    onChange({ ...panel, types })
    setActiveType(types.length - 1)
  }
  const removeType = (idx) => {
    const types = (panel.types || []).filter((_, i) => i !== idx)
    onChange({ ...panel, types })
    setActiveType(null)
  }

  return (
    <div className="space-y-4">
      {/* Panel Basis-Einstellungen */}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-discord-muted text-xs block mb-1">Panel-Name (intern)</label>
          <input value={panel.name||''} onChange={e=>updatePanel('name',e.target.value)} className="w-full bg-discord-bg text-white rounded px-3 py-2 border border-white/10 outline-none text-sm" placeholder="Support Panel" />
        </div>
        <div className="col-span-2">
          <label className="text-discord-muted text-xs block mb-1">ðŸ“¢ Panel-Titel</label>
          <input value={panel.title||''} onChange={e=>updatePanel('title',e.target.value)} className="w-full bg-discord-bg text-white rounded px-3 py-2 border border-white/10 outline-none text-sm" placeholder="ðŸŽ« Support-Tickets" />
        </div>
        <div className="col-span-2">
          <label className="text-discord-muted text-xs block mb-1">ðŸ“ Panel-Beschreibung</label>
          <textarea value={panel.description||''} rows={2} onChange={e=>updatePanel('description',e.target.value)} className="w-full bg-discord-bg text-white rounded px-3 py-2 border border-white/10 outline-none resize-none text-sm" />
        </div>
        <div>
          <label className="text-discord-muted text-xs block mb-1">ðŸŽ¨ Farbe</label>
          <div className="flex gap-1 flex-wrap mt-1">
            {COLORS.map(c => <button key={c} onClick={()=>updatePanel('color',c)} style={{background:c}} className={`w-6 h-6 rounded-full border-2 transition ${panel.color===c?'border-white scale-110':'border-transparent'}`} />)}
          </div>
        </div>
        <div>
          <label className="text-discord-muted text-xs block mb-1">Footer-Text</label>
          <input value={panel.footer||''} onChange={e=>updatePanel('footer',e.target.value)} className="w-full bg-discord-bg text-white rounded px-3 py-2 border border-white/10 outline-none text-sm" placeholder="Support-System" />
        </div>
      </div>

      {/* Vorschau */}
      <div className="rounded-lg p-3 border-l-4" style={{borderColor: panel.color||'#5865F2', background:'rgba(0,0,0,0.3)'}}>
        <p className="text-white font-bold text-sm">{panel.title||'ðŸŽ« Support-Tickets'}</p>
        <p className="text-gray-400 text-xs mt-1">{panel.description||'Klicke auf einen Button...'}</p>
        <div className="flex gap-2 mt-2 flex-wrap">
          {(panel.types||[]).map(t=>(
            <span key={t.id} style={{background: t.color||'#5865F2'}} className="text-white text-xs px-3 py-1 rounded font-medium">{t.emoji} {t.label}</span>
          ))}
          {!(panel.types?.length) && <span className="bg-discord/80 text-white text-xs px-3 py-1 rounded">ðŸŽ« Support</span>}
        </div>
        {panel.footer && <p className="text-gray-600 text-xs mt-2">{panel.footer}</p>}
      </div>

      {/* Ticket-Typen */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-discord-muted text-xs font-bold uppercase tracking-wider">Ticket-Typen</label>
          <button onClick={addType} className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded-lg">+ Typ hinzufÃ¼gen</button>
        </div>
        <div className="space-y-2">
          {(panel.types||[]).map((t, i) => (
            <div key={i} className="bg-discord-bg rounded-lg border border-white/10">
              <div className="flex items-center justify-between px-3 py-2 cursor-pointer" onClick={()=>setActiveType(activeType===i?null:i)}>
                <span className="text-white text-sm">{t.emoji} {t.label}</span>
                <div className="flex gap-2">
                  <button onClick={e=>{e.stopPropagation();removeType(i)}} className="text-red-400 text-xs">âœ•</button>
                  <span className="text-discord-muted text-xs">{activeType===i?'â–²':'â–¼'}</span>
                </div>
              </div>
              {activeType===i && (
                <div className="px-3 pb-3 pt-1 border-t border-white/5 grid grid-cols-2 gap-3">
                  <div><label className="text-discord-muted text-xs">Label</label><input value={t.label} onChange={e=>updateType(i,'label',e.target.value)} className="w-full mt-1 bg-discord-sidebar text-white rounded px-2 py-1.5 border border-white/10 outline-none text-xs" /></div>
                  <div><label className="text-discord-muted text-xs">Emoji</label><input value={t.emoji} onChange={e=>updateType(i,'emoji',e.target.value)} className="w-full mt-1 bg-discord-sidebar text-white rounded px-2 py-1.5 border border-white/10 outline-none text-xs" /></div>
                  <div><label className="text-discord-muted text-xs">Kanal-Prefix</label><input value={t.prefix||''} onChange={e=>updateType(i,'prefix',e.target.value)} placeholder="ticket" className="w-full mt-1 bg-discord-sidebar text-white rounded px-2 py-1.5 border border-white/10 outline-none text-xs" /></div>
                  <div>
                    <label className="text-discord-muted text-xs">Farbe</label>
                    <div className="flex gap-1 flex-wrap mt-1">
                      {COLORS.map(c=><button key={c} onClick={()=>updateType(i,'color',c)} style={{background:c}} className={`w-5 h-5 rounded-full border-2 ${t.color===c?'border-white':'border-transparent'}`} />)}
                    </div>
                  </div>
                  <div className="col-span-2"><label className="text-discord-muted text-xs">Kategorie (eigene)</label>
                    <select value={t.categoryId||''} onChange={e=>updateType(i,'categoryId',e.target.value)} className="w-full mt-1 bg-discord-sidebar text-white rounded px-2 py-1.5 border border-white/10 outline-none text-xs">
                      <option value="">â€” Globale Kategorie â€”</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                    </select></div>
                  <div className="col-span-2"><label className="text-discord-muted text-xs">Extra-Rolle (zusÃ¤tzlich zur Support-Rolle)</label>
                    <select value={t.extraRoleId||''} onChange={e=>updateType(i,'extraRoleId',e.target.value)} className="w-full mt-1 bg-discord-sidebar text-white rounded px-2 py-1.5 border border-white/10 outline-none text-xs">
                      <option value="">â€” Keine Extra-Rolle â€”</option>{roles.map(r=><option key={r.id} value={r.id}>@{r.name}</option>)}
                    </select></div>
                  <div className="col-span-2"><label className="text-discord-muted text-xs">Willkommensnachricht ({'{user}'}, {'{type}'})</label>
                    <textarea value={t.message||''} rows={2} onChange={e=>updateType(i,'message',e.target.value)} placeholder="Hallo {user}! Wir helfen dir so schnell wie mÃ¶glich." className="w-full mt-1 bg-discord-sidebar text-white rounded px-2 py-1.5 border border-white/10 outline-none resize-none text-xs" /></div>
                  <div className="col-span-2"><label className="text-discord-muted text-xs">Beschreibung (im SelectMenu)</label>
                    <input value={t.description||''} onChange={e=>updateType(i,'description',e.target.value)} className="w-full mt-1 bg-discord-sidebar text-white rounded px-2 py-1.5 border border-white/10 outline-none text-xs" /></div>
                </div>
              )}
            </div>
          ))}
          {!(panel.types?.length) && <p className="text-discord-muted text-xs text-center py-3">Kein Typ â†’ Standard-Button "Support" wird angezeigt</p>}
        </div>
      </div>
    </div>
  )
}

export default function TicketsModule({ config, onToggle, onSave, saving, botInfo }) {
  const channels   = botInfo?.textChannels  || botInfo?.textChannels || botInfo?.textChannels || botInfo?.channels?.filter(c => c.type === 0) || [] || []
  const categories = botInfo?.categories    || botInfo?.categories || botInfo?.channels?.filter(c => c.type === 4) || []
  const roles      = botInfo?.roles || []

  const [cfg, setCfg] = useState({
    categoryId:    config.categoryId    || '',
    supportRoleId: config.supportRoleId || '',
    logChannelId:  config.logChannelId  || '',
    message:       config.message       || 'Hallo {user}! Das Support-Team wird sich bald melden.',
    maxTickets:    config.maxTickets    || 1,
    ratingEnabled: config.ratingEnabled || false,
    dmOnClose:     config.dmOnClose     !== false,
    panels:        config.panels        || [{ name: 'Support Panel', title: 'ðŸŽ« Support-Tickets', description: 'Klicke auf einen Button um ein Ticket zu erstellen.', color: '#5865F2', footer: 'Support-System', types: [] }]
  })

  const [activePanel, setActivePanel] = useState(0)

  const updatePanel = (idx, val) => {
    const panels = [...cfg.panels]; panels[idx] = val; setCfg(p => ({ ...p, panels }))
  }
  const addPanel = () => {
    setCfg(p => ({ ...p, panels: [...p.panels, { name: `Panel ${p.panels.length + 1}`, title: 'ðŸŽ« Tickets', description: 'Erstelle ein Ticket.', color: '#5865F2', footer: 'Support', types: [] }] }))
    setActivePanel(cfg.panels.length)
  }
  const removePanel = (idx) => {
    setCfg(p => ({ ...p, panels: p.panels.filter((_, i) => i !== idx) }))
    setActivePanel(0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-discord-card rounded-xl p-5">
        <div>
          <h2 className="text-white font-bold text-lg">ðŸŽ« Ticketsystem</h2>
          <p className="text-discord-muted text-sm">VollstÃ¤ndiges Ticket-System wie TicketTool</p>
        </div>
        <ToggleSwitch enabled={config.enabled} onToggle={onToggle} />
      </div>

      {config.enabled && (
        <>
          {/* Globale Einstellungen */}
          <div className="bg-discord-card rounded-xl p-5 space-y-4">
            <h3 className="text-white font-semibold">âš™ï¸ Globale Einstellungen</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-discord-muted text-sm block mb-1">ðŸ“‚ Standard-Kategorie</label>
                <select value={cfg.categoryId} onChange={e=>setCfg(p=>({...p,categoryId:e.target.value}))} className="w-full bg-discord-sidebar text-white rounded-lg px-3 py-2 border border-white/10 outline-none text-sm">
                  <option value="">â€” Keine Kategorie â€”</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-discord-muted text-sm block mb-1">ðŸ‘® Support-Rolle</label>
                <select value={cfg.supportRoleId} onChange={e=>setCfg(p=>({...p,supportRoleId:e.target.value}))} className="w-full bg-discord-sidebar text-white rounded-lg px-3 py-2 border border-white/10 outline-none text-sm">
                  <option value="">â€” Keine Rolle â€”</option>{roles.map(r=><option key={r.id} value={r.id}>@{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-discord-muted text-sm block mb-1">ðŸ“¢ Log-Kanal</label>
                <select value={cfg.logChannelId} onChange={e=>setCfg(p=>({...p,logChannelId:e.target.value}))} className="w-full bg-discord-sidebar text-white rounded-lg px-3 py-2 border border-white/10 outline-none text-sm">
                  <option value="">â€” Kein Log â€”</option>{channels.map(c=><option key={c.id} value={c.id}>#{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-discord-muted text-sm block mb-1">ðŸŽ« Max. Tickets pro Nutzer</label>
                <input type="number" min={1} max={10} value={cfg.maxTickets} onChange={e=>setCfg(p=>({...p,maxTickets:+e.target.value}))} className="w-full bg-discord-sidebar text-white rounded-lg px-3 py-2 border border-white/10 outline-none text-sm" />
              </div>
              <div className="col-span-2">
                <label className="text-discord-muted text-sm block mb-1">ðŸ’¬ Fallback Willkommensnachricht</label>
                <textarea value={cfg.message} rows={2} onChange={e=>setCfg(p=>({...p,message:e.target.value}))} className="w-full bg-discord-sidebar text-white rounded-lg px-3 py-2 border border-white/10 outline-none resize-none text-sm" />
                <p className="text-discord-muted text-xs mt-1">Platzhalter: {'{ user }'}, {'{ type }'}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={cfg.ratingEnabled} onChange={e=>setCfg(p=>({...p,ratingEnabled:e.target.checked}))} className="w-4 h-4 accent-discord" />
                <span className="text-white text-sm">â­ Bewertung nach SchlieÃŸung per DM</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={cfg.dmOnClose} onChange={e=>setCfg(p=>({...p,dmOnClose:e.target.checked}))} className="w-4 h-4 accent-discord" />
                <span className="text-white text-sm">ðŸ“© DM beim SchlieÃŸen senden</span>
              </label>
            </div>
          </div>

          {/* Panel-Editor */}
          <div className="bg-discord-card rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">ðŸ–¼ï¸ Panels konfigurieren</h3>
              <button onClick={addPanel} className="bg-discord hover:bg-discord-dark text-white text-xs px-3 py-1.5 rounded-lg">+ Panel hinzufÃ¼gen</button>
            </div>

            {/* Panel-Tabs */}
            <div className="flex gap-2 flex-wrap">
              {cfg.panels.map((p, i) => (
                <div key={i} className="flex items-center gap-1">
                  <button onClick={()=>setActivePanel(i)} className={`text-xs px-3 py-1.5 rounded-lg transition ${activePanel===i?'bg-discord text-white':'bg-discord-sidebar text-discord-muted hover:text-white'}`}>{p.name||`Panel ${i+1}`}</button>
                  {cfg.panels.length > 1 && <button onClick={()=>removePanel(i)} className="text-red-400 text-xs hover:text-red-300">âœ•</button>}
                </div>
              ))}
            </div>

            {cfg.panels[activePanel] && (
              <PanelEditor
                panel={cfg.panels[activePanel]}
                onChange={val => updatePanel(activePanel, val)}
                channels={channels}
                categories={categories}
                roles={roles}
              />
            )}
          </div>

          {/* Befehle */}
          <div className="bg-discord-card rounded-xl p-5">
            <h3 className="text-white font-semibold mb-3">ðŸ› ï¸ VerfÃ¼gbare Befehle</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                ['/ticket panel', 'Panel in Kanal senden'],
                ['/ticket open [typ] [grund]', 'Ticket manuell Ã¶ffnen'],
                ['/ticket close [grund]', 'Ticket schlieÃŸen'],
                ['/ticket claim', 'Ticket beanspruchen'],
                ['/ticket unclaim', 'Ticket freigeben'],
                ['/ticket hold', 'Auf Wartestellung setzen'],
                ['/ticket unhold', 'Wartestellung aufheben'],
                ['/ticket add @nutzer', 'Nutzer hinzufÃ¼gen'],
                ['/ticket remove @nutzer', 'Nutzer entfernen'],
                ['/ticket rename [name]', 'Ticket umbenennen'],
                ['/ticket move [typ]', 'Ticket-Typ wechseln'],
                ['/ticket priority [stufe]', 'PrioritÃ¤t setzen'],
                ['/ticket transcript', 'Transcript erstellen'],
              ].map(([cmd, desc]) => (
                <div key={cmd} className="flex items-center gap-2 bg-discord-sidebar rounded-lg p-2">
                  <code className="text-discord text-xs font-mono shrink-0">{cmd}</code>
                  <span className="text-discord-muted text-xs">{desc}</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => onSave(cfg)} disabled={saving}
            className="w-full bg-discord hover:bg-discord-dark disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition">
            {saving ? 'Speichere...' : 'ðŸ’¾ Alles speichern'}
          </button>
        </>
      )}
    </div>
  )
}

