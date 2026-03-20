import api from '#/lib/axiosConfig.ts'
import type { ApiRes, PageResponse } from '#/commons/types'
import type {
  AddMemberRequest,
  CreateProjectRequest,
  ProjectCreatedResponse,
  ProjectDetail,
  ProjectSummary,
} from '#/commons/types/projectType'

export const projectApi = {
  getMyProjects: (page = 0, size = 20) =>
    api.get<ApiRes<PageResponse<ProjectSummary>>>('/projects', {
      params: { page, size, sort: 'createdAt,desc' },
    }),

  getDetail: (projectId: string) =>
    api.get<ApiRes<ProjectDetail>>(`/projects/${projectId}`),

  create: (data: CreateProjectRequest) =>
    api.post<ApiRes<ProjectCreatedResponse>>('/projects', data),

  addMember: (projectId: string, data: AddMemberRequest) =>
    api.post<ApiRes<void>>(`/projects/${projectId}/members`, data),




  removeMember: (projectId: string, userId: string) =>
    api.delete<ApiRes<void>>(`/projects/${projectId}/members/${userId}`),
}
