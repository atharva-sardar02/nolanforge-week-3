import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useRecordingState } from '../recordingState'

// Mock Zustand store for testing
vi.mock('zustand', () => ({
  create: (fn: any) => {
    const state = fn(() => {}, () => {})
    return () => state
  }
}))

describe('RecordingState', () => {
  let recordingState: ReturnType<typeof useRecordingState>
  
  beforeEach(() => {
    recordingState = useRecordingState()
  })
  
  describe('Initial State', () => {
    it('should have correct initial values', () => {
      expect(recordingState.status).toBe('idle')
      expect(recordingState.isRecording).toBe(false)
      expect(recordingState.duration).toBe(0)
      expect(recordingState.startTime).toBe(null)
      expect(recordingState.recordedBlob).toBe(null)
      expect(recordingState.videoStream).toBe(null)
      expect(recordingState.audioStream).toBe(null)
      expect(recordingState.error).toBe(null)
    })
    
    it('should have default settings', () => {
      expect(recordingState.settings.quality).toBe('high')
      expect(recordingState.settings.format).toBe('webm')
      expect(recordingState.settings.audioEnabled).toBe(true)
      expect(recordingState.settings.videoEnabled).toBe(true)
      expect(recordingState.settings.frameRate).toBe(30)
      expect(recordingState.settings.resolution).toEqual({
        width: 1920,
        height: 1080
      })
    })
  })
  
  describe('Status Management', () => {
    it('should update status correctly', () => {
      recordingState.setStatus('recording')
      expect(recordingState.status).toBe('recording')
      expect(recordingState.isRecording).toBe(true)
    })
    
    it('should clear error when status changes from error', () => {
      recordingState.setError('Test error')
      recordingState.setStatus('idle')
      expect(recordingState.error).toBe(null)
    })
    
    it('should set isRecording based on status', () => {
      recordingState.setStatus('recording')
      expect(recordingState.isRecording).toBe(true)
      
      recordingState.setStatus('stopped')
      expect(recordingState.isRecording).toBe(false)
      
      recordingState.setStatus('idle')
      expect(recordingState.isRecording).toBe(false)
    })
  })
  
  describe('Settings Management', () => {
    it('should update settings partially', () => {
      recordingState.setSettings({ quality: 'low' })
      expect(recordingState.settings.quality).toBe('low')
      expect(recordingState.settings.format).toBe('webm') // Should remain unchanged
    })
    
    it('should update multiple settings at once', () => {
      recordingState.setSettings({
        quality: 'medium',
        audioEnabled: false,
        frameRate: 60
      })
      
      expect(recordingState.settings.quality).toBe('medium')
      expect(recordingState.settings.audioEnabled).toBe(false)
      expect(recordingState.settings.frameRate).toBe(60)
    })
  })
  
  describe('Recording Control Actions', () => {
    it('should start recording correctly', () => {
      const mockTime = 1234567890
      vi.spyOn(Date, 'now').mockReturnValue(mockTime)
      
      recordingState.startRecording()
      
      expect(recordingState.status).toBe('recording')
      expect(recordingState.isRecording).toBe(true)
      expect(recordingState.startTime).toBe(mockTime)
      expect(recordingState.duration).toBe(0)
      expect(recordingState.error).toBe(null)
    })
    
    it('should stop recording correctly', () => {
      recordingState.startRecording()
      recordingState.stopRecording()
      
      expect(recordingState.status).toBe('stopped')
      expect(recordingState.isRecording).toBe(false)
    })
    
    it('should reset recording correctly', () => {
      recordingState.startRecording()
      recordingState.setRecordedBlob(new Blob(['test']))
      recordingState.setError('Test error')
      
      recordingState.resetRecording()
      
      expect(recordingState.status).toBe('idle')
      expect(recordingState.isRecording).toBe(false)
      expect(recordingState.duration).toBe(0)
      expect(recordingState.startTime).toBe(null)
      expect(recordingState.recordedBlob).toBe(null)
      expect(recordingState.error).toBe(null)
    })
  })
  
  describe('Duration Management', () => {
    it('should update duration correctly', () => {
      recordingState.setDuration(120.5)
      expect(recordingState.duration).toBe(120.5)
    })
    
    it('should not allow negative duration', () => {
      recordingState.setDuration(-10)
      expect(recordingState.duration).toBe(0)
    })
    
    it('should format duration correctly', () => {
      recordingState.setDuration(125) // 2 minutes 5 seconds
      const formatted = recordingState.getFormattedDuration()
      expect(formatted).toBe('02:05')
    })
    
    it('should format duration with hours', () => {
      recordingState.setDuration(3661) // 1 hour 1 minute 1 second
      const formatted = recordingState.getFormattedDuration()
      expect(formatted).toBe('01:01:01')
    })
  })
  
  describe('Stream Management', () => {
    it('should set video stream', () => {
      const mockStream = new MediaStream()
      recordingState.setVideoStream(mockStream)
      expect(recordingState.videoStream).toBe(mockStream)
    })
    
    it('should set audio stream', () => {
      const mockStream = new MediaStream()
      recordingState.setAudioStream(mockStream)
      expect(recordingState.audioStream).toBe(mockStream)
    })
    
    it('should clear streams when set to null', () => {
      recordingState.setVideoStream(new MediaStream())
      recordingState.setVideoStream(null)
      expect(recordingState.videoStream).toBe(null)
    })
  })
  
  describe('Error Management', () => {
    it('should set error correctly', () => {
      const errorMessage = 'Test error message'
      recordingState.setError(errorMessage)
      expect(recordingState.error).toBe(errorMessage)
    })
    
    it('should clear error when set to null', () => {
      recordingState.setError('Test error')
      recordingState.setError(null)
      expect(recordingState.error).toBe(null)
    })
  })
  
  describe('Blob Management', () => {
    it('should set recorded blob', () => {
      const mockBlob = new Blob(['test data'])
      recordingState.setRecordedBlob(mockBlob)
      expect(recordingState.recordedBlob).toBe(mockBlob)
    })
    
    it('should clear recorded blob when set to null', () => {
      recordingState.setRecordedBlob(new Blob(['test']))
      recordingState.setRecordedBlob(null)
      expect(recordingState.recordedBlob).toBe(null)
    })
  })
})
