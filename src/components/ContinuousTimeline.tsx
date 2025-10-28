import React, { useCallback, useRef, useState, useEffect } from 'react'
import { formatDuration } from '../utils/fileUtils'
import { TimelineClip } from '../state/editState'

interface TimelineProps {
  clips: TimelineClip[]
  selectedClipId: string | null
  currentTime: number
  totalDuration: number
  globalTrimStart: number
  globalTrimEnd: number | null
  onClipSelect: (clipId: string | null) => void
  onClipMove: (clipId: string, newStartTime: number) => void
  onClipRemove: (clipId: string) => void
  onSeek: (time: number) => void
  onGlobalTrimStartChange: (time: number) => void
  onGlobalTrimEndChange: (time: number) => void
  className?: string
}

const ContinuousTimeline: React.FC<TimelineProps> = ({
  clips,
  selectedClipId,
  currentTime,
  totalDuration,
  globalTrimStart,
  globalTrimEnd,
  onClipSelect,
  onClipMove,
  onClipRemove,
  onSeek,
  onGlobalTrimStartChange,
  onGlobalTrimEndChange,
  className = ''
}) => {
  const timelineRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragType, setDragType] = useState<'clip' | 'playhead' | 'trimStart' | 'trimEnd' | null>(null)
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false)
  const [draggedClipId, setDraggedClipId] = useState<string | null>(null)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartTime, setDragStartTime] = useState(0)

  const pixelsPerSecond = 100 // Fixed zoom level
  const timelineWidth = Math.max((totalDuration + 10) * pixelsPerSecond, 1000)

  const timeToPixels = (time: number) => time * pixelsPerSecond
  const pixelsToTime = (pixels: number) => pixels / pixelsPerSecond

  // Auto-scroll to keep playhead visible
  useEffect(() => {
    if (!scrollContainerRef.current || isDragging || isDraggingPlayhead) return
    
    const playheadX = timeToPixels(currentTime)
    const container = scrollContainerRef.current
    const containerWidth = container.clientWidth
    const scrollLeft = container.scrollLeft
    
    // Keep playhead in view
    if (playheadX < scrollLeft + 50) {
      container.scrollLeft = Math.max(0, playheadX - 100)
    } else if (playheadX > scrollLeft + containerWidth - 50) {
      container.scrollLeft = playheadX - containerWidth + 100
    }
  }, [currentTime, isDragging, isDraggingPlayhead])
  
  // Force re-render on scroll to sync timeline with ruler
  const [, setScrollLeft] = useState(0)
  
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return
    
    const handleScroll = () => {
      setScrollLeft(container.scrollLeft)
    }
    
    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (isDragging || isDraggingPlayhead) return
    
    const rect = timelineRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const scrollLeft = scrollContainerRef.current?.scrollLeft || 0
    const x = e.clientX - rect.left + scrollLeft
    const time = pixelsToTime(x)
    const clampedTime = Math.max(0, Math.min(time, totalDuration))
    
    console.log('Timeline clicked at time:', clampedTime)
    
    // Find which clip this time corresponds to
    const mainTrackClips = clips
      .filter(c => c.trackId === 0)
      .sort((a, b) => a.startTime - b.startTime)
    
    const clickedClip = mainTrackClips.find(clip => 
      clampedTime >= clip.startTime && clampedTime < (clip.startTime + clip.duration)
    )
    
    // If clicked on a clip, select it
    if (clickedClip) {
      onClipSelect(clickedClip.id)
    }
    
    // Always seek to the clicked position
    onSeek(clampedTime)
  }
  
  const handlePlayheadMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDraggingPlayhead(true)
    setDragType('playhead')
    setDragStartX(e.clientX)
  }
  
  const handleTrimStartMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDragging(true)
    setDragType('trimStart')
    setDragStartX(e.clientX)
    setDragStartTime(globalTrimStart)
  }
  
  const handleTrimEndMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDragging(true)
    setDragType('trimEnd')
    setDragStartX(e.clientX)
    setDragStartTime(globalTrimEnd || totalDuration)
  }

  const handleClipMouseDown = (e: React.MouseEvent, clip: TimelineClip) => {
    e.stopPropagation()
    setIsDragging(true)
    setDragType('clip')
    setDraggedClipId(clip.id)
    setDragStartX(e.clientX)
    setDragStartTime(clip.startTime)
    onClipSelect(clip.id)
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const rect = timelineRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const scrollLeft = scrollContainerRef.current?.scrollLeft || 0
    const x = e.clientX - rect.left + scrollLeft
    const time = pixelsToTime(x)
    const clampedTime = Math.max(0, Math.min(time, totalDuration))
    
    if (dragType === 'playhead') {
      onSeek(clampedTime)
      setDragStartX(e.clientX)
    } else if (dragType === 'trimStart') {
      onGlobalTrimStartChange(clampedTime)
    } else if (dragType === 'trimEnd') {
      onGlobalTrimEndChange(clampedTime)
    } else if (dragType === 'clip' && draggedClipId) {
      const deltaX = e.clientX - dragStartX
      const deltaTime = pixelsToTime(deltaX)
      const newTime = Math.max(0, dragStartTime + deltaTime)
      
      onClipMove(draggedClipId, newTime)
    }
  }, [isDragging, isDraggingPlayhead, dragType, draggedClipId, dragStartX, dragStartTime, onClipMove, onSeek, onGlobalTrimStartChange, onGlobalTrimEndChange, totalDuration])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setIsDraggingPlayhead(false)
    setDragType(null)
    setDraggedClipId(null)
  }, [])

  React.useEffect(() => {
    if (isDragging || isDraggingPlayhead) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, isDraggingPlayhead, handleMouseMove, handleMouseUp])

  // Render time ruler
  const renderRuler = () => {
    const intervals = []
    const step = 5 // 5 second intervals
    const maxTime = totalDuration + 10
    
    for (let time = 0; time <= maxTime; time += step) {
      const x = timeToPixels(time)
      
      intervals.push(
        <div
          key={time}
          className="absolute top-0 bottom-0"
          style={{ left: `${x}px` }}
        >
          <div className="h-full w-px bg-gray-600"></div>
          <div className="absolute top-1 left-1 text-xs text-gray-300 font-mono font-semibold">
            {formatDuration(time)}
          </div>
        </div>
      )
    }
    
    return intervals
  }

  return (
    <div className={`glass rounded-3xl border border-gray-700/30 backdrop-blur-xl p-6 shadow-2xl ${className}`}>
      <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
        <span className="text-3xl">📊</span>
        Continuous Timeline
        <span className="ml-auto text-sm font-normal text-gray-400">
          {clips.length} clip{clips.length !== 1 ? 's' : ''} • {formatDuration(totalDuration)}
        </span>
      </h3>
      
      <div className="relative">
        {/* Ruler */}
        <div className="relative h-10 bg-gray-800/50 rounded-t-xl border-b border-gray-700 overflow-x-auto" ref={scrollContainerRef}>
          <div style={{ width: `${timelineWidth}px`, height: '100%', position: 'relative' }}>
            {renderRuler()}
          </div>
        </div>

        {/* Timeline Track */}
        <div 
          ref={timelineRef}
          className="relative h-32 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-b-xl cursor-crosshair border-2 border-gray-700/50"
          onClick={handleTimelineClick}
          style={{ 
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <div 
            style={{ 
              width: `${timelineWidth}px`, 
              height: '100%', 
              position: 'absolute',
              left: scrollContainerRef.current ? `-${scrollContainerRef.current.scrollLeft}px` : '0'
            }}
          >
            {/* Grid lines */}
            {Array.from({ length: Math.ceil(totalDuration / 1) + 10 }).map((_, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-px bg-gray-700/20"
                style={{ left: `${i * pixelsPerSecond}px` }}
              />
            ))}

            {/* Clips */}
            {clips
              .filter(c => c.trackId === 0)
              .map((clip) => {
                const isSelected = clip.id === selectedClipId
                const x = timeToPixels(clip.startTime)
                const width = timeToPixels(clip.duration)
                
                return (
                  <div
                    key={clip.id}
                    className={`
                      absolute top-2 rounded-lg cursor-move select-none overflow-visible group
                      transition-shadow duration-150
                      ${isSelected 
                        ? 'ring-4 ring-blue-400 shadow-glow z-20' 
                        : 'ring-2 ring-gray-500 hover:ring-gray-400 z-10'
                      }
                    `}
                    style={{
                      left: `${x}px`,
                      width: `${width}px`,
                      height: 'calc(100% - 16px)',
                      background: isSelected 
                        ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
                        : 'linear-gradient(135deg, #4b5563 0%, #374151 100%)'
                    }}
                    onMouseDown={(e) => handleClipMouseDown(e, clip)}
                    onClick={(e) => {
                      e.stopPropagation()
                      onClipSelect(clip.id)
                    }}
                  >
                    {/* Trim indicators - show as semi-transparent overlays */}
                    {clip.trimStart > 0 && (
                      <div 
                        className="absolute left-0 top-0 bottom-0 bg-yellow-500/40 border-l-4 border-yellow-400"
                        style={{ 
                          width: `${timeToPixels((clip.trimStart / clip.sourceDuration) * clip.duration)}px`,
                          boxShadow: 'inset 2px 0 8px rgba(250, 204, 21, 0.6)',
                          pointerEvents: 'none'
                        }}
                        title={`Trimmed Start: ${formatDuration(clip.trimStart)}`}
                      >
                        <div className="absolute left-1 top-1 text-xs font-bold text-yellow-300 drop-shadow-lg">
                          ✂️
                        </div>
                      </div>
                    )}
                    {clip.trimEnd < clip.sourceDuration && (
                      <div 
                        className="absolute right-0 top-0 bottom-0 bg-yellow-500/40 border-r-4 border-yellow-400"
                        style={{ 
                          width: `${timeToPixels(((clip.sourceDuration - clip.trimEnd) / clip.sourceDuration) * clip.duration)}px`,
                          boxShadow: 'inset -2px 0 8px rgba(250, 204, 21, 0.6)',
                          pointerEvents: 'none'
                        }}
                        title={`Trimmed End: ${formatDuration(clip.sourceDuration - clip.trimEnd)}`}
                      >
                        <div className="absolute right-1 top-1 text-xs font-bold text-yellow-300 drop-shadow-lg">
                          ✂️
                        </div>
                      </div>
                    )}
                    
                    {/* Clip content */}
                    <div className="absolute inset-0 flex flex-col justify-center px-3">
                      <div className="text-white text-sm font-bold truncate drop-shadow-lg">
                        Clip #{clips.filter(c => c.trackId === 0).indexOf(clip) + 1}
                      </div>
                      <div className="text-white/90 text-xs font-mono mt-1 drop-shadow">
                        {formatDuration(clip.duration)}
                      </div>
                    </div>
                    
                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onClipRemove(clip.id)
                      }}
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 px-2 py-1 bg-red-500/90 hover:bg-red-500 rounded text-white text-xs font-bold transition-opacity shadow-lg z-50"
                    >
                      ✕
                    </button>
                  </div>
                )
              })}

            {/* Global Trim Start Handle (Blue) */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-blue-500 z-40 cursor-ew-resize shadow-lg"
              style={{ 
                left: `${timeToPixels(globalTrimStart)}px`,
                boxShadow: '0 0 10px rgba(59, 130, 246, 0.8)'
              }}
              onMouseDown={handleTrimStartMouseDown}
            >
              <div 
                className="absolute -top-3 -left-3 w-6 h-6 bg-blue-500 rounded-full shadow-lg cursor-ew-resize border-2 border-white"
                onMouseDown={handleTrimStartMouseDown}
              ></div>
              <div className="absolute -top-8 left-2 text-xs text-white font-mono font-bold whitespace-nowrap bg-blue-500 px-2 py-1 rounded shadow-lg pointer-events-none">
                Start: {formatDuration(globalTrimStart)}
              </div>
            </div>

            {/* Global Trim End Handle (Purple) */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-purple-500 z-40 cursor-ew-resize shadow-lg"
              style={{ 
                left: `${timeToPixels(globalTrimEnd || totalDuration)}px`,
                boxShadow: '0 0 10px rgba(168, 85, 247, 0.8)'
              }}
              onMouseDown={handleTrimEndMouseDown}
            >
              <div 
                className="absolute -top-3 -left-3 w-6 h-6 bg-purple-500 rounded-full shadow-lg cursor-ew-resize border-2 border-white"
                onMouseDown={handleTrimEndMouseDown}
              ></div>
              <div className="absolute -top-8 left-2 text-xs text-white font-mono font-bold whitespace-nowrap bg-purple-500 px-2 py-1 rounded shadow-lg pointer-events-none">
                End: {formatDuration(globalTrimEnd || totalDuration)}
              </div>
            </div>

            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-red-500 z-30 cursor-ew-resize shadow-lg"
              style={{ 
                left: `${timeToPixels(currentTime)}px`,
                boxShadow: '0 0 10px rgba(239, 68, 68, 0.8)'
              }}
              onMouseDown={handlePlayheadMouseDown}
            >
              <div 
                className="absolute -top-3 -left-3 w-6 h-6 bg-red-500 rounded-full shadow-lg cursor-ew-resize border-2 border-white"
                onMouseDown={handlePlayheadMouseDown}
              ></div>
              <div className="absolute -top-8 left-2 text-xs text-white font-mono font-bold whitespace-nowrap bg-red-500 px-2 py-1 rounded shadow-lg pointer-events-none">
                {formatDuration(currentTime)}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-xl border border-gray-700/30">
          <div className="flex items-center justify-center gap-6 text-xs text-gray-400 font-medium">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              <span>Blue = Export start</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
              <span>Purple = Export end</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="text-lg">🔴</span>
              <span>Red = Playhead</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-4 bg-yellow-400"></span>
              <span>Yellow = Clip trims</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContinuousTimeline

