import { NavLink, useParams } from 'react-router-dom'
import {
  FaShieldAlt, FaStar, FaRobot, FaMusic, FaDoorOpen, FaLayerGroup, FaTrophy,
  FaTicketAlt, FaHeart, FaCoins, FaTerminal, FaUserPlus, FaPoll, FaVolumeUp,
  FaBell, FaChartBar, FaTwitch, FaGift, FaBirthdayCake, FaBolt, FaFileAlt,
  FaSearch, FaHeadphones, FaBitcoin, FaLock, FaDollarSign, FaHashtag, FaHome,
  FaChevronDown, FaChevronRight, FaUserShield
} from 'react-icons/fa'
import { useState } from 'react'

const CATEGORIES = [
  {
    label: 'Grundlegendes',
    items: [
      { id: 'welcome',        label: 'Begrüßung',         icon: FaDoorOpen },
      { id: 'welcomeChannel', label: 'Willkommenskanal',   icon: FaHashtag },
      { id: 'reactionRoles',  label: 'Reaktionsrollen',    icon: FaHeart },
      { id: 'moderation',     label: 'Moderator',          icon: FaShieldAlt },
      { id: 'leveling',       label: 'Level',              icon: FaStar },
      { id: 'achievements',   label: 'Errungenschaften',   icon: FaTrophy },
      { id: 'starboard',      label: 'Starboard',          icon: FaStar },
    ]
  },
  {
    label: 'Server-Verwaltung',
    items: [
      { id: 'automations',    label: 'Automatisierungen',  icon: FaBolt },
      { id: 'customCommands', label: 'Eigene Befehle',     icon: FaTerminal },
      { id: 'inviteTracking', label: 'Einladungen',        icon: FaUserPlus },
      { id: 'tickets',        label: 'Ticketsystem',       icon: FaTicketAlt },
      { id: 'automod',        label: 'Auto-Moderator',     icon: FaRobot },
    ]
  },
  {
    label: 'Werkzeuge',
    items: [
      { id: 'music',          label: 'Musik',              icon: FaMusic },
      { id: 'polls',          label: 'Umfragen',           icon: FaPoll },
      { id: 'embedBuilder',   label: 'Einbettungen',       icon: FaFileAlt },
      { id: 'search',         label: 'Suchen',             icon: FaSearch },
      { id: 'reminders',      label: 'Erinnerungen',       icon: FaBell },
      { id: 'statChannels',   label: 'Statistik-Kanäle',   icon: FaChartBar },
      { id: 'tempChannels',   label: 'Temp. Kanäle',       icon: FaVolumeUp },
    ]
  },
  {
    label: 'Spiele & Spaß',
    items: [
      { id: 'economy',        label: 'Wirtschaft',         icon: FaCoins },
      { id: 'giveaways',      label: 'Gewinnspiele',       icon: FaGift },
      { id: 'birthdays',      label: 'Geburtstage',        icon: FaBirthdayCake },
      { id: 'musicQuiz',      label: 'Musik-Quiz',         icon: FaHeadphones },
    ]
  },
  {
    label: 'Soziales & Web3',
    items: [
      { id: 'notifications',  label: 'Benachrichtigungen', icon: FaTwitch },
      { id: 'crypto',         label: 'Krypto & NFT',       icon: FaBitcoin },
      { id: 'gating',         label: 'Gating',             icon: FaLock },
      { id: 'monetization',   label: 'Monetarisierung',    icon: FaDollarSign },
    ]
  },
]

function SidebarCategory({ label, items, guildId, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  const base = `/dashboard/${guildId}/module`

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-2 py-1.5 text-discord-muted hover:text-white text-xs uppercase font-bold tracking-wider transition-colors"
      >
        <span>{label}</span>
        {open ? <FaChevronDown className="text-[10px]" /> : <FaChevronRight className="text-[10px]" />}
      </button>
      {open && (
        <div className="ml-1 space-y-0.5 mb-2">
          {items.map(m => (
            <NavLink
              key={m.id}
              to={`${base}/${m.id}`}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-discord text-white font-medium'
                    : 'text-discord-text hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <m.icon className="text-xs shrink-0" />
              <span className="truncate">{m.label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Sidebar({ guildId, guildName }) {
  const base = `/dashboard/${guildId}`

  return (
    <aside className="w-60 bg-discord-sidebar min-h-screen flex flex-col border-r border-black/30 shrink-0">
      {/* Server-Header */}
      <div className="px-4 py-4 border-b border-black/20 bg-black/10">
        <p className="text-discord-muted text-xs uppercase font-bold tracking-wider mb-0.5">Server</p>
        <p className="text-white font-semibold truncate text-sm">{guildName}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {/* Übersicht */}
        <NavLink to={base} end className={({ isActive }) =>
          `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${isActive ? 'bg-discord text-white font-medium' : 'text-discord-text hover:bg-white/5 hover:text-white'}`
        }>
          <FaHome className="text-xs" /> Übersicht
        </NavLink>

        <NavLink to={`${base}/leaderboard`} className={({ isActive }) =>
          `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${isActive ? 'bg-discord text-white font-medium' : 'text-discord-text hover:bg-white/5 hover:text-white'}`
        }>
          <FaTrophy className="text-xs" /> Rangliste
        </NavLink>

        <NavLink to={`${base}/profiles`} className={({ isActive }) =>
          `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${isActive ? 'bg-discord text-white font-medium' : 'text-discord-text hover:bg-white/5 hover:text-white'}`
        }>
          <FaLayerGroup className="text-xs" /> Profile
        </NavLink>

        <NavLink to={`${base}/team`} className={({ isActive }) =>
          `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${isActive ? 'bg-discord text-white font-medium' : 'text-discord-text hover:bg-white/5 hover:text-white'}`
        }>
          <FaUserShield className="text-xs text-purple-400" /> Team
        </NavLink>

        <div className="border-t border-white/5 my-2" />

        {/* Modul-Kategorien */}
        {CATEGORIES.map((cat, i) => (
          <SidebarCategory key={cat.label} label={cat.label} items={cat.items} guildId={guildId} defaultOpen={i === 0} />
        ))}
      </nav>
    </aside>
  )
}
