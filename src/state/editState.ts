import { create } from 'zustand'
import { MediaFile } from './mediaStore'

export interface EditState {
  // Current editing session
  currentFile: MediaFile | null
  isPlaying: boolean
  currentTime: number
  duration: number
  
  // Trim points
  trimStart: number
  trimEnd: number
  
  // Playback settings
  volume: number
  isMuted: boolean
  
  // UI state
  isLoading: boolean
  error: string | null
  
  // Actions
  setCurrentFile: (file: MediaFile | null) => void
  setPlaying: (playing: boolean) => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setTrimStart: (time: number) => void
  setTrimEnd: (time: number) => void
  setVolume: (volume: number) => void
  setMuted: (muted: boolean) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  
  // Computed values
  getTrimDuration: () => number
  getTrimProgress: () => number
  isTrimValid: () => boolean
  resetTrim: () => void
}

export const useEditState = create<EditState>((set, get) => ({
  // Initial state
  currentFile: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  trimStart: 0,
  trimEnd: 0,
  volume: 1,
  isMuted: false,
  isLoading: false,
  error: null,

  // Actions
  setCurrentFile: (file) => {
    set({ 
      currentFile: file,
      currentTime: 0,
      trimStart: 0,
      trimEnd: file ? file.duration || 0 : 0,
      error: null
    })
  },

  setPlaying: (playing) => {
    set({ isPlaying: playing })
  },

  setCurrentTime: (time) => {
    set({ currentTime: time })
  },

  setDuration: (duration) => {
    set({ 
      duration,
      trimEnd: duration // Set initial trim end to full duration
    })
  },

  setTrimStart: (time) => {
    const state = get()
    set({ 
      trimStart: time,
      // Ensure trim start is before trim end
      trimEnd: Math.max(time, state.trimEnd)
    })
  },

  setTrimEnd: (time) => {
    const state = get()
    set({ 
      trimEnd: time,
      // Ensure trim end is after trim start
      trimStart: Math.min(time, state.trimStart)
    })
  },

  setVolume: (volume) => {
    set({ volume, isMuted: volume === 0 })
  },

  setMuted: (muted) => {
    set({ isMuted: muted })
  },

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
  getTrimDuration: () => {
    const state = get()
    return state.trimEnd - state.trimStart
  },

  getTrimProgress: () => {
    const state = get()
    if (state.duration === 0) return 0
    return (state.currentTime - state.trimStart) / (state.trimEnd - state.trimStart)
  },

  isTrimValid: () => {
    const state = get()
    return state.trimStart < state.trimEnd && state.trimEnd > 0
  },

  resetTrim: () => {
    const state = get()
    set({
      trimStart: 0,
      trimEnd: state.duration,
      currentTime: 0
    })
  }
}))
