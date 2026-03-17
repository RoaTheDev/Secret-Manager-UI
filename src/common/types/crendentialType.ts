import type { AccessTier, ApprovalPolicy, CredentialType } from '#/common/constant/apiConstant.ts'

export interface CreateCredentialRequest {
  projectId: string
  name: string
  type: CredentialType
  value: string
  accessTier: AccessTier
  approvalPolicy: ApprovalPolicy
}

export interface CredentialSummary {
  id: string
  name: string
  type: CredentialType
  accessTier: AccessTier
  approvalPolicy: ApprovalPolicy
  createdAt: string
}

export interface CredentialDetail {
  id: string
  name: string
  type: CredentialType
  accessTier: AccessTier
  approvalPolicy: ApprovalPolicy
  createdBy: string
  createdAt: string
}

export interface CredentialRevealResponse {
  id: string
  name: string
  type: CredentialType
  value: string
  expiresAt: string | null
}

export interface CredentialCreatedResponse {
  id: string
}
