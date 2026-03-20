import { useState } from 'react'
import {
  Button, CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material'
import { Eye, EyeOff, ShieldAlert } from 'lucide-react'

export interface PasswordConfirmDiaProps {
  open: boolean
  onClose: () => void
  onConfirmed: (password: string) => void
  isPending: boolean
  error?: string | null
}

export const PasswordConfirmDialog = ({
                                        open,
                                        onClose,
                                        onConfirmed,
                                        isPending,
                                        error,
                                      }: PasswordConfirmDiaProps) => {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleClose = () => {
    setPassword('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <div className="flex items-center gap-2">
          <ShieldAlert size={18} className="text-error-base" />
          <span className="text-[15px] font-semibold text-surface-700">
            Confirm Identity
          </span>
        </div>
      </DialogTitle>

      <DialogContent>
        <Typography className="!text-[13px] !text-surface-500 !mb-4">
          Enter your admin password to cast a deletion vote. This cannot be
          undone once all admins have voted.
        </Typography>
        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          size="small"
          fullWidth
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) =>
            e.key === 'Enter' && password && onConfirmed(password)
          }
          error={!!error}
          helperText={error ?? ' '}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setShowPassword((prev) => !prev)}
                  edge="end"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </DialogContent>

      <DialogActions className="!px-6 !pb-4">
        <Button size="small" onClick={handleClose} disabled={isPending}>
          Cancel
        </Button>
        <Button
          size="small"
          variant="contained"
          color="error"
          disabled={!password || isPending}
          onClick={() => onConfirmed(password)}
          startIcon={
            isPending ? <CircularProgress size={12} color="inherit" /> : null
          }
        >
          Confirm Vote
        </Button>
      </DialogActions>
    </Dialog>
  )
}
