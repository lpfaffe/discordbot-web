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
import ImpressumPage from './pages/ImpressumPage'
import DatenschutzPage from './pages/DatenschutzPage'
import AGBPage from './pages/AGBPage'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import BugReportButton from './components/BugReportButton'
import CookieBanner from './components/CookieBanner'
import { useAuth } from './context/AuthContext'

function AppContent() {
  const { user } = useAuth()
  return (
    <div className="min-h-screen bg-discord-bg flex flex-col">
      <CookieBanner />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/:guildId" element={<GuildPage />} />
          <Route path="/dashboard/:guildId/module/:module" element={<ModulePage />} />
          <Route path="/dashboard/:guildId/profiles" element={<ProfilesPage />} />
          <Route path="/dashboard/:guildId/leaderboard" element={<LeaderboardPage />} />
          <Route path="/dashboard/:guildId/team" element={<TeamPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/impressum" element={<ImpressumPage />} />
          <Route path="/datenschutz" element={<DatenschutzPage />} />
          <Route path="/agb" element={<AGBPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
      <BugReportButton />
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

