import { create } from 'zustand'
import { TimelineClip } from './editState'
import { TimelineOperation, validateTimelineOperation, calculateTotalDuration } from '../utils/timelineOps'

export interface TimelineState {
  // Timeline data
  clips: TimelineClip[]
  selectedClipId: string | null
  
  // Timeline view settings
  zoomLevel: number // Pixels per second
  scrollPosition: number // Horizontal scroll position
  snapToGrid: boolean
  gridSize: number // Seconds
  
  // Timeline operations history for undo/redo
  operationHistory: TimelineOperation[]
  historyIndex: number
  
  // UI state
  isLoading: boolean
  error: string | null
  
  // Actions
  addClip: (mediaFile: any, trackId: number, startTime: number) => void
  removeClip: (clipId: string) => void
  moveClip: (clipId: string, newTrackId: number, newStartTime: number) => void
  selectClip: (clipId: string | null) => void
  updateClipTrim: (clipId: string, trimStart: number, trimEnd: number) => void
  splitClip: (clipId: string, splitTime: number) => void
  
  // Timeline view actions
  setZoomLevel: (zoom: number) => void
  setScrollPosition: (position: number) => void
  toggleSnapToGrid: () => void
  setGridSize: (size: number) => void
  
  // History actions
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  
  // UI actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  
  // Computed values
  getTotalDuration: () => number
  getSelectedClip: () => TimelineClip | undefined
  getClipsOnTrack: (trackId: number) => TimelineClip[]
}

export const useTimelineState = create<TimelineState>((set, get) => ({
  // Initial state
  clips: [],
  selectedClipId: null,
  zoomLevel: 100, // 100 pixels per second
  scrollPosition: 0,
  snapToGrid: true,
  gridSize: 1, // 1 second grid
  operationHistory: [],
  historyIndex: -1,
  isLoading: false,
  error: null,

  // Clip actions
  addClip: (mediaFile, trackId, startTime) => {
    const state = get()
    const operation: TimelineOperation = {
      type: 'add',
      clipId: '',
      data: { mediaFile, trackId, startTime },
      timestamp: Date.now()
    }
    
    const validation = validateTimelineOperation(state.clips, operation)
    if (!validation.isValid) {
      set({ error: validation.errors.join(', ') })
      return
    }
    
    const newClip: TimelineClip = {
      id: `clip-${Date.now()}-${Math.random()}`,
      mediaFileId: mediaFile.id,
      trackId,
      startTime: state.snapToGrid ? Math.round(startTime / state.gridSize) * state.gridSize : startTime,
      duration: mediaFile.duration || 10,
      trimStart: 0,
      trimEnd: mediaFile.duration || 10,
      sourceDuration: mediaFile.duration || 10
    }
    
    operation.clipId = newClip.id
    
    set({
      clips: [...state.clips, newClip],
      operationHistory: [...state.operationHistory.slice(0, state.historyIndex + 1), operation],
      historyIndex: state.historyIndex + 1,
      error: null
    })
  },

  removeClip: (clipId) => {
    const state = get()
    const operation: TimelineOperation = {
      type: 'remove',
      clipId,
      data: {},
      timestamp: Date.now()
    }
    
    set({
      clips: state.clips.filter(clip => clip.id !== clipId),
      selectedClipId: state.selectedClipId === clipId ? null : state.selectedClipId,
      operationHistory: [...state.operationHistory.slice(0, state.historyIndex + 1), operation],
      historyIndex: state.historyIndex + 1,
      error: null
    })
  },

  moveClip: (clipId, newTrackId, newStartTime) => {
    const state = get()
    const operation: TimelineOperation = {
      type: 'move',
      clipId,
      data: { newTrackId, newStartTime },
      timestamp: Date.now()
    }
    
    const validation = validateTimelineOperation(state.clips, operation)
    if (!validation.isValid) {
      set({ error: validation.errors.join(', ') })
      return
    }
    
    const snappedStartTime = state.snapToGrid 
      ? Math.round(newStartTime / state.gridSize) * state.gridSize 
      : newStartTime
    
    const updatedClips = state.clips.map(clip =>
      clip.id === clipId
        ? { ...clip, trackId: newTrackId, startTime: snappedStartTime }
        : clip
    )
    
    set({
      clips: updatedClips,
      operationHistory: [...state.operationHistory.slice(0, state.historyIndex + 1), operation],
      historyIndex: state.historyIndex + 1,
      error: null
    })
  },

  selectClip: (clipId) => {
    set({ selectedClipId: clipId })
  },

  updateClipTrim: (clipId, trimStart, trimEnd) => {
    const state = get()
    const operation: TimelineOperation = {
      type: 'trim',
      clipId,
      data: { trimStart, trimEnd },
      timestamp: Date.now()
    }
    
    const validation = validateTimelineOperation(state.clips, operation)
    if (!validation.isValid) {
      set({ error: validation.errors.join(', ') })
      return
    }
    
    const updatedClips = state.clips.map(clip => {
      if (clip.id === clipId) {
        const newDuration = trimEnd - trimStart
        return { ...clip, trimStart, trimEnd, duration: newDuration }
      }
      return clip
    })
    
    set({
      clips: updatedClips,
      operationHistory: [...state.operationHistory.slice(0, state.historyIndex + 1), operation],
      historyIndex: state.historyIndex + 1,
      error: null
    })
  },

  splitClip: (clipId, splitTime) => {
    const state = get()
    const clipToSplit = state.clips.find(c => c.id === clipId)
    if (!clipToSplit) return
    
    const operation: TimelineOperation = {
      type: 'split',
      clipId,
      data: { splitTime },
      timestamp: Date.now()
    }
    
    const validation = validateTimelineOperation(state.clips, operation)
    if (!validation.isValid) {
      set({ error: validation.errors.join(', ') })
      return
    }
    
    const relativeTime = splitTime - clipToSplit.startTime
    
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
    
    const updatedClips = state.clips.map(clip =>
      clip.id === clipId ? clip1 : clip
    ).concat(clip2)
    
    set({
      clips: updatedClips,
      operationHistory: [...state.operationHistory.slice(0, state.historyIndex + 1), operation],
      historyIndex: state.historyIndex + 1,
      error: null
    })
  },

  // Timeline view actions
  setZoomLevel: (zoom) => {
    set({ zoomLevel: Math.max(10, Math.min(1000, zoom)) })
  },

  setScrollPosition: (position) => {
    set({ scrollPosition: Math.max(0, position) })
  },

  toggleSnapToGrid: () => {
    set(state => ({ snapToGrid: !state.snapToGrid }))
  },

  setGridSize: (size) => {
    set({ gridSize: Math.max(0.1, size) })
  },

  // History actions
  undo: () => {
    const state = get()
    if (state.historyIndex >= 0) {
      // Implementation would restore previous state
      set({ historyIndex: state.historyIndex - 1 })
    }
  },

  redo: () => {
    const state = get()
    if (state.historyIndex < state.operationHistory.length - 1) {
      // Implementation would restore next state
      set({ historyIndex: state.historyIndex + 1 })
    }
  },

  canUndo: () => {
    const state = get()
    return state.historyIndex >= 0
  },

  canRedo: () => {
    const state = get()
    return state.historyIndex < state.operationHistory.length - 1
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
  getTotalDuration: () => {
    const state = get()
    return calculateTotalDuration(state.clips)
  },

  getSelectedClip: () => {
    const state = get()
    return state.clips.find(clip => clip.id === state.selectedClipId)
  },

  getClipsOnTrack: (trackId) => {
    const state = get()
    return state.clips.filter(clip => clip.trackId === trackId)
  }
}))
