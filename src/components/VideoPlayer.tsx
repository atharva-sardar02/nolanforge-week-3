import React, { useRef, useEffect, useState, useCallback } from 'react'
import { MediaFile } from '../state/mediaStore'
import PlaybackControls from './PlaybackControls'

interface VideoPlayerProps {
  file?: MediaFile
  className?: string
  onTimeUpdate?: (currentTime: number, duration: number) => void
  onLoadedMetadata?: (duration: number) => void
  onPlay?: () => void
  onPause?: () => void
  onSeek?: (time: number) => void
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  file,
  className = '',
  onTimeUpdate,
  onLoadedMetadata,
  onPlay,
  onPause,
  onSeek
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [playbackRate, setPlaybackRate] = useState(1)

  // Handle video load
  useEffect(() => {
    if (file && videoRef.current) {
      setIsLoading(true)
      setError(null)
      
      const video = videoRef.current
      
      video.onloadedmetadata = () => {
        setDuration(video.duration)
        setIsLoading(false)
        onLoadedMetadata?.(video.duration)
      }
      
      video.onerror = () => {
        setError('Failed to load video')
        setIsLoading(false)
      }
      
      video.oncanplay = () => {
        setIsLoading(false)
      }
    }
  }, [file, onLoadedMetadata])

  // Handle time updates
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      const time = video.currentTime
      setCurrentTime(time)
      onTimeUpdate?.(time, video.duration)
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    return () => video.removeEventListener('timeupdate', handleTimeUpdate)
  }, [onTimeUpdate])

  const handlePlayPause = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
      setIsPlaying(false)
      onPause?.()
    } else {
      video.play()
      setIsPlaying(true)
      onPlay?.()
    }
  }, [isPlaying, onPlay, onPause])

  const handleSeek = useCallback((time: number) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = time
    setCurrentTime(time)
    onSeek?.(time)
  }, [onSeek])

  const handleVolumeChange = useCallback((newVolume: number) => {
    const video = videoRef.current
    if (!video) return

    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }, [])

  const handleMuteToggle = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    if (isMuted) {
      video.volume = volume
      setIsMuted(false)
    } else {
      video.volume = 0
      setIsMuted(true)
    }
  }, [isMuted, volume])

  const handleFullscreen = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    if (video.requestFullscreen) {
      video.requestFullscreen()
    }
  }, [])

  const handleFrameStep = useCallback((direction: 'forward' | 'backward') => {
    const video = videoRef.current
    if (!video) return

    const frameTime = 1 / 30 // Assuming 30fps
    const step = direction === 'forward' ? frameTime : -frameTime
    const newTime = Math.max(0, Math.min(duration, video.currentTime + step))
    
    video.currentTime = newTime
    setCurrentTime(newTime)
    onSeek?.(newTime)
  }, [duration, onSeek])

  const handlePlaybackRateChange = useCallback((rate: number) => {
    const video = videoRef.current
    if (!video) return

    video.playbackRate = rate
    setPlaybackRate(rate)
  }, [])

  if (!file) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No video selected
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Select a video from the media library to start editing
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-black rounded-lg overflow-hidden ${className}`}>
      {/* Video Element */}
      <div className="relative">
        <video
          ref={videoRef}
          className="w-full h-full"
          preload="metadata"
          poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIFZpZGVvPC90ZXh0Pjwvc3ZnPg=="
        >
          <source src={`placeholder-${file.id}`} type={`video/${file.format}`} />
          Your browser does not support the video tag.
        </video>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 bg-red-900 bg-opacity-75 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-4xl mb-2">⚠️</div>
              <p className="text-lg font-medium">{error}</p>
              <p className="text-sm opacity-75">Unable to load video file</p>
            </div>
          </div>
        )}

        {/* Play Button Overlay */}
        {!isPlaying && !isLoading && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={handlePlayPause}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-4 transition-all"
            >
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Enhanced Playback Controls */}
      <PlaybackControls
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        playbackRate={playbackRate}
        onPlayPause={handlePlayPause}
        onSeek={handleSeek}
        onVolumeChange={handleVolumeChange}
        onMuteToggle={handleMuteToggle}
        onFullscreen={handleFullscreen}
        onFrameStep={handleFrameStep}
        onPlaybackRateChange={handlePlaybackRateChange}
      />
    </div>
  )
}

export default VideoPlayer
