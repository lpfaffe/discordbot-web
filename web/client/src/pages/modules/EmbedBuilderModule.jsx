import { useState } from 'react'
import ToggleSwitch from '../../components/ToggleSwitch'

export default function EmbedBuilderModule({ config, onToggle, onSave, saving, botInfo }) {
  const channels = botInfo?.textChannels || botInfo?.textChannels || botInfo?.channels?.filter(c => c.type === 0) || [] || []
  const [embed, setEmbed] = useState({ title:'', description:'', color:'#5865F2', footer:'', thumbnail:'', channelId:'' })
  const s = (k,v) => setEmbed(p=>({...p,[k]:v}))

  const send = () => {
    if (!embed.channelId || !embed.title) return
    onSave({ pendingEmbed: embed })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-discord-card rounded-xl p-5">
        <div><h2 className="text-white font-semibold">ðŸ“‹ Einbettungen</h2><p className="text-discord-muted text-sm">Erstelle eingebettete Nachrichten per Dashboard</p></div>
        <ToggleSwitch enabled={config.enabled} onToggle={onToggle} />
      </div>
      {config.enabled && (
        <div className="bg-discord-card rounded-xl p-5 space-y-4">
          <h3 className="text-white font-semibold">Embed erstellen & senden</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className="text-discord-muted text-xs">Titel</label><input value={embed.title} onChange={e=>s('title',e.target.value)} placeholder="Regelwerk" className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none text-sm" /></div>
            <div className="col-span-2"><label className="text-discord-muted text-xs">Beschreibung</label><textarea value={embed.description} onChange={e=>s('description',e.target.value)} rows={4} placeholder="Text hier..." className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none resize-none text-sm" /></div>
            <div><label className="text-discord-muted text-xs">Farbe</label><input type="color" value={embed.color} onChange={e=>s('color',e.target.value)} className="w-full mt-1 h-10 bg-discord-sidebar rounded border border-white/10 cursor-pointer" /></div>
            <div><label className="text-discord-muted text-xs">Footer</label><input value={embed.footer} onChange={e=>s('footer',e.target.value)} placeholder="Footer-Text" className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none text-sm" /></div>
            <div className="col-span-2"><label className="text-discord-muted text-xs">Bild-URL (Thumbnail)</label><input value={embed.thumbnail} onChange={e=>s('thumbnail',e.target.value)} placeholder="https://..." className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none text-sm" /></div>
            <div className="col-span-2"><label className="text-discord-muted text-xs">Sende in Kanal</label>
              <select value={embed.channelId} onChange={e=>s('channelId',e.target.value)} className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none text-sm">
                <option value="">â€” Kanal wÃ¤hlen â€”</option>{channels.map(c=><option key={c.id} value={c.id}>#{c.name}</option>)}
              </select></div>
          </div>
          {/* Vorschau */}
          {embed.title && (
            <div className="rounded-lg p-4 border-l-4" style={{borderColor: embed.color, backgroundColor:'rgba(0,0,0,0.3)'}}>
              <p className="text-white font-bold text-sm">{embed.title}</p>
              {embed.description && <p className="text-gray-300 text-xs mt-1 whitespace-pre-wrap">{embed.description}</p>}
              {embed.footer && <p className="text-gray-500 text-xs mt-2">{embed.footer}</p>}
            </div>
          )}
          <button onClick={send} disabled={saving||!embed.channelId||!embed.title} className="bg-discord hover:bg-discord-dark text-white px-6 py-2 rounded-lg transition disabled:opacity-50">ðŸ“¤ Senden</button>
        </div>
      )}
    </div>
  )
}


