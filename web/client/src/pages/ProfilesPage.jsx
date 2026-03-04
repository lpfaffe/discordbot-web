import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import api from '../api/client'
import Sidebar from '../components/Sidebar'
import toast from 'react-hot-toast'
import { FaLayerGroup, FaPlus, FaTrash, FaCheck } from 'react-icons/fa'

export default function ProfilesPage() {
  const { guildId } = useParams()
  const qc = useQueryClient()
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [creating, setCreating] = useState(false)

  const { data: guildData } = useQuery({
    queryKey: ['guild', guildId],
    queryFn: () => api.get(`/guilds/${guildId}`).then(r => r.data)
  })

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['profiles', guildId],
    queryFn: () => api.get(`/profiles/${guildId}`).then(r => r.data)
  })

  const createMutation = useMutation({
    mutationFn: ({ name, description }) => api.post(`/profiles/${guildId}`, { name, description }),
    onSuccess: () => {
      toast.success('Profil erstellt!')
      qc.invalidateQueries(['profiles', guildId])
      setNewName(''); setNewDesc(''); setCreating(false)
    },
    onError: () => toast.error('Fehler beim Erstellen')
  })

  const activateMutation = useMutation({
    mutationFn: (profileId) => api.post(`/profiles/${guildId}/${profileId}/activate`),
    onSuccess: () => {
      toast.success('Profil aktiviert!')
      qc.invalidateQueries(['profiles', guildId])
      qc.invalidateQueries(['guild', guildId])
    },
    onError: () => toast.error('Fehler beim Aktivieren')
  })

  const deleteMutation = useMutation({
    mutationFn: (profileId) => api.delete(`/profiles/${guildId}/${profileId}`),
    onSuccess: () => {
      toast.success('Profil gelöscht!')
      qc.invalidateQueries(['profiles', guildId])
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Fehler beim Löschen')
  })

  const guild = guildData?.guild

  return (
    <div className="flex">
      <Sidebar guildId={guildId} guildName={guild?.name || 'Server'} />
      <main className="flex-1 p-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <FaLayerGroup className="text-discord text-2xl" />
          <h1 className="text-2xl font-bold text-white">Konfigurations-Profile</h1>
        </div>

        <p className="text-discord-muted mb-6">
          Erstelle mehrere Konfigurationsprofile für deinen Server. Nur das aktive Profil wird vom Bot verwendet.
          Du kannst z.B. ein "Streng"-Profil und ein "Casual"-Profil erstellen und schnell wechseln.
        </p>

        {/* Neues Profil */}
        {creating ? (
          <div className="bg-discord-card rounded-xl p-5 mb-6 space-y-3 border border-discord/50">
            <h2 className="text-white font-semibold">Neues Profil</h2>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Profil-Name"
              className="w-full bg-discord-sidebar text-white rounded-lg px-3 py-2 border border-white/10 outline-none" />
            <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Beschreibung (optional)"
              className="w-full bg-discord-sidebar text-white rounded-lg px-3 py-2 border border-white/10 outline-none" />
            <div className="flex gap-3">
              <button onClick={() => createMutation.mutate({ name: newName, description: newDesc })}
                disabled={!newName || createMutation.isPending}
                className="bg-discord hover:bg-discord-dark disabled:opacity-50 text-white px-4 py-2 rounded-lg transition text-sm">
                Erstellen
              </button>
              <button onClick={() => setCreating(false)} className="bg-white/5 hover:bg-white/10 text-discord-text px-4 py-2 rounded-lg transition text-sm">
                Abbrechen
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setCreating(true)}
            className="flex items-center gap-2 bg-discord hover:bg-discord-dark text-white px-4 py-2 rounded-lg transition mb-6">
            <FaPlus /> Neues Profil
          </button>
        )}

        {isLoading ? <div className="animate-spin w-8 h-8 border-4 border-discord border-t-transparent rounded-full" /> : (
          <div className="space-y-3">
            {profiles?.length === 0 && (
              <p className="text-discord-muted text-center py-12">Noch keine Profile. Erstelle dein erstes Profil!</p>
            )}
            {profiles?.map(profile => (
              <div key={profile._id}
                className={`bg-discord-card rounded-xl p-5 flex items-center justify-between border transition ${profile.isActive ? 'border-discord-green' : 'border-white/5'}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold">{profile.name}</h3>
                    {profile.isActive && (
                      <span className="bg-discord-green/20 text-discord-green text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                        <FaCheck className="text-xs" /> Aktiv
                      </span>
                    )}
                  </div>
                  {profile.description && <p className="text-discord-muted text-sm mt-1">{profile.description}</p>}
                  <p className="text-discord-muted text-xs mt-1">Erstellt: {new Date(profile.createdAt).toLocaleDateString('de-DE')}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!profile.isActive && (
                    <>
                      <button onClick={() => activateMutation.mutate(profile._id)}
                        className="bg-discord-green/20 hover:bg-discord-green/40 text-discord-green px-3 py-1.5 rounded-lg text-sm transition">
                        Aktivieren
                      </button>
                      <button onClick={() => deleteMutation.mutate(profile._id)}
                        className="bg-red-900/20 hover:bg-red-900/40 text-discord-red px-3 py-1.5 rounded-lg text-sm transition">
                        <FaTrash />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

