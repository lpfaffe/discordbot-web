import { useState } from 'react'
import ToggleSwitch from '../../components/ToggleSwitch'
import { FaRobot } from 'react-icons/fa'

export default function AutomodModule({ config, onToggle, onSave, saving }) {
  const [antiSpam, setAntiSpam] = useState(config.antiSpam || { enabled: false, maxMessages: 5, timeWindow: 5000, action: 'warn' })
  const [antiLinks, setAntiLinks] = useState(config.antiLinks || { enabled: false, whitelist: [], action: 'delete' })
  const [wordFilter, setWordFilter] = useState(config.wordFilter || { enabled: false, words: [], action: 'delete' })
  const [capsFilter, setCapsFilter] = useState(config.capsFilter || { enabled: false, threshold: 70, minLength: 10, action: 'delete' })
  const [wordInput, setWordInput] = useState('')
  const [whitelistInput, setWhitelistInput] = useState('')

  const handleSave = () => {
    onSave({ antiSpam, antiLinks, wordFilter, capsFilter })
  }

  const addWord = () => {
    if (wordInput.trim()) {
      setWordFilter(prev => ({ ...prev, words: [...prev.words, wordInput.trim().toLowerCase()] }))
      setWordInput('')
    }
  }

  const removeWord = (w) => setWordFilter(prev => ({ ...prev, words: prev.words.filter(x => x !== w) }))

  const addWhitelist = () => {
    if (whitelistInput.trim()) {
      setAntiLinks(prev => ({ ...prev, whitelist: [...prev.whitelist, whitelistInput.trim()] }))
      setWhitelistInput('')
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <FaRobot className="text-discord-green text-2xl" />
        <h1 className="text-2xl font-bold text-white">Auto-Moderator</h1>
      </div>

      <div className="space-y-4">
        <ToggleSwitch enabled={config.enabled} onChange={onToggle}
          label="Auto-Moderator aktivieren" description="Automatische Moderation ohne Commands" />

        {/* Anti-Spam */}
        <div className="bg-discord-card rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">Anti-Spam</h2>
            <button onClick={() => setAntiSpam(p => ({ ...p, enabled: !p.enabled }))}
              className={`px-3 py-1 rounded text-xs ${antiSpam.enabled ? 'bg-discord-green text-white' : 'bg-discord-muted/20 text-discord-muted'}`}>
              {antiSpam.enabled ? 'Aktiv' : 'Inaktiv'}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="text-discord-muted text-xs block mb-1">Max. Nachrichten</label>
              <input type="number" value={antiSpam.maxMessages} onChange={e => setAntiSpam(p => ({ ...p, maxMessages: +e.target.value }))}
                className="w-full bg-discord-sidebar text-white rounded px-2 py-1 border border-white/10 outline-none text-sm" /></div>
            <div><label className="text-discord-muted text-xs block mb-1">Zeitfenster (ms)</label>
              <input type="number" value={antiSpam.timeWindow} onChange={e => setAntiSpam(p => ({ ...p, timeWindow: +e.target.value }))}
                className="w-full bg-discord-sidebar text-white rounded px-2 py-1 border border-white/10 outline-none text-sm" /></div>
            <div><label className="text-discord-muted text-xs block mb-1">Aktion</label>
              <select value={antiSpam.action} onChange={e => setAntiSpam(p => ({ ...p, action: e.target.value }))}
                className="w-full bg-discord-sidebar text-white rounded px-2 py-1 border border-white/10 outline-none text-sm">
                {['warn', 'mute', 'kick', 'ban'].map(a => <option key={a} value={a}>{a}</option>)}
              </select></div>
          </div>
        </div>

        {/* Anti-Links */}
        <div className="bg-discord-card rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">Anti-Links</h2>
            <button onClick={() => setAntiLinks(p => ({ ...p, enabled: !p.enabled }))}
              className={`px-3 py-1 rounded text-xs ${antiLinks.enabled ? 'bg-discord-green text-white' : 'bg-discord-muted/20 text-discord-muted'}`}>
              {antiLinks.enabled ? 'Aktiv' : 'Inaktiv'}
            </button>
          </div>
          <div className="flex gap-2">
            <input value={whitelistInput} onChange={e => setWhitelistInput(e.target.value)}
              placeholder="discord.com" onKeyDown={e => e.key === 'Enter' && addWhitelist()}
              className="flex-1 bg-discord-sidebar text-white rounded px-3 py-1 border border-white/10 outline-none text-sm" />
            <button onClick={addWhitelist} className="bg-discord text-white px-3 py-1 rounded text-sm">+</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {antiLinks.whitelist.map(d => (
              <span key={d} className="bg-discord/20 text-discord text-sm px-2 py-0.5 rounded flex items-center gap-1">
                {d} <button onClick={() => setAntiLinks(p => ({ ...p, whitelist: p.whitelist.filter(x => x !== d) }))} className="text-discord-red ml-1">×</button>
              </span>
            ))}
          </div>
        </div>

        {/* Wort-Filter */}
        <div className="bg-discord-card rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">Wort-Filter</h2>
            <button onClick={() => setWordFilter(p => ({ ...p, enabled: !p.enabled }))}
              className={`px-3 py-1 rounded text-xs ${wordFilter.enabled ? 'bg-discord-green text-white' : 'bg-discord-muted/20 text-discord-muted'}`}>
              {wordFilter.enabled ? 'Aktiv' : 'Inaktiv'}
            </button>
          </div>
          <div className="flex gap-2">
            <input value={wordInput} onChange={e => setWordInput(e.target.value)}
              placeholder="Verbotenes Wort" onKeyDown={e => e.key === 'Enter' && addWord()}
              className="flex-1 bg-discord-sidebar text-white rounded px-3 py-1 border border-white/10 outline-none text-sm" />
            <button onClick={addWord} className="bg-discord text-white px-3 py-1 rounded text-sm">+</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {wordFilter.words.map(w => (
              <span key={w} className="bg-red-900/30 text-red-400 text-sm px-2 py-0.5 rounded flex items-center gap-1">
                {w} <button onClick={() => removeWord(w)} className="ml-1">×</button>
              </span>
            ))}
          </div>
        </div>

        {/* Caps-Filter */}
        <div className="bg-discord-card rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">Caps-Filter</h2>
            <button onClick={() => setCapsFilter(p => ({ ...p, enabled: !p.enabled }))}
              className={`px-3 py-1 rounded text-xs ${capsFilter.enabled ? 'bg-discord-green text-white' : 'bg-discord-muted/20 text-discord-muted'}`}>
              {capsFilter.enabled ? 'Aktiv' : 'Inaktiv'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-discord-muted text-xs block mb-1">Caps-Schwelle (%)</label>
              <input type="number" value={capsFilter.threshold} onChange={e => setCapsFilter(p => ({ ...p, threshold: +e.target.value }))}
                className="w-full bg-discord-sidebar text-white rounded px-2 py-1 border border-white/10 outline-none text-sm" /></div>
            <div><label className="text-discord-muted text-xs block mb-1">Min. Länge</label>
              <input type="number" value={capsFilter.minLength} onChange={e => setCapsFilter(p => ({ ...p, minLength: +e.target.value }))}
                className="w-full bg-discord-sidebar text-white rounded px-2 py-1 border border-white/10 outline-none text-sm" /></div>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving}
          className="w-full bg-discord hover:bg-discord-dark disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition">
          {saving ? 'Speichere...' : 'Speichern'}
        </button>
      </div>
    </div>
  )
}

