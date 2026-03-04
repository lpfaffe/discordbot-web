import { useState } from 'react'
import ToggleSwitch from '../../components/ToggleSwitch'
import { FaShieldAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa'

const COMMANDS = [
  { id: 'ban',           label: '/ban',           desc: 'Nutzer permanent sperren', icon: 'ðŸ”¨' },
  { id: 'kick',          label: '/kick',          desc: 'Nutzer vom Server werfen', icon: 'ðŸ‘¢' },
  { id: 'mute',          label: '/mute',          desc: 'Nutzer stumm schalten',    icon: 'ðŸ”‡' },
  { id: 'unmute',        label: '/unmute',        desc: 'Stummschaltung aufheben',  icon: 'ðŸ”Š' },
  { id: 'timeout',       label: '/timeout',       desc: 'Nutzer temporÃ¤r sperren',  icon: 'â±ï¸' },
  { id: 'warn',          label: '/warn',          desc: 'Nutzer verwarnen',          icon: 'âš ï¸' },
  { id: 'warnings',      label: '/warnings',      desc: 'Verwarnungen anzeigen',    icon: 'ðŸ“‹' },
  { id: 'clearwarnings', label: '/clearwarnings', desc: 'Verwarnungen lÃ¶schen',     icon: 'ðŸ—‘ï¸' },
  { id: 'purge',         label: '/purge',         desc: 'Nachrichten lÃ¶schen',       icon: 'ðŸ§¹' },
  { id: 'slowmode',      label: '/slowmode',      desc: 'Slowmode setzen',           icon: 'ðŸ¢' },
  { id: 'lock',          label: '/lock',          desc: 'Kanal sperren',             icon: 'ðŸ”’' },
  { id: 'unlock',        label: '/unlock',        desc: 'Kanal entsperren',          icon: 'ðŸ”“' },
]

function CommandRow({ cmdId, label, desc, icon, cfg, onChange, channels, roles }) {
  const [open, setOpen] = useState(false)
  const c = cfg || { enabled: true, logChannelId: '', allowedRoleId: '' }

  return (
    <div className={`rounded-xl border transition-all ${c.enabled ? 'border-white/10 bg-discord-sidebar' : 'border-white/5 bg-black/20 opacity-60'}`}>
      <div className="flex items-center justify-between px-4 py-3 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <div className="flex items-center gap-3">
          <span className="text-lg">{icon}</span>
          <div>
            <p className="text-white text-sm font-mono font-semibold">{label}</p>
            <p className="text-discord-muted text-xs">{desc}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ToggleSwitch enabled={c.enabled} onToggle={e => { e.stopPropagation(); onChange({ ...c, enabled: !c.enabled }) }} />
          {open ? <FaChevronUp className="text-discord-muted text-xs" /> : <FaChevronDown className="text-discord-muted text-xs" />}
        </div>
      </div>

      {open && (
        <div className="px-4 pb-4 pt-1 space-y-3 border-t border-white/5">
          <div>
            <label className="text-discord-muted text-xs block mb-1">ðŸ“¢ Eigener Log-Kanal (Ã¼berschreibt globalen)</label>
            <select
              value={c.logChannelId || ''}
              onChange={e => onChange({ ...c, logChannelId: e.target.value || null })}
              className="w-full bg-discord-bg text-white rounded px-3 py-2 border border-white/10 outline-none text-sm"
            >
              <option value="">â€” Globalen Log verwenden â€”</option>
              {channels.map(ch => <option key={ch.id} value={ch.id}>#{ch.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-discord-muted text-xs block mb-1">ðŸ‘® Erlaubte Rolle (leer = braucht Server-Permission)</label>
            <select
              value={c.allowedRoleId || ''}
              onChange={e => onChange({ ...c, allowedRoleId: e.target.value || null })}
              className="w-full bg-discord-bg text-white rounded px-3 py-2 border border-white/10 outline-none text-sm"
            >
              <option value="">â€” Nur Server-Rechte â€”</option>
              {roles.map(r => <option key={r.id} value={r.id}>@{r.name}</option>)}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ModerationModule({ config, onToggle, onSave, saving, botInfo }) {
  const channels = botInfo?.textChannels || botInfo?.textChannels || botInfo?.channels?.filter(c => c.type === 0) || [] || []
  const roles = botInfo?.roles || []

  const [logChannelId, setLogChannelId]     = useState(config.logChannelId || '')
  const [muteRoleId, setMuteRoleId]         = useState(config.muteRoleId || '')
  const [warnThreshold, setWarnThreshold]   = useState(config.autoAction?.warnThreshold || 3)
  const [autoAction, setAutoAction]         = useState(config.autoAction?.action || 'kick')
  const [commands, setCommands]             = useState(config.commands || {})

  const updateCommand = (id, val) => setCommands(p => ({ ...p, [id]: val }))

  const handleSave = () => {
    onSave({
      logChannelId:              logChannelId || null,
      muteRoleId:                muteRoleId || null,
      'autoAction.warnThreshold': parseInt(warnThreshold),
      'autoAction.action':        autoAction,
      commands
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-discord-card rounded-xl p-5">
        <div className="flex items-center gap-3">
          <FaShieldAlt className="text-discord text-2xl" />
          <div>
            <h2 className="text-white font-bold text-lg">Moderator</h2>
            <p className="text-discord-muted text-sm">SchÃ¼tze deinen Server mit Moderationsbefehlen</p>
          </div>
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
                <label className="text-discord-muted text-sm block mb-1">ðŸ“¢ Globaler Log-Kanal</label>
                <select value={logChannelId} onChange={e => setLogChannelId(e.target.value)}
                  className="w-full bg-discord-sidebar text-white rounded-lg px-3 py-2 border border-white/10 outline-none">
                  <option value="">â€” Kein Log â€”</option>
                  {channels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
                </select>
                <p className="text-discord-muted text-xs mt-1">Fallback wenn kein befehlsspezifischer Log gesetzt.</p>
              </div>
              <div>
                <label className="text-discord-muted text-sm block mb-1">ðŸ”‡ Mute-Rolle</label>
                <select value={muteRoleId} onChange={e => setMuteRoleId(e.target.value)}
                  className="w-full bg-discord-sidebar text-white rounded-lg px-3 py-2 border border-white/10 outline-none">
                  <option value="">â€” Keine Rolle â€”</option>
                  {roles.map(r => <option key={r.id} value={r.id}>@{r.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Auto-Aktion */}
          <div className="bg-discord-card rounded-xl p-5 space-y-4">
            <h3 className="text-white font-semibold">ðŸ¤– Auto-Aktion bei Verwarnungen</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-discord-muted text-sm block mb-1">Verwarnungs-Schwelle</label>
                <input type="number" min={1} max={20} value={warnThreshold}
                  onChange={e => setWarnThreshold(e.target.value)}
                  className="w-full bg-discord-sidebar text-white rounded-lg px-3 py-2 border border-white/10 outline-none" />
              </div>
              <div>
                <label className="text-discord-muted text-sm block mb-1">Automatische Aktion</label>
                <select value={autoAction} onChange={e => setAutoAction(e.target.value)}
                  className="w-full bg-discord-sidebar text-white rounded-lg px-3 py-2 border border-white/10 outline-none">
                  <option value="kick">Kick</option>
                  <option value="ban">Ban</option>
                  <option value="mute">Mute (24h)</option>
                  <option value="timeout">Timeout (24h)</option>
                </select>
              </div>
            </div>
            <p className="text-discord-muted text-xs">Nach <strong className="text-white">{warnThreshold}</strong> Verwarnungen wird automatisch <strong className="text-white">{autoAction}</strong> ausgefÃ¼hrt.</p>
          </div>

          {/* Pro-Befehl Konfiguration */}
          <div className="bg-discord-card rounded-xl p-5 space-y-3">
            <h3 className="text-white font-semibold">ðŸ› ï¸ Befehle konfigurieren</h3>
            <p className="text-discord-muted text-xs mb-3">Jeden Befehl einzeln aktivieren/deaktivieren, eigenen Log-Kanal und erlaubte Rolle festlegen.</p>
            <div className="space-y-2">
              {COMMANDS.map(cmd => (
                <CommandRow
                  key={cmd.id}
                  cmdId={cmd.id}
                  label={cmd.label}
                  desc={cmd.desc}
                  icon={cmd.icon}
                  cfg={commands[cmd.id]}
                  onChange={val => updateCommand(cmd.id, val)}
                  channels={channels}
                  roles={roles}
                />
              ))}
            </div>
          </div>

          <button onClick={handleSave} disabled={saving}
            className="w-full bg-discord hover:bg-discord-dark disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition">
            {saving ? 'Speichere...' : 'ðŸ’¾ Alle Einstellungen speichern'}
          </button>
        </>
      )}
    </div>
  )
}


