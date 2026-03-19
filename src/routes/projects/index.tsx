import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material'
import { FolderOpen, Plus, Users } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { projectApi } from '@/api/projectApi'
import { useAuthStore } from '@/store/authStore'
import { formatDistanceToNow } from 'date-fns'

export const Route = createFileRoute('/projects/')({
  component: RouteComponent,
})
const schema = z.object({
  name: z.string().min(1, 'Project name is required').max(255),
  description: z.string().max(500).optional(),
})
type FormValues = z.infer<typeof schema>

export const ProjectsPage = () => {}

function RouteComponent() {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '' },
  })
  const { data,isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn:  () => projectApi.getMyProjects(),
    staleTime: 1000 * 60 * 5,
  })

  const createMutation = useMutation({
    mutationFn: projectApi.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['projects'] })
      setOpen(false)
      reset()
    },
  })

  const handleClose = () => {
    setOpen(false)
    reset()
  }
  const projects = data?.data.data?.content ?? []

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-[22px] font-semibold text-ocean-700 m-0 mb-1">
            Projects
          </h1>
          <p className="text-sm text-surface-500 m-0">
            {data?.data.data?.pagination.totalElements ?? 0} projects you have
            access to
          </p>
        </div>
        {user?.role === 'ADMIN' && (
          <Button
            variant="contained"
            startIcon={<Plus size={15} />}
            onClick={() => setOpen(true)}
          >
            New Project
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <CircularProgress className="!text-ocean-500" />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-surface-400">
          <FolderOpen size={36} className="mb-3 opacity-40" />
          <p className="text-sm m-0">No projects yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              to="/projects/$projectId"
              params={{ projectId: project.id }}
              className="no-underline"
            >
              <div
                className="bg-surface-0 border border-surface-200 rounded-xl p-5 h-full
                           hover:border-ocean-300 transition-colors cursor-pointer
                           hover:shadow-[0_2px_8px_rgba(42,111,151,0.08)]"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-[10px] bg-ocean-50">
                    <FolderOpen size={18} className="text-ocean-500" />
                  </div>
                  <Chip
                    label={`${project.memberCount} members`}
                    size="small"
                    icon={<Users size={10} />}
                    variant="outlined"
                    className="!border-ocean-100 !text-ocean-400"
                  />
                </div>
                <h3 className="text-sm font-semibold text-ocean-700 m-0 mb-1.5">
                  {project.name}
                </h3>
                {project.description && (
                  <p className="text-[13px] text-surface-500 m-0 mb-3 line-clamp-2">
                    {project.description}
                  </p>
                )}
                <p className="text-[11px] text-surface-400 m-0">
                  {formatDistanceToNow(new Date(project.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form
          onSubmit={handleSubmit((v) => createMutation.mutate(v))}
          noValidate
        >
          <DialogTitle>Create Project</DialogTitle>
          <DialogContent className="flex flex-col gap-4">
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Project Name"
                  fullWidth
                  required
                  autoFocus
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description"
                  fullWidth
                  multiline
                  rows={3}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="inherit" variant="outlined">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                'Create'
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </AppLayout>
  )
}
