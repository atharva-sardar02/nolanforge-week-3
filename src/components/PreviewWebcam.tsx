import React, { useEffect, useRef, useState } from 'react'
import { useMediaRecorder } from '../hooks/useMediaRecorder'
import { useRecordingState } from '../state/recordingState'

interface PreviewWebcamProps {
  className?: string
  onStreamReady?: (stream: MediaStream) => void
  onStreamError?: (error: string) => void
}

const PreviewWebcam: React.FC<PreviewWebcamProps> = ({
  className = '',
  onStreamReady,
  onStreamError
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)
  
  const {
    requestCameraAccess,
    videoStream,
    error
  } = useMediaRecorder()
  
  const { settings } = useRecordingState()
  
  // Initialize camera stream
  const initializeCamera = async () => {
    setIsLoading(true)
    try {
      const stream = await requestCameraAccess()
      if (stream && videoRef.current) {
        videoRef.current.srcObject = stream
        setHasPermission(true)
        onStreamReady?.(stream)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize camera'
      onStreamError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Handle video element events
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    
    const handleLoadedMetadata = () => {
      console.log('Video metadata loaded:', {
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        duration: video.duration
      })
    }
    
    const handleError = () => {
      const errorMessage = 'Failed to load video stream'
      onStreamError?.(errorMessage)
    }
    
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('error', handleError)
    
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('error', handleError)
    }
  }, [onStreamError])
  
  // Update video stream when it changes
  useEffect(() => {
    if (videoStream && videoRef.current) {
      videoRef.current.srcObject = videoStream
      setHasPermission(true)
    }
  }, [videoStream])
  
  // Auto-initialize camera on mount
  useEffect(() => {
    initializeCamera()
  }, [])
  
  return (
    <div className={`relative ${className}`}>
      {/* Video Preview */}
      <div className="relative w-full h-full bg-gray-900 rounded-2xl overflow-hidden border border-gray-700/30">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
          style={{
            transform: 'scaleX(-1)' // Mirror the video for webcam preview
          }}
        />
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-white text-lg font-medium">Initializing Camera...</p>
              <p className="text-gray-400 text-sm">Please allow camera access when prompted</p>
            </div>
          </div>
        )}
        
        {/* Permission Denied Overlay */}
        {!isLoading && !hasPermission && !error && (
          <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gray-700/50 rounded-full flex items-center justify-center text-3xl">
                📷
              </div>
              <p className="text-white text-lg font-medium">Camera Access Required</p>
              <p className="text-gray-400 text-sm">Click to enable camera access</p>
              <button
                onClick={initializeCamera}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Enable Camera
              </button>
            </div>
          </div>
        )}
        
        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center text-3xl">
                ⚠️
              </div>
              <p className="text-white text-lg font-medium">Camera Error</p>
              <p className="text-gray-400 text-sm max-w-xs">{error}</p>
              <button
                onClick={initializeCamera}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
        
        {/* Recording Indicator */}
        {hasPermission && (
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span className="text-white text-sm font-medium bg-gray-800/70 px-3 py-1 rounded-full">
              Camera Ready
            </span>
          </div>
        )}
        
        {/* Quality Indicator */}
        {hasPermission && (
          <div className="absolute top-4 right-4">
            <div className="bg-gray-800/70 px-3 py-1 rounded-full">
              <span className="text-white text-sm font-medium">
                {settings.resolution.width}×{settings.resolution.height}
              </span>
            </div>
          </div>
        )}
      </div>
      
      {/* Camera Controls */}
      {hasPermission && (
        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            onClick={initializeCamera}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <span>🔄</span>
            <span>Refresh</span>
          </button>
          
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Quality:</span>
            <span className="text-white font-medium capitalize">{settings.quality}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default PreviewWebcam
