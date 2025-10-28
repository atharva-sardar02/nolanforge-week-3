import React, { useCallback, useRef, useState } from 'react'
import { TimelineClip } from '../state/editState'

interface TrackLaneProps {
  trackId: number
  clips: TimelineClip[]
  selectedClipId: string | null
  pixelsPerSecond: number
  onClipSelect: (clipId: string) => void
  onClipMove: (clipId: string, newStartTime: number) => void
  onClipRemove: (clipId: string) => void
  className?: string
}

const TrackLane: React.FC<TrackLaneProps> = ({
  trackId,
  clips,
  selectedClipId,
  pixelsPerSecond,
  onClipSelect,
  onClipMove,
  onClipRemove,
  className = ''
}) => {
  const laneRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedClipId, setDraggedClipId] = useState<string | null>(null)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartTime, setDragStartTime] = useState(0)

  const timeToPixels = (time: number) => time * pixelsPerSecond
  const pixelsToTime = (pixels: number) => pixels / pixelsPerSecond

  const handleMouseDown = useCallback((e: React.MouseEvent, clip: TimelineClip) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsDragging(true)
    setDraggedClipId(clip.id)
    setDragStartX(e.clientX)
    setDragStartTime(clip.startTime)
    
    onClipSelect(clip.id)
  }, [onClipSelect])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !draggedClipId || !laneRef.current) return
    
    const deltaX = e.clientX - dragStartX
    const deltaTime = pixelsToTime(deltaX)
    const newStartTime = Math.max(0, dragStartTime + deltaTime)
    
    onClipMove(draggedClipId, newStartTime)
  }, [isDragging, draggedClipId, dragStartX, dragStartTime, pixelsToTime, onClipMove])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setDraggedClipId(null)
  }, [])

  const handleDoubleClick = useCallback((clip: TimelineClip) => {
    onClipRemove(clip.id)
  }, [onClipRemove])

  return (
    <div 
      ref={laneRef}
      className={`
        relative h-16 bg-gray-800/30 border border-gray-700/50 rounded-lg
        overflow-hidden cursor-pointer
        ${className}
      `}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Track Label */}
      <div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10">
        <span className="text-xs font-medium text-gray-400">
          Track {trackId}
        </span>
      </div>

      {/* Clips */}
      {clips.map((clip) => {
        const clipX = timeToPixels(clip.startTime)
        const clipWidth = timeToPixels(clip.duration)
        const isSelected = clip.id === selectedClipId
        
        return (
          <div
            key={clip.id}
            className={`
              absolute top-1 bottom-1 rounded-md cursor-move select-none
              transition-all duration-200 hover:scale-105
              ${isSelected 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 border-2 border-blue-400 shadow-lg' 
                : 'bg-gradient-to-r from-gray-600 to-gray-700 border border-gray-500 hover:from-gray-500 hover:to-gray-600'
              }
            `}
            style={{
              left: `${clipX}px`,
              width: `${clipWidth}px`,
              minWidth: '20px'
            }}
            onMouseDown={(e) => handleMouseDown(e, clip)}
            onDoubleClick={() => handleDoubleClick(clip)}
            title={`${clip.id} - ${clip.duration.toFixed(1)}s`}
          >
            {/* Clip Content */}
            <div className="h-full flex items-center justify-center px-2">
              <span className="text-xs font-medium text-white truncate">
                {clip.duration.toFixed(1)}s
              </span>
            </div>

            {/* Resize Handles */}
            {isSelected && (
              <>
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400 cursor-ew-resize hover:bg-blue-300" />
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-400 cursor-ew-resize hover:bg-blue-300" />
              </>
            )}
          </div>
        )
      })}

      {/* Empty State */}
      {clips.length === 0 && (
        <div className="h-full flex items-center justify-center">
          <span className="text-gray-500 text-sm">Empty track</span>
        </div>
      )}
    </div>
  )
}

export default TrackLane
