import {
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
import { CredentialEditor } from '@/components/credential/CredentialEditor'
import {
  ACCESS_TIERS,
  CREDENTIAL_TYPES,
  POLICIES,
  POLICY_DESC,
  TYPE_LABEL,
} from '#/commons/constant/appConstant'
import type { AccessTier, ApprovalPolicy, CredentialType } from '@/commons/constant/apiConstant'

const editSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  type: z.enum([
    'ENV_VAR', 'NGINX_CONFIG', 'DOCKER_CONFIG', 'TERRAFORM', 'CONFIG_FILE',
    'SSH_KEY', 'DATABASE_URL', 'TLS_CERT', 'API_KEY', 'OTHER',
  ]),
  value: z.string().min(1, 'Value is required'),
  accessTier: z.enum(['PROJECT', 'ADMIN']),
  approvalPolicy: z.enum(['RELAXED', 'STANDARD', 'STRICT']),
})

export type EditCredentialForm = z.infer<typeof editSchema>

interface DefaultValues {
  name: string
  type: CredentialType
  value: string
  accessTier: AccessTier
  approvalPolicy: ApprovalPolicy
}

interface Props {
  open: boolean
  isPending: boolean
  defaultValues: DefaultValues
  onClose: () => void
  onSubmit: (values: EditCredentialForm) => void
}

export const EditCredentialDialog = ({
                                       open, isPending, defaultValues, onClose, onSubmit,
                                     }: Props) => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EditCredentialForm>({
    resolver: zodResolver(editSchema) as any,
    values: defaultValues,
  })

  const watchedType = watch('type')

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { style: { alignSelf: 'flex-start', marginTop: '80px' } } }}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogTitle>Edit Credential</DialogTitle>

        <DialogContent className="flex flex-col gap-4">
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Name"
                fullWidth
                required
                autoFocus
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />

          <div className="grid grid-cols-3 gap-3">
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="Type" fullWidth error={!!errors.type}>
                  {CREDENTIAL_TYPES.map((t) => (
                    <MenuItem key={t} value={t}>{TYPE_LABEL[t]}</MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="accessTier"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="Access Tier" fullWidth error={!!errors.accessTier}>
                  {ACCESS_TIERS.map((t) => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="approvalPolicy"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="Approval Policy" fullWidth error={!!errors.approvalPolicy}>
                  {POLICIES.map((p) => (
                    <MenuItem key={p} value={p}>
                      <div>
                        <p className="text-sm m-0">{p}</p>
                        <p className="text-[11px] text-surface-400 m-0">{POLICY_DESC[p]}</p>
                      </div>
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </div>

          <div>
            <p className="text-[13px] font-medium text-surface-600 m-0 mb-1.5">
              Value <span className="text-danger-base ml-0.5">*</span>
            </p>
            <Controller
              name="value"
              control={control}
              render={({ field }) => (
                <CredentialEditor
                  value={field.value}
                  type={watchedType}
                  onChange={field.onChange}
                  error={!!errors.value}
                />
              )}
            />
            {errors.value && (
              <p className="text-[11px] text-danger-base mt-1 mx-3 m-0">
                {errors.value.message}
              </p>
            )}
          </div>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} color="inherit" variant="outlined">Cancel</Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? <CircularProgress size={18} color="inherit" /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}