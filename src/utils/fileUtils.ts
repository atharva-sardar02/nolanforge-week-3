import { MediaFile } from '../state/mediaStore'

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

export const createMediaFile = (file: File): MediaFile => {
  const extension = getFileExtension(file.name)
  const isVideo = file.type.startsWith('video/')
  
  return {
    id: generateId(),
    name: file.name,
    path: file.name, // For now, we'll use the filename as path
    size: file.size,
    type: isVideo ? 'video' : 'audio',
    format: extension,
    createdAt: new Date(),
    lastModified: new Date(file.lastModified)
  }
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
