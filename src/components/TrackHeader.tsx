import React from 'react'
import { Track } from '../state/trackState'

interface TrackHeaderProps {
  track: Track
  isSelected: boolean
  canRemove: boolean
  onSelect: () => void
  onMute: (muted: boolean) => void
  onSolo: (solo: boolean) => void
  onLock: (locked: boolean) => void
  onVisibility: (visible: boolean) => void
  onRemove: () => void
  onRename: (name: string) => void
}

const TrackHeader: React.FC<TrackHeaderProps> = ({
  track,
  isSelected,
  canRemove,
  onSelect,
  onMute,
  onSolo,
  onLock,
  onVisibility,
  onRemove,
  onRename
}) => {
  const [isRenaming, setIsRenaming] = React.useState(false)
  const [newName, setNewName] = React.useState(track.name)

  const handleRename = () => {
    if (newName.trim() && newName !== track.name) {
      onRename(newName.trim())
    }
    setIsRenaming(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename()
    } else if (e.key === 'Escape') {
      setNewName(track.name)
      setIsRenaming(false)
    }
  }

  return (
    <div 
      className={`
        flex items-center gap-2 px-3 py-2
        ${isSelected ? 'bg-blue-600/20' : 'bg-gray-800/30'}
        hover:bg-gray-700/30 transition-colors
      `}
      style={{ 
        height: `${track.height}px`,
        borderLeft: `4px solid ${track.color}`
      }}
    >
      {/* Track Selection */}
      <button
        onClick={onSelect}
        className={`
          w-6 h-6 rounded-full border-2 flex items-center justify-center
          ${isSelected 
            ? 'border-blue-400 bg-blue-400/20' 
            : 'border-gray-500 hover:border-gray-400'
          }
        `}
        title={`Select ${track.name}`}
      >
        {isSelected && (
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
        )}
      </button>

      {/* Track Name */}
      <div className="flex-1 min-w-0">
        {isRenaming ? (
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyDown}
            className="w-full bg-gray-700 text-white text-sm px-2 py-1 rounded border border-gray-600 focus:border-blue-400 focus:outline-none"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setIsRenaming(true)}
            className="text-sm font-medium text-white hover:text-blue-300 truncate text-left w-full"
            title={`Rename ${track.name}`}
          >
            {track.name}
          </button>
        )}
      </div>

      {/* Track Controls */}
      <div className="flex items-center gap-1">
        {/* Visibility Toggle */}
        <button
          onClick={() => onVisibility(!track.visible)}
          className={`
            p-1 rounded text-xs
            ${track.visible 
              ? 'text-green-400 hover:text-green-300' 
              : 'text-gray-500 hover:text-gray-400'
            }
          `}
          title={track.visible ? 'Hide track' : 'Show track'}
        >
          {track.visible ? '👁️' : '👁️‍🗨️'}
        </button>

        {/* Lock Toggle */}
        <button
          onClick={() => onLock(!track.locked)}
          className={`
            p-1 rounded text-xs
            ${track.locked 
              ? 'text-yellow-400 hover:text-yellow-300' 
              : 'text-gray-500 hover:text-gray-400'
            }
          `}
          title={track.locked ? 'Unlock track' : 'Lock track'}
        >
          {track.locked ? '🔒' : '🔓'}
        </button>

        {/* Solo Toggle */}
        <button
          onClick={() => onSolo(!track.solo)}
          className={`
            p-1 rounded text-xs
            ${track.solo 
              ? 'text-purple-400 hover:text-purple-300' 
              : 'text-gray-500 hover:text-gray-400'
            }
          `}
          title={track.solo ? 'Unsolo track' : 'Solo track'}
        >
          S
        </button>

        {/* Mute Toggle */}
        <button
          onClick={() => onMute(!track.muted)}
          className={`
            p-1 rounded text-xs
            ${track.muted 
              ? 'text-red-400 hover:text-red-300' 
              : 'text-gray-500 hover:text-gray-400'
            }
          `}
          title={track.muted ? 'Unmute track' : 'Mute track'}
        >
          M
        </button>

        {/* Remove Track */}
        {canRemove && (
          <button
            onClick={onRemove}
            className="p-1 rounded text-xs text-red-400 hover:text-red-300"
            title="Remove track"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

export default TrackHeader
