import { useState } from 'react'
import { Tab, Tabs } from '@mui/material'
import { ClipboardList, FolderOpen, Key, ShieldCheck } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { createFileRoute } from '@tanstack/react-router'
import { ShamirTab } from '#/components/admin/ShamirTab.tsx'
import { AuditTab } from '#/components/admin/AuditTab'
import { UsersTab } from '#/components/admin/UserTab.tsx'
import { ProjectsTab } from '#/components/admin/ProjectTab.tsx'

export const Route = createFileRoute('/admin/')({
  component: AdminPage,
})

function AdminPage() {
  const [tab, setTab] = useState(0)

  return (
    <AppLayout>
      <div className="mb-7">
        <h1 className="text-[22px] font-semibold text-ocean-700 m-0 mb-1">
          Admin Panel
        </h1>
        <p className="text-sm text-surface-500 m-0">
          Manage users, projects, Shamir key shares, and audit logs
        </p>
      </div>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} className="mb-6">
        <Tab
          label="Users"
          icon={<ShieldCheck size={14} />}
          iconPosition="start"
        />
        <Tab
          label="Projects"
          icon={<FolderOpen size={14} />}
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
      {tab === 1 && <ProjectsTab />}
      {tab === 2 && <ShamirTab />}
      {tab === 3 && <AuditTab />}
    </AppLayout>
  )
}
