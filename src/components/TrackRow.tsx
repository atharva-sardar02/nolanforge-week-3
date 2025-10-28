import React, { useState, useRef } from 'react'
import { TimelineClip } from '../state/editState'
import { MediaFile } from '../state/mediaStore'
import { Track } from '../state/trackState'

interface TrackRowProps {
  track: Track
  clips: TimelineClip[]
  mediaFiles: MediaFile[]
  selectedClipId: string | null
  currentTime: number
  totalDuration: number
  pixelsPerSecond: number
  onClipSelect: (clipId: string | null) => void
  onClipMove: (clipId: string, newTrackId: number, newStartTime: number) => void
  onClipRemove: (clipId: string) => void
  onSeek: (time: number) => void
  onTimelineClick: (time: number) => void
}

const TrackRow: React.FC<TrackRowProps> = ({
  track,
  clips,
  mediaFiles,
  selectedClipId,
  currentTime,
  totalDuration,
  pixelsPerSecond,
  onClipSelect,
  onClipMove,
  onClipRemove,
  onSeek,
  onTimelineClick
}) => {
  const trackClips = clips.filter(clip => clip.trackId === track.id)
  const timelineWidth = Math.max((totalDuration + 10) * pixelsPerSecond, 1000)
  
  const timeToPixels = (time: number) => time * pixelsPerSecond
  const pixelsToTime = (pixels: number) => pixels / pixelsPerSecond

  // Drag and drop state
  const [draggedClip, setDraggedClip] = useState<TimelineClip | null>(null)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)

  // Helper function to get media file for a clip
  const getMediaFileForClip = (clip: TimelineClip): MediaFile | null => {
    return mediaFiles.find(file => file.id === clip.mediaFileId) || null
  }

  const handleTimelineClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const time = pixelsToTime(x)
    const clampedTime = Math.max(0, Math.min(time, totalDuration))
    onTimelineClick(clampedTime)
  }

  const handleClipClick = (e: React.MouseEvent, clip: TimelineClip) => {
    e.stopPropagation()
    onClipSelect(clip.id)
    
    // Also seek to the clicked position within the clip
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const relativeTime = pixelsToTime(x)
    const globalTime = clip.startTime + relativeTime
    const clampedTime = Math.max(clip.startTime, Math.min(globalTime, clip.startTime + clip.duration))
    
    onSeek(clampedTime)
  }

  // Drag and drop handlers
  const handleMouseDown = (e: React.MouseEvent, clip: TimelineClip) => {
    if (track.locked) return
    
    e.preventDefault()
    e.stopPropagation()
    
    const rect = e.currentTarget.getBoundingClientRect()
    const offset = e.clientX - rect.left
    setDragOffset(offset)
    setDraggedClip(clip)
    setIsDragging(true)
    onClipSelect(clip.id)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !draggedClip || !trackRef.current) return
    
    e.preventDefault()
    const rect = trackRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - dragOffset
    const newTime = pixelsToTime(Math.max(0, x))
    const clampedTime = Math.max(0, newTime)
    
    // Update clip position in real-time
    onClipMove(draggedClip.id, track.id, clampedTime)
  }

  const handleMouseUp = () => {
    if (!isDragging || !draggedClip) return
    
    setIsDragging(false)
    setDraggedClip(null)
    setDragOffset(0)
  }

  // Global mouse events for drag and drop
  React.useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        if (!draggedClip || !trackRef.current) return
        
        const rect = trackRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left - dragOffset
        const newTime = pixelsToTime(Math.max(0, x))
        const clampedTime = Math.max(0, newTime)
        
        onClipMove(draggedClip.id, track.id, clampedTime)
      }

      const handleGlobalMouseUp = () => {
        setIsDragging(false)
        setDraggedClip(null)
        setDragOffset(0)
      }

      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove)
        document.removeEventListener('mouseup', handleGlobalMouseUp)
      }
    }
  }, [isDragging, draggedClip, dragOffset, track.id, totalDuration, pixelsPerSecond, onClipMove])

  return (
    <div 
      ref={trackRef}
      className="relative"
      style={{ height: `${track.height}px` }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Track Background */}
      <div 
        className="absolute inset-0 cursor-pointer"
        onClick={handleTimelineClick}
        style={{ width: `${timelineWidth}px` }}
      >
        {/* Time Grid */}
        <div className="absolute inset-0">
          {Array.from({ length: Math.ceil(totalDuration) + 1 }, (_, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 border-l border-gray-700/20"
              style={{ left: `${timeToPixels(i)}px` }}
            />
          ))}
        </div>

        {/* Clips */}
        {trackClips.map((clip) => {
          const isSelected = clip.id === selectedClipId
          const isDragged = draggedClip?.id === clip.id
          const x = timeToPixels(clip.startTime)
          const width = timeToPixels(clip.duration)
          const mediaFile = getMediaFileForClip(clip)
          const thumbnail = mediaFile?.thumbnail
          
          return (
            <div
              key={clip.id}
              className={`
                absolute top-1 bottom-1 rounded-lg cursor-move select-none overflow-hidden group
                transition-all duration-150
                ${isSelected 
                  ? 'ring-4 ring-blue-400 shadow-glow z-20' 
                  : 'ring-2 ring-gray-500 hover:ring-gray-400 z-10'
                }
                ${track.locked ? 'opacity-50 cursor-not-allowed' : ''}
                ${isDragged ? 'opacity-80 scale-105 shadow-2xl' : ''}
              `}
              style={{
                left: `${x}px`,
                width: `${width}px`,
                background: thumbnail 
                  ? `url(${thumbnail}) center/cover`
                  : isSelected 
                    ? `linear-gradient(135deg, ${track.color} 0%, ${track.color}80 100%)`
                    : `linear-gradient(135deg, ${track.color}80 0%, ${track.color}40 100%)`
              }}
              onClick={(e) => handleClipClick(e, clip)}
              onMouseDown={(e) => handleMouseDown(e, clip)}
            >
              {/* Semi-transparent overlay for text readability */}
              {thumbnail && (
                <div className="absolute inset-0 bg-black/40 rounded-lg" />
              )}
              
              {/* Clip content */}
              <div className="absolute inset-0 flex flex-col justify-center px-2">
                <div className="relative z-10 text-white text-xs font-bold truncate drop-shadow-lg">
                  {mediaFile?.name || `Clip ${clip.id.slice(-4)}`}
                </div>
                <div className="relative z-10 text-white/90 text-xs font-mono mt-0.5 drop-shadow">
                  {Math.round(clip.duration * 10) / 10}s
                </div>
              </div>
              
              {/* Delete button */}
              {!track.locked && (
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
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TrackRow
