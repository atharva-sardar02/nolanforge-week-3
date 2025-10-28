import React, { useCallback, useRef } from 'react'
import { formatDuration } from '../utils/fileUtils'
import { TimelineClip } from '../state/editState'
import { useMediaStore } from '../state/mediaStore'

interface TimelineTrackProps {
  clips: TimelineClip[]
  selectedClipId: string | null
  currentTime: number
  trackNumber: number
  onClipSelect: (clipId: string | null) => void
  onClipRemove: (clipId: string) => void
  onSeek: (time: number) => void
  onDrop?: (e: React.DragEvent) => void
  className?: string
}

const TimelineTrack: React.FC<TimelineTrackProps> = ({
  clips,
  selectedClipId,
  currentTime,
  trackNumber,
  onClipSelect,
  onClipRemove,
  onSeek,
  onDrop,
  className = ''
}) => {
  const timelineRef = useRef<HTMLDivElement>(null)
  const { getFileById } = useMediaStore()

  // Calculate total duration of all clips
  const totalDuration = clips.reduce((total, clip) => {
    return total + (clip.trimEnd - clip.trimStart)
  }, 0)

  // Calculate clip positions on timeline
  const getClipPositions = () => {
    let accumulatedTime = 0
    return clips
      .sort((a, b) => a.order - b.order)
      .map(clip => {
        const clipDuration = clip.trimEnd - clip.trimStart
        const start = accumulatedTime
        const end = accumulatedTime + clipDuration
        accumulatedTime += clipDuration
        return { clip, start, end, duration: clipDuration }
      })
  }

  const clipPositions = getClipPositions()

  const getTimeFromPosition = useCallback((clientX: number) => {
    if (!timelineRef.current || totalDuration === 0) return 0
    
    const rect = timelineRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(1, x / rect.width))
    return percentage * totalDuration
  }, [totalDuration])

  const handleTimelineClick = (e: React.MouseEvent) => {
    const time = getTimeFromPosition(e.clientX)
    onSeek(time)
  }

  const handleClipClick = (e: React.MouseEvent, clipId: string) => {
    e.stopPropagation()
    onClipSelect(clipId)
  }

  const handleRemoveClip = (e: React.MouseEvent, clipId: string) => {
    e.stopPropagation()
    onClipRemove(clipId)
  }

  const handleTimelineDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (onDrop) {
      onDrop(e)
    }
  }

  const handleTimelineDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-4 mb-3">
        <div className="px-3 py-1.5 bg-gray-800/50 rounded-lg border border-gray-700/30">
          <span className="text-gray-400 text-sm font-semibold">Track {trackNumber}</span>
        </div>
        {clips.length > 0 && (
          <div className="text-xs text-gray-500 font-mono">
            {clips.length} clip{clips.length !== 1 ? 's' : ''} • {formatDuration(totalDuration)}
          </div>
        )}
      </div>

      <div
        ref={timelineRef}
        className="relative h-24 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl cursor-pointer border-2 border-gray-700/50 hover:border-gray-600/50 transition-all duration-300"
        onClick={handleTimelineClick}
        onDrop={handleTimelineDrop}
        onDragOver={handleTimelineDragOver}
      >
        {clips.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500 text-sm">Drop clips here</p>
          </div>
        ) : (
          <>
            {/* Render clips on timeline */}
            {clipPositions.map(({ clip, start, end }) => {
              const isSelected = clip.id === selectedClipId
              const startPercent = (start / totalDuration) * 100
              const widthPercent = ((end - start) / totalDuration) * 100
              const mediaFile = getFileById(clip.mediaFileId)

              return (
                <div
                  key={clip.id}
                  className={`
                    absolute top-1 bottom-1 rounded-lg border-2 transition-all duration-200 overflow-hidden group
                    ${isSelected 
                      ? 'bg-gradient-to-r from-blue-500/60 via-purple-500/60 to-blue-500/60 border-blue-400 z-10' 
                      : 'bg-gradient-to-r from-gray-600/60 to-gray-700/60 border-gray-500 hover:border-gray-400'
                    }
                  `}
                  style={{
                    left: `${startPercent}%`,
                    width: `${widthPercent}%`
                  }}
                  onClick={(e) => handleClipClick(e, clip.id)}
                >
                  <div className="absolute inset-0 flex items-center justify-between px-3">
                    <span className="text-white text-xs font-bold truncate flex-1">
                      {mediaFile?.name || 'Unknown'}
                    </span>
                    <button
                      onClick={(e) => handleRemoveClip(e, clip.id)}
                      className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity px-1.5 py-0.5 bg-red-500/80 hover:bg-red-500 rounded text-white text-xs"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )
            })}
            
            {/* Playhead */}
            {totalDuration > 0 && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
                style={{ left: `${(currentTime / totalDuration) * 100}%` }}
              >
                <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-red-500 rounded-full shadow-lg"></div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default TimelineTrack

