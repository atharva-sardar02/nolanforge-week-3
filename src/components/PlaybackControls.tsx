import React, { useCallback, useState } from 'react'
import { formatDuration } from '../utils/fileUtils'

interface PlaybackControlsProps {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  onPlayPause: () => void
  onSeek: (time: number) => void
  onVolumeChange: (volume: number) => void
  onMuteToggle: () => void
  onFrameStep: (direction: 'forward' | 'backward') => void
  className?: string
}

const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onMuteToggle,
  onFrameStep,
  className = ''
}) => {
  const [isSeeking, setIsSeeking] = useState(false)
  const [seekTime, setSeekTime] = useState(currentTime)

  const handleSeekStart = useCallback(() => {
    setIsSeeking(true)
    setSeekTime(currentTime)
  }, [currentTime])

  const handleSeekChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    setSeekTime(time)
  }, [])

  const handleSeekEnd = useCallback(() => {
    setIsSeeking(false)
    onSeek(seekTime)
  }, [seekTime, onSeek])

  const handleStepBackward = useCallback(() => {
    onFrameStep('backward')
  }, [onFrameStep])

  const handleStepForward = useCallback(() => {
    onFrameStep('forward')
  }, [onFrameStep])

  return (
    <div className={`bg-gray-900 text-white p-4 ${className}`}>
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-sm font-mono min-w-[3rem]">
            {formatDuration(isSeeking ? seekTime : currentTime)}
          </span>
          <div className="flex-1 bg-gray-700 rounded-full h-2 relative">
            <input
              type="range"
              min="0"
              max={duration || 0}
              step="0.1"
              value={isSeeking ? seekTime : currentTime}
              onChange={handleSeekChange}
              onMouseDown={handleSeekStart}
              onMouseUp={handleSeekEnd}
              onTouchStart={handleSeekStart}
              onTouchEnd={handleSeekEnd}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-100"
              style={{ width: duration > 0 ? `${((isSeeking ? seekTime : currentTime) / duration) * 100}%` : '0%' }}
            />
          </div>
          <span className="text-sm font-mono min-w-[3rem]">
            {formatDuration(duration)}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Play/Pause */}
          <button
            onClick={onPlayPause}
            className="p-2 hover:bg-gray-700 rounded transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>

          {/* Frame Step Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleStepBackward}
              className="p-3 hover:bg-gray-700 rounded-lg transition-all hover:scale-110"
              title="Step backward"
            >
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/>
              </svg>
            </button>
            <button
              onClick={handleStepForward}
              className="p-3 hover:bg-gray-700 rounded-lg transition-all hover:scale-110"
              title="Step forward"
            >
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 6v12l8.5-6L13 6zM4 18l8.5-6L4 6v12z"/>
              </svg>
            </button>
          </div>

          {/* Volume Controls */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onMuteToggle}
              className="p-3 hover:bg-gray-700 rounded-lg transition-all hover:scale-110"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                </svg>
              ) : (
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-40 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              title="Volume"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlaybackControls
