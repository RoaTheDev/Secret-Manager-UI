import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Alert,
  Avatar,
  Button,
  Chip,
  CircularProgress,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
} from '@mui/material'
import { ClipboardList, Key, ShieldCheck, UserCheck, UserX } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { adminApi } from '@/api'
import type { UserSummary } from '@/commons/types/userType'
import { formatDistanceToNow } from 'date-fns'

export const Route = createFileRoute('/admin/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [tab, setTab] = useState(0)

  return (
    <AppLayout>
      <div className="mb-7">
        <h1 className="text-[22px] font-semibold text-ocean-700 m-0 mb-1">
          Admin Panel
        </h1>
        <p className="text-sm text-surface-500 m-0">
          Manage users, Shamir key shares, and audit logs
        </p>
      </div>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} className="mb-6">
        <Tab
          label="Users"
          icon={<ShieldCheck size={14} />}
          iconPosition="start"
        />
        <Tab label="Shamir Key" icon={<Key size={14} />} iconPosition="start" />
        <Tab
          label="Audit Logs"
          icon={<ClipboardList size={14} />}
          iconPosition="start"
        />
      </Tabs>

      {tab === 0 && <UsersTab />}
      {tab === 1 && <ShamirTab />}
      {tab === 2 && <AuditTab />}
    </AppLayout>
  )
}

const UsersTab = () => {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminApi.getUsers(),
    staleTime: 1000 * 60 * 10
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => adminApi.deactivateUser(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })

  const activateMutation = useMutation({
    mutationFn: (id: string) => adminApi.activateUser(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })

  const users: UserSummary[] = data?.data.data?.content ?? []

  if (isLoading)
    return (
      <div className="flex justify-center py-8">
        <CircularProgress className="!text-ocean-500" />
      </div>
    )

  return (
    <div className="bg-surface-0 border border-surface-200 rounded-xl overflow-hidden">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="!w-8 !h-8 !text-[12px]">
                    {user.name.charAt(0)}
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-surface-700 m-0">
                      {user.name}
                    </p>
                    <p className="text-[12px] text-surface-400 m-0">
                      {user.email}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Chip
                  label={user.role}
                  size="small"
                  variant="outlined"
                  className="!border-ocean-100 !text-ocean-500"
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={user.isActive ? 'Active' : 'Inactive'}
                  size="small"
                  color={user.isActive ? 'success' : 'default'}
                />
              </TableCell>
              <TableCell align="right">
                {user.isActive ? (
                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    startIcon={<UserX size={13} />}
                    onClick={() => deactivateMutation.mutate(user.id)}
                    disabled={deactivateMutation.isPending}
                  >
                    Deactivate
                  </Button>
                ) : (
                  <Button
                    size="small"
                    color="success"
                    variant="outlined"
                    startIcon={<UserCheck size={13} />}
                    onClick={() => activateMutation.mutate(user.id)}
                    disabled={activateMutation.isPending}
                  >
                    Activate
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}


const ShamirTab = () => {
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

const AuditTab = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'audit'],
    queryFn: () => adminApi.getAuditLogs({}),
  })

  const logs = data?.data.data?.content ?? []

  if (isLoading)
    return (
      <div className="flex justify-center py-8">
        <CircularProgress className="!text-ocean-500" />
      </div>
    )

  return (
    <div className="bg-surface-0 border border-surface-200 rounded-xl overflow-hidden">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Actor</TableCell>
            <TableCell>Action</TableCell>
            <TableCell>Target</TableCell>
            <TableCell>When</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                <p className="text-[13px] font-medium text-surface-700 m-0 mb-0.5">
                  {log.actorName}
                </p>
                <p className="text-[11px] text-surface-400 m-0">
                  {log.actorEmail}
                </p>
              </TableCell>
              <TableCell>
                <Chip
                  label={log.action}
                  size="small"
                  variant="outlined"
                  color={
                    log.action === 'CREDENTIAL_ACCESSED' ? 'warning' : 'default'
                  }
                />
              </TableCell>
              <TableCell>
                <span className="text-[13px] text-surface-500">
                  {log.targetType ?? '—'}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-[13px] text-surface-500">
                  {formatDistanceToNow(new Date(log.performedAt), {
                    addSuffix: true,
                  })}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
