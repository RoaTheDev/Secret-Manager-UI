import { formatDistanceToNow } from 'date-fns'
import { POLICY_DESC, TYPE_LABEL } from '#/commons/constant/appConstant'
import type { AccessTier, ApprovalPolicy, CredentialType } from '@/commons/constant/apiConstant'

interface Props {
  type: CredentialType
  accessTier: AccessTier
  approvalPolicy: ApprovalPolicy
  createdBy: string
  createdAt: string
}

export const CredentialDetailSidebar = ({
                                          type, accessTier, approvalPolicy, createdBy, createdAt,
                                        }: Props) => (
  <div className="bg-surface-0 border border-surface-200 rounded-xl p-5">
    <h3 className="text-[11px] font-semibold text-surface-400 uppercase tracking-[0.05em] m-0 mb-4">
      Details
    </h3>
    <dl className="m-0">
      {[
        { label: 'Type', value: TYPE_LABEL[type] },
        { label: 'Access Tier', value: accessTier },
        {
          label: 'Policy',
          value: `${approvalPolicy} — ${POLICY_DESC[approvalPolicy]}`,
        },
        { label: 'Created by', value: createdBy },
        {
          label: 'Created',
          value: formatDistanceToNow(new Date(createdAt), { addSuffix: true }),
        },
      ].map(({ label, value }) => (
        <div
          key={label}
          className="pb-3 mb-3 border-b border-surface-100 last:border-0 last:mb-0 last:pb-0"
        >
          <dt className="text-[11px] text-surface-400 font-medium uppercase tracking-[0.04em] mb-0.5">
            {label}
          </dt>
          <dd className="text-[13px] text-surface-700 m-0">{value}</dd>
        </div>
      ))}
    </dl>
  </div>
)