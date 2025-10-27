import { useEffect, useCallback } from 'react'
import { useEditState } from '../state/editState'

/**
 * Hook to synchronize timeline with video player
 * Handles keyboard shortcuts for timeline navigation
 */
export function useTimelineSync(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const {
    trimStart,
    trimEnd,
    isPlaying,
    setCurrentTime,
    setTrimStart,
    setTrimEnd,
    setPlaying,
  } = useEditState()

  // Sync video element time with state
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)

      // Auto-pause at trim end
      if (video.currentTime >= trimEnd && isPlaying) {
        video.pause()
        setPlaying(false)
      }
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    return () => video.removeEventListener('timeupdate', handleTimeUpdate)
  }, [videoRef, setCurrentTime, trimEnd, isPlaying, setPlaying])

  // Seek video when currentTime changes externally
  const seekTo = useCallback((time: number) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = time
    setCurrentTime(time)
  }, [videoRef, setCurrentTime])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const video = videoRef.current
      if (!video) return

      // Don't handle shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      switch (e.key.toLowerCase()) {
        case ' ':
          // Space: Play/Pause
          e.preventDefault()
          if (video.paused) {
            video.play()
            setPlaying(true)
          } else {
            video.pause()
            setPlaying(false)
          }
          break

        case 'arrowleft':
          // Left Arrow: Step back 1 frame (or 1 second with shift)
          e.preventDefault()
          {
            const step = e.shiftKey ? 1 : 1 / 30 // 1 second or 1 frame
            const newTime = Math.max(0, video.currentTime - step)
            seekTo(newTime)
          }
          break

        case 'arrowright':
          // Right Arrow: Step forward 1 frame (or 1 second with shift)
          e.preventDefault()
          {
            const step = e.shiftKey ? 1 : 1 / 30
            const newTime = Math.min(video.duration, video.currentTime + step)
            seekTo(newTime)
          }
          break

        case 'i':
          // I: Set in point (trim start)
          e.preventDefault()
          setTrimStart(video.currentTime)
          break

        case 'o':
          // O: Set out point (trim end)
          e.preventDefault()
          setTrimEnd(video.currentTime)
          break

        case 'home':
          // Home: Go to start
          e.preventDefault()
          seekTo(0)
          break

        case 'end':
          // End: Go to end
          e.preventDefault()
          seekTo(video.duration)
          break

        case 'j':
          // J: Rewind
          e.preventDefault()
          {
            const newTime = Math.max(0, video.currentTime - 5)
            seekTo(newTime)
          }
          break

        case 'k':
          // K: Play/Pause (alternative to space)
          e.preventDefault()
          if (video.paused) {
            video.play()
            setPlaying(true)
          } else {
            video.pause()
            setPlaying(false)
          }
          break

        case 'l':
          // L: Fast forward
          e.preventDefault()
          {
            const newTime = Math.min(video.duration, video.currentTime + 5)
            seekTo(newTime)
          }
          break

        case 'f':
          // F: Toggle fullscreen
          e.preventDefault()
          if (!document.fullscreenElement) {
            video.requestFullscreen?.()
          } else {
            document.exitFullscreen?.()
          }
          break

        case 'm':
          // M: Toggle mute
          e.preventDefault()
          video.muted = !video.muted
          break

        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [videoRef, setTrimStart, setTrimEnd, setPlaying, seekTo])

  // Play from trim start
  const playFromTrimStart = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = trimStart
    video.play()
    setPlaying(true)
  }, [videoRef, trimStart, setPlaying])

  // Preview trim range
  const previewTrimRange = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = trimStart
    video.play()
    setPlaying(true)

    // Auto-stop at trim end
    const checkInterval = setInterval(() => {
      if (video.currentTime >= trimEnd) {
        video.pause()
        setPlaying(false)
        clearInterval(checkInterval)
      }
    }, 100)
  }, [videoRef, trimStart, trimEnd, setPlaying])

  return {
    seekTo,
    playFromTrimStart,
    previewTrimRange,
  }
}


