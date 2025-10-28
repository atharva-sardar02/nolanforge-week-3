import { useCallback, useEffect, useRef, useState } from 'react'
import { useRecordingState } from '../state/recordingState'

export interface MediaRecorderOptions {
  mimeType?: string
  videoBitsPerSecond?: number
  audioBitsPerSecond?: number
}

export interface UseMediaRecorderReturn {
  // Recording state
  isRecording: boolean
  isPaused: boolean
  duration: number
  error: string | null
  
  // Media streams
  videoStream: MediaStream | null
  audioStream: MediaStream | null
  
  // Recording controls
  startRecording: () => Promise<void>
  stopRecording: () => Promise<void>
  pauseRecording: () => void
  resumeRecording: () => void
  
  // Stream management
  requestCameraAccess: () => Promise<MediaStream | null>
  requestScreenAccess: () => Promise<MediaStream | null>
  requestMicrophoneAccess: () => Promise<MediaStream | null>
  stopAllStreams: () => void
  
  // Utility
  getSupportedMimeTypes: () => string[]
  getFormattedDuration: () => string
}

export const useMediaRecorder = (options: MediaRecorderOptions = {}, externalStream?: MediaStream | null): UseMediaRecorderReturn => {
  const {
    setStatus,
    setError,
    setRecordedBlob,
    setVideoStream,
    setAudioStream,
    setDuration,
    startRecording: startRecordingState,
    stopRecording: stopRecordingState,
    resetRecording,
    settings,
    status,
    duration,
    error,
    videoStream,
    audioStream
  } = useRecordingState()
  
  const [isPaused, setIsPaused] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  
  // Get supported MIME types
  const getSupportedMimeTypes = useCallback((): string[] => {
    const types = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4',
      'video/mp4;codecs=h264'
    ]
    
    return types.filter(type => MediaRecorder.isTypeSupported(type))
  }, [])
  
  // Get the best MIME type for recording
  const getBestMimeType = useCallback((): string => {
    const supportedTypes = getSupportedMimeTypes()
    
    // Prefer MP4 for better compatibility
    const mp4Types = supportedTypes.filter(type => type.includes('mp4'))
    if (mp4Types.length > 0) {
      return mp4Types[0]
    }
    
    // Fallback to WebM
    const webmTypes = supportedTypes.filter(type => type.includes('webm'))
    if (webmTypes.length > 0) {
      return webmTypes[0]
    }
    
    // Default fallback
    return 'video/mp4'
  }, [getSupportedMimeTypes])
  
  // Request camera access
  const requestCameraAccess = useCallback(async (): Promise<MediaStream | null> => {
    try {
      setError(null)
      
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: settings.resolution.width },
          height: { ideal: settings.resolution.height },
          frameRate: { ideal: settings.frameRate }
        },
        audio: settings.audioEnabled
      }
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      setVideoStream(stream)
      return stream
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access camera'
      setError(errorMessage)
      console.error('Camera access error:', err)
      return null
    }
  }, [settings, setError, setVideoStream])
  
  // Request screen access
  const requestScreenAccess = useCallback(async (): Promise<MediaStream | null> => {
    try {
      setError(null)
      
      const constraints: MediaStreamConstraints = {
        video: {
          mediaSource: 'screen',
          width: { ideal: settings.resolution.width },
          height: { ideal: settings.resolution.height },
          frameRate: { ideal: settings.frameRate }
        },
        audio: settings.audioEnabled
      }
      
      const stream = await navigator.mediaDevices.getDisplayMedia(constraints)
      setVideoStream(stream)
      return stream
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access screen'
      setError(errorMessage)
      console.error('Screen access error:', err)
      return null
    }
  }, [settings, setError, setVideoStream])
  
  // Request microphone access
  const requestMicrophoneAccess = useCallback(async (): Promise<MediaStream | null> => {
    try {
      setError(null)
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setAudioStream(stream)
      return stream
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access microphone'
      setError(errorMessage)
      console.error('Microphone access error:', err)
      return null
    }
  }, [setError, setAudioStream])
  
  // Stop all streams
  const stopAllStreams = useCallback(() => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop())
      setVideoStream(null)
    }
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop())
      setAudioStream(null)
    }
  }, [videoStream, audioStream, setVideoStream, setAudioStream])
  
  // Start recording
  const startRecording = useCallback(async (): Promise<void> => {
    try {
      setError(null)
      
      // Use external stream if provided, otherwise fallback to videoStream
      const streamToUse = externalStream || videoStream
      
      // Check if we have a video stream
      if (!streamToUse) {
        throw new Error('No video stream available. Please select a recording source first.')
      }
      
      // Create MediaRecorder
      const mimeType = options.mimeType || getBestMimeType()
      const mediaRecorder = new MediaRecorder(streamToUse, {
        mimeType,
        videoBitsPerSecond: options.videoBitsPerSecond || 2500000, // 2.5 Mbps
        audioBitsPerSecond: options.audioBitsPerSecond || 128000   // 128 kbps
      })
      
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      
      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      
      // Handle recording stop
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        setRecordedBlob(blob)
        stopRecordingState()
      }
      
      // Handle recording error
      mediaRecorder.onerror = (event) => {
        const errorMessage = `Recording error: ${event}`
        setError(errorMessage)
        console.error('MediaRecorder error:', event)
      }
      
      // Start recording
      mediaRecorder.start(1000) // Collect data every second
      startRecordingState()
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording'
      setError(errorMessage)
      console.error('Start recording error:', err)
    }
  }, [
    externalStream,
    videoStream,
    options,
    getBestMimeType,
    setError,
    setRecordedBlob,
    startRecordingState,
    stopRecordingState
  ])
  
  // Stop recording
  const stopRecording = useCallback(async (): Promise<void> => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop recording'
      setError(errorMessage)
      console.error('Stop recording error:', err)
    }
  }, [setError])
  
  // Pause recording
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.pause()
        setIsPaused(true)
      } catch (err) {
        console.warn('Pause recording not supported:', err)
      }
    }
  }, [])
  
  // Resume recording
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      try {
        mediaRecorderRef.current.resume()
        setIsPaused(false)
      } catch (err) {
        console.warn('Resume recording not supported:', err)
      }
    }
  }, [])
  
  // Get formatted duration
  const getFormattedDuration = useCallback((): string => {
    const minutes = Math.floor(duration / 60)
    const seconds = Math.floor(duration % 60)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }, [duration])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllStreams()
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop()
      }
    }
  }, [stopAllStreams])
  
  return {
    isRecording: status === 'recording',
    isPaused,
    duration,
    error,
    videoStream,
    audioStream,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    requestCameraAccess,
    requestScreenAccess,
    requestMicrophoneAccess,
    stopAllStreams,
    getSupportedMimeTypes,
    getFormattedDuration
  }
}
