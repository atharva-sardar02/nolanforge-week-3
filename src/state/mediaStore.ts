import { create } from 'zustand'

export interface MediaFile {
  id: string
  name: string
  path: string
  size: number
  duration?: number
  thumbnail?: string
  type: 'video' | 'audio'
  format: string
  createdAt: Date
  lastModified: Date
}

interface MediaStore {
  // State
  files: MediaFile[]
  selectedFileId: string | null
  isLoading: boolean
  error: string | null
  
  // Actions
  addFile: (file: MediaFile) => void
  removeFile: (id: string) => void
  removeFiles: (ids: string[]) => void
  selectFile: (id: string) => void
  clearSelection: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  getFileById: (id: string) => MediaFile | undefined
  getSelectedFile: () => MediaFile | undefined
  clearAllFiles: () => void
}

export const useMediaStore = create<MediaStore>((set, get) => ({
  // Initial state
  files: [],
  selectedFileId: null,
  isLoading: false,
  error: null,

  // Actions
  addFile: (file: MediaFile) => {
    set((state) => ({
      files: [...state.files, file],
      error: null
    }))
  },

  removeFile: (id: string) => {
    set((state) => ({
      files: state.files.filter(file => file.id !== id),
      selectedFileId: state.selectedFileId === id ? null : state.selectedFileId
    }))
  },

  removeFiles: (ids: string[]) => {
    set((state) => ({
      files: state.files.filter(file => !ids.includes(file.id)),
      selectedFileId: ids.includes(state.selectedFileId || '') ? null : state.selectedFileId
    }))
  },

  selectFile: (id: string) => {
    set({ selectedFileId: id })
  },

  clearSelection: () => {
    set({ selectedFileId: null })
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },

  setError: (error: string | null) => {
    set({ error })
  },

  clearError: () => {
    set({ error: null })
  },

  getFileById: (id: string) => {
    return get().files.find(file => file.id === id)
  },

  getSelectedFile: () => {
    const { selectedFileId, files } = get()
    return selectedFileId ? files.find(file => file.id === selectedFileId) : undefined
  },

  clearAllFiles: () => {
    set({ files: [], selectedFileId: null })
  }
}))
