import type { AccessTier, ApprovalPolicy, CredentialType } from '#/commons/constant/apiConstant.ts'

export const TYPE_LABEL: Record<CredentialType, string> = {
  ENV_VAR: 'Environment Variables (.env)',
  NGINX_CONFIG: 'Nginx Configuration',
  DOCKER_CONFIG: 'Docker Compose',
  TERRAFORM: 'Terraform Variables',
  CONFIG_FILE: 'Configuration File',
  SSH_KEY: 'SSH Key',
  DATABASE_URL: 'Database URL',
  TLS_CERT: 'TLS Certificate',
  API_KEY: 'API Key',
  OTHER: 'Other',
}

export const POLICY_DESC: Record<ApprovalPolicy, string> = {
  RELAXED: 'Any 1 approver',
  STANDARD: 'Any 2 approvers',
  STRICT: 'Team Lead + PM + 1 Admin',
}

export const TIER_COLOR: Record<AccessTier, 'error' | 'warning'> = {
  ADMIN: 'error',
  PROJECT: 'warning',
}

export const CREDENTIAL_TYPES: CredentialType[] = [
  'ENV_VAR',
  'NGINX_CONFIG',
  'DOCKER_CONFIG',
  'TERRAFORM',
  'CONFIG_FILE',
  'SSH_KEY',
  'DATABASE_URL',
  'TLS_CERT',
  'API_KEY',
  'OTHER',
]

export const ACCESS_TIERS: AccessTier[] = ['PROJECT', 'ADMIN']
export const POLICIES: ApprovalPolicy[] = ['RELAXED', 'STANDARD', 'STRICT']