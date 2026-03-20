import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/authStore'

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

interface RefreshResponse {
  data: {
    accessToken: string
    expiresAt: number
  }
}

const baseUrl = import.meta.env.VITE_API_BASE_URL
if (!baseUrl) {
  throw new Error('VITE_API_BASE_URL is not set — check your .env.local file')
}

const api = axios.create({
  baseURL: `${baseUrl}/api`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

let isRefreshing = false
const failedQueue: Array<{
  resolve: (value: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: unknown = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(null)))
  failedQueue.length = 0
}

const doRefresh = async (): Promise<string> => {
  const res = await api.post<RefreshResponse>('/auth/refresh')
  const { accessToken, expiresAt } = res.data.data
  useAuthStore.getState().setAccessToken(accessToken, expiresAt)
  return accessToken
}

const handleAuthFailure = () => {
  useAuthStore.getState().clearAuth()
  window.location.href = '/login'
}

api.interceptors.request.use(async (config) => {
  const { accessToken, expiresAt } = useAuthStore.getState()

  if (accessToken && expiresAt) {
    const expiresInMs = expiresAt - Date.now()

    if (expiresInMs < 60_000 && !config.url?.includes('/auth/')) {
      if (!isRefreshing) {
        isRefreshing = true
        try {
          const newToken = await doRefresh()
          processQueue()
          config.headers.Authorization = `Bearer ${newToken}`
        } catch (err) {
          processQueue(err)
          handleAuthFailure()
        } finally {
          isRefreshing = false
        }
      }
    } else {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryConfig

    if (
      error.response?.status === 401 &&
      !config?._retry &&
      !config?.url?.includes('/auth/')
    ) {
      if (isRefreshing) {
        // Another refresh is already in flight — queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => api(config))
          .catch((err) => Promise.reject(err))
      }

      config._retry = true
      isRefreshing = true

      try {
        const newToken = await doRefresh()
        processQueue()
        config.headers.Authorization = `Bearer ${newToken}`
        return api(config)
      } catch (refreshError) {
        processQueue(refreshError)
        handleAuthFailure()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export default api
