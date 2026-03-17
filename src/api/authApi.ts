import type { ApiRes } from '#/commons/types'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from '#/commons/types/userType'
import api from '@/lib/axiosConfig'

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<ApiRes<LoginResponse>>('/auth/login', data),

  register: (data: RegisterRequest) =>
    api.post<ApiRes<void>>('/auth/register', data),

  refresh: () => api.post<ApiRes<LoginResponse>>('/auth/refresh'),

  logout: () => api.post<ApiRes<void>>('/auth/logout'),
}
