import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/authStore'

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
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

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
const failedQueue: Array<{
  resolve: (value: any) => void
  reject: (reason?: any) => void
}> = []

const processQueue = (error: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(null)
  })
  failedQueue.length = 0
}

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
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => api(config))
          .catch((err) => Promise.reject(err))
      }

      config._retry = true
      isRefreshing = true

      try {
        const response = await api.post<{
          data: { accessToken: string }
        }>('/auth/refresh')

        const newToken = response.data.data.accessToken
        useAuthStore.getState().setAccessToken(newToken)

        config.headers.Authorization = `Bearer ${newToken}`

        processQueue()

        return api(config)
      } catch (refreshError) {
        processQueue(refreshError)

        useAuthStore.getState().clearAuth()
        window.location.href = '/login'

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export default api
