import React, { useRef, useState, useCallback, useEffect } from 'react'
import { TimelineClip } from '../state/editState'
import { useMediaStore } from '../state/mediaStore'
import { formatDuration } from '../utils/fileUtils'

interface ProfessionalTimelineProps {
  tracks: number[]
  clips: TimelineClip[]
  selectedClipId: string | null
  currentTime: number
  zoomLevel: number
  scrollPosition: number
  snapToGrid: boolean
  gridSize: number
  totalDuration: number
  onClipSelect: (clipId: string | null) => void
  onClipMove: (clipId: string, trackId: number, startTime: number) => void
  onClipRemove: (clipId: string) => void
  onClipResize: (clipId: string, newStartTime: number, newDuration: number) => void
  onSeek: (time: number) => void
  onDrop: (e: React.DragEvent, trackId: number, time: number) => void
  onZoomChange: (delta: number) => void
  onScrollChange: (position: number) => void
}

const TRACK_HEIGHT = 100
const RULER_HEIGHT = 40
const HANDLE_WIDTH = 8

const ProfessionalTimeline: React.FC<ProfessionalTimelineProps> = ({
  tracks,
  clips,
  selectedClipId,
  currentTime,
  zoomLevel,
  scrollPosition,
  snapToGrid,
  gridSize,
  totalDuration,
  onClipSelect,
  onClipMove,
  onClipRemove,
  onClipResize,
  onSeek,
  onDrop,
  onZoomChange,
  onScrollChange
}) => {
  const timelineRef = useRef<HTMLDivElement>(null)
  const { getFileById } = useMediaStore()
  
  const [isDragging, setIsDragging] = useState(false)
  const [dragMode, setDragMode] = useState<'move' | 'trim-start' | 'trim-end' | null>(null)
  const [draggedClipId, setDraggedClipId] = useState<string | null>(null)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartTime, setDragStartTime] = useState(0)
  const [dragStartDuration, setDragStartDuration] = useState(0)

  const timelineWidth = Math.max((totalDuration + 10) * zoomLevel, 2000)

  const timeToPixels = useCallback((time: number) => time * zoomLevel, [zoomLevel])
  
  const pixelsToTime = useCallback((pixels: number) => {
    const time = pixels / zoomLevel
    if (snapToGrid) {
      return Math.round(time / gridSize) * gridSize
    }
    return time
  }, [zoomLevel, snapToGrid, gridSize])

  const getTrackFromY = (y: number) => {
    const trackIndex = Math.floor((y - RULER_HEIGHT) / TRACK_HEIGHT)
    return Math.max(0, Math.min(tracks.length - 1, trackIndex))
  }

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (isDragging) return
    
    const rect = timelineRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const x = e.clientX - rect.left + scrollPosition
    const time = pixelsToTime(x)
    onSeek(time)
  }

  const handleClipMouseDown = (e: React.MouseEvent, clip: TimelineClip, mode: 'move' | 'trim-start' | 'trim-end') => {
    e.stopPropagation()
    setIsDragging(true)
    setDragMode(mode)
    setDraggedClipId(clip.id)
    setDragStartX(e.clientX)
    setDragStartTime(clip.startTime)
    setDragStartDuration(clip.duration)
    onClipSelect(clip.id)
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !draggedClipId || !timelineRef.current) return

    const clip = clips.find(c => c.id === draggedClipId)
    if (!clip) return

    const rect = timelineRef.current.getBoundingClientRect()
    const deltaX = e.clientX - dragStartX
    const deltaTime = pixelsToTime(deltaX)

    if (dragMode === 'move') {
      const y = e.clientY - rect.top
      const newTrack = getTrackFromY(y)
      const newTime = Math.max(0, dragStartTime + deltaTime)
      onClipMove(draggedClipId, newTrack, newTime)
    } else if (dragMode === 'trim-start') {
      const newStartTime = Math.max(0, Math.min(dragStartTime + deltaTime, clip.startTime + clip.duration - 0.1))
      const newDuration = dragStartDuration - (newStartTime - dragStartTime)
      if (newDuration > 0.1) {
        onClipResize(draggedClipId, newStartTime, newDuration)
      }
    } else if (dragMode === 'trim-end') {
      const newDuration = Math.max(0.1, dragStartDuration + deltaTime)
      onClipResize(draggedClipId, clip.startTime, newDuration)
    }
  }, [isDragging, draggedClipId, dragStartX, dragStartTime, dragStartDuration, dragMode, clips, pixelsToTime, getTrackFromY, onClipMove, onClipResize])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setDraggedClipId(null)
    setDragMode(null)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const handleTimelineDrop = (e: React.DragEvent, trackId: number) => {
    e.preventDefault()
    const rect = timelineRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const x = e.clientX - rect.left + scrollPosition
    const time = pixelsToTime(x)
    
    onDrop(e, trackId, time)
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft
    onScrollChange(scrollLeft)
  }

  const renderRuler = () => {
    const intervals = []
    const step = gridSize
    const maxTime = totalDuration + 10
    
    for (let time = 0; time <= maxTime; time += step) {
      const x = timeToPixels(time)
      const isMajor = time % (step * 5) === 0
      
      intervals.push(
        <div
          key={time}
          className="absolute top-0 bottom-0"
          style={{ left: `${x}px` }}
        >
          <div className={`${isMajor ? 'h-full bg-gray-600' : 'h-1/2 bg-gray-700'} w-px`}></div>
          {isMajor && (
            <div className="absolute top-1 left-1 text-xs text-gray-300 font-mono font-semibold">
              {formatDuration(time)}
            </div>
          )}
        </div>
      )
    }
    
    return intervals
  }

  const renderClip = (clip: TimelineClip) => {
    const mediaFile = getFileById(clip.mediaFileId)
    const isSelected = clip.id === selectedClipId
    const x = timeToPixels(clip.startTime)
    const width = timeToPixels(clip.duration)
    
    return (
      <div
        key={clip.id}
        className={`
          absolute rounded-lg select-none overflow-hidden group
          transition-shadow duration-150
          ${isSelected 
            ? 'ring-4 ring-blue-400 shadow-2xl z-30' 
            : 'ring-2 ring-gray-500 hover:ring-gray-400 z-20'
          }
        `}
        style={{
          left: `${x}px`,
          width: `${width}px`,
          top: '8px',
          height: `${TRACK_HEIGHT - 16}px`,
          background: isSelected 
            ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
            : 'linear-gradient(135deg, #4b5563 0%, #374151 100%)',
          cursor: isDragging && dragMode === 'move' ? 'grabbing' : 'grab'
        }}
        onMouseDown={(e) => handleClipMouseDown(e, clip, 'move')}
        onClick={(e) => {
          e.stopPropagation()
          onClipSelect(clip.id)
        }}
      >
        {/* Clip content */}
        <div className="absolute inset-0 flex flex-col justify-center px-4">
          <div className="text-white text-sm font-bold truncate drop-shadow-lg">
            {mediaFile?.name || 'Unknown'}
          </div>
          <div className="text-white/90 text-xs font-mono mt-1 drop-shadow">
            {formatDuration(clip.duration)}
          </div>
        </div>
        
        {/* Trim indicators - always visible for selected clip */}
        {isSelected && (
          <>
            {/* Start trim handle */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-green-400 cursor-ew-resize hover:bg-green-300 transition-colors z-40 flex items-center justify-center"
              style={{ width: `${HANDLE_WIDTH}px` }}
              onMouseDown={(e) => handleClipMouseDown(e, clip, 'trim-start')}
            >
              <div className="text-white text-xs font-bold">▶</div>
            </div>
            
            {/* End trim handle */}
            <div
              className="absolute right-0 top-0 bottom-0 bg-red-400 cursor-ew-resize hover:bg-red-300 transition-colors z-40 flex items-center justify-center"
              style={{ width: `${HANDLE_WIDTH}px` }}
              onMouseDown={(e) => handleClipMouseDown(e, clip, 'trim-end')}
            >
              <div className="text-white text-xs font-bold">◀</div>
            </div>
          </>
        )}
        
        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClipRemove(clip.id)
          }}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 px-2 py-1 bg-red-500/90 hover:bg-red-500 rounded text-white text-xs font-bold transition-opacity shadow-lg z-50"
        >
          ✕
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div 
        ref={timelineRef}
        className="flex-1 overflow-auto relative"
        onClick={handleTimelineClick}
        onScroll={handleScroll}
      >
        <div 
          className="relative"
          style={{ 
            width: `${timelineWidth}px`,
            height: `${RULER_HEIGHT + tracks.length * TRACK_HEIGHT}px`
          }}
        >
          {/* Time ruler */}
          <div 
            className="sticky top-0 z-30 bg-gray-800 border-b-2 border-gray-700"
            style={{ height: `${RULER_HEIGHT}px` }}
          >
            <div className="relative h-full">
              {renderRuler()}
            </div>
          </div>

          {/* Tracks */}
          {tracks.map((trackId, index) => {
            const trackClips = clips.filter(c => c.trackId === trackId)
            
            return (
              <div
                key={trackId}
                className="relative border-b-2 border-gray-700"
                style={{ height: `${TRACK_HEIGHT}px` }}
                onDrop={(e) => handleTimelineDrop(e, trackId)}
                onDragOver={(e) => e.preventDefault()}
              >
                {/* Track label */}
                <div className="absolute left-0 top-0 bottom-0 w-24 bg-gray-800 border-r-2 border-gray-700 flex items-center justify-center z-20">
                  <span className="text-gray-300 text-sm font-bold">
                    {trackId === 0 ? '🎬 Main' : '📺 PiP'}
                  </span>
                </div>

                {/* Track content area */}
                <div className="absolute left-24 right-0 top-0 bottom-0 bg-gray-850">
                  {/* Grid lines */}
                  {snapToGrid && Array.from({ length: Math.ceil(timelineWidth / timeToPixels(gridSize)) }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-0 bottom-0 w-px bg-gray-700/20"
                      style={{ left: `${i * timeToPixels(gridSize)}px` }}
                    />
                  ))}
                  
                  {/* Clips */}
                  {trackClips.map(renderClip)}
                </div>
              </div>
            )
          })}

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none z-40 shadow-lg"
            style={{ left: `${timeToPixels(currentTime)}px` }}
          >
            <div className="absolute -top-2 -left-3 w-6 h-6 bg-red-500 transform rotate-45 shadow-lg"></div>
            <div className="absolute -top-1 left-1 text-xs text-white font-mono font-bold whitespace-nowrap bg-red-500 px-2 py-0.5 rounded shadow-lg">
              {formatDuration(currentTime)}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline controls */}
      <div className="flex-shrink-0 bg-gray-800 border-t-2 border-gray-700 px-4 py-2 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onZoomChange(-10)}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm font-bold transition-colors"
          >
            −
          </button>
          <span className="text-gray-300 text-sm font-mono font-semibold min-w-20 text-center">
            {zoomLevel}px/s
          </span>
          <button
            onClick={() => onZoomChange(10)}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm font-bold transition-colors"
          >
            +
          </button>
        </div>
        
        <div className="px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-lg">
          <span className="text-blue-300 text-sm font-semibold">🧲 Snap: {gridSize}s</span>
        </div>
        
        <div className="ml-auto text-gray-300 text-sm font-mono font-semibold">
          Duration: {formatDuration(totalDuration)}
        </div>
      </div>
    </div>
  )
}

export default ProfessionalTimeline
