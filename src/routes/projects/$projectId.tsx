import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, CircularProgress, Tab, Tabs } from '@mui/material'
import { ChevronRight, Plus, UserPlus, Users } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { adminApi, credentialApi, projectApi } from '@/api'
import { useAuthStore } from '@/store/authStore'
import { CredentialList } from '#/components/projects/CredentialList.tsx'
import { MemberList } from '#/components/projects/MemberList.tsx'
import { AddCredentialDialog, type CreateCredentialForm } from '#/components/projects/AddCrendetialDialog'
import { AddMemberDialog } from '#/components/projects/AddMemberDialog.tsx'

export const Route = createFileRoute('/projects/$projectId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { projectId } = Route.useParams()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  const [tab, setTab] = useState(0)
  const [credDialogOpen, setCredDialogOpen] = useState(false)
  const [memberDialogOpen, setMemberDialogOpen] = useState(false)

  const canManageMembers =
    user?.role === 'ADMIN' ||
    user?.role === 'TEAM_LEAD' ||
    user?.role === 'PROJECT_MANAGER'

  const { data: projectData, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectApi.getDetail(projectId),
    staleTime: 1000 * 60 * 10,
  })

  const { data: credentialData, isLoading: credLoading } = useQuery({
    queryKey: ['credentials', projectId],
    queryFn: () => credentialApi.listByProject(projectId),
    staleTime: 1000 * 60 * 10,
  })

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => adminApi.getUsers(0, 100),
    enabled: memberDialogOpen,
  })

  const createMutation = useMutation({
    mutationFn: credentialApi.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['credentials', projectId] })
      setCredDialogOpen(false)
    },
  })

  const addMemberMutation = useMutation({
    mutationFn: (data: { userId: string }) => projectApi.addMember(projectId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      setMemberDialogOpen(false)
    },
  })

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => projectApi.removeMember(projectId, userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['project', projectId] })
    },
  })

  const project = projectData?.data.data
  const credentials = credentialData?.data.data?.content ?? []
  const users = usersData?.data.data?.content ?? []
  const availableUsers = users.filter(
    (u) => !project?.members.some((m) => m.id === u.id)
  )

  if (isLoading)
    return (
      <AppLayout>
        <div className="flex justify-center py-16">
          <CircularProgress className="!text-ocean-500" />
        </div>
      </AppLayout>
    )

  if (!project) return null

  return (
    <AppLayout>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Link to="/projects" className="text-[13px] text-surface-500 no-underline hover:text-ocean-500">
          Projects
        </Link>
        <ChevronRight size={14} className="text-surface-300" />
        <span className="text-[13px] text-surface-700">{project.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-ocean-700 m-0 mb-1">{project.name}</h1>
          {project.description && (
            <p className="text-sm text-surface-500 m-0">{project.description}</p>
          )}
        </div>
        {user?.role === 'ADMIN' && tab === 0 && (
          <Button variant="contained" size="small" startIcon={<Plus size={14} />} onClick={() => setCredDialogOpen(true)}>
            Add Credential
          </Button>
        )}
        {canManageMembers && tab === 1 && (
          <Button variant="contained" size="small" startIcon={<UserPlus size={14} />} onClick={() => setMemberDialogOpen(true)}>
            Add Member
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} className="mb-5">
        <Tab label={`Credentials (${credentials.length})`} />
        <Tab label={`Members (${project.members.length})`} icon={<Users size={14} />} iconPosition="start" />
      </Tabs>

      {tab === 0 && (
        <CredentialList
          credentials={credentials}
          isLoading={credLoading}
          isAdmin={user?.role === 'ADMIN'}
          onAdd={() => setCredDialogOpen(true)}
        />
      )}

      {tab === 1 && (
        <MemberList
          members={project.members}
          currentUserId={user?.id ?? ''}
          canManage={canManageMembers}
          isRemoving={removeMemberMutation.isPending}
          onRemove={(id) => removeMemberMutation.mutate(id)}
        />
      )}

      <AddCredentialDialog
        open={credDialogOpen}
        isPending={createMutation.isPending}
        onClose={() => setCredDialogOpen(false)}
        onSubmit={(values: CreateCredentialForm) =>
          createMutation.mutate({ ...values, projectId })
        }
      />

      <AddMemberDialog
        open={memberDialogOpen}
        availableUsers={availableUsers}
        isPending={addMemberMutation.isPending}
        isError={addMemberMutation.isError}
        onClose={() => setMemberDialogOpen(false)}
        onSubmit={(data) => addMemberMutation.mutate(data)}
      />
    </AppLayout>
  )
}