import { useState } from 'react'
import ToggleSwitch from '../../components/ToggleSwitch'

export default function MusicQuizModule({ config, onToggle, onSave, saving }) {
  const [cfg, setCfg] = useState({ rounds: config.rounds||10, timePerRound: config.timePerRound||30, genres: config.genres||[] })
  const genres = ['Pop','Rock','Hip-Hop','Electronic','Jazz','Classical','Metal','R&B','Anime','Gaming']
  const toggle = (g) => setCfg(p=>({...p, genres: p.genres.includes(g) ? p.genres.filter(x=>x!==g) : [...p.genres, g]}))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-discord-card rounded-xl p-5">
        <div><h2 className="text-white font-semibold">🎵 Musik-Quiz</h2><p className="text-discord-muted text-sm">Rate Lieder im Sprachkanal und gewinne Punkte</p></div>
        <ToggleSwitch enabled={config.enabled} onToggle={onToggle} />
      </div>
      {config.enabled && (
        <div className="bg-discord-card rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-discord-muted text-sm">Runden pro Spiel</label><input type="number" min={1} max={50} value={cfg.rounds} onChange={e=>setCfg(p=>({...p,rounds:+e.target.value}))} className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none" /></div>
            <div><label className="text-discord-muted text-sm">Zeit pro Runde (Sekunden)</label><input type="number" min={10} max={120} value={cfg.timePerRound} onChange={e=>setCfg(p=>({...p,timePerRound:+e.target.value}))} className="w-full mt-1 bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none" /></div>
          </div>
          <div>
            <label className="text-discord-muted text-sm mb-2 block">Genre-Filter</label>
            <div className="flex flex-wrap gap-2">
              {genres.map(g=>(
                <button key={g} onClick={()=>toggle(g)} className={`px-3 py-1 rounded-full text-sm transition ${cfg.genres.includes(g)?'bg-discord text-white':'bg-discord-sidebar text-discord-muted hover:text-white'}`}>{g}</button>
              ))}
            </div>
          </div>
          <button onClick={()=>onSave(cfg)} disabled={saving} className="bg-discord hover:bg-discord-dark text-white px-6 py-2 rounded-lg transition disabled:opacity-50">{saving?'Speichern...':'Speichern'}</button>
        </div>
      )}
      <div className="bg-discord-card rounded-xl p-4"><h3 className="text-white font-semibold mb-2">Befehle</h3><div className="text-sm text-discord-muted font-mono space-y-1"><p>/musicquiz start · /musicquiz stop · /musicquiz score</p></div></div>
    </div>
  )
}

