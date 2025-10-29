import React, { useCallback, useRef, useState, useEffect } from 'react'
import { formatDuration } from '../utils/fileUtils'
import { TimelineClip } from '../state/editState'
import { MediaFile } from '../state/mediaStore'
import { useTrackState } from '../state/trackState'
import TrackRow from './TrackRow'

interface TimelineProps {
  clips: TimelineClip[]
  mediaFiles: MediaFile[]
  selectedClipId: string | null
  currentTime: number
  totalDuration: number
  globalTrimStart: number
  globalTrimEnd: number | null
  pixelsPerSecond?: number
  onClipSelect: (clipId: string | null) => void
  onClipMove: (clipId: string, newTrackId: number, newStartTime: number) => void
  onClipRemove: (clipId: string) => void
  onSeek: (time: number) => void
  onGlobalTrimStartChange: (time: number) => void
  onGlobalTrimEndChange: (time: number) => void
  onZoomChange?: (zoomLevel: number) => void
  className?: string
  // Multi-track support
  multiTrackMode?: boolean
}

const ContinuousTimeline: React.FC<TimelineProps> = ({
  clips,
  mediaFiles,
  selectedClipId,
  currentTime,
  totalDuration,
  globalTrimStart,
  globalTrimEnd,
  pixelsPerSecond = 100,
  onClipSelect,
  onClipMove,
  onClipRemove,
  onSeek,
  onGlobalTrimStartChange,
  onGlobalTrimEndChange,
  onZoomChange,
  className = '',
  multiTrackMode = false
}) => {
  const timelineRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragType, setDragType] = useState<'clip' | 'playhead' | 'trimStart' | 'trimEnd' | null>(null)
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false)
  const [draggedClipId, setDraggedClipId] = useState<string | null>(null)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartTime, setDragStartTime] = useState(0)

  // Multi-track state
  const {
    tracks,
    addTrack,
    removeTrack,
    setTrackMute,
    setTrackSolo,
    setTrackLock,
    setTrackVisibility,
    canRemoveTrack
  } = useTrackState()

  const pixelsPerSecondValue = pixelsPerSecond
  const timelineWidth = Math.max((totalDuration + 10) * pixelsPerSecondValue, 1000)

  const timeToPixels = (time: number) => time * pixelsPerSecondValue
  const pixelsToTime = (pixels: number) => pixels / pixelsPerSecondValue

  // Helper function to get media file for a clip
  const getMediaFileForClip = (clip: TimelineClip): MediaFile | null => {
    return mediaFiles.find(file => file.id === clip.mediaFileId) || null
  }

  // Auto-scroll to keep playhead visible
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return
    
    const playheadX = timeToPixels(currentTime)
    const containerWidth = container.clientWidth
    const scrollLeft = container.scrollLeft
    
    if (playheadX < scrollLeft + 100) {
      container.scrollLeft = Math.max(0, playheadX - 100)
    } else if (playheadX > scrollLeft + containerWidth - 100) {
      container.scrollLeft = playheadX - containerWidth + 100
    }
  }, [currentTime, pixelsPerSecondValue])
  
  // Mouse wheel zoom support and scroll synchronization
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container || !onZoomChange) return
    
    const handleWheel = (e: WheelEvent) => {
      // Only zoom when Ctrl is pressed
      if (!e.ctrlKey) return
      
      e.preventDefault()
      
      const delta = e.deltaY > 0 ? -25 : 25 // Zoom out on scroll down, zoom in on scroll up
      const newZoom = Math.max(10, Math.min(200, pixelsPerSecond + delta))
      
      if (newZoom !== pixelsPerSecond) {
        console.log('🔍 Mouse wheel zoom:', newZoom)
        onZoomChange(newZoom)
      }
    }
    
    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [pixelsPerSecond, onZoomChange])

  // Scroll synchronization for multi-track mode
  useEffect(() => {
    if (!multiTrackMode) return

    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      // Force re-render of timeline content to sync with ruler scroll
      const timelineContent = container.parentElement?.querySelector('.flex-1.relative.overflow-hidden > div') as HTMLElement
      if (timelineContent) {
        timelineContent.style.left = `-${container.scrollLeft}px`
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [multiTrackMode])


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
    if (!isDragging && !isDraggingPlayhead) return
    
    const deltaX = e.clientX - dragStartX
    const deltaTime = pixelsToTime(deltaX)
    
    if (dragType === 'playhead') {
      const newTime = Math.max(0, Math.min(totalDuration, dragStartTime + deltaTime))
      onSeek(newTime)
    } else if (dragType === 'trimStart') {
      const newTime = Math.max(0, Math.min(globalTrimEnd || totalDuration, dragStartTime + deltaTime))
      onGlobalTrimStartChange(newTime)
    } else if (dragType === 'trimEnd') {
      const newTime = Math.max(globalTrimStart, Math.min(totalDuration, dragStartTime + deltaTime))
      onGlobalTrimEndChange(newTime)
    } else if (dragType === 'clip' && draggedClipId) {
      const newTime = Math.max(0, Math.min(totalDuration, dragStartTime + deltaTime))
      // Find the clip to get its current track
      const clip = clips.find(c => c.id === draggedClipId)
      if (clip) {
        onClipMove(draggedClipId, clip.trackId, newTime)
      }
    }
  }, [isDragging, isDraggingPlayhead, dragType, dragStartX, dragStartTime, draggedClipId, pixelsPerSecondValue, totalDuration, globalTrimStart, globalTrimEnd, onSeek, onGlobalTrimStartChange, onGlobalTrimEndChange, onClipMove])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setIsDraggingPlayhead(false)
    setDragType(null)
    setDraggedClipId(null)
  }, [])

  useEffect(() => {
    if (isDragging || isDraggingPlayhead) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, isDraggingPlayhead, handleMouseMove, handleMouseUp])

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
        {multiTrackMode ? 'Multi-Track Timeline' : 'Continuous Timeline'}
        <span className="ml-auto text-sm font-normal text-gray-400">
          {clips.length} clip{clips.length !== 1 ? 's' : ''} • {formatDuration(totalDuration)}
        </span>
      </h3>
      
      <div className="relative">
        {/* Ruler */}
        {multiTrackMode ? (
          <div className="relative h-10 bg-gray-800/50 rounded-t-xl border-b border-gray-700 overflow-x-auto" ref={scrollContainerRef}>
            <div className="flex">
              {/* Empty space to align with timeline content */}
              <div className="w-48 flex-shrink-0"></div>
              
              {/* Ruler Content */}
              <div className="flex-1 relative">
                <div style={{ width: `${timelineWidth}px`, height: '100%', position: 'relative' }}>
                  {renderRuler()}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative h-10 bg-gray-800/50 rounded-t-xl border-b border-gray-700 overflow-x-auto" ref={scrollContainerRef}>
            <div style={{ width: `${timelineWidth}px`, height: '100%', position: 'relative' }}>
              {renderRuler()}
            </div>
          </div>
        )}

        {/* Timeline Tracks */}
        {multiTrackMode ? (
          <div className="border-2 border-gray-700/50 rounded-b-xl overflow-hidden">
            {/* Track Rows */}
            <div className="flex relative overflow-hidden">
              {/* Track Labels Column with Controls */}
              <div className="w-48 flex-shrink-0 bg-gray-800/30 border-r border-gray-700/30">
                {tracks.map((track) => (
                  <div 
                    key={track.id}
                    className="flex items-center justify-between px-3 py-2 border-b border-gray-700/30 gap-2"
                    style={{ height: `${track.height}px` }}
                  >
                    {/* Left side: Track dot and name */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: track.color }}
                      ></div>
                      <span className="text-sm font-medium text-gray-300 truncate">
                        {track.name}
                      </span>
                    </div>
                    
                    {/* Right side: Track Controls */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* Visibility Toggle */}
                      <button
                        onClick={() => setTrackVisibility(track.id, !track.visible)}
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
                        onClick={() => setTrackLock(track.id, !track.locked)}
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
                        onClick={() => setTrackSolo(track.id, !track.solo)}
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
                        onClick={() => setTrackMute(track.id, !track.muted)}
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
                      {canRemoveTrack(track.id) && (
                        <button
                          onClick={() => removeTrack(track.id)}
                          className="p-1 rounded text-xs text-red-400 hover:text-red-300"
                          title="Remove track"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Add Track Button */}
                <button
                  onClick={addTrack}
                  className="w-full px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white border-t border-gray-700/30 transition-colors text-sm font-medium"
                  title="Add Track"
                >
                  + Add Track
                </button>
              </div>

              {/* Timeline Content */}
              <div className="flex-1 relative overflow-hidden">
                <div 
                  style={{ 
                    width: `${timelineWidth}px`, 
                    height: '100%', 
                    position: 'absolute',
                    left: scrollContainerRef.current ? `-${scrollContainerRef.current.scrollLeft}px` : '0'
                  }}
                >
                  {tracks.map((track) => (
                    <TrackRow
                      key={track.id}
                      track={track}
                      clips={clips}
                      mediaFiles={mediaFiles}
                      selectedClipId={selectedClipId}
                      currentTime={currentTime}
                      totalDuration={totalDuration}
                      pixelsPerSecond={pixelsPerSecondValue}
                      onClipSelect={onClipSelect}
                      onClipMove={onClipMove}
                      onClipRemove={onClipRemove}
                      onSeek={onSeek}
                      onTimelineClick={(time) => {
                        // Find which clip this time corresponds to
                        const mainTrackClips = clips
                          .filter(c => c.trackId === 0)
                          .sort((a, b) => a.startTime - b.startTime)
                        
                        const clickedClip = mainTrackClips.find(clip => 
                          time >= clip.startTime && time < (clip.startTime + clip.duration)
                        )
                        
                        // If clicked on a clip, select it
                        if (clickedClip) {
                          onClipSelect(clickedClip.id)
                        }
                        
                        // Always seek to the clicked position
                        onSeek(time)
                      }}
                    />
                  ))}
                  
                  {/* Global Trim Handles and Playhead - Positioned relative to timeline content */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Global Trim Start Handle (Green) */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-green-500 z-40 cursor-ew-resize shadow-lg pointer-events-auto"
                      style={{ 
                        left: `${timeToPixels(globalTrimStart)}px`,
                        boxShadow: '0 0 10px rgba(34, 197, 94, 0.8)'
                      }}
                      onMouseDown={handleTrimStartMouseDown}
                    >
                      <div 
                        className="absolute -top-3 -left-3 w-6 h-6 bg-green-500 rounded-full shadow-lg cursor-ew-resize border-2 border-white"
                        onMouseDown={handleTrimStartMouseDown}
                      ></div>
                      <div className="absolute -top-8 left-2 text-xs text-white font-mono font-bold whitespace-nowrap bg-green-500 px-2 py-1 rounded shadow-lg pointer-events-none">
                        Start: {formatDuration(globalTrimStart)}
                      </div>
                    </div>

                    {/* Global Trim End Handle (Purple) */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-purple-500 z-40 cursor-ew-resize shadow-lg pointer-events-auto"
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
                      className="absolute top-0 bottom-0 w-1 bg-red-500 z-30 cursor-ew-resize shadow-lg pointer-events-auto"
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
              </div>
            </div>
          </div>
        ) : (
          /* Single Track Mode (Original) */
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
                  const mediaFile = getMediaFileForClip(clip)
                  const thumbnail = mediaFile?.thumbnail
                
                return (
                  <div
                    key={clip.id}
                    className={`
                        absolute top-2 rounded-lg cursor-move select-none overflow-hidden group
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
                        background: thumbnail 
                          ? `url(${thumbnail}) center/cover`
                          : isSelected 
                        ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
                        : 'linear-gradient(135deg, #4b5563 0%, #374151 100%)'
                    }}
                    onMouseDown={(e) => handleClipMouseDown(e, clip)}
                    onClick={(e) => {
                      e.stopPropagation()
                      onClipSelect(clip.id)
                      
                      // Also seek to the clicked position within the clip
                      const rect = e.currentTarget.getBoundingClientRect()
                      const x = e.clientX - rect.left
                      const relativeTime = pixelsToTime(x)
                      const globalTime = clip.startTime + relativeTime
                      const clampedTime = Math.max(clip.startTime, Math.min(globalTime, clip.startTime + clip.duration))
                      
                      console.log('Clip clicked, seeking to:', clampedTime)
                      onSeek(clampedTime)
                    }}
                  >
                      {/* Semi-transparent overlay for text readability */}
                      {thumbnail && (
                        <div className="absolute inset-0 bg-black/40 rounded-lg" />
                    )}
                    
                    {/* Clip content */}
                    <div className="absolute inset-0 flex flex-col justify-center px-3">
                        <div className="relative z-10 text-white text-sm font-bold truncate drop-shadow-lg">
                        Clip #{clips.filter(c => c.trackId === 0).indexOf(clip) + 1}
                      </div>
                        <div className="relative z-10 text-white/90 text-xs font-mono mt-1 drop-shadow">
                        {formatDuration(clip.duration)}
                      </div>
                    </div>
                    
                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onClipRemove(clip.id)
                      }}
                        className="absolute top-1 right-1 p-1 bg-red-600/80 hover:bg-red-700 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-30"
                        title="Remove Clip"
                    >
                      ✕
                    </button>
                  </div>
                )
              })}

            {/* Global Trim Start Handle (Green) */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-green-500 z-40 cursor-ew-resize shadow-lg"
              style={{ 
                left: `${timeToPixels(globalTrimStart)}px`,
                boxShadow: '0 0 10px rgba(34, 197, 94, 0.8)'
              }}
              onMouseDown={handleTrimStartMouseDown}
            >
              <div 
                className="absolute -top-3 -left-3 w-6 h-6 bg-green-500 rounded-full shadow-lg cursor-ew-resize border-2 border-white"
                onMouseDown={handleTrimStartMouseDown}
              ></div>
              <div className="absolute -top-8 left-2 text-xs text-white font-mono font-bold whitespace-nowrap bg-green-500 px-2 py-1 rounded shadow-lg pointer-events-none">
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
        )}

        {/* Instructions */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-xl border border-gray-700/30">
          <div className="flex items-center justify-center gap-6 text-xs text-gray-400 font-medium">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span>Green = Trim start</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
              <span>Purple = Trim end</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="text-lg">🔴</span>
              <span>Red = Playhead</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContinuousTimeline