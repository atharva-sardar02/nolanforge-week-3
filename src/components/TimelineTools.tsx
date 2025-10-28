import React from 'react'
import SplitButton from './SplitButton'
import DeleteButton from './DeleteButton'

interface TimelineToolsProps {
  onSplit: () => void
  onDelete: () => void
  canSplit: boolean
  canDelete: boolean
  className?: string
}

const TimelineTools: React.FC<TimelineToolsProps> = ({
  onSplit,
  onDelete,
  canSplit,
  canDelete,
  className = ''
}) => {
  return (
    <div className={`
      flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700/30
      backdrop-blur-sm
      ${className}
    `}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-300">Timeline Tools:</span>
      </div>
      
      <div className="flex items-center gap-2">
        <SplitButton
          onSplit={onSplit}
          disabled={!canSplit}
        />
        <DeleteButton
          onDelete={onDelete}
          disabled={!canDelete}
        />
      </div>
      
      <div className="flex-1" />
      
      <div className="text-xs text-gray-500 space-y-1">
        <div>Ctrl+S: Split clip</div>
        <div>Delete: Remove clip</div>
      </div>
    </div>
  )
}

export default TimelineTools
