import { create } from 'zustand'

export interface Track {
  id: number
  name: string
  muted: boolean
  solo: boolean
  locked: boolean
  visible: boolean
  height: number
  color: string
}

export interface TrackState {
  // Track data
  tracks: Track[]
  selectedTrackId: number
  maxTrackId: number
  
  // Track actions
  addTrack: () => void
  removeTrack: (trackId: number) => void
  selectTrack: (trackId: number) => void
  updateTrack: (trackId: number, updates: Partial<Track>) => void
  
  // Track controls
  setTrackMute: (trackId: number, muted: boolean) => void
  setTrackSolo: (trackId: number, solo: boolean) => void
  setTrackLock: (trackId: number, locked: boolean) => void
  setTrackVisibility: (trackId: number, visible: boolean) => void
  
  // Track utilities
  getTrackById: (trackId: number) => Track | undefined
  getVisibleTracks: () => Track[]
  canRemoveTrack: (trackId: number) => boolean
}

// Default track configuration
const DEFAULT_TRACK_HEIGHT = 60
const TRACK_COLORS = [
  '#3b82f6', // Blue for main track
  '#ef4444', // Red for overlay track 1
  '#10b981', // Green for overlay track 2
  '#f59e0b', // Yellow for overlay track 3
  '#8b5cf6', // Purple for overlay track 4
]

export const useTrackState = create<TrackState>((set, get) => ({
  // Initial state - start with 2 tracks (main + overlay)
  tracks: [
    {
      id: 0,
      name: 'Main Video',
      muted: false,
      solo: false,
      locked: false,
      visible: true,
      height: DEFAULT_TRACK_HEIGHT,
      color: TRACK_COLORS[0]
    },
    {
      id: 1,
      name: 'Overlay Track',
      muted: false,
      solo: false,
      locked: false,
      visible: true,
      height: DEFAULT_TRACK_HEIGHT,
      color: TRACK_COLORS[1]
    }
  ],
  selectedTrackId: 0,
  maxTrackId: 1,

  // Track actions
  addTrack: () => {
    const state = get()
    const newTrackId = state.maxTrackId + 1
    const newTrack: Track = {
      id: newTrackId,
      name: `Track ${newTrackId}`,
      muted: false,
      solo: false,
      locked: false,
      visible: true,
      height: DEFAULT_TRACK_HEIGHT,
      color: TRACK_COLORS[newTrackId % TRACK_COLORS.length]
    }
    
    set({
      tracks: [...state.tracks, newTrack],
      maxTrackId: newTrackId,
      selectedTrackId: newTrackId
    })
  },

  removeTrack: (trackId: number) => {
    const state = get()
    
    // Don't allow removing track 0 (main track)
    if (trackId === 0) return
    
    // Don't allow removing if it's the only overlay track
    const overlayTracks = state.tracks.filter(t => t.id > 0)
    if (overlayTracks.length <= 1 && trackId > 0) return
    
    const updatedTracks = state.tracks.filter(t => t.id !== trackId)
    const newSelectedTrackId = state.selectedTrackId === trackId ? 0 : state.selectedTrackId
    
    set({
      tracks: updatedTracks,
      selectedTrackId: newSelectedTrackId
    })
  },

  selectTrack: (trackId: number) => {
    set({ selectedTrackId: trackId })
  },

  updateTrack: (trackId: number, updates: Partial<Track>) => {
    const state = get()
    const updatedTracks = state.tracks.map(track =>
      track.id === trackId ? { ...track, ...updates } : track
    )
    set({ tracks: updatedTracks })
  },

  // Track controls
  setTrackMute: (trackId: number, muted: boolean) => {
    get().updateTrack(trackId, { muted })
  },

  setTrackSolo: (trackId: number, solo: boolean) => {
    const state = get()
    
    // If soloing this track, unsolo all others
    if (solo) {
      const updatedTracks = state.tracks.map(track =>
        track.id === trackId ? { ...track, solo: true } : { ...track, solo: false }
      )
      set({ tracks: updatedTracks })
    } else {
      get().updateTrack(trackId, { solo: false })
    }
  },

  setTrackLock: (trackId: number, locked: boolean) => {
    get().updateTrack(trackId, { locked })
  },

  setTrackVisibility: (trackId: number, visible: boolean) => {
    get().updateTrack(trackId, { visible })
  },

  // Track utilities
  getTrackById: (trackId: number) => {
    return get().tracks.find(track => track.id === trackId)
  },

  getVisibleTracks: () => {
    return get().tracks.filter(track => track.visible)
  },

  canRemoveTrack: (trackId: number) => {
    const state = get()
    // Can't remove track 0 (main track)
    if (trackId === 0) return false
    
    // Can't remove if it's the only overlay track
    const overlayTracks = state.tracks.filter(t => t.id > 0)
    return overlayTracks.length > 1
  }
}))
