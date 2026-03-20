import {
  Avatar,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const memberSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
})

type MemberForm = z.infer<typeof memberSchema>

interface User {
  id: string
  name: string
  email: string
}

interface Props {
  open: boolean
  availableUsers: User[]
  isPending: boolean
  isError: boolean
  onClose: () => void
  onSubmit: (data: MemberForm) => void
}

export const AddMemberDialog = ({
                                  open, availableUsers, isPending, isError, onClose, onSubmit,
                                }: Props) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MemberForm>({
    resolver: zodResolver(memberSchema) as any,
    defaultValues: { userId: '' },
  })

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { style: { alignSelf: 'flex-start', marginTop: '80px' } } }}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogTitle>Add Member</DialogTitle>
        <DialogContent className="flex flex-col gap-4">
          <Controller
            name="userId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="User"
                fullWidth
                required
                autoFocus
                error={!!errors.userId}
                helperText={errors.userId?.message}
              >
                {availableUsers.length === 0 ? (
                  <MenuItem disabled>
                    <span className="text-surface-400 text-sm">No users available to add</span>
                  </MenuItem>
                ) : (
                  availableUsers.map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      <div className="flex items-center gap-3 py-0.5">
                        <Avatar className="!w-7 !h-7 !text-[11px]">
                          {u.name.charAt(0)}
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-surface-700 m-0 leading-tight">
                            {u.name}
                          </p>
                          <p className="text-[11px] text-surface-400 m-0">{u.email}</p>
                        </div>
                      </div>
                    </MenuItem>
                  ))
                )}
              </TextField>
            )}
          />
          {isError && (
            <p className="text-[12px] text-danger-base m-0">
              Failed to add member. Please try again.
            </p>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit" variant="outlined">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? <CircularProgress size={18} color="inherit" /> : 'Add Member'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}