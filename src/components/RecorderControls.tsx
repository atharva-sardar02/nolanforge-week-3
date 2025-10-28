import React, { useState } from 'react'
import { useMediaRecorder } from '../hooks/useMediaRecorder'
import { useRecordingState } from '../state/recordingState'

interface RecorderControlsProps {
  className?: string
  stream?: MediaStream | null
  onRecordingStart?: () => void
  onRecordingStop?: (blob: Blob) => void
  onRecordingError?: (error: string) => void
  onSaveToDisk?: (blob: Blob, fileName: string) => Promise<void>
  onAddToTimeline?: (blob: Blob, fileName: string) => Promise<void>
}

const RecorderControls: React.FC<RecorderControlsProps> = ({
  className = '',
  stream,
  onRecordingStart,
  onRecordingStop,
  onRecordingError,
  onSaveToDisk,
  onAddToTimeline
}) => {
  const [isStarting, setIsStarting] = useState(false)
  const [isStopping, setIsStopping] = useState(false)
  
  const {
    isRecording,
    error,
    startRecording,
    stopRecording,
    getFormattedDuration
  } = useMediaRecorder({}, stream)
  
  const {
    settings,
    setSettings,
    recordedBlob,
    resetRecording
  } = useRecordingState()
  
  // Handle start recording
  const handleStartRecording = async () => {
    if (!stream) {
      onRecordingError?.('No video stream available. Please select a recording source first.')
      return
    }
    
    setIsStarting(true)
    try {
      await startRecording()
      onRecordingStart?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording'
      onRecordingError?.(errorMessage)
    } finally {
      setIsStarting(false)
    }
  }
  
  // Handle stop recording
  const handleStopRecording = async () => {
    setIsStopping(true)
    try {
      await stopRecording()
      
      // Wait a moment for the blob to be created
      setTimeout(() => {
        if (recordedBlob) {
          onRecordingStop?.(recordedBlob)
        }
      }, 500)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop recording'
      onRecordingError?.(errorMessage)
    } finally {
      setIsStopping(false)
    }
  }
  
  // Handle reset recording
  const handleResetRecording = () => {
    resetRecording()
  }
  
  // Handle quality change
  const handleQualityChange = (quality: 'low' | 'medium' | 'high') => {
    const qualitySettings = {
      low: { resolution: { width: 1280, height: 720 }, frameRate: 24 },
      medium: { resolution: { width: 1920, height: 1080 }, frameRate: 30 },
      high: { resolution: { width: 1920, height: 1080 }, frameRate: 60 }
    }
    
    setSettings({
      quality,
      ...qualitySettings[quality]
    })
  }
  
  // Handle audio toggle
  const handleAudioToggle = () => {
    setSettings({ audioEnabled: !settings.audioEnabled })
  }
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Recording Status */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-3 px-6 py-3 bg-gray-800/50 rounded-full border border-gray-700/30">
          <div className={`w-3 h-3 rounded-full ${
            isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-500'
          }`}></div>
          <span className="text-white font-medium">
            {isRecording ? 'Recording' : 'Standby'}
          </span>
          {isRecording && (
            <span className="text-red-400 font-mono text-lg">
              {getFormattedDuration()}
            </span>
          )}
        </div>
      </div>
      
      {/* Main Recording Controls */}
      <div className="flex items-center justify-center gap-6">
        {!isRecording ? (
          <button
            onClick={handleStartRecording}
            disabled={isStarting || !stream}
            className="group relative w-20 h-20 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-red-500/25"
          >
            <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 text-white text-2xl">
              {isStarting ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                '⏺️'
              )}
            </div>
          </button>
        ) : (
          <button
            onClick={handleStopRecording}
            disabled={isStopping}
            className="group relative w-20 h-20 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-gray-500/25"
          >
            <div className="absolute inset-0 rounded-full bg-gray-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 text-white text-2xl">
              {isStopping ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                '⏹️'
              )}
            </div>
          </button>
        )}
      </div>
      
      {/* Recording Settings */}
      <div className="space-y-4">
        {/* Quality Settings */}
        <div className="flex items-center justify-center gap-4">
          <span className="text-gray-400 text-sm font-medium">Quality:</span>
          <div className="flex gap-2">
            {(['low', 'medium', 'high'] as const).map((quality) => (
              <button
                key={quality}
                onClick={() => handleQualityChange(quality)}
                disabled={isRecording}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  settings.quality === quality
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                } ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {quality.charAt(0).toUpperCase() + quality.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Audio Toggle */}
        <div className="flex items-center justify-center gap-4">
          <span className="text-gray-400 text-sm font-medium">Audio:</span>
          <button
            onClick={handleAudioToggle}
            disabled={isRecording}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              settings.audioEnabled
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            } ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {settings.audioEnabled ? '🔊 On' : '🔇 Off'}
          </button>
        </div>
        
        {/* Format Display */}
        <div className="flex items-center justify-center gap-4">
          <span className="text-gray-400 text-sm font-medium">Format:</span>
          <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-lg text-sm font-mono">
            {settings.format.toUpperCase()}
          </span>
        </div>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-red-400 text-lg">⚠️</span>
            <span className="text-red-300 text-sm">{error}</span>
          </div>
        </div>
      )}
      
      {/* Recording Actions */}
      {recordedBlob && !isRecording && (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleResetRecording}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Reset Recording
            </button>
          </div>
          
          {/* Save and Timeline Actions */}
          <div className="flex items-center justify-center gap-4">
            {onSaveToDisk && (
              <button
                onClick={async () => {
                  if (recordedBlob) {
                    const fileName = `recording_${Date.now()}.${settings.format}`
                    try {
                      await onSaveToDisk(recordedBlob, fileName)
                    } catch (error) {
                      onRecordingError?.(error instanceof Error ? error.message : 'Failed to save recording')
                    }
                  }
                }}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <span>💾</span>
                <span>Save to Disk</span>
              </button>
            )}
            
            {onAddToTimeline && (
              <button
                onClick={async () => {
                  if (recordedBlob) {
                    const fileName = `recording_${Date.now()}.${settings.format}`
                    try {
                      await onAddToTimeline(recordedBlob, fileName)
                    } catch (error) {
                      onRecordingError?.(error instanceof Error ? error.message : 'Failed to add to timeline')
                    }
                  }
                }}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <span>🎬</span>
                <span>Add to Timeline</span>
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Keyboard Shortcuts */}
      <div className="pt-4 border-t border-gray-700/30">
        <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-gray-800/70 rounded text-gray-300 font-mono border border-gray-700/50">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-2 py-1 bg-gray-800/70 rounded text-gray-300 font-mono border border-gray-700/50">R</kbd>
            <span>Start/Stop</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-gray-800/70 rounded text-gray-300 font-mono border border-gray-700/50">Esc</kbd>
            <span>Reset</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecorderControls
