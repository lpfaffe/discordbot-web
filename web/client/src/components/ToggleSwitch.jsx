export default function ToggleSwitch({ enabled, onToggle, onChange, label, description }) {
  const handler = onToggle || onChange
  return (
    <button
      onClick={e => { e.preventDefault(); e.stopPropagation(); handler && handler(!enabled) }}
      className={`relative shrink-0 w-12 h-6 rounded-full transition-colors duration-200 ${enabled ? 'bg-green-500' : 'bg-white/20'}`}
    >
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${enabled ? 'translate-x-7' : 'translate-x-1'}`} />
    </button>
  )
}
