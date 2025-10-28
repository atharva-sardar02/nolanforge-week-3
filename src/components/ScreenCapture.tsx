import React, { useRef, useState } from 'react'

interface ScreenCaptureProps {
  className?: string
  onStreamReady?: (stream: MediaStream) => void
  onStreamError?: (error: string) => void
}

const ScreenCapture: React.FC<ScreenCaptureProps> = ({
  className = '',
  onStreamReady,
  onStreamError
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasRequested, setHasRequested] = useState(false)
  const [showRequestButton, setShowRequestButton] = useState(true)

  const requestScreenCapture = async () => {
    try {
      console.log('🖥️ Starting screen capture request...')
      setIsLoading(true)
      setError(null)
      // Don't set hasRequested and showRequestButton until we know the result

      // Request screen capture with more flexible constraints
      console.log('🖥️ Calling getDisplayMedia...')
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          // Remove mediaSource constraint to allow any screen/window
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: true
      })

      // Request microphone access for voice recording
      console.log('🎤 Requesting microphone access...')
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      // Create Web Audio context for mixing
      const audioContext = new AudioContext()
      
      // Create audio sources
      const screenAudioSource = audioContext.createMediaStreamSource(screenStream)
      const micAudioSource = audioContext.createMediaStreamSource(micStream)
      
      // Create gain nodes for volume control
      const screenGain = audioContext.createGain()
      const micGain = audioContext.createGain()
      
      // Set volume levels (adjust as needed)
      screenGain.gain.value = 0.7  // System audio at 70%
      micGain.gain.value = 1.0     // Microphone at 100%
      
      // Create destination for mixed audio
      const destination = audioContext.createMediaStreamDestination()
      
      // Connect audio sources to gain nodes, then to destination
      screenAudioSource.connect(screenGain)
      micAudioSource.connect(micGain)
      screenGain.connect(destination)
      micGain.connect(destination)
      
      // Create final combined stream
      const combinedStream = new MediaStream()
      
      // Add video track from screen
      screenStream.getVideoTracks().forEach(track => {
        combinedStream.addTrack(track)
      })
      
      // Add mixed audio track
      destination.stream.getAudioTracks().forEach(track => {
        combinedStream.addTrack(track)
      })

      console.log('🖥️ Audio mixing successful!')
      console.log('🖥️ Combined stream created:', combinedStream)
      console.log('🖥️ Stream tracks:', combinedStream.getTracks())
      console.log('🖥️ Video tracks:', combinedStream.getVideoTracks())
      console.log('🖥️ Audio tracks:', combinedStream.getAudioTracks())
      console.log('🎤 Microphone audio tracks:', micStream.getAudioTracks())
      console.log('🖥️ Screen audio tracks:', screenStream.getAudioTracks())
      console.log('🔊 Mixed audio: System sound + Microphone voice')
      
      const stream = combinedStream
      
      console.log('🖥️ Screen capture successful:', stream)
      console.log('🖥️ Stream tracks:', stream.getTracks())
      console.log('🖥️ Video tracks:', stream.getVideoTracks())
      console.log('🖥️ Audio tracks:', stream.getAudioTracks())
      console.log('🖥️ Video ref current:', videoRef.current)
      
      // Only update states after successful stream creation
      setHasRequested(true)
      setShowRequestButton(false)
      
      // Wait a bit for the video element to be ready
      setTimeout(() => {
        if (stream && videoRef.current) {
          console.log('🖥️ Setting video srcObject...')
          videoRef.current.srcObject = stream
          
          // Ensure video is ready to play
          videoRef.current.onloadedmetadata = () => {
            console.log('🖥️ Video metadata loaded')
            videoRef.current?.play().then(() => {
              console.log('🖥️ Video started playing')
            }).catch(err => {
              console.error('🖥️ Video play error:', err)
            })
          }
          
          videoRef.current.oncanplay = () => {
            console.log('🖥️ Video can play')
          }
          
          videoRef.current.onerror = (err) => {
            console.error('🖥️ Video error:', err)
          }
          
          // Try to play immediately in case metadata is already loaded
          setTimeout(() => {
            if (videoRef.current && videoRef.current.readyState >= 1) {
              console.log('🖥️ Trying immediate play...')
              videoRef.current.play().then(() => {
                console.log('🖥️ Immediate play successful')
              }).catch(err => {
                console.error('🖥️ Immediate play error:', err)
              })
            }
          }, 100)
          
          onStreamReady?.(stream)
          console.log('🖥️ Video element updated with stream')
        } else {
          console.error('🖥️ No video element or stream available after timeout')
          console.log('🖥️ Stream:', stream)
          console.log('🖥️ Video ref:', videoRef.current)
        }
      }, 200) // Wait 200ms for video element to be ready

      setIsLoading(false)

      // Handle stream end (user stops sharing)
      if (stream) {
        stream.getVideoTracks()[0].onended = () => {
          console.log('🖥️ Screen sharing ended by user')
          if (videoRef.current) {
            videoRef.current.srcObject = null
          }
          // Reset all states to allow sharing again
          setShowRequestButton(true)
          setHasRequested(false)
          setIsLoading(false)
          setError(null)
        }
      }

    } catch (err) {
      console.error('🖥️ Screen capture error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to access screen'
      console.error('Screen capture error:', errorMessage)
      setError(errorMessage)
      onStreamError?.(errorMessage)
      setIsLoading(false)
      setHasRequested(false) // Allow retry
      setShowRequestButton(true)
    }
  }

  // Reset function to allow sharing again
  const resetScreenCapture = () => {
    setShowRequestButton(true)
    setHasRequested(false)
    setIsLoading(false)
    setError(null)
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-96 bg-gray-800 rounded-lg border border-gray-700 ${className}`}>
        <div className="text-center space-y-4">
          <div className="text-6xl">🚫</div>
          <div className="text-white font-medium">Screen Access Denied</div>
          <div className="text-gray-400 text-sm max-w-md">
            {error.includes('NotAllowedError') 
              ? 'Please allow screen sharing to record your screen'
              : error.includes('NotFoundError')
              ? 'No screen sharing source available'
              : error
            }
          </div>
          <button
            onClick={resetScreenCapture}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (showRequestButton && !hasRequested) {
    return (
      <div className={`flex items-center justify-center h-96 bg-gray-800 rounded-lg border border-gray-700 ${className}`}>
        <div className="text-center space-y-6">
          <div className="text-6xl">🖥️</div>
          <div className="space-y-3">
            <div className="text-white font-medium text-xl">Ready to Share Screen</div>
            <div className="text-gray-400 text-sm">Click the button below to start screen sharing</div>
          </div>
          <button
            onClick={requestScreenCapture}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
          >
            <span>📺</span>
            <span>Share Screen</span>
          </button>
        </div>
        {/* Hidden video element to ensure it's always available */}
        <video
          ref={videoRef}
          className="hidden"
          autoPlay
          muted
          playsInline
        />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-96 bg-gray-800 rounded-lg border border-gray-700 ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <div className="text-white font-medium">Requesting Screen Access...</div>
          <div className="text-gray-400 text-sm">Please select a screen or window to share</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative bg-gray-800 rounded-lg border border-gray-700 overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        autoPlay
        muted
        playsInline
        controls={false}
        style={{ backgroundColor: 'black' }}
      />
      
      {/* Screen sharing indicator */}
      <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        Screen Sharing Active
      </div>
      
      {/* Stop sharing button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={resetScreenCapture}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Stop Sharing
        </button>
      </div>
    </div>
  )
}

export default ScreenCapture
