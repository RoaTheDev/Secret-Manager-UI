import type { AccessTier, ApprovalStatus, VoteChoice } from '#/commons/constant/apiConstant.ts'

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
  credentialId: string | null
  credentialName: string | null
  targetUserId: string | null
  targetUserName: string | null
  requestedBy: string
  accessTier: AccessTier
  status: ApprovalStatus
  type: 'CREDENTIAL_ACCESS' | 'USER_DEACTIVATION' | 'USER_ACTIVATION'
  quorumRequired: number
  approveCount: number
  rejectCount: number
  createdAt: string
  hasVoted: boolean
}
export interface VoteCastResponse {
  requestId: string
  currentStatus: ApprovalStatus
  quorumReached: boolean
}
