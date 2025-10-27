import { describe, it, expect, beforeEach } from 'vitest'
import { useEditState } from '../editState'
import { act, renderHook } from '@testing-library/react'

describe('editState', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useEditState())
    act(() => {
      result.current.setCurrentFile(null)
      result.current.setPlaying(false)
      result.current.setCurrentTime(0)
      result.current.setDuration(0)
      result.current.setVolume(1)
      result.current.setMuted(false)
      result.current.clearError()
    })
  })

  describe('initial state', () => {
    it('has correct default values', () => {
      const { result } = renderHook(() => useEditState())
      
      expect(result.current.currentFile).toBeNull()
      expect(result.current.isPlaying).toBe(false)
      expect(result.current.currentTime).toBe(0)
      expect(result.current.duration).toBe(0)
      expect(result.current.trimStart).toBe(0)
      expect(result.current.trimEnd).toBe(0)
      expect(result.current.volume).toBe(1)
      expect(result.current.isMuted).toBe(false)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('setCurrentFile', () => {
    it('sets current file and resets state', () => {
      const { result } = renderHook(() => useEditState())
      const mockFile = {
        id: '1',
        name: 'test.mp4',
        path: '/test.mp4',
        size: 1000,
        type: 'video' as const,
        duration: 120,
        format: 'mp4',
        createdAt: new Date(),
        lastModified: new Date()
      }

      act(() => {
        result.current.setCurrentFile(mockFile)
      })

      expect(result.current.currentFile).toEqual(mockFile)
      expect(result.current.currentTime).toBe(0)
      expect(result.current.trimStart).toBe(0)
      expect(result.current.trimEnd).toBe(120)
      expect(result.current.error).toBeNull()
    })

    it('handles null file', () => {
      const { result } = renderHook(() => useEditState())
      
      act(() => {
        result.current.setCurrentFile(null)
      })

      expect(result.current.currentFile).toBeNull()
      expect(result.current.trimEnd).toBe(0)
    })
  })

  describe('playback controls', () => {
    it('sets playing state', () => {
      const { result } = renderHook(() => useEditState())
      
      act(() => {
        result.current.setPlaying(true)
      })

      expect(result.current.isPlaying).toBe(true)
    })

    it('sets current time', () => {
      const { result } = renderHook(() => useEditState())
      
      act(() => {
        result.current.setCurrentTime(45.5)
      })

      expect(result.current.currentTime).toBe(45.5)
    })

    it('sets duration and updates trim end', () => {
      const { result } = renderHook(() => useEditState())
      
      act(() => {
        result.current.setDuration(180)
      })

      expect(result.current.duration).toBe(180)
      expect(result.current.trimEnd).toBe(180)
    })
  })

  describe('trim controls', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useEditState())
      act(() => {
        result.current.setDuration(100)
      })
    })

    it('sets trim start', () => {
      const { result } = renderHook(() => useEditState())
      
      act(() => {
        result.current.setTrimStart(10)
      })

      expect(result.current.trimStart).toBe(10)
    })

    it('ensures trim start is before trim end', () => {
      const { result } = renderHook(() => useEditState())
      
      act(() => {
        result.current.setTrimEnd(50)
        result.current.setTrimStart(60)
      })

      // Should adjust trim end to be at least equal to new trim start
      expect(result.current.trimStart).toBe(60)
      expect(result.current.trimEnd).toBeGreaterThanOrEqual(60)
    })

    it('sets trim end', () => {
      const { result } = renderHook(() => useEditState())
      
      act(() => {
        result.current.setTrimEnd(90)
      })

      expect(result.current.trimEnd).toBe(90)
    })

    it('ensures trim end is after trim start', () => {
      const { result } = renderHook(() => useEditState())
      
      act(() => {
        result.current.setTrimStart(50)
        result.current.setTrimEnd(40)
      })

      // Should adjust trim start to be at most equal to new trim end
      expect(result.current.trimEnd).toBe(40)
      expect(result.current.trimStart).toBeLessThanOrEqual(40)
    })
  })

  describe('audio controls', () => {
    it('sets volume', () => {
      const { result } = renderHook(() => useEditState())
      
      act(() => {
        result.current.setVolume(0.5)
      })

      expect(result.current.volume).toBe(0.5)
      expect(result.current.isMuted).toBe(false)
    })

    it('mutes when volume is 0', () => {
      const { result } = renderHook(() => useEditState())
      
      act(() => {
        result.current.setVolume(0)
      })

      expect(result.current.volume).toBe(0)
      expect(result.current.isMuted).toBe(true)
    })

    it('sets muted state', () => {
      const { result } = renderHook(() => useEditState())
      
      act(() => {
        result.current.setMuted(true)
      })

      expect(result.current.isMuted).toBe(true)
    })
  })

  describe('loading and error states', () => {
    it('sets loading state', () => {
      const { result } = renderHook(() => useEditState())
      
      act(() => {
        result.current.setLoading(true)
      })

      expect(result.current.isLoading).toBe(true)
    })

    it('sets error message', () => {
      const { result } = renderHook(() => useEditState())
      
      act(() => {
        result.current.setError('Test error')
      })

      expect(result.current.error).toBe('Test error')
    })

    it('clears error', () => {
      const { result } = renderHook(() => useEditState())
      
      act(() => {
        result.current.setError('Test error')
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('computed values', () => {
    it('calculates trim duration', () => {
      const { result } = renderHook(() => useEditState())
      
      act(() => {
        result.current.setTrimStart(10)
        result.current.setTrimEnd(50)
      })

      expect(result.current.getTrimDuration()).toBe(40)
    })

    it('calculates trim progress', () => {
      const { result } = renderHook(() => useEditState())
      
      act(() => {
        result.current.setDuration(100)
        result.current.setTrimStart(20)
        result.current.setTrimEnd(80)
        result.current.setCurrentTime(50)
      })

      // Progress within trim range: (50-20)/(80-20) = 30/60 = 0.5
      expect(result.current.getTrimProgress()).toBe(0.5)
    })

    it('returns 0 progress when duration is 0', () => {
      const { result } = renderHook(() => useEditState())
      
      expect(result.current.getTrimProgress()).toBe(0)
    })

    it('validates trim range', () => {
      const { result } = renderHook(() => useEditState())
      
      act(() => {
        result.current.setTrimStart(10)
        result.current.setTrimEnd(50)
      })

      expect(result.current.isTrimValid()).toBe(true)
    })

    it('invalidates when trim start >= trim end', () => {
      const { result } = renderHook(() => useEditState())
      
      act(() => {
        result.current.setTrimStart(50)
        result.current.setTrimEnd(50)
      })

      expect(result.current.isTrimValid()).toBe(false)
    })

    it('invalidates when trim end is 0', () => {
      const { result } = renderHook(() => useEditState())
      
      act(() => {
        result.current.setTrimStart(0)
        result.current.setTrimEnd(0)
      })

      expect(result.current.isTrimValid()).toBe(false)
    })
  })

  describe('resetTrim', () => {
    it('resets trim points to full duration', () => {
      const { result } = renderHook(() => useEditState())
      
      act(() => {
        result.current.setDuration(100)
        result.current.setTrimStart(20)
        result.current.setTrimEnd(80)
        result.current.setCurrentTime(50)
        result.current.resetTrim()
      })

      expect(result.current.trimStart).toBe(0)
      expect(result.current.trimEnd).toBe(100)
      expect(result.current.currentTime).toBe(0)
    })
  })

  describe('workflow integration', () => {
    it('handles complete edit workflow', () => {
      const { result } = renderHook(() => useEditState())
      const mockFile = {
        id: '1',
        name: 'test.mp4',
        path: '/test.mp4',
        size: 1000,
        type: 'video' as const,
        duration: 120,
        format: 'mp4',
        createdAt: new Date(),
        lastModified: new Date()
      }

      // Load file
      act(() => {
        result.current.setCurrentFile(mockFile)
      })
      expect(result.current.currentFile).toEqual(mockFile)
      expect(result.current.trimEnd).toBe(120)

      // Set duration (simulating video load)
      act(() => {
        result.current.setDuration(120)
      })

      // Play video
      act(() => {
        result.current.setPlaying(true)
        result.current.setCurrentTime(30)
      })
      expect(result.current.isPlaying).toBe(true)
      expect(result.current.currentTime).toBe(30)

      // Set trim points
      act(() => {
        result.current.setTrimStart(20)
        result.current.setTrimEnd(100)
      })
      expect(result.current.getTrimDuration()).toBe(80)
      expect(result.current.isTrimValid()).toBe(true)

      // Adjust volume
      act(() => {
        result.current.setVolume(0.7)
      })
      expect(result.current.volume).toBe(0.7)

      // Reset trim
      act(() => {
        result.current.resetTrim()
      })
      expect(result.current.trimStart).toBe(0)
      expect(result.current.trimEnd).toBe(120)
    })
  })
})


