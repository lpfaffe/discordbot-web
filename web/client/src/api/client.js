import axios from 'axios'

// Lokal: http://localhost:3001  |  Production: https://rls-nds.eu
const AUTH_URL = import.meta.env.VITE_AUTH_URL || ''

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      window.location.href = `${AUTH_URL}/auth/discord`
    }
    return Promise.reject(err)
  }
)

export default api

