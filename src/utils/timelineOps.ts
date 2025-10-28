import { TimelineClip } from '../state/editState'

export interface TimelineOperation {
  type: 'add' | 'remove' | 'move' | 'split' | 'trim'
  clipId: string
  data: any
  timestamp: number
}

export interface TimelineValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * Validates timeline operations to prevent invalid states
 */
export const validateTimelineOperation = (
  clips: TimelineClip[],
  operation: TimelineOperation
): TimelineValidationResult => {
  const errors: string[] = []

  switch (operation.type) {
    case 'add':
      const { mediaFile, trackId, startTime } = operation.data
      if (!mediaFile) errors.push('Media file is required')
      if (trackId < 0) errors.push('Track ID must be non-negative')
      if (startTime < 0) errors.push('Start time must be non-negative')
      break

    case 'move':
      const { newStartTime, newTrackId } = operation.data
      if (newStartTime < 0) errors.push('New start time must be non-negative')
      if (newTrackId < 0) errors.push('New track ID must be non-negative')
      
      // Check for overlaps
      const overlappingClip = clips.find(clip => 
        clip.id !== operation.clipId &&
        clip.trackId === newTrackId &&
        newStartTime < clip.startTime + clip.duration &&
        newStartTime + clips.find(c => c.id === operation.clipId)!.duration > clip.startTime
      )
      if (overlappingClip) {
        errors.push(`Clip would overlap with existing clip at track ${newTrackId}`)
      }
      break

    case 'split':
      const clipToSplit = clips.find(c => c.id === operation.clipId)
      if (!clipToSplit) {
        errors.push('Clip to split not found')
      } else {
        const { splitTime } = operation.data
        if (splitTime <= clipToSplit.trimStart || splitTime >= clipToSplit.trimEnd) {
          errors.push('Split time must be within clip duration')
        }
      }
      break

    case 'trim':
      const clipToTrim = clips.find(c => c.id === operation.clipId)
      if (!clipToTrim) {
        errors.push('Clip to trim not found')
      } else {
        const { trimStart, trimEnd } = operation.data
        if (trimStart < 0) errors.push('Trim start must be non-negative')
        if (trimEnd > clipToTrim.sourceDuration) errors.push('Trim end exceeds source duration')
        if (trimStart >= trimEnd) errors.push('Trim start must be less than trim end')
      }
      break
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Checks for overlapping clips on the same track
 */
export const findOverlappingClips = (clips: TimelineClip[]): TimelineClip[][] => {
  const overlaps: TimelineClip[][] = []
  const trackGroups = clips.reduce((acc, clip) => {
    if (!acc[clip.trackId]) acc[clip.trackId] = []
    acc[clip.trackId].push(clip)
    return acc
  }, {} as Record<number, TimelineClip[]>)

  Object.values(trackGroups).forEach(trackClips => {
    trackClips.sort((a, b) => a.startTime - b.startTime)
    
    for (let i = 0; i < trackClips.length - 1; i++) {
      const current = trackClips[i]
      const next = trackClips[i + 1]
      
      if (current.startTime + current.duration > next.startTime) {
        overlaps.push([current, next])
      }
    }
  })

  return overlaps
}

/**
 * Calculates the total duration of all clips
 */
export const calculateTotalDuration = (clips: TimelineClip[]): number => {
  if (clips.length === 0) return 0
  
  return Math.max(...clips.map(clip => clip.startTime + clip.duration))
}

/**
 * Gets clips that are active at a specific time
 */
export const getClipsAtTime = (clips: TimelineClip[], time: number): TimelineClip[] => {
  return clips.filter(clip => 
    time >= clip.startTime && time <= clip.startTime + clip.duration
  )
}

/**
 * Snaps a time value to the grid
 */
export const snapToGrid = (time: number, gridSize: number): number => {
  return Math.round(time / gridSize) * gridSize
}

/**
 * Converts time to pixels based on zoom level
 */
export const timeToPixels = (time: number, pixelsPerSecond: number): number => {
  return time * pixelsPerSecond
}

/**
 * Converts pixels to time based on zoom level
 */
export const pixelsToTime = (pixels: number, pixelsPerSecond: number): number => {
  return pixels / pixelsPerSecond
}

/**
 * Formats time for display
 */
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 100)
  
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
  } else {
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
  }
}

/**
 * Creates a new clip with validation
 */
export const createClip = (
  mediaFile: any,
  trackId: number,
  startTime: number,
  duration?: number
): TimelineClip => {
  const clipDuration = duration || mediaFile.duration || 10
  
  return {
    id: `clip-${Date.now()}-${Math.random()}`,
    mediaFileId: mediaFile.id,
    trackId,
    startTime,
    duration: clipDuration,
    trimStart: 0,
    trimEnd: clipDuration,
    sourceDuration: clipDuration
  }
}

/**
 * Splits a clip at the specified time
 */
export const splitClip = (clip: TimelineClip, splitTime: number): [TimelineClip, TimelineClip] => {
  const relativeSplitTime = splitTime - clip.startTime
  
  const clip1: TimelineClip = {
    ...clip,
    id: `clip-${Date.now()}-${Math.random()}`,
    duration: relativeSplitTime,
    trimEnd: clip.trimStart + relativeSplitTime
  }
  
  const clip2: TimelineClip = {
    ...clip,
    id: `clip-${Date.now()}-${Math.random()}-2`,
    startTime: clip.startTime + relativeSplitTime,
    duration: clip.duration - relativeSplitTime,
    trimStart: clip.trimStart + relativeSplitTime
  }
  
  return [clip1, clip2]
}
