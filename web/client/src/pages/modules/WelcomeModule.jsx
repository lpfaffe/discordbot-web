import { useState } from 'react'
import ToggleSwitch from '../../components/ToggleSwitch'
import { FaDoorOpen } from 'react-icons/fa'

export default function WelcomeModule({ config, onToggle, onSave, saving, botInfo }) {
  const [channelId, setChannelId] = useState(config.channelId || '')
  const [message, setMessage] = useState(config.message || 'Willkommen {user} auf {server}!')
  const [useEmbed, setUseEmbed] = useState(config.useEmbed || false)
  const [embedColor, setEmbedColor] = useState(config.embedColor || '#5865F2')
  const [embedTitle, setEmbedTitle] = useState(config.embedTitle || 'Willkommen!')
  const [embedDescription, setEmbedDescription] = useState(config.embedDescription || 'Herzlich Willkommen, {user}!')
  const [goodbye, setGoodbye] = useState(config.goodbye || { enabled: false, channelId: '', message: '{user} hat den Server verlassen.' })
  const [dm, setDm] = useState(config.dm || { enabled: false, message: 'Willkommen auf {server}!' })
  const [autoRole, setAutoRole] = useState(config.autoRole || { enabled: false, roleId: '' })

  const channels = botInfo?.textChannels || botInfo?.textChannels || botInfo?.channels?.filter(c => c.type === 0) || [] || []
  const roles = botInfo?.roles || []

  const handleSave = () => {
    onSave({ channelId: channelId || null, message, useEmbed, embedColor, embedTitle, embedDescription, goodbye, dm, autoRole })
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <FaDoorOpen className="text-discord-green text-2xl" />
        <h1 className="text-2xl font-bold text-white">Willkommen / Goodbye</h1>
      </div>

      <div className="space-y-4">
        <ToggleSwitch enabled={config.enabled} onChange={onToggle} label="Willkommenssystem aktivieren" />

        <div className="bg-discord-card rounded-xl p-5 space-y-4">
          <h2 className="text-white font-semibold">Willkommen-Channel</h2>
          <select value={channelId} onChange={e => setChannelId(e.target.value)}
            className="w-full bg-discord-sidebar text-discord-text rounded-lg px-3 py-2 border border-white/10 focus:border-discord outline-none">
            <option value="">Channel auswÃ¤hlen</option>
            {channels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
          </select>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="useEmbed" checked={useEmbed} onChange={e => setUseEmbed(e.target.checked)} className="w-4 h-4 accent-discord" />
            <label htmlFor="useEmbed" className="text-discord-text text-sm">Als Embed senden</label>
          </div>

          {useEmbed ? (
            <div className="space-y-3">
              <input value={embedTitle} onChange={e => setEmbedTitle(e.target.value)} placeholder="Embed-Titel"
                className="w-full bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none" />
              <textarea value={embedDescription} onChange={e => setEmbedDescription(e.target.value)} rows={3}
                className="w-full bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none resize-none" />
              <div className="flex items-center gap-2">
                <label className="text-discord-muted text-sm">Farbe:</label>
                <input type="color" value={embedColor} onChange={e => setEmbedColor(e.target.value)} className="h-8 w-16 rounded" />
              </div>
            </div>
          ) : (
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
              className="w-full bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none resize-none" />
          )}
          <p className="text-discord-muted text-xs">Platzhalter: {'{user}'}, {'{server}'}, {'{count}'}</p>
        </div>

        {/* Goodbye */}
        <div className="bg-discord-card rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">Goodbye-Nachricht</h2>
            <button onClick={() => setGoodbye(p => ({ ...p, enabled: !p.enabled }))}
              className={`px-3 py-1 rounded text-xs ${goodbye.enabled ? 'bg-discord-green text-white' : 'bg-discord-muted/20 text-discord-muted'}`}>
              {goodbye.enabled ? 'Aktiv' : 'Inaktiv'}
            </button>
          </div>
          <select value={goodbye.channelId} onChange={e => setGoodbye(p => ({ ...p, channelId: e.target.value }))}
            className="w-full bg-discord-sidebar text-discord-text rounded-lg px-3 py-2 border border-white/10 outline-none">
            <option value="">Channel auswÃ¤hlen</option>
            {channels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
          </select>
          <textarea value={goodbye.message} onChange={e => setGoodbye(p => ({ ...p, message: e.target.value }))} rows={2}
            className="w-full bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none resize-none" />
        </div>

        {/* DM */}
        <div className="bg-discord-card rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">DM beim Beitritt</h2>
            <button onClick={() => setDm(p => ({ ...p, enabled: !p.enabled }))}
              className={`px-3 py-1 rounded text-xs ${dm.enabled ? 'bg-discord-green text-white' : 'bg-discord-muted/20 text-discord-muted'}`}>
              {dm.enabled ? 'Aktiv' : 'Inaktiv'}
            </button>
          </div>
          <textarea value={dm.message} onChange={e => setDm(p => ({ ...p, message: e.target.value }))} rows={2}
            className="w-full bg-discord-sidebar text-white rounded px-3 py-2 border border-white/10 outline-none resize-none" />
        </div>

        {/* Auto-Role */}
        <div className="bg-discord-card rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">Auto-Rolle</h2>
            <button onClick={() => setAutoRole(p => ({ ...p, enabled: !p.enabled }))}
              className={`px-3 py-1 rounded text-xs ${autoRole.enabled ? 'bg-discord-green text-white' : 'bg-discord-muted/20 text-discord-muted'}`}>
              {autoRole.enabled ? 'Aktiv' : 'Inaktiv'}
            </button>
          </div>
          <select value={autoRole.roleId} onChange={e => setAutoRole(p => ({ ...p, roleId: e.target.value }))}
            className="w-full bg-discord-sidebar text-discord-text rounded-lg px-3 py-2 border border-white/10 outline-none">
            <option value="">Rolle auswÃ¤hlen</option>
            {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>

        <button onClick={handleSave} disabled={saving}
          className="w-full bg-discord hover:bg-discord-dark disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition">
          {saving ? 'Speichere...' : 'Speichern'}
        </button>
      </div>
    </div>
  )
}


