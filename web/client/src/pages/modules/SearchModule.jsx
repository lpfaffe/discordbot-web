import ToggleSwitch from '../../components/ToggleSwitch'

export default function SearchModule({ config, onToggle }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-discord-card rounded-xl p-5">
        <div><h2 className="text-white font-semibold">🔍 Suchen</h2><p className="text-discord-muted text-sm">Suche nach YouTube, Twitch, Anime und mehr</p></div>
        <ToggleSwitch enabled={config.enabled} onToggle={onToggle} />
      </div>
      <div className="bg-discord-card rounded-xl p-5 space-y-3">
        <h3 className="text-white font-semibold">Verfügbare Befehle</h3>
        <div className="grid grid-cols-1 gap-2">
          {[
            { cmd: '/youtube [suche]', desc: 'YouTube-Videos suchen' },
            { cmd: '/twitch [streamer]', desc: 'Twitch-Streamer anzeigen' },
            { cmd: '/anime [titel]', desc: 'Anime-Informationen (MyAnimeList)' },
            { cmd: '/weather [stadt]', desc: 'Aktuelles Wetter anzeigen' },
            { cmd: '/wiki [thema]', desc: 'Wikipedia-Artikel suchen' },
            { cmd: '/gif [suche]', desc: 'GIFs von Tenor suchen' },
          ].map(b=>(
            <div key={b.cmd} className="flex items-center gap-3 bg-discord-sidebar rounded p-2">
              <code className="text-discord text-sm font-mono">{b.cmd}</code>
              <span className="text-discord-muted text-xs">{b.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

