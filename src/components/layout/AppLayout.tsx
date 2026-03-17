import { type ReactNode } from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import {
  CheckSquare,
  FolderOpen,
  LayoutDashboard,
  Lock,
  LogOut,
  ShieldCheck,
} from 'lucide-react'
import { Avatar } from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '#/api/authApi.ts'
import { useAuthStore } from '#/store/authStore.ts'
import type { UserRole } from '#/commons/constant/apiConstant.ts'

interface NavItem {
  label: string
  to: string
  icon: ReactNode
  roles?: UserRole[]
}

const NAV: NavItem[] = [
  { label: 'Dashboard', to: '/', icon: <LayoutDashboard size={16} /> },
  { label: 'Projects', to: '/projects', icon: <FolderOpen size={16} /> },
  { label: 'Approvals', to: '/approvals', icon: <CheckSquare size={16} /> },
  {
    label: 'Admin',
    to: '/admin',
    icon: <ShieldCheck size={16} />,
    roles: ['ADMIN'],
  },
]

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const { user, clearAuth } = useAuthStore()
  const router = useRouter()

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clearAuth()
      router.navigate({ to: '/login' })
    },
  })

  const visibleNav = NAV.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role)),
  )

  return (
    <div className="flex h-screen bg-surface-100">
      <aside className="flex flex-col w-56 min-w-56 bg-ocean-800 border-r border-ocean-700">
        <div className="flex items-center gap-3 px-5 py-5 border-b border-ocean-700">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-ocean-500">
            <Lock size={15} color="#FFFFFF" />
          </div>
          <span className="text-sm font-semibold text-ocean-50">
            Secrets Manager
          </span>
        </div>

        <nav className="flex-1 px-3 pt-3">
          {visibleNav.map((item) => (
            <Link key={item.to} to={item.to} className="block mb-0.5">
              {({ isActive }) => (
                <div
                  className={[
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-colors cursor-pointer',
                    isActive
                      ? 'bg-ocean-500/25 text-ocean-100 font-medium'
                      : 'text-ocean-300 hover:text-ocean-100 hover:bg-ocean-700/50',
                  ].join(' ')}
                >
                  {item.icon}
                  {item.label}
                </div>
              )}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-3 border-t border-ocean-700">
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar className="!w-7 !h-7 !text-[11px] !bg-ocean-500">
              {user?.name?.charAt(0)}
            </Avatar>
            <div className="overflow-hidden">
              <p className="text-[13px] font-medium text-ocean-50 truncate m-0">
                {user?.name}
              </p>
              <p className="text-[11px] text-ocean-400 m-0">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-[13px]
                       text-ocean-300 hover:text-ocean-100 bg-transparent border-none
                       cursor-pointer transition-colors"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="max-w-[1100px] mx-auto px-10 py-8">{children}</div>
      </main>
    </div>
  )
}
