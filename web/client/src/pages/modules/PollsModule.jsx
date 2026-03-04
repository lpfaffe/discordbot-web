import ToggleSwitch from '../../components/ToggleSwitch'

export default function PollsModule({ config, onToggle, onSave, saving }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-discord-card rounded-xl p-5">
        <div><h2 className="text-white font-semibold">📊 Umfragen</h2><p className="text-discord-muted text-sm">Erstelle Abstimmungen mit /poll</p></div>
        <ToggleSwitch enabled={config.enabled} onToggle={onToggle} />
      </div>
      <div className="bg-discord-card rounded-xl p-4">
        <h3 className="text-white font-semibold mb-2">Befehle</h3>
        <div className="text-sm text-discord-muted font-mono space-y-1">
          <p>/poll [frage] [option1] [option2] [option3] [option4] [dauer_min]</p>
          <p className="text-xs mt-2">Der Bot reagiert automatisch mit Emojis. Nach Ablauf der Zeit wird das Ergebnis gepostet.</p>
        </div>
      </div>
    </div>
  )
}

