import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Avatar,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
} from '@mui/material'
import {
  ClipboardList,
  FolderOpen,
  Key,
  ShieldCheck,
  UserCheck,
  UserX,
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { adminApi } from '@/api/adminApi'
import { useAuthStore } from '@/store/authStore'
import { createFileRoute } from '@tanstack/react-router'
import type { UserSummary } from '#/commons/types/userType.ts'
import { AppLoadingComponent } from '#/components/AppLoadingComponent.tsx'
import { ShamirTab } from '#/components/admin/ShamirTab.tsx'
import { AuditTab } from '#/components/admin/AuditTab'
import { ProjectRow } from '#/components/admin/ProjectRow.tsx'
import { CreateUserDialog } from '#/components/admin/CreateUserDialog.tsx'

export const Route = createFileRoute('/admin/')({
  component: AdminPage,
})

function AdminPage() {
  const [tab, setTab] = useState(0)

  return (
    <AppLayout>
      <div className="mb-7">
        <h1 className="text-[22px] font-semibold text-ocean-700 m-0 mb-1">
          Admin Panel
        </h1>
        <p className="text-sm text-surface-500 m-0">
          Manage users, projects, Shamir key shares, and audit logs
        </p>
      </div>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} className="mb-6">
        <Tab
          label="Users"
          icon={<ShieldCheck size={14} />}
          iconPosition="start"
        />
        <Tab
          label="Projects"
          icon={<FolderOpen size={14} />}
          iconPosition="start"
        />
        <Tab label="Shamir Key" icon={<Key size={14} />} iconPosition="start" />
        <Tab
          label="Audit Logs"
          icon={<ClipboardList size={14} />}
          iconPosition="start"
        />
      </Tabs>

      {tab === 0 && <UsersTab />}
      {tab === 1 && <ProjectsTab />}
      {tab === 2 && <ShamirTab />}
      {tab === 3 && <AuditTab />}
    </AppLayout>
  )
}

export const UsersTab = () => {
  const queryClient = useQueryClient()
  const currentUser = useAuthStore((s) => s.user)

  const [adminToDeactivate, setAdminToDeactivate] =
    useState<UserSummary | null>(null)
  const [selectedAdminIds, setSelectedAdminIds] = useState<Set<string>>(
    new Set(),
  )

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminApi.getUsers(),
    staleTime: 1000 * 60 * 5,
  })

  const deactivateMutation = useMutation({
    mutationFn: ({ id, adminIds }: { id: string; adminIds?: string[] }) =>
      adminApi.deactivateUser(id, adminIds),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      setAdminToDeactivate(null)
      setSelectedAdminIds(new Set())
    },
  })

  const activateMutation = useMutation({
    mutationFn: (id: string) => adminApi.activateUser(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })

  const users: UserSummary[] = data?.data.data?.content ?? []

  const availableApprovers = users.filter(
    (u) =>
      u.role === 'ADMIN' &&
      u.isActive &&
      u.id !== adminToDeactivate?.id &&
      u.id !== currentUser?.id,
  )

  const handleDeactivateClick = (user: UserSummary) => {
    if (user.role === 'ADMIN') {
      setAdminToDeactivate(user)
    } else {
      deactivateMutation.mutate({ id: user.id })
    }
  }

  const handleQuorumSubmit = () => {
    if (!adminToDeactivate) return
    deactivateMutation.mutate({
      id: adminToDeactivate.id,
      adminIds: [...Array.from(selectedAdminIds), currentUser!.id],
    })
  }

  const toggleAdminId = (id: string) => {
    setSelectedAdminIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  if (isLoading) return <AppLoadingComponent />

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-surface-500 m-0">
          {users.length} user{users.length !== 1 ? 's' : ''} total
        </p>
        <CreateUserDialog />
      </div>
      <div className="bg-surface-0 border border-surface-200 rounded-xl overflow-hidden">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="!w-8 !h-8 !text-[12px]">
                      {user.name.charAt(0)}
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-surface-700 m-0">
                        {user.name}
                      </p>
                      <p className="text-[12px] text-surface-400 m-0">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.role}
                    size="small"
                    variant="outlined"
                    className="!border-ocean-100 !text-ocean-500"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.isActive ? 'Active' : 'Inactive'}
                    size="small"
                    color={user.isActive ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell align="right">
                  {user.isActive ? (
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      startIcon={<UserX size={13} />}
                      onClick={() => handleDeactivateClick(user)}
                      disabled={deactivateMutation.isPending}
                    >
                      Deactivate
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      color="success"
                      variant="outlined"
                      startIcon={<UserCheck size={13} />}
                      onClick={() => activateMutation.mutate(user.id)}
                      disabled={activateMutation.isPending}
                    >
                      Activate
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Quorum dialog for admin deactivation */}
      <Dialog
        open={!!adminToDeactivate}
        onClose={() => setAdminToDeactivate(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Deactivate Admin</DialogTitle>
        <DialogContent>
          <p className="text-sm text-surface-600 mb-4">
            Deactivating <strong>{adminToDeactivate?.name}</strong> requires
            quorum approval from other admins. Select the admins approving this
            action.
          </p>
          {availableApprovers.length === 0 ? (
            <p className="text-sm text-error-500">
              No other active admins available to form a quorum.
            </p>
          ) : (
            availableApprovers.map((admin) => (
              <div key={admin.id}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedAdminIds.has(admin.id)}
                      onChange={() => toggleAdminId(admin.id)}
                      size="small"
                    />
                  }
                  label={
                    <span className="text-sm">
                      {admin.name}
                      <span className="text-surface-400 ml-1 text-[12px]">
                        {admin.email}
                      </span>
                    </span>
                  }
                />
              </div>
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdminToDeactivate(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleQuorumSubmit}
            disabled={
              selectedAdminIds.size === 0 || deactivateMutation.isPending
            }
          >
            Confirm Deactivation
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
const ProjectsTab = () => {
  const queryClient = useQueryClient()
  const currentUser = useAuthStore((s) => s.user)

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['admin', 'projects'],
    queryFn: () => adminApi.getAllProjects(),
    staleTime: 1000 * 60 * 2,
  })

  const projects = projectsData?.data.data?.content ?? []

  if (isLoading) return <AppLoadingComponent />

  return (
    <div className="bg-surface-0 border border-surface-200 rounded-xl overflow-hidden">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Project</TableCell>
            <TableCell>Members</TableCell>
            <TableCell>Created</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {projects.map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              currentUserId={currentUser?.id ?? ''}
              onDeleted={async () => {
                await queryClient.invalidateQueries({
                  queryKey: ['admin', 'projects'],
                })
                await queryClient.invalidateQueries({ queryKey: ['projects'] })
              }}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
