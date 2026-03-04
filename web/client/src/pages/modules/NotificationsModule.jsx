import { useState } from 'react'
import ToggleSwitch from '../../components/ToggleSwitch'

export default function NotificationsModule({ config, onToggle, onSave, saving, botInfo }) {
  const channels = botInfo?.textChannels || botInfo?.textChannels || botInfo?.channels?.filter(c => c.type === 0) || [] || []
  const [twitch, setTwitch] = useState(config.twitch || [])
  const [youtube, setYoutube] = useState(config.youtube || [])
  const [reddit, setReddit] = useState(config.reddit || [])
  const [rss, setRss] = useState(config.rss || [])
  const [newTwitch, setNewTwitch] = useState({ username: '', channelId: '', message: 'ðŸ”´ {user} ist jetzt live auf Twitch!' })
  const [newYoutube, setNewYoutube] = useState({ channelId: '', channelName: '', discordChannelId: '', message: 'ðŸŽ¥ Neues Video von {channel}!' })
  const [newReddit, setNewReddit] = useState({ subreddit: '', channelId: '', message: 'ðŸ“‹ Neuer Post in r/{subreddit}!' })
  const [newRss, setNewRss] = useState({ url: '', channelId: '', message: 'ðŸ“° Neuer Artikel: {title}' })

  const input = 'w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none text-sm'
  const sel = 'w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none text-sm'

  const save = () => onSave({ twitch, youtube, reddit, rss })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-discord-card rounded-xl p-5">
        <div><h2 className="text-white font-semibold">ðŸ”” Benachrichtigungen</h2><p className="text-discord-muted text-sm">Twitch, YouTube, Reddit & RSS</p></div>
        <ToggleSwitch enabled={config.enabled} onToggle={onToggle} />
      </div>

      {config.enabled && (
        <>
          {/* Twitch */}
          <div className="bg-discord-card rounded-xl p-5 space-y-3">
            <h3 className="text-white font-semibold flex items-center gap-2">ðŸŸ£ Twitch ({twitch.length})</h3>
            {twitch.map((t,i) => (
              <div key={i} className="flex items-center justify-between bg-discord-sidebar rounded p-2 text-sm">
                <span className="text-white">{t.username} â†’ #{channels.find(c=>c.id===t.channelId)?.name||t.channelId}</span>
                <button onClick={()=>setTwitch(p=>p.filter((_,idx)=>idx!==i))} className="text-red-400 text-xs ml-3">âœ•</button>
              </div>
            ))}
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-discord-muted text-xs">Twitch-Username</label><input value={newTwitch.username} onChange={e=>setNewTwitch(p=>({...p,username:e.target.value}))} placeholder="streamer" className={input} /></div>
              <div><label className="text-discord-muted text-xs">Discord-Kanal</label>
                <select value={newTwitch.channelId} onChange={e=>setNewTwitch(p=>({...p,channelId:e.target.value}))} className={sel}>
                  <option value="">â€” Kanal â€”</option>{channels.map(c=><option key={c.id} value={c.id}>#{c.name}</option>)}
                </select></div>
            </div>
            <button onClick={()=>{if(newTwitch.username&&newTwitch.channelId){setTwitch(p=>[...p,{...newTwitch,enabled:true}]);setNewTwitch({username:'',channelId:'',message:'ðŸ”´ {user} ist live!'});}}} className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-1.5 rounded text-sm">+ Twitch hinzufÃ¼gen</button>
          </div>

          {/* YouTube */}
          <div className="bg-discord-card rounded-xl p-5 space-y-3">
            <h3 className="text-white font-semibold">ðŸ”´ YouTube ({youtube.length})</h3>
            {youtube.map((y,i) => (
              <div key={i} className="flex items-center justify-between bg-discord-sidebar rounded p-2 text-sm">
                <span className="text-white">{y.channelName} â†’ #{channels.find(c=>c.id===y.discordChannelId)?.name||y.discordChannelId}</span>
                <button onClick={()=>setYoutube(p=>p.filter((_,idx)=>idx!==i))} className="text-red-400 text-xs ml-3">âœ•</button>
              </div>
            ))}
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-discord-muted text-xs">YouTube Kanal-ID</label><input value={newYoutube.channelId} onChange={e=>setNewYoutube(p=>({...p,channelId:e.target.value}))} placeholder="UCxxxxxxxx" className={input} /></div>
              <div><label className="text-discord-muted text-xs">Anzeigename</label><input value={newYoutube.channelName} onChange={e=>setNewYoutube(p=>({...p,channelName:e.target.value}))} placeholder="Kanalname" className={input} /></div>
              <div className="col-span-2"><label className="text-discord-muted text-xs">Discord-Kanal</label>
                <select value={newYoutube.discordChannelId} onChange={e=>setNewYoutube(p=>({...p,discordChannelId:e.target.value}))} className={sel}>
                  <option value="">â€” Kanal â€”</option>{channels.map(c=><option key={c.id} value={c.id}>#{c.name}</option>)}
                </select></div>
            </div>
            <button onClick={()=>{if(newYoutube.channelId&&newYoutube.discordChannelId){setYoutube(p=>[...p,{...newYoutube,enabled:true}]);setNewYoutube({channelId:'',channelName:'',discordChannelId:'',message:'ðŸŽ¥ Neues Video!'});}}} className="bg-red-700 hover:bg-red-800 text-white px-4 py-1.5 rounded text-sm">+ YouTube hinzufÃ¼gen</button>
          </div>

          {/* Reddit */}
          <div className="bg-discord-card rounded-xl p-5 space-y-3">
            <h3 className="text-white font-semibold">ðŸŸ  Reddit ({reddit.length})</h3>
            {reddit.map((r,i) => (
              <div key={i} className="flex items-center justify-between bg-discord-sidebar rounded p-2 text-sm">
                <span className="text-white">r/{r.subreddit} â†’ #{channels.find(c=>c.id===r.channelId)?.name||r.channelId}</span>
                <button onClick={()=>setReddit(p=>p.filter((_,idx)=>idx!==i))} className="text-red-400 text-xs ml-3">âœ•</button>
              </div>
            ))}
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-discord-muted text-xs">Subreddit (ohne r/)</label><input value={newReddit.subreddit} onChange={e=>setNewReddit(p=>({...p,subreddit:e.target.value}))} placeholder="gaming" className={input} /></div>
              <div><label className="text-discord-muted text-xs">Discord-Kanal</label>
                <select value={newReddit.channelId} onChange={e=>setNewReddit(p=>({...p,channelId:e.target.value}))} className={sel}>
                  <option value="">â€” Kanal â€”</option>{channels.map(c=><option key={c.id} value={c.id}>#{c.name}</option>)}
                </select></div>
            </div>
            <button onClick={()=>{if(newReddit.subreddit&&newReddit.channelId){setReddit(p=>[...p,{...newReddit,enabled:true}]);setNewReddit({subreddit:'',channelId:'',message:'ðŸ“‹ Neuer Post!'});}}} className="bg-orange-700 hover:bg-orange-800 text-white px-4 py-1.5 rounded text-sm">+ Reddit hinzufÃ¼gen</button>
          </div>

          {/* RSS */}
          <div className="bg-discord-card rounded-xl p-5 space-y-3">
            <h3 className="text-white font-semibold">ðŸ“° RSS-Feeds ({rss.length})</h3>
            {rss.map((r,i) => (
              <div key={i} className="flex items-center justify-between bg-discord-sidebar rounded p-2 text-sm">
                <span className="text-white truncate">{r.url}</span>
                <button onClick={()=>setRss(p=>p.filter((_,idx)=>idx!==i))} className="text-red-400 text-xs ml-3 shrink-0">âœ•</button>
              </div>
            ))}
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2"><label className="text-discord-muted text-xs">RSS-URL</label><input value={newRss.url} onChange={e=>setNewRss(p=>({...p,url:e.target.value}))} placeholder="https://example.com/feed.xml" className={input} /></div>
              <div className="col-span-2"><label className="text-discord-muted text-xs">Discord-Kanal</label>
                <select value={newRss.channelId} onChange={e=>setNewRss(p=>({...p,channelId:e.target.value}))} className={sel}>
                  <option value="">â€” Kanal â€”</option>{channels.map(c=><option key={c.id} value={c.id}>#{c.name}</option>)}
                </select></div>
            </div>
            <button onClick={()=>{if(newRss.url&&newRss.channelId){setRss(p=>[...p,{...newRss,enabled:true}]);setNewRss({url:'',channelId:'',message:'ðŸ“° Neuer Artikel!'});}}} className="bg-yellow-700 hover:bg-yellow-800 text-white px-4 py-1.5 rounded text-sm">+ RSS hinzufÃ¼gen</button>
          </div>

          <button onClick={save} disabled={saving} className="bg-discord hover:bg-discord-dark text-white px-8 py-2 rounded-lg transition disabled:opacity-50 w-full">{saving?'Speichern...':'Alle Einstellungen speichern'}</button>
        </>
      )}
    </div>
  )
}


