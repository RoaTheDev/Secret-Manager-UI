import type { AccessTier, ApprovalStatus, VoteChoice } from '#/common/constant/apiConstant.ts'

export interface CastVoteRequest {
  vote: VoteChoice
}

export interface AccessRequestedResponse {
  requestId: string
  status: ApprovalStatus
  quorumRequired: number
}

export interface ApprovalRequestSummary {
  id: string
  credentialId: string
  credentialName: string
  requestedBy: string
  accessTier: AccessTier
  status: ApprovalStatus
  quorumRequired: number
  approveCount: number
  rejectCount: number
  createdAt: string
}

export interface VoteCastResponse {
  requestId: string
  currentStatus: ApprovalStatus
  quorumReached: boolean
}
