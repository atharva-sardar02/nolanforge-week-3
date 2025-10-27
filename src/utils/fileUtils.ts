import { MediaFile } from '../state/mediaStore'

// Store the actual File objects to maintain reference
const fileObjectCache = new Map<string, File>()

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || ''
}

export const createMediaFile = (file: File): Promise<MediaFile> => {
  return new Promise((resolve) => {
    const extension = getFileExtension(file.name)
    const isVideo = file.type.startsWith('video/')
    const id = generateId()
    
    // Create a blob URL for the file
    const blobUrl = URL.createObjectURL(file)
    
    // Cache the file object
    fileObjectCache.set(id, file)
    
    // Try to get the original file path (works in Tauri/Electron)
    // @ts-ignore - path property exists in Tauri but not in standard File API
    const originalPath = file.path || (file as any).path
    
    const mediaFile: MediaFile = {
      id,
      name: file.name,
      path: blobUrl, // Use blob URL for video playback
      originalPath: originalPath, // Store original file path if available
      size: file.size,
      type: isVideo ? 'video' : 'audio',
      format: extension,
      createdAt: new Date(),
      lastModified: new Date(file.lastModified)
    }
    
    // Extract video duration if it's a video
    if (isVideo) {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.muted = true // Mute to allow autoplay
      
      let resolved = false
      
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true
          console.warn('Video metadata loading timeout for:', file.name)
          video.remove()
          resolve(mediaFile)
        }
      }, 10000) // 10 second timeout
      
      video.onloadedmetadata = () => {
        if (!resolved) {
          resolved = true
          clearTimeout(timeout)
          mediaFile.duration = video.duration
          console.log('Video metadata loaded:', {
            name: file.name,
            duration: video.duration,
            width: video.videoWidth,
            height: video.videoHeight
          })
          video.remove()
          resolve(mediaFile)
        }
      }
      
      video.onerror = (e) => {
        if (!resolved) {
          resolved = true
          clearTimeout(timeout)
          console.error('Error loading video metadata for:', file.name, e)
          video.remove()
          resolve(mediaFile)
        }
      }
      
      // Try to trigger loading by appending to DOM briefly
      video.style.display = 'none'
      document.body.appendChild(video)
      video.src = blobUrl
      video.load()
      
    } else {
      resolve(mediaFile)
    }
  })
}

// Get cached file object
export const getCachedFile = (id: string): File | undefined => {
  return fileObjectCache.get(id)
}

// Clean up cached file
export const cleanupFile = (id: string): void => {
  fileObjectCache.delete(id)
}

export interface ValidationResult {
  valid: boolean
  error?: string
  warnings?: string[]
}

export const validateVideoFile = (file: File): ValidationResult => {
  const warnings: string[] = []
  
  // Check if file exists
  if (!file) {
    return { valid: false, error: 'No file provided' }
  }
  
  // Check file type
  if (!file.type.startsWith('video/')) {
    return { valid: false, error: 'File must be a video' }
  }
  
  // Check supported formats
  const supportedFormats = ['mp4', 'mov', 'avi', 'webm', 'mkv', 'm4v', '3gp']
  const extension = getFileExtension(file.name)
  
  if (!supportedFormats.includes(extension)) {
    return { 
      valid: false, 
      error: `Unsupported format: ${extension}. Supported formats: ${supportedFormats.join(', ')}` 
    }
  }
  
  // Check file size (max 2GB)
  const maxSize = 2 * 1024 * 1024 * 1024 // 2GB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size too large (max 2GB)' }
  }
  
  // Check minimum file size (1MB)
  const minSize = 1024 * 1024 // 1MB
  if (file.size < minSize) {
    warnings.push('File is very small, may not be a valid video')
  }
  
  // Check filename
  if (file.name.length > 255) {
    warnings.push('Filename is very long, may cause issues')
  }
  
  // Check for special characters in filename
  const invalidChars = /[<>:"/\\|?*]/
  if (invalidChars.test(file.name)) {
    warnings.push('Filename contains special characters that may cause issues')
  }
  
  return { valid: true, warnings: warnings.length > 0 ? warnings : undefined }
}

export const validateMultipleFiles = (files: File[]): {
  validFiles: File[]
  invalidFiles: { file: File; error: string }[]
  warnings: { file: File; warnings: string[] }[]
} => {
  const validFiles: File[] = []
  const invalidFiles: { file: File; error: string }[] = []
  const warnings: { file: File; warnings: string[] }[] = []
  
  files.forEach(file => {
    const validation = validateVideoFile(file)
    
    if (!validation.valid) {
      invalidFiles.push({ file, error: validation.error || 'Unknown validation error' })
    } else {
      validFiles.push(file)
      if (validation.warnings && validation.warnings.length > 0) {
        warnings.push({ file, warnings: validation.warnings })
      }
    }
  })
  
  return { validFiles, invalidFiles, warnings }
}

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unknown error occurred'
}
