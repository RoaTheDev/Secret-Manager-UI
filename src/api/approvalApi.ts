import api from '#/lib/axiosConfig.ts'
import type { ApiRes, PageResponse } from '#/commons/types'
import type { ApprovalRequestSummary, CastVoteRequest, VoteCastResponse } from '#/commons/types/approvalType.ts'

export const approvalApi = {
  getPending: (page = 0, size = 20) =>
    api.get<ApiRes<PageResponse<ApprovalRequestSummary>>>(
      '/approvals/pending',
      {
        params: { page, size, sort: 'createdAt,asc' },
      },
    ),
  requestUserAction: (
    targetUserId: string,
    type: 'USER_DEACTIVATION' | 'USER_ACTIVATION',
  ) =>
    api.post<ApiRes<{ id: string; status: string; quorumRequired: number }>>(
      `/approvals/user-action/${targetUserId}?type=${type}`,
    ),
  castVote: (requestId: string, data: CastVoteRequest) =>
    api.post<ApiRes<VoteCastResponse>>(`/approvals/${requestId}/vote`, data),
}
