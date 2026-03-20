export interface ApiRes<T> {
  success: boolean
  message: string
  data: T | null
  errors: Record<string, string> | null
}

export interface PageResponse<T> {
  content: T[]
  pagination: Pagination
}

export interface Pagination {
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
}

export interface AuditLogResponse {
  id: string
  actorName: string
  actorEmail: string
  action: string
  targetType: string | null
  targetId: string | null
  metadata: Record<string, unknown> | null
  performedAt: string
}

export interface ShamirStatusResponse {
  initialized: boolean
  totalShares: number
}
export interface DeletionVoteStatus {
  votedCount:  number
  totalAdmins: number
}
