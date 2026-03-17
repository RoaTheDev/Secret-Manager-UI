import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import '../styles.css'
import TanStackQueryProvider from '#/integrations/root-provider.tsx'

export const Route = createRootRoute({
  // beforeLoad: ({ location }) => {
  //   const { isAuthenticated } = useAuthStore.getState()
  //   const isPublicRoute = location.pathname === '/login'
  //
  //   if (!isAuthenticated && !isPublicRoute) {
  //     throw redirect({ to: '/login' })
  //   }
  //
  //   if (isAuthenticated && isPublicRoute) {
  //     throw redirect({ to: '/' })
  //   }
  // },
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
