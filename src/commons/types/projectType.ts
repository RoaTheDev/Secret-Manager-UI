import type { UserRole } from '#/commons/constant/apiConstant.ts'

export interface CreateProjectRequest {
  name: string
  description?: string
}

export interface AddMemberRequest {
  userId: string
}
export interface ProjectDeletionVoteSummary {
  projectId: string
  projectName: string
  votedCount: number
  totalAdmins: number
  hasVoted: boolean
}
export interface ProjectSummary {
  id: string
  name: string
  description: string | null
  memberCount: number
  createdAt: string
}

export interface ProjectDetail {
  id: string
  name: string
  description: string | null
  members: MemberSummary[]
  createdAt: string
}

export interface MemberSummary {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface ProjectCreatedResponse {
  id: string
}
