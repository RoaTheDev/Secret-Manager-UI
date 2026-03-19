import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Avatar,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Tab,
  Tabs,
  TextField,
} from '@mui/material'
import {
  ChevronRight,
  Lock,
  Plus,
  Shield,
  ShieldAlert,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { adminApi, credentialApi, projectApi } from '@/api'
import type {
  AccessTier,
  ApprovalPolicy,
  CredentialType,
} from '@/commons/constant/apiConstant'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CredentialEditor } from '@/components/credential/CredentialEditor'
import { useAuthStore } from '@/store/authStore'

export const Route = createFileRoute('/projects/$projectId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { projectId } = Route.useParams()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  const [tab, setTab] = useState(0)
  const [open, setOpen] = useState(false)
  const [memberDialogOpen, setMemberDialogOpen] = useState(false)

  const memberSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
  })
  type MemberForm = z.infer<typeof memberSchema>

  const {
    control: memberControl,
    handleSubmit: handleMemberSubmit,
    reset: resetMember,
    formState: { errors: memberErrors },
  } = useForm<MemberForm>({
    resolver: zodResolver(memberSchema) as any,
    defaultValues: { userId: '' },
  })

  const addMemberMutation = useMutation({
    mutationFn: (data: { userId: string }) =>
      projectApi.addMember(projectId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      setMemberDialogOpen(false)
      resetMember()
    },
  })

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => projectApi.removeMember(projectId, userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['project', projectId] })
    },
  })

  const onAddMember = (values: MemberForm) => {
    addMemberMutation.mutate(values)
  }
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => adminApi.getUsers(0, 100),
    enabled: memberDialogOpen,
  })

  const users = usersData?.data.data?.content ?? []


  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      name: '',
      type: 'ENV_VAR',
      value: '',
      accessTier: 'PROJECT',
      approvalPolicy: 'STANDARD',
    },
  })

  const watchedType = watch('type')

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

  const createMutation = useMutation({
    mutationFn: credentialApi.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['credentials', projectId],
      })
      setOpen(false)
      reset()
    },
  })

  const handleClose = () => {
    setOpen(false)
    reset()
  }

  const onSubmit = (values: CreateForm) => {
    createMutation.mutate({ ...values, projectId })
  }

  const project = projectData?.data.data
  const credentials = credentialData?.data.data?.content ?? []
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
        <Link
          to="/projects"
          className="text-[13px] text-surface-500 no-underline hover:text-ocean-500"
        >
          Projects
        </Link>
        <ChevronRight size={14} className="text-surface-300" />
        <span className="text-[13px] text-surface-700">{project.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-ocean-700 m-0 mb-1">
            {project.name}
          </h1>
          {project.description && (
            <p className="text-sm text-surface-500 m-0">
              {project.description}
            </p>
          )}
        </div>
        {user?.role === 'ADMIN' && tab === 0 && (
          <Button
            variant="contained"
            size="small"
            startIcon={<Plus size={14} />}
            onClick={() => setOpen(true)}
          >
            Add Credential
          </Button>
        )}
        {(user?.role === 'ADMIN' ||
          user?.role === 'TEAM_LEAD' ||
          user?.role === 'PROJECT_MANAGER') &&
          tab === 1 && (
            <Button
              variant="contained"
              size="small"
              startIcon={<UserPlus size={14} />}
              onClick={() => setMemberDialogOpen(true)}
            >
              Add Member
            </Button>
          )}
      </div>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} className="mb-5">
        <Tab label={`Credentials (${credentials.length})`} />
        <Tab
          label={`Members (${project.members.length})`}
          icon={<Users size={14} />}
          iconPosition="start"
        />
      </Tabs>

      {tab === 0 && (
        <div className="flex flex-col gap-2">
          {credLoading ? (
            <div className="flex justify-center py-8">
              <CircularProgress size={24} className="!text-ocean-500" />
            </div>
          ) : credentials.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-surface-400">
              <Lock size={32} className="mb-3 opacity-35" />
              <p className="text-sm m-0">No credentials yet</p>
              {user?.role === 'ADMIN' && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Plus size={13} />}
                  onClick={() => setOpen(true)}
                  className="!mt-4"
                >
                  Add the first credential
                </Button>
              )}
            </div>
          ) : (
            credentials.map((cred) => (
              <Link
                key={cred.id}
                to="/credentials/$credentialId"
                params={{ credentialId: cred.id }}
                className="no-underline"
              >
                <div
                  className="flex items-center justify-between bg-surface-0 border border-surface-200
                           rounded-[10px] px-5 py-3.5 hover:border-ocean-300 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-surface-100">
                      <Lock size={14} className="text-surface-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-surface-700 m-0 mb-0.5">
                        {cred.name}
                      </p>
                      <p className="text-[11px] text-surface-400 m-0">
                        {TYPE_LABEL[cred.type]}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[11px] font-medium px-2 py-1 rounded-[5px] ${POLICY_CLASSES[cred.approvalPolicy]}`}
                    >
                      {cred.approvalPolicy}
                    </span>
                    <Chip
                      label={cred.accessTier}
                      size="small"
                      color={TIER_COLOR[cred.accessTier]}
                      icon={
                        cred.accessTier === 'ADMIN' ? (
                          <ShieldAlert size={11} />
                        ) : (
                          <Shield size={11} />
                        )
                      }
                    />
                    <ChevronRight size={16} className="text-surface-300" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {tab === 1 && (
        <div className="flex flex-col gap-2">
          {project.members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-4 bg-surface-0 border border-surface-200 rounded-[10px] px-5 py-3.5"
            >
              <Avatar className="!w-9 !h-9 !text-[13px]">
                {member.name.charAt(0)}
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium text-surface-700 m-0 mb-0.5">
                  {member.name}
                </p>
                <p className="text-[12px] text-surface-400 m-0">
                  {member.email}
                </p>
              </div>
              <Chip
                label={member.role}
                size="small"
                variant="outlined"
                className="!border-ocean-100 !text-ocean-400"
              />
              {(user?.role === 'ADMIN' ||
                user?.role === 'TEAM_LEAD' ||
                user?.role === 'PROJECT_MANAGER') &&
                member.id !== user.id && (
                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    disabled={removeMemberMutation.isPending}
                    onClick={() => removeMemberMutation.mutate(member.id)}
                    className="!min-w-0 !px-2"
                  >
                    {removeMemberMutation.isPending ? (
                      <CircularProgress size={14} color="inherit" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </Button>
                )}
            </div>
          ))}
        </div>
      )}
      <Dialog
        open={memberDialogOpen}
        onClose={() => {
          setMemberDialogOpen(false)
          resetMember()
        }}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: { style: { alignSelf: 'flex-start', marginTop: '80px' } },
        }}
      >
        <form onSubmit={handleMemberSubmit(onAddMember)} noValidate>
          <DialogTitle>Add Member</DialogTitle>
          <DialogContent className="flex flex-col gap-4">
            <Controller
              name="userId"
              control={memberControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="User"
                  fullWidth
                  required
                  autoFocus
                  error={!!memberErrors.userId}
                  helperText={memberErrors.userId?.message}
                >
                  {availableUsers.length === 0 ? (
                    <MenuItem disabled>
            <span className="text-surface-400 text-sm">
              No users available to add
            </span>
                    </MenuItem>
                  ) : (
                    availableUsers.map((u) => (
                      <MenuItem key={u.id} value={u.id}>
                        <div className="flex items-center gap-3 py-0.5">
                          <Avatar className="!w-7 !h-7 !text-[11px]">
                            {u.name.charAt(0)}
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-surface-700 m-0 leading-tight">
                              {u.name}
                            </p>
                            <p className="text-[11px] text-surface-400 m-0">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </MenuItem>
                    ))
                  )}
                </TextField>
              )}
            />
            {addMemberMutation.isError && (
              <p className="text-[12px] text-danger-base m-0">
                Failed to add member. Please try again.
              </p>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setMemberDialogOpen(false)
                resetMember()
              }}
              color="inherit"
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={addMemberMutation.isPending}
            >
              {addMemberMutation.isPending ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                'Add Member'
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: { style: { alignSelf: 'flex-start', marginTop: '80px' } },
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogTitle>Add Credential</DialogTitle>

          <DialogContent className="flex flex-col gap-4">
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Name"
                  fullWidth
                  required
                  autoFocus
                  placeholder="e.g. Production Environment Variables"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />

            <div className="grid grid-cols-3 gap-3">
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Type"
                    fullWidth
                    error={!!errors.type}
                  >
                    {CREDENTIAL_TYPES.map((t) => (
                      <MenuItem key={t} value={t}>
                        {TYPE_LABEL[t]}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />

              <Controller
                name="accessTier"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Access Tier"
                    fullWidth
                    error={!!errors.accessTier}
                  >
                    {ACCESS_TIERS.map((t) => (
                      <MenuItem key={t} value={t}>
                        {t}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />

              <Controller
                name="approvalPolicy"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Approval Policy"
                    fullWidth
                    error={!!errors.approvalPolicy}
                  >
                    {POLICIES.map((p) => (
                      <MenuItem key={p} value={p}>
                        <div>
                          <p className="text-sm m-0">{p}</p>
                          <p className="text-[11px] text-surface-400 m-0">
                            {POLICY_DESC[p]}
                          </p>
                        </div>
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </div>

            <div>
              <p className="text-[13px] font-medium text-surface-600 m-0 mb-1.5">
                Value
                <span className="text-danger-base ml-0.5">*</span>
              </p>
              <Controller
                name="value"
                control={control}
                render={({ field }) => (
                  <CredentialEditor
                    value={field.value}
                    type={watchedType}
                    onChange={field.onChange}
                    error={!!errors.value}
                  />
                )}
              />
              {errors.value && (
                <p className="text-[11px] text-danger-base mt-1 mx-3 m-0">
                  {errors.value.message}
                </p>
              )}
            </div>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose} color="inherit" variant="outlined">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                'Save Credential'
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </AppLayout>
  )
}

const TIER_COLOR: Record<AccessTier, 'error' | 'warning'> = {
  ADMIN: 'error',
  PROJECT: 'warning',
}

const POLICY_CLASSES: Record<ApprovalPolicy, string> = {
  RELAXED: 'bg-success-light text-success-dark',
  STANDARD: 'bg-warning-light text-warning-dark',
  STRICT: 'bg-danger-light  text-danger-dark',
}

const TYPE_LABEL: Record<CredentialType, string> = {
  ENV_VAR: '.env',
  NGINX_CONFIG: 'Nginx',
  DOCKER_CONFIG: 'Docker',
  TERRAFORM: 'Terraform',
  CONFIG_FILE: 'Config',
  SSH_KEY: 'SSH Key',
  DATABASE_URL: 'Database URL',
  TLS_CERT: 'TLS Certificate',
  API_KEY: 'API Key',
  OTHER: 'Other',
}

const CREDENTIAL_TYPES: CredentialType[] = [
  'ENV_VAR',
  'NGINX_CONFIG',
  'DOCKER_CONFIG',
  'TERRAFORM',
  'CONFIG_FILE',
  'SSH_KEY',
  'DATABASE_URL',
  'TLS_CERT',
  'API_KEY',
  'OTHER',
]

const ACCESS_TIERS: AccessTier[] = ['PROJECT', 'ADMIN']
const POLICIES: ApprovalPolicy[] = ['RELAXED', 'STANDARD', 'STRICT']

const POLICY_DESC: Record<ApprovalPolicy, string> = {
  RELAXED: 'Any 1 approver',
  STANDARD: 'Any 2 approvers',
  STRICT: 'Team Lead + PM + 1 Admin',
}

const createSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  type: z.enum([
    'ENV_VAR',
    'NGINX_CONFIG',
    'DOCKER_CONFIG',
    'TERRAFORM',
    'CONFIG_FILE',
    'SSH_KEY',
    'DATABASE_URL',
    'TLS_CERT',
    'API_KEY',
    'OTHER',
  ]),
  value: z.string().min(1, 'Value is required'),
  accessTier: z.enum(['PROJECT', 'ADMIN']),
  approvalPolicy: z.enum(['RELAXED', 'STANDARD', 'STRICT']),
})

type CreateForm = z.infer<typeof createSchema>
