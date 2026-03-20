import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '#/api'
import { Key } from 'lucide-react'
import { Alert, Button, Chip, CircularProgress } from '@mui/material'

export const ShamirTab = () => {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'shamir'],
    queryFn: () => adminApi.getShamirStatus(),
  })

  const initMutation = useMutation({
    mutationFn: adminApi.initShamir,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['admin', 'shamir'] }),
  })

  const status = data?.data.data

  return (
    <div className="bg-surface-0 border border-surface-200 rounded-xl p-6 max-w-[480px]">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center justify-center w-10 h-10 rounded-[10px] bg-ocean-50">
          <Key size={18} className="text-ocean-500" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-ocean-700 m-0">
            Shamir Key Splitting
          </h3>
          <p className="text-[13px] text-surface-500 m-0">
            Master key distribution status
          </p>
        </div>
      </div>

      {isLoading ? (
        <CircularProgress size={22} className="!text-ocean-500" />
      ) : (
        <dl className="m-0 mb-5">
          {[
            {
              label: 'Status',
              value: (
                <Chip
                  label={
                    status?.initialized ? 'Initialized' : 'Not initialized'
                  }
                  size="small"
                  color={status?.initialized ? 'success' : 'default'}
                />
              ),
            },
            {
              label: 'Total shares',
              value: (
                <span className="text-sm font-medium text-surface-700">
                  {status?.totalShares ?? 0}
                </span>
              ),
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between py-2.5 border-b border-surface-100 last:border-0"
            >
              <dt className="text-[13px] text-surface-500">{label}</dt>
              <dd className="m-0">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {!status?.initialized && (
        <>
          <Alert severity="info" className="mb-4 text-[13px]">
            Splits the master key and distributes one encrypted share to each
            admin. This can only be performed once.
          </Alert>
          <Button
            variant="contained"
            disabled={initMutation.isPending}
            onClick={() => initMutation.mutate()}
          >
            {initMutation.isPending ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              'Split and Distribute Key'
            )}
          </Button>
        </>
      )}

      {initMutation.isSuccess && (
        <Alert severity="success" className="mt-4">
          Master key successfully distributed to all admins.
        </Alert>
      )}
    </div>
  )
}
