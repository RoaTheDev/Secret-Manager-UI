import api from '#/lib/axiosConfig.ts'
import type { ApiRes, PageResponse } from '#/commons/types'
import type {
  CreateCredentialRequest, CredentialCreatedResponse,
  CredentialDetail, CredentialRevealResponse,
  CredentialSummary,
} from '#/commons/types/crendentialType.ts'
import type { AccessRequestedResponse } from '#/commons/types/approvalType.ts'

export const credentialApi = {
  listByProject: (projectId: string, page = 0, size = 20) =>
    api.get<ApiRes<PageResponse<CredentialSummary>>>(
      `/credentials/project/${projectId}`,
      { params: { page, size, sort: 'createdAt,desc' } },
    ),

  getDetail: (credentialId: string) =>
    api.get<ApiRes<CredentialDetail>>(`/credentials/${credentialId}`),

  create: (data: CreateCredentialRequest) =>
    api.post<ApiRes<CredentialCreatedResponse>>('/credentials', data),

  delete: (credentialId: string) =>
    api.delete<ApiRes<void>>(`/credentials/${credentialId}`),

  requestAccess: (credentialId: string) =>
    api.post<ApiRes<AccessRequestedResponse>>(
      `/credentials/${credentialId}/request-access`,
    ),

  reveal: (credentialId: string) =>
    api.get<ApiRes<CredentialRevealResponse>>(
      `/credentials/${credentialId}/reveal`,
    ),
}
