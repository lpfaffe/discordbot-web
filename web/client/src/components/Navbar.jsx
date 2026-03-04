import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useQuery } from '@tanstack/react-query'
import api from '../api/client'
import { FaDiscord, FaShieldAlt } from 'react-icons/fa'

export default function Navbar() {
  const { user, login, logout, loading } = useAuth()

  const { data: adminData } = useQuery({
    queryKey: ['adminMe'],
    queryFn: () => api.get('/admin/me').then(r => r.data),
    enabled: !!user,
    staleTime: 60000
  })

  return (
    <nav className="bg-discord-sidebar border-b border-black/20 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl">
        <FaDiscord className="text-discord text-2xl" />
        Bot Dashboard
      </Link>

      <div className="flex items-center gap-4">
        {!loading && (
          user ? (
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="text-discord-text hover:text-white transition text-sm">Dashboard</Link>
              {adminData?.isAdmin && (
                <Link to="/admin" className="flex items-center gap-1 text-red-400 hover:text-red-300 transition text-sm">
                  <FaShieldAlt className="text-xs" /> Admin
                </Link>
              )}
              <div className="flex items-center gap-2">
                <img src={user.avatar || '/default-avatar.png'} alt="" className="w-8 h-8 rounded-full" />
                <span className="text-sm text-discord-text">{user.username}</span>
              </div>
              <button onClick={logout} className="bg-discord-red hover:opacity-80 text-white px-3 py-1 rounded text-sm transition">
                Logout
              </button>
            </div>
          ) : (
            <button onClick={login} className="flex items-center gap-2 bg-discord hover:bg-discord-dark text-white px-4 py-2 rounded transition font-medium">
              <FaDiscord />
              Mit Discord anmelden
            </button>
          )
        )}
      </div>
    </nav>
  )
}

