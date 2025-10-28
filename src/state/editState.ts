import { create } from 'zustand'
import { MediaFile } from './mediaStore'

export interface TimelineClip {
  id: string // Unique clip instance ID
  mediaFileId: string // Reference to MediaFile
  trackId: number // Which track (0, 1, 2, etc.)
  startTime: number // When clip starts on timeline (in seconds)
  duration: number // How long clip plays on timeline
  trimStart: number // Trim start for this clip (within source)
  trimEnd: number // Trim end for this clip (within source)
  sourceDuration: number // Original source file duration
  
  // Overlay properties (for Track 1+)
  overlayPosition?: { x: number; y: number }
  overlaySize?: { width: number; height: number }
  overlayOpacity?: number
  overlayBlendMode?: 'normal' | 'multiply' | 'screen' | 'overlay'
  overlayVisible?: boolean
}

export interface EditState {
  // Timeline clips
  timelineClips: TimelineClip[]
  selectedClipId: string | null
  
  // Playback state
  isPlaying: boolean
  currentTime: number // Global timeline time
  
  // Global export trim (for exporting a range across multiple clips)
  globalTrimStart: number // Global timeline trim start
  globalTrimEnd: number | null // Global timeline trim end (null = end of timeline)
  
  // Timeline view settings
  zoomLevel: number // Pixels per second
  scrollPosition: number // Horizontal scroll
  snapToGrid: boolean
  gridSize: number // Seconds
  
  // Playback settings
  volume: number
  isMuted: boolean
  
  // UI state
  isLoading: boolean
  error: string | null
  
  // Timeline clip actions
  addClipToTimeline: (mediaFile: MediaFile, trackId: number, startTime: number) => void
  removeClipFromTimeline: (clipId: string) => void
  moveClip: (clipId: string, newTrackId: number, newStartTime: number) => void
  selectClip: (clipId: string | null) => void
  updateClipTrim: (clipId: string, trimStart: number, trimEnd: number) => void
  updateClipDuration: (clipId: string, duration: number) => void
  updateClip: (clipId: string, updates: Partial<TimelineClip>) => void
  splitClipAtPlayhead: () => void
  clearTimeline: () => void
  
  // Global trim actions
  setGlobalTrimStart: (time: number) => void
  setGlobalTrimEnd: (time: number | null) => void
  resetGlobalTrim: () => void
  
  // Timeline view actions
  setZoomLevel: (zoom: number) => void
  setScrollPosition: (position: number) => void
  toggleSnapToGrid: () => void
  setGridSize: (size: number) => void
  
  // Playback actions
  setPlaying: (playing: boolean) => void
  setCurrentTime: (time: number) => void
  setVolume: (volume: number) => void
  setMuted: (muted: boolean) => void
  
  // UI actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  
  // Computed values
  getSelectedClip: () => TimelineClip | undefined
  getTotalDuration: () => number
  getClipsAtTime: (time: number) => TimelineClip[]
  getClipsByTrack: (trackId: number) => TimelineClip[]
}

