import type { UserRole } from '#/commons/constant/apiConstant.ts'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  role: UserRole
}

export interface LoginResponse {
  accessToken: string
  user: UserSummary
}

export interface UserSummary {
  id: string
  name: string
  email: string
  role: UserRole
  isActive: boolean
}
