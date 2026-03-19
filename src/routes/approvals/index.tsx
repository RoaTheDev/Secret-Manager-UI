import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Chip, CircularProgress, LinearProgress } from '@mui/material'
import { CheckCircle, Clock, XCircle } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { approvalApi } from '@/api'
import type { VoteChoice } from '@/commons/constant/apiConstant'
import { formatDistanceToNow } from 'date-fns'
import type { ApprovalRequestSummary } from '#/commons/types/approvalType.ts'

export const Route = createFileRoute('/approvals/')({
  component: RouteComponent,
})

function RouteComponent() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['approvals', 'pending'],
    queryFn: () => approvalApi.getPending(),
    staleTime: 1000 * 30,
  })

  const voteMutation = useMutation({
    mutationFn: ({
      requestId,
      vote,
    }: {
      requestId: string
      vote: VoteChoice
    }) => approvalApi.castVote(requestId, { vote }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['approvals'] }),
  })

  const requests = data?.data.data?.content ?? []
  const total = data?.data.data?.pagination.totalElements ?? 0

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
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center py-16 bg-surface-0 border border-surface-200 rounded-xl text-surface-400">
          <CheckCircle size={36} className="mb-3 opacity-40" />
          <p className="text-sm font-medium text-surface-600 m-0 mb-1">
            All caught up
          </p>
          <p className="text-[13px] m-0">No pending approvals need your vote</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {requests.map((request) => (
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
      )}
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
  const progress = Math.round(
    (request.approveCount / request.quorumRequired) * 100,
  )

  return (
    <div className="bg-surface-0 border border-surface-200 rounded-xl px-6 py-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-warning-light shrink-0 mt-0.5">
            <Clock size={16} className="text-warning-base" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ocean-700 m-0 mb-1">
              {request.credentialName}
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
          label={request.accessTier}
          size="small"
          color={request.accessTier === 'ADMIN' ? 'error' : 'warning'}
        />
      </div>

      {/* Quorum progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[12px] text-surface-500">
            {request.approveCount} of {request.quorumRequired} approvals
            required
          </span>
          {request.rejectCount > 0 && (
            <span className="text-[12px] text-danger-base">
              {request.rejectCount} rejection
              {request.rejectCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <LinearProgress
          variant="determinate"
          value={progress}
          className="[&_.MuiLinearProgress-bar]:!bg-success-base"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="contained"
          size="small"
          startIcon={<CheckCircle size={14} />}
          disabled={loading}
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
          disabled={loading}
          onClick={() => onVote('REJECT')}
        >
          Reject
        </Button>
      </div>
    </div>
  )
}
