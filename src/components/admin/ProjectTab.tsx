import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import { adminApi } from '@/api/adminApi'
import { useAuthStore } from '@/store/authStore'
import { AppLoadingComponent } from '#/components/AppLoadingComponent.tsx'
import { ProjectRow } from '#/components/admin/ProjectRow.tsx'

export const ProjectsTab = () => {
  const queryClient = useQueryClient()
  const currentUser = useAuthStore((s) => s.user)

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['admin', 'projects'],
    queryFn: () => adminApi.getAllProjects(),
    staleTime: 1000 * 60 * 2,
  })

  const projects = projectsData?.data.data?.content ?? []

  if (isLoading) return <AppLoadingComponent />

  return (
    <div className="bg-surface-0 border border-surface-200 rounded-xl overflow-hidden">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Project</TableCell>
            <TableCell>Members</TableCell>
            <TableCell>Created</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {projects.map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              currentUserId={currentUser?.id ?? ''}
              onDeleted={async () => {
                await queryClient.invalidateQueries({
                  queryKey: ['admin', 'projects'],
                })
                await queryClient.invalidateQueries({
                  queryKey: ['projects'],
                })
              }}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
