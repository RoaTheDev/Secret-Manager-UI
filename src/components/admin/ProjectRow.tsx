import { adminApi } from '#/api'
import type { ProjectSummary } from '#/commons/types/projectType'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Button, CircularProgress, TableCell, TableRow } from '@mui/material'
import { CheckCircle, FolderOpen, Trash2 } from 'lucide-react'
import { PasswordConfirmDialog } from '../PasswordConfirmDialog'
import { formatDistanceToNow } from 'date-fns'

export const ProjectRow = ({
  project,
  onDeleted,
}: {
  project: ProjectSummary
  currentUserId: string
  onDeleted: () => void
}) => {
  const { data: voteData, refetch } = useQuery({
    queryKey: ['deletion-vote', project.id],
    queryFn: () => adminApi.getDeletionVoteStatus(project.id),
  })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [voteError, setVoteError] = useState<string | null>(null)

  const voteMutation = useMutation({
    mutationFn: (password: string) =>
      adminApi.voteDeletion(project.id, password),
    onSuccess: async (res) => {
      const status = res.data.data!
      setDialogOpen(false)
      await refetch()
      if (status.votedCount >= status.totalAdmins) onDeleted()
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message
      setVoteError(
        msg === 'Invalid password'
          ? 'Incorrect password.'
          : 'Something went wrong.',
      )
    },
  })

  const handleConfirmed = (password: string) => {
    setVoteError(null)
    voteMutation.mutate(password)
  }

  const status = voteData?.data.data

  const hasVoted = status !== undefined && status!.votedCount > 0
  const allVoted =
    status !== undefined && status!.votedCount >= status!.totalAdmins

  return (
    <>
      <TableRow>
        <TableCell>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-ocean-50">
              <FolderOpen size={14} className="text-ocean-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-surface-700 m-0">
                {project.name}
              </p>
              {project.description && (
                <p className="text-[12px] text-surface-400 m-0 max-w-[300px] truncate">
                  {project.description}
                </p>
              )}
            </div>
          </div>
        </TableCell>
        <TableCell>
          <span className="text-sm text-surface-600">
            {project.memberCount} member{project.memberCount !== 1 ? 's' : ''}
          </span>
        </TableCell>
        <TableCell>
          <span className="text-[13px] text-surface-500">
            {formatDistanceToNow(new Date(project.createdAt), {
              addSuffix: true,
            })}
          </span>
        </TableCell>
        <TableCell align="right">
          <div className="flex items-center justify-end gap-3">
            {hasVoted && !allVoted && (
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {Array.from({ length: status!.totalAdmins }).map((_, i) => (
                    <div
                      key={i}
                      className={[
                        'w-2 h-2 rounded-full',
                        i < status!.votedCount
                          ? 'bg-warning-base'
                          : 'bg-surface-200',
                      ].join(' ')}
                    />
                  ))}
                </div>
                <span className="text-[11px] text-surface-500">
                  {status!.votedCount}/{status!.totalAdmins} voted
                </span>
              </div>
            )}
            {allVoted && (
              <div className="flex items-center gap-1 text-[11px] text-success-base">
                <CheckCircle size={12} />
                Deleted
              </div>
            )}
            {!allVoted && (
              <Button
                size="small"
                color="error"
                variant="outlined"
                startIcon={
                  voteMutation.isPending ? (
                    <CircularProgress size={12} color="inherit" />
                  ) : (
                    <Trash2 size={13} />
                  )
                }
                disabled={voteMutation.isPending}
                onClick={() => setDialogOpen(true)}
              >
                Vote to Delete
              </Button>
            )}{' '}
          </div>
        </TableCell>
      </TableRow>
      <PasswordConfirmDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false)
          setVoteError(null)
        }}
        onConfirmed={handleConfirmed}
        isPending={voteMutation.isPending}
        error={voteError}
      />
    </>
  )
}
