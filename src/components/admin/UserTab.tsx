import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi, approvalApi } from '#/api'
import type { UserSummary } from '#/commons/types/userType.ts'
import type { AxiosResponse } from 'axios'
import type { ApiRes } from '#/commons/types'
import { AppLoadingComponent } from '#/components/AppLoadingComponent.tsx'
import { CreateUserDialog } from '#/components/admin/CreateUserDialog.tsx'
import {
  Avatar,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material'
import { UserCheck, UserX } from 'lucide-react'

export const UsersTab = () => {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminApi.getUsers(),
    staleTime: 1000 * 60 * 5,
  })
  const deactivateMutation = useMutation({
    mutationFn: (
      user: UserSummary,
    ): Promise<AxiosResponse<ApiRes<unknown>>> => {
      if (user.role === 'DEVELOPER') {
        return adminApi.deactivateUser(user.id)
      }
      return approvalApi.requestUserAction(user.id, 'USER_DEACTIVATION')
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })

  const activateMutation = useMutation({
    mutationFn: (
      user: UserSummary,
    ): Promise<AxiosResponse<ApiRes<unknown>>> => {
      if (user.role === 'DEVELOPER') {
        return adminApi.activateUser(user.id)
      }
      return approvalApi.requestUserAction(user.id, 'USER_ACTIVATION')
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })

  const users: UserSummary[] = data?.data.data?.content ?? []

  if (isLoading) return <AppLoadingComponent />

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-surface-500 m-0">
          {users.length} user{users.length !== 1 ? 's' : ''} total
        </p>
        <CreateUserDialog />
      </div>
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
                  <div className="flex items-center justify-end gap-2">
                    {user.isActive ? (
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        startIcon={<UserX size={13} />}
                        onClick={() => deactivateMutation.mutate(user)}
                        disabled={deactivateMutation.isPending}
                      >
                        {user.role === 'DEVELOPER'
                          ? 'Deactivate'
                          : 'Request Deactivation'}
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        color="success"
                        variant="outlined"
                        startIcon={<UserCheck size={13} />}
                        onClick={() => activateMutation.mutate(user)}
                        disabled={activateMutation.isPending}
                      >
                        {user.role === 'DEVELOPER'
                          ? 'Activate'
                          : 'Request Activation'}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
