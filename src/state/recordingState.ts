import { create } from 'zustand'

export type RecordingStatus = 'idle' | 'recording' | 'stopped' | 'error'

export type RecordingQuality = 'low' | 'medium' | 'high'

export type RecordingFormat = 'webm' | 'mp4'

export interface RecordingSettings {
  quality: RecordingQuality
  format: RecordingFormat
  audioEnabled: boolean
  videoEnabled: boolean
  frameRate: number
  resolution: {
    width: number
    height: number
  }
}

export interface RecordingState {
  // Recording status
  status: RecordingStatus
  isRecording: boolean
  
  // Recording settings
  settings: RecordingSettings
  
  // Recording data
  duration: number // in seconds
  startTime: number | null
  recordedBlob: Blob | null
  
  // Media streams
  videoStream: MediaStream | null
  audioStream: MediaStream | null
  
  // Error handling
  error: string | null
  
  // Actions
  setStatus: (status: RecordingStatus) => void
  setSettings: (settings: Partial<RecordingSettings>) => void
  setDuration: (duration: number) => void
  setStartTime: (startTime: number | null) => void
  setRecordedBlob: (blob: Blob | null) => void
  setVideoStream: (stream: MediaStream | null) => void
  setAudioStream: (stream: MediaStream | null) => void
  setError: (error: string | null) => void
  
  // Recording control actions
  startRecording: () => void
  stopRecording: () => void
  pauseRecording: () => void
  resumeRecording: () => void
  resetRecording: () => void
  
  // Utility actions
  updateDuration: () => void
  getFormattedDuration: () => string
}

const defaultSettings: RecordingSettings = {
  quality: 'high',
  format: 'mp4',
  audioEnabled: true,
  videoEnabled: true,
  frameRate: 30,
  resolution: {
    width: 1920,
    height: 1080
  }
}

export const useRecordingState = create<RecordingState>((set, get) => ({
  // Initial state
  status: 'idle',
  isRecording: false,
  settings: defaultSettings,
  duration: 0,
  startTime: null,
  recordedBlob: null,
  videoStream: null,
  audioStream: null,
  error: null,
  
  // Status actions
  setStatus: (status: RecordingStatus) => {
    set({ 
      status,
      isRecording: status === 'recording',
      error: status === 'error' ? get().error : null
    })
  },
  
  setSettings: (newSettings: Partial<RecordingSettings>) => {
    set(state => ({
      settings: { ...state.settings, ...newSettings }
    }))
  },
  
  setDuration: (duration: number) => {
    set({ duration: Math.max(0, duration) })
  },
  
  setStartTime: (startTime: number | null) => {
    set({ startTime })
  },
  
  setRecordedBlob: (recordedBlob: Blob | null) => {
    set({ recordedBlob })
  },
  
  setVideoStream: (videoStream: MediaStream | null) => {
    set({ videoStream })
  },
  
  setAudioStream: (audioStream: MediaStream | null) => {
    set({ audioStream })
  },
  
  setError: (error: string | null) => {
    set({ error })
  },
  
  // Recording control actions
  startRecording: () => {
    const now = Date.now()
    set({
      status: 'recording',
      isRecording: true,
      startTime: now,
      duration: 0,
      error: null
    })
  },
  
  stopRecording: () => {
    set({
      status: 'stopped',
      isRecording: false
    })
  },
  
  pauseRecording: () => {
    // Note: MediaRecorder pause/resume is not widely supported
    // This is a placeholder for future implementation
    console.warn('Pause recording not implemented yet')
  },
  
  resumeRecording: () => {
    // Note: MediaRecorder pause/resume is not widely supported
    // This is a placeholder for future implementation
    console.warn('Resume recording not implemented yet')
  },
  
  resetRecording: () => {
    set({
      status: 'idle',
      isRecording: false,
      duration: 0,
      startTime: null,
      recordedBlob: null,
      error: null
    })
  },
  
  // Utility actions
  updateDuration: () => {
    const { startTime } = get()
    if (startTime) {
      const now = Date.now()
      const duration = (now - startTime) / 1000
      set({ duration })
    }
  },
  
  getFormattedDuration: () => {
    const { duration } = get()
    const minutes = Math.floor(duration / 60)
    const seconds = Math.floor(duration % 60)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
}))

// Auto-update duration every second when recording
let durationInterval: number | null = null

useRecordingState.subscribe((state) => {
  if (state.isRecording && !durationInterval) {
    durationInterval = setInterval(() => {
      useRecordingState.getState().updateDuration()
    }, 1000)
  } else if (!state.isRecording && durationInterval) {
    clearInterval(durationInterval)
    durationInterval = null
  }
})
