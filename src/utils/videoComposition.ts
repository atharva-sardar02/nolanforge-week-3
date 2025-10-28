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
      video.src = mediaFile.path
      video.muted = true
      video.loop = false
      video.preload = 'metadata'
      video.style.display = 'none' // Hide the video element
      video.crossOrigin = 'anonymous' // Required for canvas operations
      
      // Add to DOM to ensure proper loading
      document.body.appendChild(video)
      
      this.videoElements.set(key, video)
    }
    
    return this.videoElements.get(key)!
  }

  /**
   * Update video element time based on global timeline time
   */
  private updateVideoTime(video: HTMLVideoElement, clip: TimelineClip, globalTime: number, isPlaying: boolean): void {
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
   * FORCE REFRESH - Updated debugging
   */
  compose(
    tracks: TrackComposition[],
    globalTime: number,
    isPlaying: boolean
  ): void {
    console.log('🎬 VideoComposer.compose called:', { tracksCount: tracks.length, globalTime, isPlaying })
    
    // Only update if time has changed significantly (reduce flickering)
    const timeDiff = Math.abs(globalTime - this.lastCompositionTime)
    if (timeDiff < 0.01) {
      console.log('⏭️ Skipping composition - time diff too small:', timeDiff)
      return // Reduced threshold to prevent black screen
    }
    
    this.lastCompositionTime = globalTime
    console.log('✅ Proceeding with composition')

    // Only clear canvas if we have tracks to render
    if (tracks.length === 0) {
      console.log('🖤 No tracks - clearing canvas')
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      return
    }

    // Sort tracks by trackId (Track 0 = background, Track 1+ = overlays)
    const sortedTracks = tracks
      .filter(track => track.visible)
      .sort((a, b) => a.trackId - b.trackId)

    // Check if any video is ready before clearing canvas
    let hasReadyVideo = false
    for (const track of sortedTracks) {
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

      // Render each track
      console.log('🎬 Rendering', sortedTracks.length, 'tracks')
      for (const track of sortedTracks) {
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
          clipDuration: track.clip.duration
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
