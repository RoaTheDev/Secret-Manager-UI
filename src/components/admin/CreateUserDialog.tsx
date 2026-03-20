import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material'
import { UserPlus } from 'lucide-react'
import { authApi } from '@/api/authApi'
import type { RegisterRequest } from '#/commons/types/userType'
import type { UserRole } from '#/commons/constant/apiConstant.ts'

const ROLES: UserRole[] = ['ADMIN', 'TEAM_LEAD', 'PROJECT_MANAGER']

const defaultForm: RegisterRequest = {
  name: '',
  email: '',
  password: '',
  role: 'DEVELOPER',
}

export const CreateUserDialog = () => {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<RegisterRequest>(defaultForm)
  const [error, setError] = useState<string | null>(null)

  const createMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      setOpen(false)
      setForm(defaultForm)
      setError(null)
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message ?? 'Failed to create user')
    },
  })

  const handleChange = (field: keyof RegisterRequest, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.password) {
      setError('All fields are required')
      return
    }
    setError(null)
    createMutation.mutate(form)
  }

  const handleClose = () => {
    setOpen(false)
    setForm(defaultForm)
    setError(null)
  }

  return (
    <>
      <Button
        variant="contained"
        startIcon={<UserPlus size={14} />}
        onClick={() => setOpen(true)}
        size="small"
      >
        New User
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent className="flex flex-col gap-4 !pt-4">
          {error && (
            <Alert severity="error" className="mb-2">
              {error}
            </Alert>
          )}
          <TextField
            label="Name"
            size="small"
            fullWidth
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
          <TextField
            label="Email"
            size="small"
            fullWidth
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
          <TextField
            label="Password"
            size="small"
            fullWidth
            type="password"
            value={form.password}
            onChange={(e) => handleChange('password', e.target.value)}
          />
          <FormControl size="small" fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              label="Role"
              value={form.role}
              onChange={(e) => handleChange('role', e.target.value)}
            >
              {ROLES.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={createMutation.isPending}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
