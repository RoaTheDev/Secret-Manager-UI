import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from '@mui/material'
import {
  ChevronRight,
  Clock,
  Eye,
  Lock,
  Pencil,
  Shield,
  ShieldAlert,
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { CredentialViewer } from '@/components/credential/CredentialViewer'
import { CredentialEditor } from '@/components/credential/CredentialEditor'
import { credentialApi } from '@/api'
import type { CredentialRevealResponse } from '@/commons/types/crendentialType'
import { formatDistanceToNow } from 'date-fns'
import type {
  AccessTier,
  ApprovalPolicy,
  CredentialType,
} from '#/commons/constant/apiConstant.ts'
import { useAuthStore } from '#/store/authStore.ts'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

export const Route = createFileRoute('/credentials/$credentialId')({
  component: RouteComponent,
})

const editSchema = z.object({
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

type EditForm = z.infer<typeof editSchema>

function RouteComponent() {
  const { credentialId } = Route.useParams()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  const [revealed, setRevealed] = useState<CredentialRevealResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [showRequestButton, setShowRequestButton] = useState(false)
  const [accessRequested, setAccessRequested] = useState(false)

  const isPrivileged =
    user?.role === 'ADMIN' ||
    user?.role === 'TEAM_LEAD' ||
    user?.role === 'PROJECT_MANAGER'

  const { data, isLoading } = useQuery({
    queryKey: ['credential', credentialId],
    queryFn: () => credentialApi.getDetail(credentialId),
  })

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<EditForm>({
    resolver: zodResolver(editSchema) as any,
  })

  const watchedType = watch('type')

  const requestMutation = useMutation({
    mutationFn: () => credentialApi.requestAccess(credentialId),
    onSuccess: () => setAccessRequested(true),
    onError: (e: { response?: { status?: number; data?: { message?: string } } }) => {
      const status = e.response?.status
      const msg = e.response?.data?.message ?? ''
      if (status === 409) {
        setAccessRequested(true)
      } else {
        setError(msg || 'Request failed')
      }
    },
  })

  const revealMutation = useMutation({
    mutationFn: () => credentialApi.reveal(credentialId),
    onSuccess: (res) => {
      setRevealed(res.data.data!)
      setError(null)
      setShowRequestButton(false)
    },
    onError: (e: { response?: { status?: number; data?: { message?: string } } }) => {
      const status = e.response?.status
      const msg = e.response?.data?.message ?? ''
      if (status === 403) {
        setShowRequestButton(true)
      } else {
        setError(msg || 'Access denied')
      }
    },
  })

  const editMutation = useMutation({
    mutationFn: (data: EditForm) => credentialApi.update(credentialId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['credential', credentialId],
      })
      setEditOpen(false)
      setRevealed(null)
    },
    onError: (e: { response?: { data?: { message?: string } } }) =>
      setError(e.response?.data?.message ?? 'Failed to update credential'),
  })

  const handleEditOpen = async () => {
    if (!credential) return
    setEditLoading(true)

    try {
      const res = await credentialApi.reveal(credentialId)
      const revealedData = res.data.data!
      reset({
        name: credential.name,
        type: credential.type,
        value: revealedData.value,
        accessTier: credential.accessTier,
        approvalPolicy: credential.approvalPolicy,
      })
      setRevealed(revealedData)
      setEditOpen(true)
    } catch {
      setError('Could not load credential value for editing.')
    } finally {
      setEditLoading(false)
    }
  }

  const onEditSubmit = (values: EditForm) => editMutation.mutate(values)

  const credential = data?.data.data

  if (isLoading)
    return (
      <AppLayout>
        <div className="flex justify-center py-16">
          <CircularProgress className="!text-ocean-500" />
        </div>
      </AppLayout>
    )

  if (!credential) return null

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
        <button
          onClick={() => history.back()}
          className="text-[13px] text-surface-500 bg-transparent border-none
                     cursor-pointer p-0 hover:text-ocean-500"
        >
          Project
        </button>
        <ChevronRight size={14} className="text-surface-300" />
        <span className="text-[13px] text-surface-700">{credential.name}</span>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 280px' }}>
        {/* Main card */}
        <div className="bg-surface-0 border border-surface-200 rounded-xl p-6">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-[10px] bg-surface-100">
                <Lock size={18} className="text-surface-500" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-ocean-700 m-0 mb-0.5">
                  {credential.name}
                </h1>
                <p className="text-[13px] text-surface-500 m-0">
                  {TYPE_LABEL[credential.type]}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Chip
                label={credential.accessTier}
                color={TIER_COLOR[credential.accessTier]}
                size="small"
                icon={
                  credential.accessTier === 'ADMIN' ? (
                    <ShieldAlert size={11} />
                  ) : (
                    <Shield size={11} />
                  )
                }
              />
              {user?.role === 'ADMIN' && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={
                    editLoading ? (
                      <CircularProgress size={13} color="inherit" />
                    ) : (
                      <Pencil size={13} />
                    )
                  }
                  onClick={handleEditOpen}
                  disabled={editLoading}
                >
                  Edit
                </Button>
              )}
            </div>
          </div>

          {error && (
            <Alert
              severity="warning"
              onClose={() => setError(null)}
              className="mb-4"
            >
              {error}
            </Alert>
          )}

          {revealed ? (
            <CredentialViewer credential={revealed} />
          ) : isPrivileged ? (
            /* Privileged roles — reveal directly, no approval needed */
            <div
              className="flex flex-col items-center border border-dashed border-surface-300
                  rounded-[10px] p-10 bg-surface-50 gap-3"
            >
              <Lock size={28} className="text-surface-300" />
              <div className="text-center">
                <p className="text-sm font-medium text-surface-600 m-0 mb-1">
                  This credential is locked
                </p>
                <p className="text-[13px] text-surface-400 m-0">
                  Click reveal to view the credential value
                </p>
              </div>
              <Button
                variant="contained"
                size="small"
                startIcon={
                  revealMutation.isPending ? (
                    <CircularProgress size={13} color="inherit" />
                  ) : (
                    <Eye size={13} />
                  )
                }
                disabled={revealMutation.isPending}
                onClick={() => revealMutation.mutate()}
              >
                Reveal
              </Button>
            </div>
          ) : (
            /* Developers — reveal first, request access only if 403 */
            <div
              className="flex flex-col items-center border border-dashed border-surface-300
                  rounded-[10px] p-10 bg-surface-50 gap-3"
            >
              <Lock size={28} className="text-surface-300" />
              <div className="text-center">
                <p className="text-sm font-medium text-surface-600 m-0 mb-1">
                  This credential is locked
                </p>
                <p className="text-[13px] text-surface-400 m-0">
                  {accessRequested
                    ? 'Your request is pending approval'
                    : showRequestButton
                      ? 'You need approval to access this credential'
                      : 'Click reveal to attempt access'}
                </p>
              </div>
              <div className="flex gap-2.5 mt-1">
                {showRequestButton && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Clock size={13} />}
                    disabled={requestMutation.isPending || accessRequested}
                    onClick={() => requestMutation.mutate()}
                  >
                    {accessRequested ? 'Request Submitted' : 'Request Access'}
                  </Button>
                )}
                <Button
                  variant="contained"
                  size="small"
                  startIcon={
                    revealMutation.isPending ? (
                      <CircularProgress size={13} color="inherit" />
                    ) : (
                      <Eye size={13} />
                    )
                  }
                  disabled={revealMutation.isPending}
                  onClick={() => revealMutation.mutate()}
                >
                  Reveal
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Details panel */}
        <div className="bg-surface-0 border border-surface-200 rounded-xl p-5">
          <h3 className="text-[11px] font-semibold text-surface-400 uppercase tracking-[0.05em] m-0 mb-4">
            Details
          </h3>
          <dl className="m-0">
            {[
              { label: 'Type', value: TYPE_LABEL[credential.type] },
              { label: 'Access Tier', value: credential.accessTier },
              {
                label: 'Policy',
                value: `${credential.approvalPolicy} — ${POLICY_DESC[credential.approvalPolicy]}`,
              },
              { label: 'Created by', value: credential.createdBy },
              {
                label: 'Created',
                value: formatDistanceToNow(new Date(credential.createdAt), {
                  addSuffix: true,
                }),
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="pb-3 mb-3 border-b border-surface-100 last:border-0 last:mb-0 last:pb-0"
              >
                <dt className="text-[11px] text-surface-400 font-medium uppercase tracking-[0.04em] mb-0.5">
                  {label}
                </dt>
                <dd className="text-[13px] text-surface-700 m-0">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: { style: { alignSelf: 'flex-start', marginTop: '80px' } },
        }}
      >
        <form onSubmit={handleSubmit(onEditSubmit)} noValidate>
          <DialogTitle>Edit Credential</DialogTitle>

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
            <Button
              onClick={() => setEditOpen(false)}
              color="inherit"
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={editMutation.isPending}
            >
              {editMutation.isPending ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </AppLayout>
  )
}

const TYPE_LABEL: Record<CredentialType, string> = {
  ENV_VAR: 'Environment Variables (.env)',
  NGINX_CONFIG: 'Nginx Configuration',
  DOCKER_CONFIG: 'Docker Compose',
  TERRAFORM: 'Terraform Variables',
  CONFIG_FILE: 'Configuration File',
  SSH_KEY: 'SSH Key',
  DATABASE_URL: 'Database URL',
  TLS_CERT: 'TLS Certificate',
  API_KEY: 'API Key',
  OTHER: 'Other',
}

const POLICY_DESC: Record<ApprovalPolicy, string> = {
  RELAXED: 'Any 1 approver',
  STANDARD: 'Any 2 approvers',
  STRICT: 'Team Lead + PM + 1 Admin',
}

const TIER_COLOR: Record<AccessTier, 'error' | 'warning'> = {
  ADMIN: 'error',
  PROJECT: 'warning',
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