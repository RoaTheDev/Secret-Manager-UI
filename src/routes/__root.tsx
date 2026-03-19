import { createRootRoute, isRedirect, Outlet, redirect } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import '../styles.css'
import TanStackQueryProvider from '#/integrations/root-provider.tsx'
import { useAuthStore } from '#/store/authStore.ts'
import { authApi } from '#/api'

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    const { isAuthenticated, setAuth, clearAuth } = useAuthStore.getState()
    const isPublicRoute = location.pathname === '/login'

    if (!isAuthenticated) {
      try {
        const response = await authApi.refresh()
        const { accessToken, user } = response.data.data!
        setAuth(accessToken, user)

        if (isPublicRoute) {
          throw redirect({ to: '/' })
        }
      } catch (e) {
        if (isRedirect(e)) throw e

        clearAuth()

        if (!isPublicRoute) {
          throw redirect({ to: '/login' })
        }
      }

      return
    }
    if (isAuthenticated && isPublicRoute) {
      throw redirect({ to: '/' })
    }
  },
  component: RootComponent,
})

function RootComponent() {
  return (
    <>
      <TanStackQueryProvider>
        <Outlet />
      </TanStackQueryProvider>
      <TanStackDevtools
        config={{
          position: 'bottom-right',
        }}
        plugins={[
          {
            name: 'TanStack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </>
  )
}
