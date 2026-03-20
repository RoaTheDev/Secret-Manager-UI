import { Alert, Button, CircularProgress } from '@mui/material'
import { Clock, Eye, Lock } from 'lucide-react'
import { CredentialViewer } from '@/components/credential/CredentialViewer'
import type { CredentialRevealResponse } from '@/commons/types/crendentialType'

interface Props {
  revealed: CredentialRevealResponse | null
  isPrivileged: boolean
  isRevealing: boolean
  isRequesting: boolean
  accessRequested: boolean
  showRequestButton: boolean
  error: string | null
  onReveal: () => void
  onRequestAccess: () => void
  onDismissError: () => void
}

export const CredentialRevealPanel = ({
                                        revealed,
                                        isPrivileged,
                                        isRevealing,
                                        isRequesting,
                                        accessRequested,
                                        showRequestButton,
                                        error,
                                        onReveal,
                                        onRequestAccess,
                                        onDismissError,
                                      }: Props) => (
  <div>
    {error && (
      <Alert severity="warning" onClose={onDismissError} className="mb-4">
        {error}
      </Alert>
    )}

    {revealed ? (
      <CredentialViewer credential={revealed} />
    ) : (
      <div className="flex flex-col items-center border border-dashed border-surface-300 rounded-[10px] p-10 bg-surface-50 gap-3">
        <Lock size={28} className="text-surface-300" />
        <div className="text-center">
          <p className="text-sm font-medium text-surface-600 m-0 mb-1">
            This credential is locked
          </p>
          <p className="text-[13px] text-surface-400 m-0">
            {accessRequested
              ? 'Your request is pending approval'
              : showRequestButton
                ? 'You need approval to access this credential'
                : isPrivileged
                  ? 'Click reveal to view the credential value'
                  : 'Click reveal to attempt access'}
          </p>
        </div>
        <div className="flex gap-2.5 mt-1">
          {showRequestButton && !isPrivileged && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<Clock size={13} />}
              disabled={isRequesting || accessRequested}
              onClick={onRequestAccess}
            >
              {accessRequested ? 'Request Submitted' : 'Request Access'}
            </Button>
          )}
          <Button
            variant="contained"
            size="small"
            startIcon={
              isRevealing ? (
                <CircularProgress size={13} color="inherit" />
              ) : (
                <Eye size={13} />
              )
            }
            disabled={isRevealing}
            onClick={onReveal}
          >
            Reveal
          </Button>
        </div>
      </div>
    )}
  </div>
)