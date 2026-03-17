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

  castVote: (requestId: string, data: CastVoteRequest) =>
    api.post<ApiRes<VoteCastResponse>>(`/approvals/${requestId}/vote`, data),
}
