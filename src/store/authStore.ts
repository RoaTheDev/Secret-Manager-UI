import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserSummary } from '#/commons/types/userType.ts'

interface AuthState {
  accessToken: string | null
  user: UserSummary | null
  isAuthenticated: boolean

  setAuth: (token: string, user: UserSummary) => void
  setAccessToken: (token: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,

      setAuth: (token, user) =>
        set({ accessToken: token, user, isAuthenticated: true }),

      setAccessToken: (token) => set({ accessToken: token }),

      clearAuth: () =>
        set({ accessToken: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    },
  ),
)
