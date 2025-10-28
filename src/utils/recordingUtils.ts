import { MediaFile } from '../state/mediaStore'

export interface RecordingMetadata {
  duration: number
  resolution: {
    width: number
    height: number
  }
  frameRate: number
  quality: 'low' | 'medium' | 'high'
  format: 'webm' | 'mp4'
  audioEnabled: boolean
  timestamp: number
}

export interface RecordingResult {
  blob: Blob
  metadata: RecordingMetadata
  fileName: string
}

/**
 * Generate a unique filename for a recording
 */
export const generateRecordingFileName = (format: 'webm' | 'mp4' = 'mp4'): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const randomId = Math.random().toString(36).substring(2, 8)
  return `recording_${timestamp}_${randomId}.${format}`
}

/**
 * Create a MediaFile object from a recording blob
 */
export const createMediaFileFromRecording = (
  blob: Blob,
  metadata: RecordingMetadata
): MediaFile => {
  const fileName = generateRecordingFileName(metadata.format)
  const blobUrl = URL.createObjectURL(blob)
  
  return {
    id: `recording_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    name: fileName,
    path: blobUrl, // Use blob URL for video player
    originalPath: blobUrl, // For recordings, blob URL is the original path
    size: blob.size,
    type: 'video' as const, // Ensure it matches MediaFile interface
    duration: metadata.duration,
    format: metadata.format,
    createdAt: new Date(metadata.timestamp), // Convert to Date object
    lastModified: new Date(metadata.timestamp) // Add missing lastModified property
  }
}

/**
 * Extract metadata from a video blob
 */
export const extractVideoMetadata = async (blob: Blob): Promise<Partial<RecordingMetadata>> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const url = URL.createObjectURL(blob)
    
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url)
      resolve({
        duration: video.duration,
        resolution: {
          width: video.videoWidth,
          height: video.videoHeight
        },
        frameRate: 30 // Default, actual frame rate is hard to detect
      })
    }
    
    video.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load video metadata'))
    }
    
    video.src = url
  })
}

/**
 * Validate recording settings
 */
export const validateRecordingSettings = (settings: Partial<RecordingMetadata>): string[] => {
  const errors: string[] = []
  
  if (settings.duration && settings.duration < 0) {
    errors.push('Duration must be positive')
  }
  
  if (settings.resolution) {
    if (settings.resolution.width <= 0 || settings.resolution.height <= 0) {
      errors.push('Resolution dimensions must be positive')
    }
    
    if (settings.resolution.width > 4096 || settings.resolution.height > 4096) {
      errors.push('Resolution too high (max 4096x4096)')
    }
  }
  
  if (settings.frameRate && (settings.frameRate < 1 || settings.frameRate > 120)) {
    errors.push('Frame rate must be between 1 and 120 fps')
  }
  
  return errors
}

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

/**
 * Format duration for display
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }
}

/**
 * Check if the browser supports the required recording features
 */
export const checkRecordingSupport = (): {
  supported: boolean
  features: {
    getUserMedia: boolean
    getDisplayMedia: boolean
    MediaRecorder: boolean
    webm: boolean
    mp4: boolean
  }
  errors: string[]
} => {
  const errors: string[] = []
  const features = {
    getUserMedia: !!navigator.mediaDevices?.getUserMedia,
    getDisplayMedia: !!navigator.mediaDevices?.getDisplayMedia,
    MediaRecorder: !!window.MediaRecorder,
    webm: MediaRecorder.isTypeSupported('video/webm'),
    mp4: MediaRecorder.isTypeSupported('video/mp4')
  }
  
  if (!features.getUserMedia) {
    errors.push('getUserMedia is not supported')
  }
  
  if (!features.getDisplayMedia) {
    errors.push('getDisplayMedia is not supported (screen recording)')
  }
  
  if (!features.MediaRecorder) {
    errors.push('MediaRecorder is not supported')
  }
  
  if (!features.webm && !features.mp4) {
    errors.push('No supported video formats available')
  }
  
  return {
    supported: errors.length === 0,
    features,
    errors
  }
}

/**
 * Get the best supported MIME type for recording
 */
export const getBestSupportedMimeType = (): string => {
  const types = [
    'video/mp4;codecs=h264',
    'video/mp4',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm'
  ]
  
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type
    }
  }
  
  return 'video/mp4' // Fallback to MP4
}

/**
 * Create a download link for a recording blob
 */
export const createDownloadLink = (blob: Blob, fileName: string): HTMLAnchorElement => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.style.display = 'none'
  document.body.appendChild(link)
  return link
}

/**
 * Download a recording blob
 */
export const downloadRecording = (blob: Blob, fileName: string): void => {
  const link = createDownloadLink(blob, fileName)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}

/**
 * Save recording to disk using Tauri file system
 */
export const saveRecordingToDisk = async (blob: Blob, fileName: string): Promise<string | null> => {
  try {
    // Convert blob to array buffer
    const arrayBuffer = await blob.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    
    // Use Tauri's dialog API to get save path
    const { save } = await import('@tauri-apps/plugin-dialog')
    const { invoke } = await import('@tauri-apps/api/core')
    
    // Open save dialog
    const filePath = await save({
      defaultPath: fileName,
      filters: [
        {
          name: 'Video Files',
          extensions: ['mp4', 'webm']
        }
      ]
    })
    
    if (filePath) {
      // Use Rust command to save the file
      await invoke('save_recording_to_file', {
        filePath: filePath,
        data: Array.from(uint8Array)
      })
      return filePath
    }
    
    return null
  } catch (error) {
    console.error('Failed to save recording to disk:', error)
    throw error
  }
}

/**
 * Save recording to Downloads folder
 */
export const saveRecordingToDownloads = async (blob: Blob, fileName: string): Promise<string | null> => {
  try {
    // Convert blob to array buffer
    const arrayBuffer = await blob.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    
    // Use Tauri's path API to get Downloads directory
    const { downloadDir } = await import('@tauri-apps/api/path')
    const { invoke } = await import('@tauri-apps/api/core')
    
    // Get Downloads directory
    const downloadsPath = await downloadDir()
    const filePath = `${downloadsPath}/${fileName}`
    
    // Use Rust command to save the file
    await invoke('save_recording_to_file', {
      filePath: filePath,
      data: Array.from(uint8Array)
    })
    
    return filePath
  } catch (error) {
    console.error('Failed to save recording to Downloads:', error)
    throw error
  }
}
