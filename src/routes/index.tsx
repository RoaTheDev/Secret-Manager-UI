import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { CheckSquare, ChevronRight, Clock, FolderOpen } from 'lucide-react'
import { Chip } from '@mui/material'
import { AppLayout } from '@/components/layout/AppLayout'
import { approvalApi, projectApi } from '@/api'
import { useAuthStore } from '@/store/authStore'
import { formatDistanceToNow } from 'date-fns'
import { SectionCard } from '#/components/admin/SectionCard'
import { StatCard } from '#/components/admin/StateCard.tsx'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const user = useAuthStore((s) => s.user)

  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectApi.getMyProjects(0, 5),
    staleTime: 1000 * 60 * 5
  })

  const { data: approvalsData, isLoading: approvalsLoading } = useQuery({
    queryKey: ['approvals', 'pending'],
    queryFn: () => approvalApi.getPending(0, 5),
    enabled: user?.role !== 'DEVELOPER',
    staleTime: 1000 * 60 * 5
  })

  const projects = projectsData?.data.data?.content ?? []
  const approvals = approvalsData?.data.data?.content ?? []
  const pendingCount = approvalsData?.data.data?.pagination.totalElements ?? 0

  return (
    <AppLayout>
      {/* Page header */}
      <div className="mb-7">
        <h1 className="text-[22px] font-semibold text-ocean-700 m-0 mb-1">
          Welcome back, {user?.name}
        </h1>
        <p className="text-sm text-surface-500 m-0">
          Here is what needs your attention today.
        </p>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-3 gap-3 mb-7">
        <StatCard
          icon={<FolderOpen size={18} className="text-ocean-500" />}
          label="Your Projects"
          value={projectsData?.data.data?.pagination.totalElements ?? 0}
          loading={projectsLoading}
          iconBg="bg-ocean-50"
        />
        <StatCard
          icon={
            <CheckSquare
              size={18}
              className={
                pendingCount > 0 ? 'text-warning-base' : 'text-ocean-500'
              }
            />
          }
          label="Pending Approvals"
          value={pendingCount}
          loading={approvalsLoading}
          iconBg={pendingCount > 0 ? 'bg-warning-light' : 'bg-ocean-50'}
          valueClass={pendingCount > 0 ? 'text-warning-base' : 'text-ocean-700'}
        />
        <StatCard
          icon={<Clock size={18} className="text-ocean-500" />}
          label="Your Role"
          value={user?.role ?? '—'}
          iconBg="bg-ocean-50"
        />
      </div>

      {/* Content row */}
      <div className="grid grid-cols-2 gap-5">
        {/* Recent projects */}
        <SectionCard
          title="Recent Projects"
          linkTo="/projects"
          linkLabel="View all"
          loading={projectsLoading}
          empty={projects.length === 0}
          emptyText="No projects yet"
        >
          {projects.map((project) => (
            <Link
              key={project.id}
              to="/projects/$projectId"
              params={{ projectId: project.id }}
              className="block no-underline"
            >
              <div
                className="flex items-center justify-between px-3 py-2.5 rounded-lg
                              hover:bg-surface-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-ocean-50">
                    <FolderOpen size={14} className="text-ocean-500" />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-surface-700 m-0">
                      {project.name}
                    </p>
                    <p className="text-[11px] text-surface-400 m-0">
                      {project.memberCount} members
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-surface-400">
                    {formatDistanceToNow(new Date(project.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                  <ChevronRight size={14} className="text-surface-300" />
                </div>
              </div>
            </Link>
          ))}
        </SectionCard>

        {/* Pending approvals */}
        {user?.role !== 'DEVELOPER' && (
          <SectionCard
            title="Pending Your Vote"
            linkTo="/approvals"
            linkLabel="View all"
            loading={approvalsLoading}
            empty={approvals.length === 0}
            emptyText="No pending approvals"
          >
            {approvals.map((approval) => (
              <div
                key={approval.id}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg
                           bg-warning-light border border-[#F5E3BB] mb-1.5"
              >
                <div className="flex items-center gap-3">
                  <Clock size={14} className="text-warning-base shrink-0" />
                  <div>
                    <p className="text-[13px] font-medium text-surface-700 m-0">
                      {approval.credentialName}
                    </p>
                    <p className="text-[11px] text-surface-400 m-0">
                      by {approval.requestedBy}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Chip
                    label={`${approval.approveCount}/${approval.quorumRequired}`}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                  <Link
                    to="/approvals"
                    className="text-[12px] text-ocean-500 font-medium no-underline"
                  >
                    Vote
                  </Link>
                </div>
              </div>
            ))}
          </SectionCard>
        )}
      </div>
    </AppLayout>
  )
}
