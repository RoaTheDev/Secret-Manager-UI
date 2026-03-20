import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { UserSummary } from '@/commons/types/userType'

interface AuthState {
  accessToken: string | null
  user: UserSummary | null
  isAuthenticated: boolean
  expiresAt: number | null
  setAuth: (token: string, expiresAt: number, user: UserSummary) => void
  setAccessToken: (token: string, expiresAt: number) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      expiresAt: null,

      setAuth: (token, expiresAt, user) =>
        set({ accessToken: token, expiresAt, user, isAuthenticated: true }),

      setAccessToken: (token, expiresAt) =>
        set({ accessToken: token, expiresAt }),

      clearAuth: () =>
        set({
          accessToken: null,
          user: null,
          isAuthenticated: false,
          expiresAt: null,
        }),
    }),
    {
      name: 'auth-session',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        expiresAt: state.expiresAt,
      }),
    },
  ),
)
