export type UserRole = 'ADMIN' | 'TEAM_LEAD' | 'PROJECT_MANAGER' | 'DEVELOPER'

export type AccessTier = 'PROJECT' | 'ADMIN'

export type ApprovalPolicy = 'RELAXED' | 'STANDARD' | 'STRICT'

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED'

export type VoteChoice = 'APPROVE' | 'REJECT'

export type CredentialType =
  | 'ENV_VAR'
  | 'NGINX_CONFIG'
  | 'DOCKER_CONFIG'
  | 'TERRAFORM'
  | 'CONFIG_FILE'
  | 'SSH_KEY'
  | 'DATABASE_URL'
  | 'TLS_CERT'
  | 'API_KEY'
  | 'OTHER'
