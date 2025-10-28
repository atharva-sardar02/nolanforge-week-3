import React, { useRef, useEffect, useState, useCallback } from 'react'
import { MediaFile } from '../state/mediaStore'
import { TimelineClip } from '../state/editState'
import { VideoComposer, TrackComposition, createTrackComposition } from '../utils/videoComposition'
import PlaybackControls from './PlaybackControls'

interface MultiTrackVideoPlayerProps {
  clips: TimelineClip[]
  mediaFiles: MediaFile[]
  currentTime: number
  totalDuration: number
  isPlaying: boolean
  className?: string
  onTimeUpdate?: (currentTime: number, duration: number) => void
  onPlay?: () => void
  onPause?: () => void
  onSeek?: (time: number) => void
  onEnded?: () => void
}

const MultiTrackVideoPlayer: React.FC<MultiTrackVideoPlayerProps> = ({
  clips,
  mediaFiles,
  currentTime,
  totalDuration,
  isPlaying,
  className = '',
  onTimeUpdate,
  onPlay,
  onPause,
  onSeek,
  onEnded
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const composerRef = useRef<VideoComposer | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)

  // Initialize video composer
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    
    // Ensure canvas has proper internal dimensions
    canvas.width = rect.width
    canvas.height = rect.height
    
    console.log('🎨 Canvas initialized with dimensions:', { width: canvas.width, height: canvas.height })
    
    composerRef.current = new VideoComposer(canvas, {
      width: rect.width,
      height: rect.height,
      backgroundColor: '#000000'
    })

    return () => {
      if (composerRef.current) {
        composerRef.current.cleanup()
      }
    }
  }, [])

  // Initialize audio element for main track
  useEffect(() => {
    if (!audioRef.current) return

    const audio = audioRef.current
    audio.preload = 'metadata'
    audio.crossOrigin = 'anonymous'
    
    // Ensure audio element is completely separate from video elements
    audio.style.display = 'none'
    audio.muted = false
    audio.volume = volume
    
    console.log('🔊 Audio element initialized')
    
    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [volume])

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !composerRef.current) return
      
      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()
      
      // Update canvas internal dimensions
      canvas.width = rect.width
      canvas.height = rect.height
      
      console.log('🔄 Canvas resized to:', { width: canvas.width, height: canvas.height })
      
      composerRef.current.resize(rect.width, rect.height)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])


  // Handle main track audio playback
  useEffect(() => {
    if (!audioRef.current) return

    const audio = audioRef.current
    
    // Ensure audio element is properly configured
    audio.muted = false // Audio element should NOT be muted
    audio.volume = isMuted ? 0 : volume
    
    // Find the main track (track 0) clip that should be playing at current time
    const mainTrackClip = clips.find(clip => 
      clip.trackId === 0 && 
      currentTime >= clip.startTime && 
      currentTime <= clip.startTime + clip.duration
    )
    
    if (mainTrackClip) {
      const mediaFile = mediaFiles.find(f => f.id === mainTrackClip.mediaFileId)
      if (mediaFile && audio.src !== mediaFile.path) {
        audio.src = mediaFile.path
        console.log('🔊 Loading main track audio:', mediaFile.name)
      }
      
      // Calculate the audio time based on clip timing
      const localTime = currentTime - mainTrackClip.startTime
      const audioTime = mainTrackClip.trimStart + localTime
      
      // Only seek if the time difference is significant
      if (Math.abs(audio.currentTime - audioTime) > 0.1) {
        audio.currentTime = audioTime
      }
      
      // Sync play/pause with video
      if (isPlaying && audio.paused) {
        console.log('🔊 Starting audio playback')
        audio.play().catch(console.error)
      } else if (!isPlaying && !audio.paused) {
        console.log('🔊 Pausing audio playback')
        audio.pause()
      }
    } else {
      // No main track active, pause audio
      if (!audio.paused) {
        console.log('🔊 No main track active, pausing audio')
        audio.pause()
      }
    }
  }, [clips, mediaFiles, currentTime, isPlaying, volume, isMuted])

  // Time advancement effect - advance time and trigger composition
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      const newTime = currentTime + 0.1 // Advance by 100ms
      if (newTime <= totalDuration) {
        onTimeUpdate?.(newTime)
      } else {
        onEnded?.()
      }
    }, 100) // Update every 100ms

    return () => clearInterval(interval)
  }, [isPlaying, currentTime, totalDuration, onTimeUpdate, onEnded])

  // Update composition when time changes or clips change - with lighter throttling
  useEffect(() => {
    if (!composerRef.current || !canvasRef.current) return

    // Lighter throttling to prevent black screen
    const timeoutId = setTimeout(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const compositions = createTrackComposition(
        clips,
        mediaFiles,
        currentTime,
        canvas.width,
        canvas.height
      )

      // Always compose - even during gaps (empty compositions array)
      composerRef.current.compose(compositions, currentTime, isPlaying)
    }, 16) // Throttle to ~60fps (16ms)

    return () => clearTimeout(timeoutId)
  }, [clips, mediaFiles, currentTime, isPlaying])

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      onPause?.()
    } else {
      onPlay?.()
    }
  }, [isPlaying, onPlay, onPause])

  const handleSeek = useCallback((time: number) => {
    onSeek?.(time)
  }, [onSeek])

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
    
    // Apply volume to audio element
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }, [])

  const handleMuteToggle = useCallback(() => {
    if (isMuted) {
      setVolume(1)
      setIsMuted(false)
      if (audioRef.current) {
        audioRef.current.volume = 1
      }
    } else {
      setVolume(0)
      setIsMuted(true)
      if (audioRef.current) {
        audioRef.current.volume = 0
      }
    }
  }, [isMuted])

  const handleFullscreen = useCallback(() => {
    if (canvasRef.current?.requestFullscreen) {
      canvasRef.current.requestFullscreen()
    }
  }, [])

  const handleFrameStep = useCallback((direction: 'forward' | 'backward') => {
    const frameTime = 1 / 30 // Assuming 30fps
    const step = direction === 'forward' ? frameTime : -frameTime
    const newTime = Math.max(0, Math.min(totalDuration, currentTime + step))
    
    onSeek?.(newTime)
  }, [totalDuration, currentTime, onSeek])

  const handlePlaybackRateChange = useCallback((rate: number) => {
    setPlaybackRate(rate)
  }, [])

  if (clips.length === 0) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No clips on timeline
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Add clips to the timeline to start multi-track editing
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-black rounded-lg overflow-hidden flex flex-col ${className}`}>
      {/* Hidden Audio Element for Main Track */}
      <audio
        ref={audioRef}
        style={{ display: 'none' }}
        preload="metadata"
      />
      
      {/* Canvas Video Element */}
      <div className="relative flex-1 flex items-center justify-center bg-black min-h-0">
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain"
          style={{ maxHeight: '100%' }}
        />

        {/* Loading Overlay */}
        {isLoading && !isPlaying && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mb-4"></div>
              <p className="text-white text-lg font-semibold">Composing video...</p>
            </div>
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 bg-red-900 bg-opacity-75 flex items-center justify-center z-10">
            <div className="text-center text-white">
              <div className="text-4xl mb-2">⚠️</div>
              <p className="text-lg font-medium">{error}</p>
              <p className="text-sm opacity-75">Unable to compose video</p>
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

        {/* Multi-Track Indicator */}
        <div className="absolute top-4 left-4 bg-blue-600/80 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-sm font-medium">
          🎵 Multi-Track Mode
        </div>
      </div>

      {/* Enhanced Playback Controls */}
      <div className="flex-shrink-0">
        <PlaybackControls
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={totalDuration}
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

export default MultiTrackVideoPlayer
