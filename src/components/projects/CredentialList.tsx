import { Link } from '@tanstack/react-router'
import { Button, Chip, CircularProgress } from '@mui/material'
import { ChevronRight, Lock, Plus, Shield, ShieldAlert } from 'lucide-react'
import type {
  AccessTier,
  ApprovalPolicy,
  CredentialType,
} from '@/commons/constant/apiConstant'
import { TIER_COLOR, TYPE_LABEL } from '#/commons/constant/appConstant.ts'

interface Credential {
  id: string
  name: string
  type: CredentialType
  accessTier: AccessTier
  approvalPolicy: ApprovalPolicy
}

interface Props {
  credentials: Credential[]
  isLoading: boolean
  isAdmin: boolean
  onAdd: () => void
}

export const CredentialList = ({
  credentials,
  isLoading,
  isAdmin,
  onAdd,
}: Props) => {
  if (isLoading)
    return (
      <div className="flex justify-center py-8">
        <CircularProgress size={24} className="!text-ocean-500" />
      </div>
    )

  if (credentials.length === 0)
    return (
      <div className="flex flex-col items-center py-12 text-surface-400">
        <Lock size={32} className="mb-3 opacity-35" />
        <p className="text-sm m-0">No credentials yet</p>
        {isAdmin && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<Plus size={13} />}
            onClick={onAdd}
            className="!mt-4"
          >
            Add the first credential
          </Button>
        )}
      </div>
    )

  return (
    <div className="flex flex-col gap-2">
      {credentials.map((cred) => (
        <Link
          key={cred.id}
          to="/credentials/$credentialId"
          params={{ credentialId: cred.id }}
          className="no-underline"
        >
          <div className="flex items-center justify-between bg-surface-0 border border-surface-200 rounded-[10px] px-5 py-3.5 hover:border-ocean-300 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-surface-100">
                <Lock size={14} className="text-surface-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-surface-700 m-0 mb-0.5">
                  {cred.name}
                </p>
                <p className="text-[11px] text-surface-400 m-0">
                  {TYPE_LABEL[cred.type]}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-[11px] font-medium px-2 py-1 rounded-[5px] ${POLICY_CLASSES[cred.approvalPolicy]}`}
              >
                {cred.approvalPolicy}
              </span>
              <Chip
                label={cred.accessTier}
                size="small"
                color={TIER_COLOR[cred.accessTier]}
                icon={
                  cred.accessTier === 'ADMIN' ? (
                    <ShieldAlert size={11} />
                  ) : (
                    <Shield size={11} />
                  )
                }
              />
              <ChevronRight size={16} className="text-surface-300" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

const POLICY_CLASSES: Record<ApprovalPolicy, string> = {
  RELAXED: 'bg-success-light text-success-dark',
  STANDARD: 'bg-warning-light text-warning-dark',
  STRICT: 'bg-danger-light text-danger-dark',
}
