import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Button,
  Chip,
  CircularProgress, Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  TextField,
} from '@mui/material'
import { CheckCircle, Clock, UserCheck, UserX, XCircle } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { adminApi, approvalApi } from '@/api'
import type { VoteChoice } from '@/commons/constant/apiConstant'
import { formatDistanceToNow } from 'date-fns'
import type { ApprovalRequestSummary } from '#/commons/types/approvalType.ts'
import { useAuthStore } from '#/store/authStore'
import { useState } from 'react'

export const Route = createFileRoute('/approvals/')({
  component: RouteComponent,
})

function RouteComponent() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  const { data, isLoading } = useQuery({
    queryKey: ['approvals', 'pending'],
    queryFn: () => approvalApi.getPending(),
    staleTime: 1000 * 30,
  })

  const { data: deletionVotesData } = useQuery({
    queryKey: ['admin', 'deletion-votes'],
    queryFn: () => adminApi.getOngoingDeletionVotes(),
    enabled: user?.role === 'ADMIN',
    staleTime: 1000 * 30,
  })

  const voteMutation = useMutation({
    mutationFn: ({ requestId, vote }: { requestId: string; vote: VoteChoice }) =>
      approvalApi.castVote(requestId, { vote }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['approvals'] }),
  })

  const deletionVoteMutation = useMutation({
    mutationFn: ({ projectId, password }: { projectId: string; password: string }) =>
      adminApi.voteDeletion(projectId, password),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'deletion-votes'] })
      await queryClient.invalidateQueries({ queryKey: ['admin', 'projects'] })
      await queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })

  const requests = data?.data.data?.content ?? []
  const deletionVotes = deletionVotesData?.data.data ?? []
  const total = (data?.data.data?.pagination.totalElements ?? 0) + deletionVotes.length

  const credentialRequests = requests.filter((r) => r.type === 'CREDENTIAL_ACCESS')
  const userActionRequests = requests.filter(
    (r) => r.type === 'USER_DEACTIVATION' || r.type === 'USER_ACTIVATION',
  )

  const [passwordDialogProjectId, setPasswordDialogProjectId] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const handleDeletionVote = (projectId: string) => {
    setPasswordDialogProjectId(projectId)
    setPassword('')
    setPasswordError(null)
  }

  const handleDeletionVoteConfirm = () => {
    if (!passwordDialogProjectId) return
    deletionVoteMutation.mutate(
      { projectId: passwordDialogProjectId, password },
      {
        onSuccess: () => {
          setPasswordDialogProjectId(null)
          setPassword('')
        },
        onError: (err: any) => {
          setPasswordError(
            err?.response?.data?.message === 'Invalid password'
              ? 'Incorrect password'
              : 'Something went wrong',
          )
        },
      },
    )
  }

  return (
    <AppLayout>
      <div className="mb-7">
        <h1 className="text-[22px] font-semibold text-ocean-700 m-0 mb-1">
          Pending Approvals
        </h1>
        <p className="text-sm text-surface-500 m-0">
          {total} request{total !== 1 ? 's' : ''} waiting for your vote
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <CircularProgress className="!text-ocean-500" />
        </div>
      ) : total === 0 ? (
        <div className="flex flex-col items-center py-16 bg-surface-0 border border-surface-200 rounded-xl text-surface-400">
          <CheckCircle size={36} className="mb-3 opacity-40" />
          <p className="text-sm font-medium text-surface-600 m-0 mb-1">All caught up</p>
          <p className="text-[13px] m-0">No pending approvals need your vote</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {userActionRequests.length > 0 && (
            <section>
              <h2 className="text-[13px] font-semibold text-surface-500 uppercase tracking-wide mb-3 m-0">
                User Actions
              </h2>
              <div className="flex flex-col gap-2.5">
                {userActionRequests.map((request) => (
                  <ApprovalCard
                    key={request.id}
                    request={request}
                    onVote={(vote) =>
                      voteMutation.mutate({ requestId: request.id, vote })
                    }
                    loading={voteMutation.isPending}
                  />
                ))}
              </div>
            </section>
          )}

          {deletionVotes.length > 0 && (
            <section>
              <h2 className="text-[13px] font-semibold text-surface-500 uppercase tracking-wide mb-3 m-0">
                Project Deletions
              </h2>
              <div className="flex flex-col gap-2.5">
                {deletionVotes.map((vote) => (
                  <DeletionVoteCard
                    key={vote.projectId}
                    vote={vote}
                    onVote={() => handleDeletionVote(vote.projectId)}
                    loading={deletionVoteMutation.isPending}
                  />
                ))}
              </div>
            </section>
          )}

          {credentialRequests.length > 0 && (
            <section>
              <h2 className="text-[13px] font-semibold text-surface-500 uppercase tracking-wide mb-3 m-0">
                Credential Access
              </h2>
              <div className="flex flex-col gap-2.5">
                {credentialRequests.map((request) => (
                  <ApprovalCard
                    key={request.id}
                    request={request}
                    onVote={(vote) =>
                      voteMutation.mutate({ requestId: request.id, vote })
                    }
                    loading={voteMutation.isPending}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <Dialog
        open={!!passwordDialogProjectId}
        onClose={() => setPasswordDialogProjectId(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Vote</DialogTitle>
        <DialogContent className="flex flex-col gap-3 !pt-4">
          <p className="text-sm text-surface-600 m-0">
            Enter your password to cast your deletion vote.
          </p>
          {passwordError && (
            <p className="text-sm text-red-500 m-0">{passwordError}</p>
          )}
          <TextField
            label="Password"
            type="password"
            size="small"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleDeletionVoteConfirm()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogProjectId(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDeletionVoteConfirm}
            disabled={!password || deletionVoteMutation.isPending}
          >
            Vote to Delete
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  )
}
const ApprovalCard = ({
                        request,
                        onVote,
                        loading,
                      }: {
  request: ApprovalRequestSummary
  onVote: (vote: VoteChoice) => void
  loading: boolean
}) => {
  const isUserAction =
    request.type === 'USER_DEACTIVATION' || request.type === 'USER_ACTIVATION'
  const isDeactivation = request.type === 'USER_DEACTIVATION'

  const progress = Math.round(
    (request.approveCount / request.quorumRequired) * 100,
  )

  return (
    <div className="bg-surface-0 border border-surface-200 rounded-xl px-6 py-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div
            className={[
              'flex items-center justify-center w-9 h-9 rounded-lg shrink-0 mt-0.5',
              isUserAction
                ? isDeactivation
                  ? 'bg-red-50'
                  : 'bg-green-50'
                : 'bg-warning-light',
            ].join(' ')}
          >
            {isUserAction ? (
              isDeactivation ? (
                <UserX size={16} className="text-red-500" />
              ) : (
                <UserCheck size={16} className="text-green-600" />
              )
            ) : (
              <Clock size={16} className="text-warning-base" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-ocean-700 m-0 mb-1">
              {isUserAction
                ? `${isDeactivation ? 'Deactivate' : 'Activate'} ${request.targetUserName}`
                : request.credentialName}
            </p>
            <p className="text-[12px] text-surface-500 m-0">
              Requested by{' '}
              <strong className="text-surface-700 font-medium">
                {request.requestedBy}
              </strong>
              {' · '}
              {formatDistanceToNow(new Date(request.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>

        <Chip
          label={
            isUserAction
              ? isDeactivation
                ? 'Deactivation'
                : 'Activation'
              : request.accessTier
          }
          size="small"
          color={
            isDeactivation
              ? 'error'
              : request.type === 'USER_ACTIVATION'
                ? 'success'
                : request.accessTier === 'ADMIN'
                  ? 'error'
                  : 'warning'
          }
        />
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[12px] text-surface-500">
            {request.approveCount} of {request.quorumRequired} approvals
            required
          </span>
          {request.rejectCount > 0 && (
            <span className="text-[12px] text-red-500">
              {request.rejectCount} rejection
              {request.rejectCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <LinearProgress
          variant="determinate"
          value={Math.min(progress, 100)}
          className="[&_.MuiLinearProgress-bar]:!bg-success-base"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="contained"
          size="small"
          startIcon={<CheckCircle size={14} />}
          disabled={loading || request.hasVoted}
          onClick={() => onVote('APPROVE')}
          className="!bg-success-base hover:!bg-success-dark"
        >
          Approve
        </Button>
        <Button
          variant="outlined"
          size="small"
          color="error"
          startIcon={<XCircle size={14} />}
          disabled={loading || request.hasVoted}
          onClick={() => onVote('REJECT')}
        >
          Reject
        </Button>
        {request.hasVoted && (
          <span className="text-[11px] text-surface-400 ml-1">
            You have already voted
          </span>
        )}
      </div>
    </div>
  )
}
import { Trash2 } from 'lucide-react'
import type { ProjectDeletionVoteSummary } from '#/commons/types/projectType'

const DeletionVoteCard = ({
                            vote,
                            onVote,
                            loading,
                          }: {
  vote: ProjectDeletionVoteSummary
  onVote: () => void
  loading: boolean
}) => {
  const progress = Math.round((vote.votedCount / vote.totalAdmins) * 100)

  return (
    <div className="bg-surface-0 border border-surface-200 rounded-xl px-6 py-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-50 shrink-0 mt-0.5">
            <Trash2 size={16} className="text-red-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ocean-700 m-0 mb-1">
              Delete {vote.projectName}
            </p>
            <p className="text-[12px] text-surface-500 m-0">
              Project deletion requires all admin votes
            </p>
          </div>
        </div>
        <Chip label="Deletion" size="small" color="error" />
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[12px] text-surface-500">
            {vote.votedCount} of {vote.totalAdmins} admins voted
          </span>
        </div>
        <LinearProgress
          variant="determinate"
          value={Math.min(progress, 100)}
          className="[&_.MuiLinearProgress-bar]:!bg-red-500"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outlined"
          size="small"
          color="error"
          startIcon={<Trash2 size={14} />}
          disabled={loading || vote.hasVoted}
          onClick={onVote}
        >
          Vote to Delete
        </Button>
        {vote.hasVoted && (
          <span className="text-[11px] text-surface-400 ml-1">
            You have already voted
          </span>
        )}
      </div>
    </div>
  )
}