import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Alert,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { Lock } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/api/authApi'
import { useAuthStore } from '@/store/authStore'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})
type LoginForm = z.infer<typeof loginSchema>

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

export function LoginPage() {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [showPassword, setShowPassword] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (res) => {
      const { accessToken, expiresAt, user } = res.data.data!
      setAuth(accessToken, expiresAt, user)
      router.navigate({ to: '/' })
    },
  })

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface-100">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-[52px] h-[52px]
                          rounded-[14px] bg-ocean-500 mb-4"
          >
            <Lock size={24} color="#FFFFFF" />
          </div>
          <h1 className="text-[22px] font-semibold text-ocean-700 m-0 mb-1.5">
            Secrets Manager
          </h1>
          <p className="text-sm text-surface-500 m-0">
            Sign in to access your team's credentials
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface-0 rounded-xl border border-surface-200 p-8">
          {loginMutation.isError && (
            <Alert severity="error" className="mb-5">
              Invalid email or password
            </Alert>
          )}

          <form
            onSubmit={handleSubmit((v) => loginMutation.mutate(v))}
            noValidate
            className="flex flex-col gap-4"
          >
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  type="email"
                  fullWidth
                  autoComplete="email"
                  autoFocus
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  autoComplete="current-password"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword((p) => !p)}
                            edge="end"
                            size="small"
                            aria-label={
                              showPassword ? 'Hide password' : 'Show password'
                            }
                          >
                            {showPassword ? (
                              <VisibilityOff fontSize="small" />
                            ) : (
                              <Visibility fontSize="small" />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              )}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loginMutation.isPending}
              className="mt-1"
            >
              {loginMutation.isPending ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
