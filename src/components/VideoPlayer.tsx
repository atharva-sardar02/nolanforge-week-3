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
  externalIsPlaying?: boolean // Control playback from parent
  seekToTime?: number // External seek control
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  file,
  className = '',
  onTimeUpdate,
  onLoadedMetadata,
  onPlay,
  onPause,
  onSeek,
  externalIsPlaying,
  seekToTime
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
    if (!file || !videoRef.current) return
    
    const video = videoRef.current
    console.log('Loading video file:', { name: file.name, path: file.path, duration: file.duration })
    
    setIsLoading(true)
    setError(null)
    
    // If we already have duration from file metadata, use it immediately
    if (file.duration) {
      setDuration(file.duration)
      console.log('Set duration from file metadata:', file.duration)
    }
    
    const handleLoadedMetadata = () => {
      const videoDuration = video.duration
      console.log('Video metadata loaded, duration:', videoDuration)
      setDuration(videoDuration)
      setIsLoading(false)
      onLoadedMetadata?.(videoDuration)
    }
    
    const handleError = (e: Event) => {
      console.error('Video error:', e)
      setError('Failed to load video')
      setIsLoading(false)
    }
    
    const handleLoadedData = () => {
      console.log('Video data loaded')
      setIsLoading(false)
    }
    
    const handleCanPlay = () => {
      console.log('Video can play')
      setIsLoading(false)
    }
    
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('error', handleError)
    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('canplay', handleCanPlay)
    
    // Only load if src changed
    if (video.src !== file.path) {
      video.src = file.path
      video.load()
    } else {
      // If already loaded, just set loading to false
      if (video.readyState >= 1) {
        setIsLoading(false)
      }
    }
    
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('error', handleError)
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('canplay', handleCanPlay)
    }
  }, [file?.id]) // Only re-run when file ID changes

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

  // Handle external play/pause control
  useEffect(() => {
    const video = videoRef.current
    if (!video || externalIsPlaying === undefined) return

    if (externalIsPlaying && video.paused) {
      video.play()
      setIsPlaying(true)
    } else if (!externalIsPlaying && !video.paused) {
      video.pause()
      setIsPlaying(false)
    }
  }, [externalIsPlaying])

  // Handle external seek control
  useEffect(() => {
    const video = videoRef.current
    if (!video || seekToTime === undefined) return

    // Only seek if the time is significantly different (avoid loops)
    if (Math.abs(video.currentTime - seekToTime) > 0.1) {
      video.currentTime = seekToTime
      setCurrentTime(seekToTime)
    }
  }, [seekToTime])

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
    <div className={`bg-black rounded-lg overflow-hidden flex flex-col ${className}`}>
      {/* Video Element */}
      <div className="relative flex-1 flex items-center justify-center bg-black min-h-0">
        <video
          ref={videoRef}
          key={file.path}
          src={file.path}
          className="w-full h-full object-contain"
          preload="metadata"
        >
          Your browser does not support the video tag.
        </video>

        {/* Loading Overlay */}
        {isLoading && !isPlaying && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mb-4"></div>
              <p className="text-white text-lg font-semibold">Loading video...</p>
            </div>
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 bg-red-900 bg-opacity-75 flex items-center justify-center z-10">
            <div className="text-center text-white">
              <div className="text-4xl mb-2">⚠️</div>
              <p className="text-lg font-medium">{error}</p>
              <p className="text-sm opacity-75">Unable to load video file</p>
            </div>
          </div>
        )}

        {/* Play Button Overlay */}
        {!isPlaying && !isLoading && !error && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <button
              onClick={handlePlayPause}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-4 transition-all pointer-events-auto"
            >
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Enhanced Playback Controls - Outside video area */}
      <div className="flex-shrink-0">
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
    </div>
  )
}

export default VideoPlayer
