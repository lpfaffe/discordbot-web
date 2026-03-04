import ToggleSwitch from '../../components/ToggleSwitch'

export default function MonetizationModule({ config, onToggle }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-discord-card rounded-xl p-5">
        <div><h2 className="text-white font-semibold">💵 Monetarisieren</h2><p className="text-discord-muted text-sm">Verdiene Geld mit deinem Discord-Server</p></div>
        <ToggleSwitch enabled={config.enabled} onToggle={onToggle} />
      </div>
      <div className="bg-discord-card rounded-xl p-5 space-y-4">
        <h3 className="text-white font-semibold">Funktionen</h3>
        <div className="space-y-2 text-sm text-discord-muted">
          <div className="flex items-start gap-3 bg-discord-sidebar rounded-lg p-3"><span className="text-2xl">💎</span><div><p className="text-white font-medium">Abonnenten-Rollen</p><p>Vergebe automatisch Rollen an zahlende Abonnenten.</p></div></div>
          <div className="flex items-start gap-3 bg-discord-sidebar rounded-lg p-3"><span className="text-2xl">🔒</span><div><p className="text-white font-medium">Exklusive Kanäle</p><p>Private Kanäle nur für Premium-Mitglieder.</p></div></div>
          <div className="flex items-start gap-3 bg-discord-sidebar rounded-lg p-3"><span className="text-2xl">💳</span><div><p className="text-white font-medium">Zahlungsintegration</p><p>Stripe/PayPal-Integration für direkte Zahlungen.</p></div></div>
        </div>
        <p className="text-discord-muted text-xs border border-white/10 rounded-lg p-3">ℹ️ Diese Funktion erfordert eine externe Zahlungsanbindung. Konfiguriere zuerst deinen API-Key in den Server-Einstellungen.</p>
      </div>
    </div>
  )
}

