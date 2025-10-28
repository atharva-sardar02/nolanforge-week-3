/**
 * Video composition utilities for multi-track editing
 * UPDATED: Fixed gap detection logic - force refresh
 */
import { MediaFile } from '../state/mediaStore'
import { TimelineClip } from '../state/editState'

export interface VideoCompositionOptions {
  width: number
  height: number
  backgroundColor?: string
  overlayOpacity?: number
  overlayBlendMode?: 'normal' | 'multiply' | 'screen' | 'overlay'
}

export interface TrackComposition {
  trackId: number
  clip: TimelineClip
  mediaFile: MediaFile
  position: { x: number; y: number }
  size: { width: number; height: number }
  opacity: number
  blendMode: 'normal' | 'multiply' | 'screen' | 'overlay'
  visible: boolean
}

export class VideoComposer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private videoElements: Map<string, HTMLVideoElement> = new Map()
  private options: VideoCompositionOptions
  private lastCompositionTime: number = -1

  constructor(canvas: HTMLCanvasElement, options: VideoCompositionOptions) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.options = options
    
    // Set canvas size
    this.canvas.width = options.width
    this.canvas.height = options.height
  }

  /**
   * Create or get video element for a clip
   */
  private getVideoElement(clip: TimelineClip, mediaFile: MediaFile): HTMLVideoElement {
    const key = `${clip.id}_${mediaFile.id}`
    
    if (!this.videoElements.has(key)) {
      const video = document.createElement('video')
      
      // Try to load video without audio by using a different approach
      // Create a video element that only loads video tracks
      video.muted = true
      video.volume = 0
      video.loop = false
      video.preload = 'metadata'
      video.style.display = 'none'
      video.crossOrigin = 'anonymous'
      
      // Set attributes to disable audio
      video.setAttribute('muted', 'true')
      video.setAttribute('volume', '0')
      video.setAttribute('playsinline', 'true')
      
      // Add event listeners to ensure audio stays disabled
      const ensureMuted = () => {
        video.muted = true
        video.volume = 0
        video.setAttribute('muted', 'true')
        video.setAttribute('volume', '0')
        
        // Try to disable audio tracks
        if (video.audioTracks) {
          for (let i = 0; i < video.audioTracks.length; i++) {
            video.audioTracks[i].enabled = false
          }
        }
      }
      
      video.addEventListener('loadedmetadata', ensureMuted)
      video.addEventListener('canplay', ensureMuted)
      video.addEventListener('play', ensureMuted)
      video.addEventListener('timeupdate', ensureMuted)
      
      // Set source after setting up event listeners
      video.src = mediaFile.path
      
      // Add to DOM to ensure proper loading
      document.body.appendChild(video)
      
      this.videoElements.set(key, video)
    }
    
    // Ensure video remains muted every time we access it
    const video = this.videoElements.get(key)!
    video.muted = true
    video.volume = 0
    video.setAttribute('muted', 'true')
    video.setAttribute('volume', '0')
    
    return this.videoElements.get(key)!
  }

  /**
   * Update video element time based on global timeline time
   */
  private updateVideoTime(video: HTMLVideoElement, clip: TimelineClip, globalTime: number, isPlaying: boolean): void {
    // Aggressively ensure video is always muted
    video.muted = true
    video.volume = 0
    video.setAttribute('muted', 'true')
    video.setAttribute('volume', '0')
    
    // Disable audio tracks if possible
    if (video.audioTracks) {
      for (let i = 0; i < video.audioTracks.length; i++) {
        video.audioTracks[i].enabled = false
      }
    }
    
    if (globalTime < clip.startTime || globalTime > clip.startTime + clip.duration) {
      // Video is outside its time range
      if (!video.paused) {
        video.pause()
      }
      return
    }

    const localTime = globalTime - clip.startTime
    const sourceTime = clip.trimStart + localTime
    
    // Only seek if the time difference is significant (reduced threshold for smoother playback)
    if (Math.abs(video.currentTime - sourceTime) > 0.05) {
      video.currentTime = sourceTime
    }

    // Play/pause based on global playing state
    if (isPlaying && video.paused && video.readyState >= 3) {
      video.play().catch(console.error)
    } else if (!isPlaying && !video.paused) {
      video.pause()
    }
  }

  /**
   * Compose multiple video tracks into a single canvas
   * FORCE REFRESH - Updated gap detection logic
   */
  compose(
    tracks: TrackComposition[],
    globalTime: number,
    isPlaying: boolean
  ): void {
    console.log('🚀 NEW GAP DETECTION LOGIC - VideoComposer.compose called:', { tracksCount: tracks.length, globalTime, isPlaying, timestamp: Date.now() })
    console.log('🔥 FORCE RELOAD - Time diff check removed!')
    
    // Update last composition time for reference
    this.lastCompositionTime = globalTime
    console.log('✅ Proceeding with composition - NO TIME DIFF CHECK')

    // Only clear canvas if we have tracks to render
    if (tracks.length === 0) {
      console.log('🖤 No tracks - showing blank screen with message')
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      if (this.options.backgroundColor) {
        this.ctx.fillStyle = this.options.backgroundColor
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
      }
      
      // Draw blank screen message
      this.drawBlankScreenMessage()
      return
    }

    // Sort tracks by trackId (Track 0 = background, Track 1+ = overlays)
    const sortedTracks = tracks
      .filter(track => track.visible)
      .sort((a, b) => a.trackId - b.trackId)

    // For each track, find the specific clip that should be playing at the current time
    // This matches the single-track logic approach
    const activeTracks = sortedTracks.filter(track => {
      const clipStart = track.clip.startTime
      const clipEnd = track.clip.startTime + track.clip.duration
      const isActive = globalTime >= clipStart && globalTime <= clipEnd
      
      console.log(`🔍 Track ${track.trackId} clip check:`, {
        globalTime,
        clipStart,
        clipEnd,
        isActive,
        clipId: track.clip.id
      })
      
      return isActive
    })
    
    console.log('🎯 Active tracks (not in gap):', activeTracks.length, 'out of', sortedTracks.length)
    console.log('🔍 Gap detection details:', {
      globalTime,
      tracks: sortedTracks.map(track => ({
        trackId: track.trackId,
        clipStartTime: track.clip.startTime,
        clipDuration: track.clip.duration,
        clipEndTime: track.clip.startTime + track.clip.duration,
        isActive: globalTime >= track.clip.startTime && globalTime <= (track.clip.startTime + track.clip.duration)
      }))
    })
    
    // Log each track individually for better visibility
    sortedTracks.forEach(track => {
      const isActive = globalTime >= track.clip.startTime && globalTime <= (track.clip.startTime + track.clip.duration)
      console.log(`📊 Track ${track.trackId}:`, {
        clipStartTime: track.clip.startTime,
        clipDuration: track.clip.duration,
        clipEndTime: track.clip.startTime + track.clip.duration,
        globalTime: globalTime,
        isActive: isActive,
        isBeforeStart: globalTime < track.clip.startTime,
        isAfterEnd: globalTime > (track.clip.startTime + track.clip.duration)
      })
    })
    
    // If no tracks are active, we're in a gap - show blank screen with message
    if (activeTracks.length === 0) {
      console.log('🖤 In gap - showing blank screen with message')
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      if (this.options.backgroundColor) {
        this.ctx.fillStyle = this.options.backgroundColor
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
      }
      
      // Draw blank screen message
      this.drawBlankScreenMessage()
      return
    }

    // Check if any video is ready before clearing canvas
    let hasReadyVideo = false
    for (const track of activeTracks) {
      const video = this.getVideoElement(track.clip, track.mediaFile)
      console.log(`📹 Video ${track.clip.id} readyState:`, video.readyState)
      if (video.readyState >= 2) { // Reduced back to HAVE_CURRENT_DATA
        hasReadyVideo = true
        break
      }
    }
    
    console.log('🎥 Has ready video:', hasReadyVideo)

    // Only clear and redraw if we have ready videos
    if (hasReadyVideo) {
      console.log('🚨 ENTERING CANVAS DRAWING BLOCK')
      console.log('🎨 Drawing to canvas...')
      console.log('📐 Canvas dimensions:', { width: this.canvas.width, height: this.canvas.height })
      
      // Clear canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      console.log('🧹 Canvas cleared')
      
      // Fill background
      if (this.options.backgroundColor) {
        this.ctx.fillStyle = this.options.backgroundColor
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
        console.log('🖤 Background filled with:', this.options.backgroundColor)
      }

      // Render only active tracks (not in gaps)
      console.log('🎬 Rendering', activeTracks.length, 'active tracks')
      for (const track of activeTracks) {
        const video = this.getVideoElement(track.clip, track.mediaFile)
        
        console.log(`📹 Processing track ${track.trackId}:`, {
          videoReadyState: video.readyState,
          videoCurrentTime: video.currentTime,
          videoDuration: video.duration,
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight,
          videoPaused: video.paused,
          videoSrc: video.src,
          globalTime: globalTime,
          clipStartTime: track.clip.startTime,
          clipDuration: track.clip.duration,
          clipEndTime: track.clip.startTime + track.clip.duration
        })
        
        // Update video time
        this.updateVideoTime(video, track.clip, globalTime, isPlaying)
        
        // Skip if video is not ready (allow readyState 1 - HAVE_METADATA)
        if (video.readyState < 1) {
          console.log(`⏭️ Skipping track ${track.trackId} - not ready (readyState: ${video.readyState})`)
          continue
        }
        
        console.log(`🎬 Drawing track ${track.trackId}:`, {
          position: track.position,
          size: track.size,
          opacity: track.opacity,
          videoCurrentTime: video.currentTime
        })
        
        // Set composition properties
        this.ctx.globalAlpha = track.opacity
        this.ctx.globalCompositeOperation = track.blendMode
        
        // Draw video frame
        this.ctx.drawImage(
          video,
          track.position.x,
          track.position.y,
          track.size.width,
          track.size.height
        )
        
        console.log(`✅ Track ${track.trackId} drawn successfully`)
      }

      // Reset composition properties
      this.ctx.globalAlpha = 1
      this.ctx.globalCompositeOperation = 'source-over'
      console.log('✅ Canvas drawing complete')
    } else {
      console.log('❌ No ready videos - skipping canvas drawing')
    }
  }

  /**
   * Get default overlay position and size for a track
   */
  static getDefaultOverlaySettings(trackId: number, canvasWidth: number, canvasHeight: number): {
    position: { x: number; y: number }
    size: { width: number; height: number }
  } {
    if (trackId === 0) {
      // Main track fills entire canvas
      return {
        position: { x: 0, y: 0 },
        size: { width: canvasWidth, height: canvasHeight }
      }
    } else {
      // Overlay tracks are positioned in bottom-right corner
      const overlayWidth = canvasWidth * 0.3
      const overlayHeight = canvasHeight * 0.3
      return {
        position: { 
          x: canvasWidth - overlayWidth - 20, 
          y: canvasHeight - overlayHeight - 20 
        },
        size: { width: overlayWidth, height: overlayHeight }
      }
    }
  }

  /**
   * Clean up video elements
   */
  cleanup(): void {
    this.videoElements.forEach(video => {
      video.pause()
      video.src = ''
      video.remove() // Remove from DOM
    })
    this.videoElements.clear()
  }

  /**
   * Draw blank screen message
   */
  private drawBlankScreenMessage(): void {
    console.log('🎨 Drawing blank screen message on canvas:', { width: this.canvas.width, height: this.canvas.height })
    
    const centerX = this.canvas.width / 2
    const centerY = this.canvas.height / 2
    
    console.log('📍 Message position:', { centerX, centerY })
    
    // Set text properties
    this.ctx.fillStyle = '#FFFFFF' // white for better visibility
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    
    // Draw "Blank Screen" text (larger and simpler)
    this.ctx.font = 'bold 32px Arial'
    this.ctx.fillText('Blank Screen', centerX, centerY - 20)
    
    // Draw subtitle
    this.ctx.font = '16px Arial'
    this.ctx.fillStyle = '#CCCCCC' // lighter gray
    this.ctx.fillText('Gap between clips', centerX, centerY + 20)
    
    console.log('✅ Blank screen message drawn')
  }

  /**
   * Update canvas size
   */
  resize(width: number, height: number): void {
    this.canvas.width = width
    this.canvas.height = height
    this.options.width = width
    this.options.height = height
  }
}

