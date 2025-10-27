import React, { useCallback, useRef, useState } from 'react'
import { formatDuration } from '../utils/fileUtils'

interface TimelineProps {
  duration: number
  currentTime: number
  trimStart: number
  trimEnd: number
  onSeek: (time: number) => void
  onTrimStartChange: (time: number) => void
  onTrimEndChange: (time: number) => void
  className?: string
}

const Timeline: React.FC<TimelineProps> = ({
  duration,
  currentTime,
  trimStart,
  trimEnd,
  onSeek,
  onTrimStartChange,
  onTrimEndChange,
  className = ''
}) => {
  const timelineRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragType, setDragType] = useState<'playhead' | 'trimStart' | 'trimEnd' | null>(null)

  const getTimeFromPosition = useCallback((clientX: number) => {
    if (!timelineRef.current) return 0
    
    const rect = timelineRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(1, x / rect.width))
    return percentage * duration
  }, [duration])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!timelineRef.current) return
    
    const rect = timelineRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const timelineWidth = rect.width
    
    // Determine what was clicked
    const playheadPosition = (currentTime / duration) * timelineWidth
    const trimStartPosition = (trimStart / duration) * timelineWidth
    const trimEndPosition = (trimEnd / duration) * timelineWidth
    
    const tolerance = 15 // pixels - larger for better touch/mouse interaction
    
    if (Math.abs(x - playheadPosition) < tolerance) {
      setDragType('playhead')
    } else if (Math.abs(x - trimStartPosition) < tolerance) {
      setDragType('trimStart')
    } else if (Math.abs(x - trimEndPosition) < tolerance) {
      setDragType('trimEnd')
    } else {
      // Click on timeline - seek to that position
      const time = getTimeFromPosition(e.clientX)
      onSeek(time)
      return
    }
    
    setIsDragging(true)
  }, [currentTime, duration, trimStart, trimEnd, getTimeFromPosition, onSeek])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !dragType) return
    
    const time = getTimeFromPosition(e.clientX)
    
    switch (dragType) {
      case 'playhead':
        onSeek(time)
        break
      case 'trimStart':
        onTrimStartChange(Math.min(time, trimEnd))
        break
      case 'trimEnd':
        onTrimEndChange(Math.max(time, trimStart))
        break
    }
  }, [isDragging, dragType, getTimeFromPosition, onSeek, onTrimStartChange, onTrimEndChange, trimStart, trimEnd])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setDragType(null)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false)
    setDragType(null)
  }, [])

  // Timeline markers for better navigation
  const getTimelineMarkers = () => {
    const markers = []
    const interval = duration / 10 // 10 markers
    
    for (let i = 0; i <= 10; i++) {
      const time = i * interval
      const position = (time / duration) * 100
      markers.push(
        <div
          key={i}
          className="absolute top-0 h-full w-px bg-gray-600/50"
          style={{ left: `${position}%` }}
        >
          <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 font-mono font-semibold">
            {formatDuration(time)}
          </div>
        </div>
      )
    }
    
    return markers
  }

  return (
    <div className={`glass rounded-3xl border border-gray-700/30 backdrop-blur-xl p-8 shadow-2xl ${className}`}>
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <span className="text-3xl">📊</span>
        Timeline
      </h3>
      
      <div className="space-y-6">
        {/* Timeline Container */}
        <div className="relative pt-8">
          <div
            ref={timelineRef}
            className="relative h-20 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-2xl cursor-pointer overflow-visible border-2 border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 shadow-lg"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            {/* Timeline Markers */}
            {getTimelineMarkers()}
            
            {/* Trim Range Background with Gradient */}
            <div
              className="absolute top-0 h-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 border-l-4 border-r-4 border-blue-400 rounded-lg backdrop-blur-sm"
              style={{
                left: `${(trimStart / duration) * 100}%`,
                width: `${((trimEnd - trimStart) / duration) * 100}%`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse-slow"></div>
            </div>
            
            {/* Trim Start Handle */}
            <div
              className="absolute top-0 h-full w-3 bg-gradient-to-r from-blue-500 to-blue-600 cursor-ew-resize hover:from-blue-400 hover:to-blue-500 transition-all duration-200 hover:w-4 group"
              style={{ left: `${(trimStart / duration) * 100}%` }}
            >
              <div className="absolute -top-2 -left-2 w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full border-4 border-gray-900 shadow-glow group-hover:scale-125 transition-transform duration-200"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs font-bold">▶</div>
            </div>
            
            {/* Trim End Handle */}
            <div
              className="absolute top-0 h-full w-3 bg-gradient-to-r from-purple-500 to-purple-600 cursor-ew-resize hover:from-purple-400 hover:to-purple-500 transition-all duration-200 hover:w-4 group"
              style={{ left: `${(trimEnd / duration) * 100}%` }}
            >
              <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full border-4 border-gray-900 shadow-glow group-hover:scale-125 transition-transform duration-200"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs font-bold">◀</div>
            </div>
            
            {/* Playhead */}
            <div
              className="absolute top-0 h-full w-1 bg-gradient-to-b from-red-500 via-red-400 to-red-500 cursor-ew-resize hover:w-2 transition-all duration-200 group z-10"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            >
              <div className="absolute -top-3 -left-3 w-7 h-7 bg-gradient-to-br from-red-500 to-red-600 rounded-full border-4 border-gray-900 shadow-glow animate-pulse-slow group-hover:scale-125 transition-transform duration-200">
                <div className="absolute inset-0 rounded-full bg-white/20"></div>
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-red-500 text-white text-xs font-mono font-bold rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {formatDuration(currentTime)}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Info Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-2xl border border-blue-500/20 backdrop-blur-sm">
            <div className="text-xs text-blue-300 uppercase tracking-wider mb-2 font-semibold">Start</div>
            <div className="font-mono font-bold text-2xl text-blue-400">{formatDuration(trimStart)}</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-red-500/10 to-red-600/5 rounded-2xl border border-red-500/20 backdrop-blur-sm">
            <div className="text-xs text-red-300 uppercase tracking-wider mb-2 font-semibold">Current</div>
            <div className="font-mono font-bold text-2xl text-red-400">{formatDuration(currentTime)}</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-2xl border border-purple-500/20 backdrop-blur-sm">
            <div className="text-xs text-purple-300 uppercase tracking-wider mb-2 font-semibold">End</div>
            <div className="font-mono font-bold text-2xl text-purple-400">{formatDuration(trimEnd)}</div>
          </div>
        </div>

        {/* Timeline Instructions */}
        <div className="p-4 bg-gray-800/30 rounded-2xl border border-gray-700/30">
          <div className="flex items-center justify-center gap-6 text-xs text-gray-400 font-medium">
            <span className="flex items-center gap-2">
              <span className="text-lg">👆</span>
              <span>Click to seek</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="text-lg">↔️</span>
              <span>Drag handles</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <span>Drag playhead</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Timeline
