import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import GuildPage from './pages/GuildPage'
import ModulePage from './pages/ModulePage'
import ProfilesPage from './pages/ProfilesPage'
import LeaderboardPage from './pages/LeaderboardPage'
import TeamPage from './pages/TeamPage'
import AdminPage from './pages/AdminPage'
import Navbar from './components/Navbar'
import BugReportButton from './components/BugReportButton'
import { useAuth } from './context/AuthContext'

function AppContent() {
  const { user } = useAuth()
  return (
    <div className="min-h-screen bg-discord-bg">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/:guildId" element={<GuildPage />} />
        <Route path="/dashboard/:guildId/module/:module" element={<ModulePage />} />
        <Route path="/dashboard/:guildId/profiles" element={<ProfilesPage />} />
        <Route path="/dashboard/:guildId/leaderboard" element={<LeaderboardPage />} />
        <Route path="/dashboard/:guildId/team" element={<TeamPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {user && <BugReportButton />}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

