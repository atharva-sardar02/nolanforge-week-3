import React, { useCallback, useRef, useState, useMemo, useEffect } from 'react'
import { formatDuration } from '../utils/fileUtils'

interface DualTimelineProps {
  duration: number
  currentTime: number
  trimStart: number
  trimEnd: number
  onSeek: (time: number) => void
  onTrimStartChange: (time: number) => void
  onTrimEndChange: (time: number) => void
  className?: string
}

const DualTimeline: React.FC<DualTimelineProps> = ({
  duration,
  currentTime,
  trimStart,
  trimEnd,
  onSeek,
  onTrimStartChange,
  onTrimEndChange,
  className = ''
}) => {
  const masterTimelineRef = useRef<HTMLDivElement>(null)
  const zoomTimelineRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragType, setDragType] = useState<'playhead' | 'trimStart' | 'trimEnd' | null>(null)
  const [activeTimeline, setActiveTimeline] = useState<'master' | 'zoom'>('master')
  const [zoomLevel, setZoomLevel] = useState(10) // seconds to show in zoom view

  // Calculate zoom timeline range (centered around playhead)
  const zoomRange = useMemo(() => {
    const halfZoom = zoomLevel / 2
    let start = Math.max(0, currentTime - halfZoom)
    let end = Math.min(duration, currentTime + halfZoom)
    
    // Adjust if at the edges
    if (end === duration) {
      start = Math.max(0, duration - zoomLevel)
    }
    if (start === 0) {
      end = Math.min(duration, zoomLevel)
    }
    
    return { start, end }
  }, [currentTime, zoomLevel, duration])

  const getTimeFromPosition = useCallback((clientX: number, isZoom: boolean) => {
    const timeline = isZoom ? zoomTimelineRef.current : masterTimelineRef.current
    if (!timeline) return 0
    
    const rect = timeline.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(1, x / rect.width))
    
    if (isZoom) {
      return zoomRange.start + percentage * (zoomRange.end - zoomRange.start)
    }
    
    return percentage * duration
  }, [duration, zoomRange])

  const handleMouseDown = useCallback((e: React.MouseEvent, isZoom: boolean) => {
    const timeline = isZoom ? zoomTimelineRef.current : masterTimelineRef.current
    if (!timeline) return
    
    const rect = timeline.getBoundingClientRect()
    const x = e.clientX - rect.left
    const timelineWidth = rect.width
    
    const displayDuration = isZoom ? (zoomRange.end - zoomRange.start) : duration
    const displayStart = isZoom ? zoomRange.start : 0
    
    // Determine what was clicked
    const playheadPosition = ((currentTime - displayStart) / displayDuration) * timelineWidth
    const trimStartPosition = ((trimStart - displayStart) / displayDuration) * timelineWidth
    const trimEndPosition = ((trimEnd - displayStart) / displayDuration) * timelineWidth
    
    const tolerance = 15
    
    if (Math.abs(x - playheadPosition) < tolerance) {
      setDragType('playhead')
    } else if (Math.abs(x - trimStartPosition) < tolerance) {
      setDragType('trimStart')
    } else if (Math.abs(x - trimEndPosition) < tolerance) {
      setDragType('trimEnd')
    } else {
      // Click on timeline - seek to that position
      const time = getTimeFromPosition(e.clientX, isZoom)
      onSeek(time)
      return
    }
    
    setActiveTimeline(isZoom ? 'zoom' : 'master')
    setIsDragging(true)
  }, [currentTime, duration, trimStart, trimEnd, zoomRange, getTimeFromPosition, onSeek])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !dragType) return
    
    const time = getTimeFromPosition(e.clientX, activeTimeline === 'zoom')
    
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
  }, [isDragging, dragType, activeTimeline, getTimeFromPosition, onSeek, onTrimStartChange, onTrimEndChange, trimStart, trimEnd])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setDragType(null)
  }, [])

  // Add global mouse move and mouse up listeners for smooth dragging
  useEffect(() => {
    if (!isDragging) return

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!dragType) return
      
      const timeline = activeTimeline === 'zoom' ? zoomTimelineRef.current : masterTimelineRef.current
      if (!timeline) return

      const time = getTimeFromPosition(e.clientX, activeTimeline === 'zoom')
      
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
    }

    const handleGlobalMouseUp = () => {
      setIsDragging(false)
      setDragType(null)
    }

    document.addEventListener('mousemove', handleGlobalMouseMove)
    document.addEventListener('mouseup', handleGlobalMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isDragging, dragType, activeTimeline, getTimeFromPosition, onSeek, onTrimStartChange, onTrimEndChange, trimStart, trimEnd])

  const getTimelineMarkers = (isZoom: boolean) => {
    const markers = []
    const displayDuration = isZoom ? (zoomRange.end - zoomRange.start) : duration
    const displayStart = isZoom ? zoomRange.start : 0
    const markerCount = isZoom ? 5 : 10
    const interval = displayDuration / markerCount
    
    for (let i = 0; i <= markerCount; i++) {
      const time = displayStart + (i * interval)
      const position = (i / markerCount) * 100
      markers.push(
        <div
          key={i}
          className="absolute top-0 h-full w-px bg-gray-600/50"
          style={{ left: `${position}%` }}
        >
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-[10px] text-gray-400 font-mono font-semibold whitespace-nowrap">
            {formatDuration(time)}
          </div>
        </div>
      )
    }
    
    return markers
  }

  const renderTimelineContent = (isZoom: boolean) => {
    const displayDuration = isZoom ? (zoomRange.end - zoomRange.start) : duration
    const displayStart = isZoom ? zoomRange.start : 0
    
    const getRelativePosition = (time: number) => {
      return ((time - displayStart) / displayDuration) * 100
    }
    
    const getRelativeWidth = (start: number, end: number) => {
      return ((end - start) / displayDuration) * 100
    }
    
    // Only show trim range if it's visible in this view
    const trimVisible = trimEnd > displayStart && trimStart < displayStart + displayDuration
    const playheadVisible = currentTime >= displayStart && currentTime <= displayStart + displayDuration
    
    return (
      <>
        {/* Timeline Markers */}
        {getTimelineMarkers(isZoom)}
        
        {/* Trim Range Background */}
        {trimVisible && (
          <div
            className="absolute top-0 h-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 border-l-2 border-r-2 border-blue-400 rounded-lg"
            style={{
              left: `${Math.max(0, getRelativePosition(trimStart))}%`,
              width: `${getRelativeWidth(Math.max(displayStart, trimStart), Math.min(displayStart + displayDuration, trimEnd))}%`
            }}
          />
        )}
        
        {/* Trim Start Handle */}
        {trimStart >= displayStart && trimStart <= displayStart + displayDuration && (
          <div
            className="absolute top-0 h-full w-2 bg-gradient-to-r from-blue-500 to-blue-600 cursor-ew-resize hover:from-blue-400 hover:to-blue-500 transition-all duration-200 group z-10"
            style={{ left: `${getRelativePosition(trimStart)}%` }}
          >
            <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full border-3 border-gray-900 shadow-glow group-hover:scale-110 transition-transform"></div>
          </div>
        )}
        
        {/* Trim End Handle */}
        {trimEnd >= displayStart && trimEnd <= displayStart + displayDuration && (
          <div
            className="absolute top-0 h-full w-2 bg-gradient-to-r from-purple-500 to-purple-600 cursor-ew-resize hover:from-purple-400 hover:to-purple-500 transition-all duration-200 group z-10"
            style={{ left: `${getRelativePosition(trimEnd)}%` }}
          >
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full border-3 border-gray-900 shadow-glow group-hover:scale-110 transition-transform"></div>
          </div>
        )}
        
        {/* Playhead */}
        {playheadVisible && (
          <div
            className="absolute top-0 h-full w-1 bg-gradient-to-b from-red-500 via-red-400 to-red-500 cursor-ew-resize group z-20"
            style={{ left: `${getRelativePosition(currentTime)}%` }}
            title="Drag to seek video"
          >
            <div className="absolute -top-2 -left-2 w-5 h-5 bg-gradient-to-br from-red-500 to-red-600 rounded-full border-3 border-gray-900 shadow-glow animate-pulse-slow group-hover:scale-125 transition-transform cursor-grab active:cursor-grabbing">
              <div className="absolute inset-0 rounded-full bg-white/20"></div>
            </div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 bg-red-500 text-white text-[10px] font-mono font-bold rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {formatDuration(currentTime)}
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className={`glass rounded-3xl border border-gray-700/30 backdrop-blur-xl p-6 shadow-2xl ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-3">
          <span className="text-2xl">📊</span>
          Dual Timeline
        </h3>
        
        {/* Zoom Level Control */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Zoom:</span>
          <select
            value={zoomLevel}
            onChange={(e) => setZoomLevel(Number(e.target.value))}
            className="bg-gray-800 text-white text-xs rounded-lg px-2 py-1 border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value={5}>5s</option>
            <option value={10}>10s</option>
            <option value={20}>20s</option>
            <option value={30}>30s</option>
            <option value={60}>60s</option>
          </select>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Master Timeline */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Master</h4>
            <span className="text-[10px] text-gray-500 font-mono">{formatDuration(duration)}</span>
          </div>
          <div className="relative pt-5">
            <div
              ref={masterTimelineRef}
              className="relative h-12 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl cursor-pointer overflow-visible border-2 border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 shadow-lg"
              onMouseDown={(e) => handleMouseDown(e, false)}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {renderTimelineContent(false)}
            </div>
          </div>
        </div>

        {/* Zoom Timeline */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Zoom (Precision)</h4>
            <span className="text-[10px] text-gray-500 font-mono">
              {formatDuration(zoomRange.start)} - {formatDuration(zoomRange.end)}
            </span>
          </div>
          <div className="relative pt-5">
            <div
              ref={zoomTimelineRef}
              className="relative h-16 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl cursor-pointer overflow-visible border-2 border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 shadow-lg"
              onMouseDown={(e) => handleMouseDown(e, true)}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {renderTimelineContent(true)}
            </div>
          </div>
        </div>

        {/* Timeline Info Cards - Compact */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl border border-blue-500/20">
            <div className="text-[10px] text-blue-300 uppercase tracking-wider mb-1 font-semibold">Start</div>
            <div className="font-mono font-bold text-lg text-blue-400">{formatDuration(trimStart)}</div>
          </div>
          <div className="p-2 bg-gradient-to-br from-red-500/10 to-red-600/5 rounded-xl border border-red-500/20">
            <div className="text-[10px] text-red-300 uppercase tracking-wider mb-1 font-semibold">Playhead</div>
            <div className="font-mono font-bold text-lg text-red-400">{formatDuration(currentTime)}</div>
          </div>
          <div className="p-2 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl border border-purple-500/20">
            <div className="text-[10px] text-purple-300 uppercase tracking-wider mb-1 font-semibold">End</div>
            <div className="font-mono font-bold text-lg text-purple-400">{formatDuration(trimEnd)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DualTimeline

