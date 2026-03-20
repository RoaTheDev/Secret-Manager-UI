import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Chip, CircularProgress } from '@mui/material'
import { ChevronRight, Lock, Pencil, Shield, ShieldAlert } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { credentialApi } from '@/api'
import { useAuthStore } from '#/store/authStore.ts'
import { TIER_COLOR, TYPE_LABEL } from '#/commons/constant/appConstant'
import type { CredentialRevealResponse } from '@/commons/types/crendentialType'
import { CredentialDetailSidebar } from '@/components/credential/CredentialDetailSidebar'
import { CredentialRevealPanel } from '@/components/credential/CredentialRevealPanel'
import { EditCredentialDialog, type EditCredentialForm } from '@/components/credential/EditCredentialDialog'

export const Route = createFileRoute('/credentials/$credentialId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { credentialId } = Route.useParams()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  const [revealed, setRevealed] = useState<CredentialRevealResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editDefaults, setEditDefaults] = useState<EditCredentialForm | null>(null)
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
      if (status === 403) setShowRequestButton(true)
      else setError(msg || 'Access denied')
    },
  })

  const requestMutation = useMutation({
    mutationFn: () => credentialApi.requestAccess(credentialId),
    onSuccess: () => setAccessRequested(true),
    onError: (e: { response?: { status?: number; data?: { message?: string } } }) => {
      if (e.response?.status === 409) setAccessRequested(true)
      else setError(e.response?.data?.message || 'Request failed')
    },
  })

  const editMutation = useMutation({
    mutationFn: (values: EditCredentialForm) => credentialApi.update(credentialId, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['credential', credentialId] })
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
      setEditDefaults({
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
        <Link to="/projects" className="text-[13px] text-surface-500 no-underline hover:text-ocean-500">
          Projects
        </Link>
        <ChevronRight size={14} className="text-surface-300" />
        <button
          onClick={() => history.back()}
          className="text-[13px] text-surface-500 bg-transparent border-none cursor-pointer p-0 hover:text-ocean-500"
        >
          Project
        </button>
        <ChevronRight size={14} className="text-surface-300" />
        <span className="text-[13px] text-surface-700">{credential.name}</span>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 280px' }}>
        {/* Main panel */}
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
                icon={credential.accessTier === 'ADMIN' ? <ShieldAlert size={11} /> : <Shield size={11} />}
              />
              {user?.role === 'ADMIN' && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={editLoading ? <CircularProgress size={13} color="inherit" /> : <Pencil size={13} />}
                  onClick={handleEditOpen}
                  disabled={editLoading}
                >
                  Edit
                </Button>
              )}
            </div>
          </div>

          <CredentialRevealPanel
            revealed={revealed}
            isPrivileged={isPrivileged}
            isRevealing={revealMutation.isPending}
            isRequesting={requestMutation.isPending}
            accessRequested={accessRequested}
            showRequestButton={showRequestButton}
            error={error}
            onReveal={() => revealMutation.mutate()}
            onRequestAccess={() => requestMutation.mutate()}
            onDismissError={() => setError(null)}
          />
        </div>

        {/* Sidebar */}
        <CredentialDetailSidebar
          type={credential.type}
          accessTier={credential.accessTier}
          approvalPolicy={credential.approvalPolicy}
          createdBy={credential.createdBy}
          createdAt={credential.createdAt}
        />
      </div>

      {editDefaults && (
        <EditCredentialDialog
          open={editOpen}
          isPending={editMutation.isPending}
          defaultValues={editDefaults}
          onClose={() => setEditOpen(false)}
          onSubmit={(values) => editMutation.mutate(values)}
        />
      )}
    </AppLayout>
  )
}