/**
 * Create a video composition from timeline clips
 */
export function createTrackComposition(
  clips: TimelineClip[],
  mediaFiles: MediaFile[],
  globalTime: number,
  canvasWidth: number,
  canvasHeight: number
): TrackComposition[] {
  const compositions: TrackComposition[] = []
  
  for (const clip of clips) {
    const mediaFile = mediaFiles.find(f => f.id === clip.mediaFileId)
    if (!mediaFile) continue
    
    // Check if clip is active at current time
    if (globalTime < clip.startTime || globalTime > clip.startTime + clip.duration) {
      continue
    }
    
    // Use overlay properties if available, otherwise use defaults
    const position = clip.overlayPosition || VideoComposer.getDefaultOverlaySettings(clip.trackId, canvasWidth, canvasHeight).position
    const size = clip.overlaySize || VideoComposer.getDefaultOverlaySettings(clip.trackId, canvasWidth, canvasHeight).size
    const opacity = clip.overlayOpacity ?? (clip.trackId === 0 ? 1 : 0.8)
    const blendMode = clip.overlayBlendMode || 'normal'
    const visible = clip.overlayVisible ?? true
    
    compositions.push({
      trackId: clip.trackId,
      clip,
      mediaFile,
      position,
      size,
      opacity,
      blendMode,
      visible
    })
  }
  
  return compositions
}