export const useEditState = create<EditState>((set, get) => ({
  // Initial state
  timelineClips: [],
  selectedClipId: null,
  isPlaying: false,
  currentTime: 0,
  globalTrimStart: 0,
  globalTrimEnd: null,
  zoomLevel: 50, // 50 pixels per second default
  scrollPosition: 0,
  snapToGrid: true,
  gridSize: 1, // 1 second grid
  volume: 1,
  isMuted: false,
  isLoading: false,
  error: null,

  // Timeline clip actions
  addClipToTimeline: (mediaFile: MediaFile, trackId: number, startTime: number) => {
    const state = get()
    const duration = mediaFile.duration || 10
    
    // Snap to grid if enabled - use more precise rounding
    let snappedStartTime = startTime
    if (state.snapToGrid) {
      // Round to nearest grid interval with higher precision
      snappedStartTime = Math.round((startTime / state.gridSize) * 1000) / 1000 * state.gridSize
    }
    
    const newClip: TimelineClip = {
      id: `clip-${Date.now()}-${Math.random()}`,
      mediaFileId: mediaFile.id,
      trackId,
      startTime: snappedStartTime,
      duration,
      trimStart: 0,
      trimEnd: duration,
      sourceDuration: duration
    }
    
    set({ 
      timelineClips: [...state.timelineClips, newClip],
      error: null
    })
  },

  removeClipFromTimeline: (clipId: string) => {
    const state = get()
    set({ 
      timelineClips: state.timelineClips.filter(clip => clip.id !== clipId),
      selectedClipId: state.selectedClipId === clipId ? null : state.selectedClipId
    })
  },

  moveClip: (clipId: string, newTrackId: number, newStartTime: number) => {
    const state = get()
    
    // Snap to grid if enabled - use more precise rounding
    let snappedStartTime = newStartTime
    if (state.snapToGrid) {
      // Round to nearest grid interval with higher precision
      snappedStartTime = Math.round((newStartTime / state.gridSize) * 1000) / 1000 * state.gridSize
    }
    
    const updatedClips = state.timelineClips.map(clip =>
      clip.id === clipId
        ? { ...clip, trackId: newTrackId, startTime: snappedStartTime }
        : clip
    )
    set({ timelineClips: updatedClips })
  },

  selectClip: (clipId: string | null) => {
    set({ selectedClipId: clipId })
  },

  updateClipTrim: (clipId: string, trimStart: number, trimEnd: number) => {
    const state = get()
    const updatedClips = state.timelineClips.map(clip => {
      if (clip.id === clipId) {
        const newDuration = trimEnd - trimStart
        return { ...clip, trimStart, trimEnd, duration: newDuration }
      }
      return clip
    })
    set({ timelineClips: updatedClips })
  },

  updateClip: (clipId: string, updates: Partial<TimelineClip>) => {
    const state = get()
    const updatedClips = state.timelineClips.map(clip => {
      if (clip.id === clipId) {
        return { ...clip, ...updates }
      }
      return clip
    })
    set({ timelineClips: updatedClips })
  },

  updateClipDuration: (clipId: string, duration: number) => {
    const state = get()
    const updatedClips = state.timelineClips.map(clip =>
      clip.id === clipId
        ? { ...clip, duration }
        : clip
    )
    set({ timelineClips: updatedClips })
  },

  splitClipAtPlayhead: () => {
    const state = get()
    const { currentTime, selectedClipId, timelineClips } = state
    
    const clipToSplit = timelineClips.find(c => c.id === selectedClipId)
    if (!clipToSplit) return
    
    const relativeTime = currentTime - clipToSplit.startTime
    
    // Check if playhead is within the clip
    if (relativeTime <= 0 || relativeTime >= clipToSplit.duration) return
    
    // Create two new clips
    const clip1: TimelineClip = {
      ...clipToSplit,
      id: `clip-${Date.now()}-${Math.random()}`,
      duration: relativeTime,
      trimEnd: clipToSplit.trimStart + relativeTime
    }
    
    const clip2: TimelineClip = {
      ...clipToSplit,
      id: `clip-${Date.now()}-${Math.random()}-2`,
      startTime: clipToSplit.startTime + relativeTime,
      duration: clipToSplit.duration - relativeTime,
      trimStart: clipToSplit.trimStart + relativeTime
    }
    
    // Remove original and add two new clips
    const updatedClips = timelineClips
      .filter(c => c.id !== clipToSplit.id)
      .concat([clip1, clip2])
    
    set({ 
      timelineClips: updatedClips,
      selectedClipId: clip1.id
    })
  },

  clearTimeline: () => {
    set({ 
      timelineClips: [],
      selectedClipId: null,
      currentTime: 0,
      globalTrimStart: 0,
      globalTrimEnd: null
    })
  },

  // Global trim actions
  setGlobalTrimStart: (time: number) => {
    const { globalTrimEnd, getTotalDuration } = get()
    const totalDuration = getTotalDuration()
    const clampedTime = Math.max(0, Math.min(time, totalDuration))
    
    // Ensure start doesn't exceed end
    if (globalTrimEnd !== null && clampedTime >= globalTrimEnd) {
      set({ globalTrimStart: globalTrimEnd - 0.1 })
    } else {
      set({ globalTrimStart: clampedTime })
    }
  },

  setGlobalTrimEnd: (time: number | null) => {
    const { globalTrimStart, getTotalDuration } = get()
    const totalDuration = getTotalDuration()
    
    if (time === null) {
      set({ globalTrimEnd: null })
    } else {
      const clampedTime = Math.max(0, Math.min(time, totalDuration))
      
      // Ensure end doesn't go before start
      if (clampedTime <= globalTrimStart) {
        set({ globalTrimEnd: globalTrimStart + 0.1 })
      } else {
        set({ globalTrimEnd: clampedTime })
      }
    }
  },

  resetGlobalTrim: () => {
    const { getTotalDuration } = get()
    set({ 
      globalTrimStart: 0,
      globalTrimEnd: getTotalDuration()
    })
  },

  // Timeline view actions
  setZoomLevel: (zoom: number) => {
    set({ zoomLevel: Math.max(10, Math.min(200, zoom)) })
  },

  setScrollPosition: (position: number) => {
    set({ scrollPosition: Math.max(0, position) })
  },

  toggleSnapToGrid: () => {
    set(state => ({ snapToGrid: !state.snapToGrid }))
  },

  setGridSize: (size: number) => {
    set({ gridSize: Math.max(0.1, Math.min(10, size)) })
  },

  // Playback actions
  setPlaying: (playing) => {
    set({ isPlaying: playing })
  },

  setCurrentTime: (time) => {
    set({ currentTime: Math.max(0, time) })
  },

  setVolume: (volume) => {
    set({ volume, isMuted: volume === 0 })
  },

  setMuted: (muted) => {
    set({ isMuted: muted })
  },

  // UI actions
  setLoading: (loading) => {
    set({ isLoading: loading })
  },

  setError: (error) => {
    set({ error })
  },

  clearError: () => {
    set({ error: null })
  },

  // Computed values
  getSelectedClip: () => {
    const { selectedClipId, timelineClips } = get()
    return timelineClips.find(clip => clip.id === selectedClipId)
  },

  getTotalDuration: () => {
    const { timelineClips } = get()
    if (timelineClips.length === 0) return 0
    
    return Math.max(
      ...timelineClips.map(clip => clip.startTime + clip.duration)
    )
  },

  getClipsAtTime: (time: number) => {
    const { timelineClips } = get()
    return timelineClips.filter(clip => 
      time >= clip.startTime && time < clip.startTime + clip.duration
    )
  },

  getClipsByTrack: (trackId: number) => {
    const { timelineClips } = get()
    return timelineClips
      .filter(clip => clip.trackId === trackId)
      .sort((a, b) => a.startTime - b.startTime)
  }
}))
