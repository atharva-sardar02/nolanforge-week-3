/**
 * Thumbnail generation utilities for video files
 */

// Thumbnail cache to prevent regeneration
const thumbnailCache = new Map<string, string>()

export interface ThumbnailOptions {
  timeOffset?: number // Percentage of video duration (0-1)
  width?: number // Thumbnail width
  height?: number // Thumbnail height
  quality?: number // JPEG quality (0-1)
  format?: 'jpeg' | 'png' | 'webp'
}

const DEFAULT_OPTIONS: Required<ThumbnailOptions> = {
  timeOffset: 0.1, // 10% into the video
  width: 320,
  height: 180,
  quality: 0.8,
  format: 'jpeg'
}

/**
 * Generate a thumbnail from a video URL
 */
export const generateVideoThumbnail = (
  videoUrl: string, 
  options: ThumbnailOptions = {}
): Promise<string> => {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  
  // Create cache key based on URL and options
  const cacheKey = `${videoUrl}_${opts.timeOffset}_${opts.width}_${opts.height}_${opts.quality}_${opts.format}`
  
  // Check cache first
  if (thumbnailCache.has(cacheKey)) {
    console.log('🎬 Using cached thumbnail for:', videoUrl.substring(0, 50) + '...')
    return Promise.resolve(thumbnailCache.get(cacheKey)!)
  }
  
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      reject(new Error('Failed to get canvas context'))
      return
    }
    
    // Configure video element
    video.crossOrigin = 'anonymous'
    video.preload = 'metadata'
    video.muted = true // Required for autoplay
    
    let resolved = false
    
    // Timeout to prevent hanging
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true
        console.warn('Thumbnail generation timeout for:', videoUrl)
        cleanup()
        reject(new Error('Thumbnail generation timeout'))
      }
    }, 15000) // 15 second timeout
    
    const cleanup = () => {
      video.remove()
      canvas.remove()
      clearTimeout(timeout)
    }
    
    video.onloadedmetadata = () => {
      if (resolved) return
      
      try {
        // Calculate thumbnail dimensions maintaining aspect ratio
        const videoAspect = video.videoWidth / video.videoHeight
        const thumbnailAspect = opts.width / opts.height
        
        let thumbnailWidth = opts.width
        let thumbnailHeight = opts.height
        
        if (videoAspect > thumbnailAspect) {
          // Video is wider, fit to width
          thumbnailHeight = opts.width / videoAspect
        } else {
          // Video is taller, fit to height
          thumbnailWidth = opts.height * videoAspect
        }
        
        // Set canvas size
        canvas.width = thumbnailWidth
        canvas.height = thumbnailHeight
        
        // Seek to specific time
        const seekTime = video.duration * opts.timeOffset
        video.currentTime = Math.max(0, Math.min(seekTime, video.duration - 0.1))
        
        console.log('🎬 Generating thumbnail:', {
          videoUrl: videoUrl.substring(0, 50) + '...',
          duration: video.duration,
          seekTime,
          thumbnailSize: `${thumbnailWidth}x${thumbnailHeight}`
        })
      } catch (error) {
        if (!resolved) {
          resolved = true
          cleanup()
          reject(error)
        }
      }
    }
    
    video.onseeked = () => {
      if (resolved) return
      
      try {
        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        // Convert to data URL
        const mimeType = `image/${opts.format}`
        const thumbnail = canvas.toDataURL(mimeType, opts.quality)
        
        // Cache the thumbnail
        thumbnailCache.set(cacheKey, thumbnail)
        
        if (!resolved) {
          resolved = true
          cleanup()
          console.log('✅ Thumbnail generated and cached successfully')
          resolve(thumbnail)
        }
      } catch (error) {
        if (!resolved) {
          resolved = true
          cleanup()
          reject(error)
        }
      }
    }
    
    video.onerror = (e) => {
      if (!resolved) {
        resolved = true
        cleanup()
        console.error('❌ Video error during thumbnail generation:', e)
        reject(new Error('Failed to load video for thumbnail generation'))
      }
    }
    
    video.oncanplay = () => {
      // Video is ready to play, metadata should be loaded
      if (video.duration && !resolved) {
        video.onloadedmetadata?.()
      }
    }
    
    // Start loading the video
    video.src = videoUrl
  })
}

/**
 * Generate multiple thumbnails from a video (start, middle, end)
 */
export const generateMultipleThumbnails = (
  videoUrl: string,
  count: number = 3,
  options: ThumbnailOptions = {}
): Promise<string[]> => {
  const timeOffsets = Array.from({ length: count }, (_, i) => 
    i === 0 ? 0.05 : i === count - 1 ? 0.95 : (i + 1) / (count + 1)
  )
  
  return Promise.all(
    timeOffsets.map(offset => 
      generateVideoThumbnail(videoUrl, { ...options, timeOffset: offset })
    )
  )
}

/**
 * Generate a thumbnail strip (multiple thumbnails in one image)
 */
export const generateThumbnailStrip = (
  videoUrl: string,
  count: number = 5,
  options: ThumbnailOptions = {}
): Promise<string> => {
  return generateMultipleThumbnails(videoUrl, count, options).then(thumbnails => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      throw new Error('Failed to get canvas context')
    }
    
    const opts = { ...DEFAULT_OPTIONS, ...options }
    const thumbnailWidth = opts.width / count
    const thumbnailHeight = opts.height
    
    canvas.width = opts.width
    canvas.height = opts.height
    
    // Draw each thumbnail
    thumbnails.forEach((thumbnail, index) => {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(
          img, 
          index * thumbnailWidth, 
          0, 
          thumbnailWidth, 
          thumbnailHeight
        )
      }
      img.src = thumbnail
    })
    
    return canvas.toDataURL(`image/${opts.format}`, opts.quality)
  })
}

/**
 * Check if a video URL can generate thumbnails
 */
export const canGenerateThumbnail = (videoUrl: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    
    const timeout = setTimeout(() => {
      video.remove()
      resolve(false)
    }, 5000)
    
    video.onloadedmetadata = () => {
      clearTimeout(timeout)
      video.remove()
      resolve(video.duration > 0)
    }
    
    video.onerror = () => {
      clearTimeout(timeout)
      video.remove()
      resolve(false)
    }
    
    video.src = videoUrl
  })
}

/**
 * Get optimal thumbnail size based on container dimensions
 */
export const getOptimalThumbnailSize = (
  containerWidth: number,
  containerHeight: number,
  aspectRatio: number = 16/9
): { width: number; height: number } => {
  const containerAspect = containerWidth / containerHeight
  
  if (containerAspect > aspectRatio) {
    // Container is wider, fit to height
    return {
      width: containerHeight * aspectRatio,
      height: containerHeight
    }
  } else {
    // Container is taller, fit to width
    return {
      width: containerWidth,
      height: containerWidth / aspectRatio
    }
  }
}

/**
 * Cache management functions
 */
export const clearThumbnailCache = (): void => {
  thumbnailCache.clear()
  console.log('🗑️ Thumbnail cache cleared')
}

export const getThumbnailCacheSize = (): number => {
  return thumbnailCache.size
}

export const removeThumbnailFromCache = (videoUrl: string): void => {
  const keysToDelete = Array.from(thumbnailCache.keys()).filter(key => 
    key.startsWith(videoUrl)
  )
  keysToDelete.forEach(key => thumbnailCache.delete(key))
  console.log(`🗑️ Removed ${keysToDelete.length} thumbnails from cache for:`, videoUrl.substring(0, 50) + '...')
}
