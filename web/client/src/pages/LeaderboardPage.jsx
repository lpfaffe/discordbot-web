import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Sidebar from '../components/Sidebar'
import api from '../api/client'
import { FaTrophy } from 'react-icons/fa'

export default function LeaderboardPage() {
  const { guildId } = useParams()

  const { data: guildData } = useQuery({
    queryKey: ['guild', guildId],
    queryFn: () => api.get(`/guilds/${guildId}`).then(r => r.data)
  })

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard', guildId],
    queryFn: () => api.get(`/leaderboard/${guildId}?limit=20`).then(r => r.data)
  })

  const guild = guildData?.guild
  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="flex">
      <Sidebar guildId={guildId} guildName={guild?.name || 'Server'} />
      <main className="flex-1 p-8 max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <FaTrophy className="text-yellow-400 text-2xl" />
          <h1 className="text-2xl font-bold text-white">Rangliste</h1>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="animate-spin w-12 h-12 border-4 border-discord border-t-transparent rounded-full" />
          </div>
        ) : leaderboard?.data?.length === 0 ? (
          <p className="text-discord-muted text-center py-12">Noch keine XP-Daten vorhanden.</p>
        ) : (
          <div className="space-y-2">
            {leaderboard?.data?.map((entry, i) => (
              <div key={entry.userId}
                className={`flex items-center gap-4 p-4 rounded-xl border transition ${i < 3 ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-white/5 bg-discord-card'}`}>
                <div className="w-8 text-center">
                  <span className="text-lg">{medals[i] || `#${entry.rank}`}</span>
                </div>
                <img src={entry.avatar || `https://cdn.discordapp.com/embed/avatars/0.png`}
                  alt="" className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <p className="text-white font-medium">{entry.username}</p>
                  <p className="text-discord-muted text-xs">{entry.totalMessages} Nachrichten</p>
                </div>
                <div className="text-right">
                  <p className="text-discord font-bold">Level {entry.level}</p>
                  <p className="text-discord-muted text-xs">{entry.xp} XP</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

