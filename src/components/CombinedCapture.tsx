import React, { useEffect, useRef, useState } from 'react'

interface CombinedCaptureProps {
  className?: string
  onStreamReady?: (stream: MediaStream) => void
  onStreamError?: (error: string) => void
}

const CombinedCapture: React.FC<CombinedCaptureProps> = ({
  className = '',
  onStreamReady,
  onStreamError
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const webcamVideoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasRequested, setHasRequested] = useState(false)
  const [showRequestButton, setShowRequestButton] = useState(true)
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null)
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null)
  const [micStream, setMicStream] = useState<MediaStream | null>(null)
  const [combinedStream, setCombinedStream] = useState<MediaStream | null>(null)

  // Create canvas-based combined stream
  const createCanvasStream = (_screenStream: MediaStream, _webcamStream: MediaStream): MediaStream => {
    const canvas = canvasRef.current
    if (!canvas) throw new Error('Canvas not available')

    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas context not available')

    // Set canvas size to match screen stream
    const screenVideo = videoRef.current
    const webcamVideo = webcamVideoRef.current
    
    if (!screenVideo || !webcamVideo) throw new Error('Video elements not ready')

    // Set canvas dimensions
    canvas.width = 1920
    canvas.height = 1080

    // Create canvas stream
    const canvasStream = canvas.captureStream(30) // 30 FPS

    // Animation loop to draw frames
    const drawFrame = () => {
      // Clear canvas
      ctx.fillStyle = 'black'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw screen video
      if (screenVideo.videoWidth > 0 && screenVideo.videoHeight > 0) {
        ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height)
      }

      // Draw webcam overlay (150% of current size)
      if (webcamVideo.videoWidth > 0 && webcamVideo.videoHeight > 0) {
        const webcamWidth = 192 * 0.95 * 1.5 // 150% of current size (~273px)
        const webcamHeight = 144 * 0.95 * 1.5 // 150% of current size (~205px)
        const x = canvas.width - webcamWidth - 16
        const y = canvas.height - webcamHeight - 16
        
        // Draw webcam with rounded corners
        ctx.save()
        ctx.beginPath()
        ctx.roundRect(x, y, webcamWidth, webcamHeight, 8)
        ctx.clip()
        ctx.drawImage(webcamVideo, x, y, webcamWidth, webcamHeight)
        ctx.restore()

        // Draw webcam label
        ctx.fillStyle = 'rgba(147, 51, 234, 0.9)' // Purple background
        ctx.fillRect(x, y, webcamWidth, 20)
        ctx.fillStyle = 'white'
        ctx.font = '12px Arial'
        ctx.fillText('📷 Webcam', x + 4, y + 14)
      }

      requestAnimationFrame(drawFrame)
    }

    // Start drawing
    drawFrame()

    // Note: Audio tracks will be mixed and added in the calling function
    // This canvas stream only handles video composition

    return canvasStream
  }

  const requestCombinedCapture = async () => {
    try {
      console.log('🎥 Starting combined capture request...')
      setIsLoading(true)
      setError(null)

      // Request screen capture first
      console.log('🖥️ Requesting screen capture...')
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: true
      })

      console.log('📷 Requesting webcam capture...')
      // Request webcam capture with microphone
      const webcamStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 }
        },
        audio: true // Include microphone audio
      })

      console.log('🎤 Requesting additional microphone access...')
      // Request additional microphone access for better audio quality
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      console.log('🎥 Both streams captured successfully')
      console.log('🖥️ Screen stream:', screenStream)
      console.log('📷 Webcam stream:', webcamStream)

      // Store streams for cleanup
      setScreenStream(screenStream)
      setWebcamStream(webcamStream)
      setMicStream(micStream)

      // Update states
      setHasRequested(true)
      setShowRequestButton(false)

      // Wait for video elements to be ready
      setTimeout(() => {
        if (screenStream && webcamStream && videoRef.current && webcamVideoRef.current) {
          console.log('🎥 Setting up video elements...')
          
          // Set up screen video
          videoRef.current.srcObject = screenStream
          
          // Set up webcam video
          webcamVideoRef.current.srcObject = webcamStream
          
          // Wait for videos to load
          Promise.all([
            new Promise(resolve => {
              if (videoRef.current) {
                videoRef.current.onloadedmetadata = resolve
              }
            }),
            new Promise(resolve => {
              if (webcamVideoRef.current) {
                webcamVideoRef.current.onloadedmetadata = resolve
              }
            })
          ]).then(() => {
            console.log('🎥 Both videos loaded, creating canvas stream...')
            
            // Create canvas-based combined stream
            const canvasStream = createCanvasStream(screenStream, webcamStream)
            
            // Create Web Audio context for mixing all audio sources
            const audioContext = new AudioContext()
            
            // Create audio sources
            const screenAudioSource = audioContext.createMediaStreamSource(screenStream)
            const webcamAudioSource = audioContext.createMediaStreamSource(webcamStream)
            const micAudioSource = audioContext.createMediaStreamSource(micStream)
            
            // Create gain nodes for volume control
            const screenGain = audioContext.createGain()
            const webcamGain = audioContext.createGain()
            const micGain = audioContext.createGain()
            
            // Set volume levels (adjust as needed)
            screenGain.gain.value = 0.6  // System audio at 60%
            webcamGain.gain.value = 0.8  // Webcam audio at 80%
            micGain.gain.value = 1.0     // Microphone at 100%
            
            // Create destination for mixed audio
            const destination = audioContext.createMediaStreamDestination()
            
            // Connect audio sources to gain nodes, then to destination
            screenAudioSource.connect(screenGain)
            webcamAudioSource.connect(webcamGain)
            micAudioSource.connect(micGain)
            screenGain.connect(destination)
            webcamGain.connect(destination)
            micGain.connect(destination)
            
            // Add mixed audio track to canvas stream
            destination.stream.getAudioTracks().forEach(track => {
              canvasStream.addTrack(track)
            })
            
            console.log('🔊 Audio mixing successful for combined recording!')
            console.log('🎤 Mixed audio: System sound + Webcam audio + Microphone voice')
            
            setCombinedStream(canvasStream)
            
            console.log('🎥 Canvas stream created:', canvasStream)
            console.log('🎥 Canvas tracks:', canvasStream.getTracks())
            console.log('🎥 Audio tracks:', canvasStream.getAudioTracks())
            
            onStreamReady?.(canvasStream)
            console.log('🎥 Combined stream ready for recording')
          }).catch(err => {
            console.error('🎥 Error setting up videos:', err)
            setError('Failed to set up video streams')
          })
        } else {
          console.error('🎥 Video elements not ready')
          setError('Video elements not ready')
        }
      }, 500) // Wait longer for both videos to be ready

      setIsLoading(false)

      // Handle stream end
      screenStream.getVideoTracks()[0].onended = () => {
        console.log('🎥 Screen sharing ended by user')
        cleanupStreams()
      }

    } catch (err) {
      console.error('🎥 Combined capture error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to access screen and webcam'
      setError(errorMessage)
      onStreamError?.(errorMessage)
      setIsLoading(false)
      setHasRequested(false)
      setShowRequestButton(true)
      cleanupStreams()
    }
  }

  const cleanupStreams = () => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop())
      setScreenStream(null)
    }
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop())
      setWebcamStream(null)
    }
    if (micStream) {
      micStream.getTracks().forEach(track => track.stop())
      setMicStream(null)
    }
    if (combinedStream) {
      combinedStream.getTracks().forEach(track => track.stop())
      setCombinedStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    if (webcamVideoRef.current) {
      webcamVideoRef.current.srcObject = null
    }
    setShowRequestButton(true)
    setHasRequested(false)
    setIsLoading(false)
    setError(null)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupStreams()
    }
  }, [])

  if (error) {
    return (
      <div className={`flex items-center justify-center h-96 bg-gray-800 rounded-lg border border-gray-700 ${className}`}>
        <div className="text-center space-y-4">
          <div className="text-6xl">🚫</div>
          <div className="text-white font-medium">Access Denied</div>
          <div className="text-gray-400 text-sm max-w-md">
            {error.includes('NotAllowedError') 
              ? 'Please allow screen sharing and webcam access'
              : error.includes('NotFoundError')
              ? 'No screen sharing source or webcam available'
              : error
            }
          </div>
          <button
            onClick={cleanupStreams}
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
          <div className="text-6xl">🎥</div>
          <div className="space-y-3">
            <div className="text-white font-medium text-xl">Ready for Combined Recording</div>
            <div className="text-gray-400 text-sm">Record both screen and webcam simultaneously</div>
          </div>
          <button
            onClick={requestCombinedCapture}
            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
          >
            <span>🎬</span>
            <span>Start Combined Recording</span>
          </button>
        </div>
        {/* Hidden video elements */}
        <video
          ref={videoRef}
          className="hidden"
          autoPlay
          muted
          playsInline
        />
        <video
          ref={webcamVideoRef}
          className="hidden"
          autoPlay
          muted
          playsInline
        />
        <canvas
          ref={canvasRef}
          className="hidden"
        />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-96 bg-gray-800 rounded-lg border border-gray-700 ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
          <div className="text-white font-medium">Requesting Access...</div>
          <div className="text-gray-400 text-sm">Please allow screen sharing and webcam access</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative bg-gray-800 rounded-lg border border-gray-700 overflow-hidden ${className}`}>
      {/* Canvas for combined video */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain"
        style={{ backgroundColor: 'black' }}
      />
      
      {/* Hidden video elements for canvas composition */}
      <video
        ref={videoRef}
        className="hidden"
        autoPlay
        muted
        playsInline
      />
      <video
        ref={webcamVideoRef}
        className="hidden"
        autoPlay
        muted
        playsInline
      />
      
      {/* Combined recording indicator */}
      <div className="absolute top-4 left-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        Combined Recording Active
      </div>
      
      {/* Stop recording button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={cleanupStreams}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Stop Recording
        </button>
      </div>
    </div>
  )
}

export default CombinedCapture
