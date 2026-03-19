import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { UserSummary } from '@/commons/types/userType'

interface AuthState {
  accessToken:     string | null
  user:            UserSummary | null
  isAuthenticated: boolean

  setAuth:         (token: string, user: UserSummary) => void
  setAccessToken:  (token: string) => void
  clearAuth:       () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken:     null,
      user:            null,
      isAuthenticated: false,

      setAuth: (token, user) =>
        set({ accessToken: token, user, isAuthenticated: true }),

      setAccessToken: (token) =>
        set({ accessToken: token }),

      clearAuth: () =>
        set({ accessToken: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-session',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        accessToken:     state.accessToken,
        user:            state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)