import api from '#/lib/axiosConfig.ts'
import type { ApiRes, AuditLogResponse, PageResponse, ShamirStatusResponse } from '#/commons/types'
import type { UserSummary } from '#/commons/types/userType.ts'

export const adminApi = {
  getUsers: (page = 0, size = 20) =>
    api.get<ApiRes<PageResponse<UserSummary>>>('/admin/users', {
      params: { page, size },
    }),

  deactivateUser: (userId: string) =>
    api.patch<ApiRes<void>>(`/admin/users/${userId}/deactivate`),

  activateUser: (userId: string) =>
    api.patch<ApiRes<void>>(`/admin/users/${userId}/activate`),

  initShamir: () => api.post<ApiRes<void>>('/admin/shamir/init'),

  getShamirStatus: () =>
    api.get<ApiRes<ShamirStatusResponse>>('/admin/shamir/status'),

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
}
