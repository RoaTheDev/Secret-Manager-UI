import type { ReactNode } from 'react'
import { CircularProgress } from '@mui/material'

export const StatCard = ({
                           icon,
                           label,
                           value,
                           loading,
                           iconBg,
                           valueClass = 'text-ocean-700',
                         }: {
  icon: ReactNode
  label: string
  value: number | string
  loading?: boolean
  iconBg: string
  valueClass?: string
}) => (
  <div className="bg-surface-0 border border-surface-200 rounded-xl p-5">
  <div
    className={`inline-flex items-center justify-center w-9 h-9 rounded-lg mb-3 ${iconBg}`}
>
{icon}
</div>
<p className="text-[12px] font-medium text-surface-500 m-0 mb-1">{label}</p>
{loading ? (
  <CircularProgress size={18} className="!text-ocean-500" />
) : (
  <p className={`text-[22px] font-semibold m-0 ${valueClass}`}>{value}</p>
)}
</div>
)
