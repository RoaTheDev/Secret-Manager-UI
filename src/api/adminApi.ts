import api from '#/lib/axiosConfig.ts'
import type {
  ApiRes,
  AuditLogResponse,
  DeletionVoteStatus,
  PageResponse,
  ShamirStatusResponse,
} from '#/commons/types'
import type { UserSummary } from '#/commons/types/userType.ts'
import type { ProjectDeletionVoteSummary, ProjectSummary } from '#/commons/types/projectType.ts'

export const adminApi = {
  getUsers: (page = 0, size = 20) =>
    api.get<ApiRes<PageResponse<UserSummary>>>('/admin/users', {
      params: { page, size },
    }),

  deactivateUser: (id: string) =>
    api.patch<ApiRes<void>>(`/admin/users/${id}/deactivate`),

  activateUser: (id: string) =>
    api.patch<ApiRes<void>>(`/admin/users/${id}/activate`),


  initShamir: () => api.post<ApiRes<void>>('/admin/shamir/init'),
  getOngoingDeletionVotes: () =>
    api.get<ApiRes<ProjectDeletionVoteSummary[]>>('/admin/deletion-votes'),
  getShamirStatus: () =>
    api.get<ApiRes<ShamirStatusResponse>>('/admin/shamir/status'),

  deleteProject: (projectId: string, adminIds: string[]) =>
    api.delete<ApiRes<void>>(`/admin/projects/${projectId}`, {
      data: adminIds,
    }),
  voteDeletion: (projectId: string, password: string) =>
    api.post<ApiRes<DeletionVoteStatus>>(
      `/admin/projects/${projectId}/deletion-vote`,
      { password },
    ),
  getDeletionVoteStatus: (projectId: string) =>
    api.get<ApiRes<DeletionVoteStatus>>(
      `/admin/projects/${projectId}/deletion-vote`,
    ),
  getAuditLogs: (params: {
    page?: number
    size?: number
    actorId?: string
    action?: string
    targetType?: string
  }) =>
    api.get<ApiRes<PageResponse<AuditLogResponse>>>('/admin/audit-logs', {
      params: { size: 50, sort: 'performedAt,desc', ...params },
    }),
  getAllProjects: (page = 0, size = 20) =>
    api.get<ApiRes<PageResponse<ProjectSummary>>>('/admin/projects/all', {
      params: { page, size },
    }),
}
