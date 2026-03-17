import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { CircularProgress } from '@mui/material'

export const SectionCard = ({
  title,
  linkTo,
  linkLabel,
  loading,
  empty,
  emptyText,
  children,
}: {
  title: string
  linkTo: string
  linkLabel: string
  loading: boolean
  empty: boolean
  emptyText: string
  children: ReactNode
}) => (
  <div className="bg-surface-0 border border-surface-200 rounded-xl p-5">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-semibold text-ocean-700 m-0">{title}</h2>
      <Link
        to={linkTo}
        className="text-[12px] text-ocean-500 font-medium no-underline"
      >
        {linkLabel}
      </Link>
    </div>
    {loading ? (
      <div className="flex justify-center py-6">
        <CircularProgress size={22} className="!text-ocean-500" />
      </div>
    ) : empty ? (
      <p className="text-[13px] text-surface-400 text-center py-6 m-0">
        {emptyText}
      </p>
    ) : (
      children
    )}
  </div>
)
