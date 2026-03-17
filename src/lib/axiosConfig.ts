import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/authStore'

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// On 401 — attempt token refresh then retry original request once
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryConfig

    const isUnauthorized = error.response?.status === 401
    const isNotRetried = !config?._retry
    const isNotAuthRoute = !config?.url?.includes('/auth/')

    if (isUnauthorized && isNotRetried && isNotAuthRoute) {
      config._retry = true

      try {
        const response = await api.post<{
          data: { accessToken: string }
        }>('/auth/refresh')

        const newToken = response.data.data.accessToken
        useAuthStore.getState().setAccessToken(newToken)
        config.headers.Authorization = `Bearer ${newToken}`

        return api(config)
      } catch {
        useAuthStore.getState().clearAuth()
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  },
)

export default api
