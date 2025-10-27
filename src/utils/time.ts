/**
 * Time utility functions for video editing
 */

/**
 * Format seconds to MM:SS or HH:MM:SS format
 * @param seconds - Time in seconds
 * @param includeHours - Whether to always include hours
 * @returns Formatted time string
 */
export function formatTime(seconds: number, includeHours = false): string {
  if (isNaN(seconds) || !isFinite(seconds)) {
    return '00:00'
  }

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  const pad = (num: number) => num.toString().padStart(2, '0')

  if (hours > 0 || includeHours) {
    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`
  }

  return `${pad(minutes)}:${pad(secs)}`
}

/**
 * Format seconds to MM:SS.mmm format with milliseconds
 * @param seconds - Time in seconds
 * @returns Formatted time string with milliseconds
 */
export function formatTimeWithMilliseconds(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) {
    return '00:00.000'
  }

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)

  const pad = (num: number, len = 2) => num.toString().padStart(len, '0')

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}.${pad(ms, 3)}`
  }

  return `${pad(minutes)}:${pad(secs)}.${pad(ms, 3)}`
}

/**
 * Parse time string to seconds
 * Supports formats: MM:SS, HH:MM:SS, MM:SS.mmm, HH:MM:SS.mmm
 * @param timeString - Time string to parse
 * @returns Time in seconds
 */
export function parseTime(timeString: string): number {
  if (!timeString || typeof timeString !== 'string') {
    return 0
  }

  const parts = timeString.split(':')
  let seconds = 0

  if (parts.length === 2) {
    // MM:SS or MM:SS.mmm
    const [minutes, secondsPart] = parts
    seconds = parseInt(minutes) * 60 + parseFloat(secondsPart)
  } else if (parts.length === 3) {
    // HH:MM:SS or HH:MM:SS.mmm
    const [hours, minutes, secondsPart] = parts
    seconds = parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseFloat(secondsPart)
  }

  return isNaN(seconds) ? 0 : seconds
}

/**
 * Convert frame number to time (assuming 30fps)
 * @param frame - Frame number
 * @param fps - Frames per second (default: 30)
 * @returns Time in seconds
 */
export function frameToTime(frame: number, fps = 30): number {
  return frame / fps
}

/**
 * Convert time to frame number (assuming 30fps)
 * @param time - Time in seconds
 * @param fps - Frames per second (default: 30)
 * @returns Frame number
 */
export function timeToFrame(time: number, fps = 30): number {
  return Math.floor(time * fps)
}

/**
 * Clamp time value between min and max
 * @param time - Time to clamp
 * @param min - Minimum time
 * @param max - Maximum time
 * @returns Clamped time
 */
export function clampTime(time: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, time))
}

/**
 * Round time to nearest frame (assuming 30fps)
 * @param time - Time in seconds
 * @param fps - Frames per second (default: 30)
 * @returns Rounded time
 */
export function snapToFrame(time: number, fps = 30): number {
  return Math.round(time * fps) / fps
}

/**
 * Calculate percentage of time within a range
 * @param time - Current time
 * @param start - Range start
 * @param end - Range end
 * @returns Percentage (0-1)
 */
export function timeToPercentage(time: number, start: number, end: number): number {
  if (end <= start) return 0
  return clampTime((time - start) / (end - start), 0, 1)
}

/**
 * Calculate time from percentage within a range
 * @param percentage - Percentage (0-1)
 * @param start - Range start
 * @param end - Range end
 * @returns Time in seconds
 */
export function percentageToTime(percentage: number, start: number, end: number): number {
  return start + (end - start) * clampTime(percentage, 0, 1)
}

/**
 * Validate trim range
 * @param trimStart - Start time
 * @param trimEnd - End time
 * @param duration - Total duration
 * @returns Validation result with message
 */
export function validateTrimRange(
  trimStart: number,
  trimEnd: number,
  duration: number
): { valid: boolean; message?: string } {
  if (trimStart < 0) {
    return { valid: false, message: 'Start time cannot be negative' }
  }

  if (trimEnd > duration) {
    return { valid: false, message: 'End time cannot exceed video duration' }
  }

  if (trimStart >= trimEnd) {
    return { valid: false, message: 'Start time must be before end time' }
  }

  const minDuration = 0.1 // 100ms minimum
  if (trimEnd - trimStart < minDuration) {
    return { valid: false, message: 'Trim duration must be at least 100ms' }
  }

  return { valid: true }
}

/**
 * Format duration in human-readable format
 * @param seconds - Duration in seconds
 * @returns Human-readable duration string
 */
export function formatDurationHuman(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) {
    return '0 seconds'
  }

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  const parts: string[] = []

  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`)
  }

  if (minutes > 0) {
    parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`)
  }

  if (secs > 0 || parts.length === 0) {
    parts.push(`${secs} ${secs === 1 ? 'second' : 'seconds'}`)
  }

  return parts.join(', ')
}

/**
 * Get frame-accurate time step
 * @param fps - Frames per second (default: 30)
 * @returns Time step for one frame
 */
export function getFrameStep(fps = 30): number {
  return 1 / fps
}

/**
 * Calculate timecode from seconds (e.g., for SMPTE timecode)
 * @param seconds - Time in seconds
 * @param fps - Frames per second (default: 30)
 * @returns Timecode string (HH:MM:SS:FF)
 */
export function formatTimecode(seconds: number, fps = 30): string {
  if (isNaN(seconds) || !isFinite(seconds)) {
    return '00:00:00:00'
  }

  const totalFrames = Math.floor(seconds * fps)
  const frames = totalFrames % fps
  const totalSeconds = Math.floor(totalFrames / fps)
  const secs = totalSeconds % 60
  const totalMinutes = Math.floor(totalSeconds / 60)
  const minutes = totalMinutes % 60
  const hours = Math.floor(totalMinutes / 60)

  const pad = (num: number) => num.toString().padStart(2, '0')

  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}:${pad(frames)}`
}


