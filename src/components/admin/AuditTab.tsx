import { adminApi } from '#/api'
import {
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { AppLoadingComponent } from '../AppLoadingComponent.tsx'
import { formatDistanceToNow } from 'date-fns'

export const AuditTab = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'audit'],
    queryFn: () => adminApi.getAuditLogs({}),
  })

  const logs = data?.data.data?.content ?? []

  if (isLoading) return <AppLoadingComponent />

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
