import { Avatar, Button, Chip, CircularProgress } from '@mui/material'
import { Trash2 } from 'lucide-react'

interface Member {
  id: string
  name: string
  email: string
  role: string
}

interface Props {
  members: Member[]
  currentUserId: string
  canManage: boolean
  isRemoving: boolean
  onRemove: (userId: string) => void
}

export const MemberList = ({ members, currentUserId, canManage, isRemoving, onRemove }: Props) => (
  <div className="flex flex-col gap-2">
    {members.map((member) => (
      <div
        key={member.id}
        className="flex items-center gap-4 bg-surface-0 border border-surface-200 rounded-[10px] px-5 py-3.5"
      >
        <Avatar className="!w-9 !h-9 !text-[13px]">
          {member.name.charAt(0)}
        </Avatar>
        <div className="flex-1">
          <p className="text-sm font-medium text-surface-700 m-0 mb-0.5">
            {member.name}
          </p>
          <p className="text-[12px] text-surface-400 m-0">{member.email}</p>
        </div>
        <Chip
          label={member.role}
          size="small"
          variant="outlined"
          className="!border-ocean-100 !text-ocean-400"
        />
        {canManage && member.id !== currentUserId && (
          <Button
            size="small"
            color="error"
            variant="outlined"
            disabled={isRemoving}
            onClick={() => onRemove(member.id)}
            className="!min-w-0 !px-2"
          >
            {isRemoving ? (
              <CircularProgress size={14} color="inherit" />
            ) : (
              <Trash2 size={14} />
            )}
          </Button>
        )}
      </div>
    ))}
  </div>
)