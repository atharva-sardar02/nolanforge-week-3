import React, { useState } from 'react'
import { useMediaStore } from '../state/mediaStore'
import { useRecordingState } from '../state/recordingState'
import { useEditState } from '../state/editState'
import PreviewWebcam from '../components/PreviewWebcam'
import ScreenCapture from '../components/ScreenCapture'
import CombinedCapture from '../components/CombinedCapture'
import RecorderControls from '../components/RecorderControls'
import { downloadRecording, generateRecordingFileName, formatFileSize, saveRecordingToDisk, saveRecordingToDownloads } from '../utils/recordingUtils'

const Recorder: React.FC = () => {
  const [recordingMode, setRecordingMode] = useState<'idle' | 'webcam' | 'screen' | 'combined'>('idle')
  const [recordedFiles, setRecordedFiles] = useState<Array<{ blob: Blob; fileName: string }>>([])
  const [currentStream, setCurrentStream] = useState<MediaStream | null>(null)
  const [multiTrackMode, setMultiTrackMode] = useState(false)
  const [selectedTrackId, setSelectedTrackId] = useState(0)
  
  const { addFile } = useMediaStore()
  const { settings, duration } = useRecordingState()
  
  // Handle recording start
  const handleRecordingStart = () => {
    console.log('🎬 Recording started')
  }
  
  // Handle recording stop
  const handleRecordingStop = async (blob: Blob) => {
    console.log('🛑 Recording stopped, blob size:', formatFileSize(blob.size))
    
    // Just store the blob for the buttons to use
    // Don't automatically add to media library - let buttons handle their own actions
    const fileName = generateRecordingFileName(settings.format)
    setRecordedFiles(prev => [...prev, { blob, fileName }])
    
    console.log('✅ Recording ready for user action')
  }
  
  // Handle recording error
  const handleRecordingError = (error: string) => {
    console.error('❌ Recording error:', error)
  }
  
  // Handle webcam mode
  const handleWebcamMode = () => {
    setRecordingMode('webcam')
  }
  
  // Handle screen mode
  const handleScreenMode = () => {
    setRecordingMode('screen')
  }
  
  // Handle combined mode
  const handleCombinedMode = () => {
    setRecordingMode('combined')
  }
  
  // Handle back to idle
  const handleBackToIdle = () => {
    setRecordingMode('idle')
  }
  
  // Handle download recording
  const handleDownloadRecording = (blob: Blob, fileName: string) => {
    downloadRecording(blob, fileName)
  }
  
  // Handle save recording to disk
  const handleSaveToDisk = async (blob: Blob, fileName: string) => {
    try {
      console.log('💾 Saving recording to disk:', fileName)
      const filePath = await saveRecordingToDisk(blob, fileName)
      if (filePath) {
        console.log('✅ Recording saved to:', filePath)
        alert(`✅ Recording saved successfully!\nLocation: ${filePath}`)
      } else {
        console.log('❌ Save cancelled by user')
      }
    } catch (error) {
      console.error('❌ Failed to save recording:', error)
      alert(`❌ Failed to save recording: ${error}`)
    }
  }
  
  // Handle add recording to timeline
  const handleAddToTimeline = async (blob: Blob, fileName: string) => {
    try {
      console.log('🎬 Adding recording to timeline:', fileName)
      
      // First save to Downloads folder
      const filePath = await saveRecordingToDownloads(blob, fileName)
      if (!filePath) {
        throw new Error('Failed to save recording to Downloads folder')
      }
      
      console.log('✅ Recording saved to Downloads:', filePath)
      
      // Create blob URL for video player
      const blobUrl = URL.createObjectURL(blob)
      
      // Create MediaFile with blob URL for playback and file path for export
      const metadata = {
        duration: duration, // Use the actual recording duration
        resolution: settings.resolution,
        frameRate: settings.frameRate,
        quality: settings.quality,
        format: settings.format,
        audioEnabled: settings.audioEnabled,
        timestamp: Date.now()
      }
      
      // Create MediaFile with blob URL for playback
      const mediaFile = {
        id: `recording_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        name: fileName,
        path: blobUrl, // Use blob URL for video player
        originalPath: filePath, // Keep file path for export
        size: blob.size,
        type: 'video' as const, // Ensure it matches MediaFile interface
        duration: metadata.duration,
        format: metadata.format,
        createdAt: new Date(metadata.timestamp), // Convert to Date object
        lastModified: new Date(metadata.timestamp) // Add missing lastModified property
      }
      
      // Add to media store
      addFile(mediaFile)
      
      // Add to edit state timeline
      const { addClipToTimeline, getTotalDuration } = useEditState.getState()
      addClipToTimeline(mediaFile, selectedTrackId, getTotalDuration())
      
      console.log('✅ Recording added to timeline:', mediaFile.name)
      alert(`✅ Recording added to timeline!\nFile saved to: ${filePath}`)
      
    } catch (error) {
      console.error('❌ Failed to add recording to timeline:', error)
      alert(`❌ Failed to add recording to timeline: ${error}`)
    }
  }
  
  // Render idle state (recording source selection)
  if (recordingMode === 'idle') {
  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="flex-1 overflow-auto p-12 bg-gradient-to-br from-gray-950 to-gray-900">
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-full max-w-6xl">
            <div className="glass rounded-3xl border border-gray-700/30 backdrop-blur-xl p-16 shadow-2xl">
              {/* Header Section */}
              <div className="mb-20">
                <div className="flex items-center justify-center gap-6 mb-6">
                  <div className="relative w-20 h-20 bg-gradient-to-br from-red-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center text-5xl group hover:scale-105 transition-all duration-500 shadow-glow">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500/20 to-purple-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
                    <span className="relative z-10">📹</span>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-purple-400 to-pink-400">
                      Ready to Record
                    </h2>
                    <p className="text-gray-400 text-lg mt-2">
                      Choose your recording source to get started
                    </p>
                  </div>
                </div>
              </div>

              {/* Recording Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-24">
                  <button 
                    onClick={handleWebcamMode}
                    className="group relative glass rounded-3xl p-14 border-2 border-green-500/40 hover:border-green-400/80 transition-all duration-500 hover:scale-[1.03] hover:shadow-glow-lg overflow-hidden bg-gradient-to-br from-green-500/5 to-transparent"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-green-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10 space-y-8 flex flex-col items-center text-center">
                      <div className="w-32 h-32 bg-gradient-to-br from-green-500/40 to-green-600/40 rounded-3xl flex items-center justify-center text-8xl shadow-xl shadow-green-500/20 group-hover:scale-110 transition-transform duration-300">
                        📷
                      </div>
                      <div className="space-y-4 text-center">
                        <div className="text-4xl font-black text-white">Record Webcam</div>
                        <div className="text-lg text-gray-200">Record directly from your camera device</div>
                      </div>
                      <div className="flex items-center justify-center gap-3 text-green-300 font-bold text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span>Start Recording</span>
                        <span className="text-xl">→</span>
                      </div>
                    </div>
                  </button>

                  <button 
                    onClick={handleScreenMode}
                    className="group relative glass rounded-3xl p-14 border-2 border-blue-500/40 hover:border-blue-400/80 transition-all duration-500 hover:scale-[1.03] hover:shadow-glow-lg overflow-hidden bg-gradient-to-br from-blue-500/5 to-transparent"
                  >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10 space-y-8 flex flex-col items-center text-center">
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-500/40 to-blue-600/40 rounded-3xl flex items-center justify-center text-8xl shadow-xl shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                      🖥️
                    </div>
                    <div className="space-y-4 text-center">
                      <div className="text-4xl font-black text-white">Record Screen</div>
                      <div className="text-lg text-gray-200">Capture your entire screen or a specific window</div>
                    </div>
                    <div className="flex items-center justify-center gap-3 text-blue-300 font-bold text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span>Start Recording</span>
                      <span className="text-xl">→</span>
                    </div>
                  </div>
                </button>

                  <button 
                    onClick={handleCombinedMode}
                    className="group relative glass rounded-3xl p-14 border-2 border-purple-500/40 hover:border-purple-400/80 transition-all duration-500 hover:scale-[1.03] hover:shadow-glow-lg overflow-hidden bg-gradient-to-br from-purple-500/5 to-transparent"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10 space-y-8 flex flex-col items-center text-center">
                      <div className="w-32 h-32 bg-gradient-to-br from-purple-500/40 to-purple-600/40 rounded-3xl flex items-center justify-center text-8xl shadow-xl shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                        🎥
                    </div>
                    <div className="space-y-4 text-center">
                        <div className="text-4xl font-black text-white">Record Both</div>
                        <div className="text-lg text-gray-200">Record screen and webcam simultaneously</div>
                    </div>
                      <div className="flex items-center justify-center gap-3 text-purple-300 font-bold text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span>Start Recording</span>
                      <span className="text-xl">→</span>
                    </div>
                  </div>
                </button>
              </div>

                {/* Recent Recordings */}
                {recordedFiles.length > 0 && (
                  <div className="glass rounded-3xl border border-gray-700/30 p-8 bg-gradient-to-br from-gray-800/20 to-gray-900/30 mb-8">
                    <h3 className="text-xl font-bold text-white mb-6">Recent Recordings</h3>
                    <div className="space-y-3">
                      {recordedFiles.slice(-3).map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">🎬</span>
                            <div>
                              <p className="text-white font-medium">{file.fileName}</p>
                              <p className="text-gray-400 text-sm">{formatFileSize(file.blob.size)}</p>
                    </div>
                  </div>
                          <button
                            onClick={() => handleDownloadRecording(file.blob, file.fileName)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                          >
                            Download
                          </button>
                        </div>
                      ))}
                </div>
              </div>
                )}

              {/* Quick Tips */}
              <div className="mt-20 pt-16 border-t border-gray-700/30">
                <h4 className="text-2xl font-bold text-gray-300 mb-10 flex items-center gap-3 justify-center">
                  <span className="text-3xl">💡</span>
                  <span>Pro Recording Tips</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="text-4xl mb-2">🎯</div>
                    <p className="text-lg text-white font-semibold">HD Quality</p>
                    <p className="text-sm text-gray-400">Crystal clear video output</p>
                  </div>
                  <div className="space-y-3">
                    <div className="text-4xl mb-2">⚡</div>
                    <p className="text-lg text-white font-semibold">Fast Encoding</p>
                    <p className="text-sm text-gray-400">Quick processing after recording</p>
                  </div>
                  <div className="space-y-3">
                    <div className="text-4xl mb-2">💾</div>
                    <p className="text-lg text-white font-semibold">Auto Save</p>
                    <p className="text-sm text-gray-400">Never lose your recordings</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // Render recording interface
  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-gray-700/30">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToIdle}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-white">
            {recordingMode === 'webcam' ? 'Webcam Recording' : 
             recordingMode === 'screen' ? 'Screen Recording' : 
             'Combined Recording'}
          </h1>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <span className="text-lg">📹</span>
          <span className="font-medium">
            {recordingMode === 'webcam' ? 'Webcam' : 
             recordingMode === 'screen' ? 'Screen' : 
             'Combined'}
          </span>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
            {/* Preview Area - Takes 2 columns on large screens */}
            <div className="xl:col-span-2">
              <div className="glass rounded-3xl border border-gray-700/30 p-8 bg-gradient-to-br from-gray-800/20 to-gray-900/30">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Live Preview</h2>
                  <p className="text-gray-400">Your recording will appear here</p>
                </div>
                <div className="flex justify-center">
                  {recordingMode === 'webcam' ? (
                    <PreviewWebcam
                      className="h-[500px] w-full"
                      onStreamReady={(stream) => {
                        console.log('Webcam stream ready:', stream)
                        setCurrentStream(stream)
                      }}
                      onStreamError={(error) => console.error('Webcam stream error:', error)}
                    />
                  ) : recordingMode === 'screen' ? (
                    <ScreenCapture
                      className="h-[500px] w-full"
                      onStreamReady={(stream) => {
                        console.log('Screen stream ready:', stream)
                        setCurrentStream(stream)
                      }}
                      onStreamError={(error) => console.error('Screen stream error:', error)}
                    />
                  ) : (
                    <CombinedCapture
                      className="h-[500px] w-full"
                      onStreamReady={(stream) => {
                        console.log('Combined stream ready:', stream)
                        setCurrentStream(stream)
                      }}
                      onStreamError={(error) => console.error('Combined stream error:', error)}
                    />
                  )}
                </div>
              </div>
            </div>
            
            {/* Controls Area - Takes 1 column on large screens, full width on smaller */}
            <div className="xl:col-span-1 space-y-6">
              {/* Recording Controls */}
              <div className="glass rounded-3xl border border-gray-700/30 p-6 bg-gradient-to-br from-blue-900/10 to-purple-900/10">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-2xl">🎮</span>
                  <span>Recording Controls</span>
                </h3>
                <RecorderControls
                  stream={currentStream}
                  onRecordingStart={handleRecordingStart}
                  onRecordingStop={handleRecordingStop}
                  onRecordingError={handleRecordingError}
                  onSaveToDisk={handleSaveToDisk}
                  onAddToTimeline={handleAddToTimeline}
                  multiTrackMode={multiTrackMode}
                  selectedTrackId={selectedTrackId}
                  onTrackSelect={setSelectedTrackId}
                />
              </div>
              
              {/* Recording Settings */}
              <div className="glass rounded-3xl border border-gray-700/30 p-6 bg-gradient-to-br from-green-900/10 to-blue-900/10">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-2xl">⚙️</span>
                  <span>Recording Settings</span>
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🎯</span>
                      <span className="text-gray-300">Quality</span>
                    </div>
                    <span className="text-white font-semibold capitalize bg-blue-600/20 px-3 py-1 rounded-lg">{settings.quality}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">📐</span>
                      <span className="text-gray-300">Resolution</span>
                    </div>
                    <span className="text-white font-semibold bg-green-600/20 px-3 py-1 rounded-lg">{settings.resolution.width}×{settings.resolution.height}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🎬</span>
                      <span className="text-gray-300">Frame Rate</span>
                    </div>
                    <span className="text-white font-semibold bg-purple-600/20 px-3 py-1 rounded-lg">{settings.frameRate} fps</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">📁</span>
                      <span className="text-gray-300">Format</span>
                    </div>
                    <span className="text-white font-semibold bg-orange-600/20 px-3 py-1 rounded-lg uppercase">{settings.format}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🔊</span>
                      <span className="text-gray-300">Audio</span>
                    </div>
                    <span className={`font-semibold px-3 py-1 rounded-lg ${settings.audioEnabled ? 'text-green-400 bg-green-600/20' : 'text-red-400 bg-red-600/20'}`}>
                      {settings.audioEnabled ? 'On' : 'Off'}
                    </span>
                  </div>
                  
                  {/* Multi-Track Toggle */}
                  <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🎵</span>
                      <span className="text-gray-300">Multi-Track Mode</span>
                    </div>
                    <button
                      onClick={() => setMultiTrackMode(!multiTrackMode)}
                      className={`
                        relative w-16 h-8 rounded-full transition-all duration-300
                        ${multiTrackMode 
                          ? 'bg-blue-600 shadow-lg shadow-blue-500/25' 
                          : 'bg-gray-600 hover:bg-gray-500'
                        }
                      `}
                      title={multiTrackMode ? 'Disable Multi-Track' : 'Enable Multi-Track'}
                    >
                      <div 
                        className={`
                          absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-300
                          ${multiTrackMode ? 'translate-x-9' : 'translate-x-1'}
                        `}
                      />
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                        {multiTrackMode ? '🎵' : '📊'}
                      </div>
                    </button>
                  </div>
                  
                  {/* Track Selection Info */}
                  {multiTrackMode && (
                    <div className="p-4 bg-blue-600/20 rounded-xl border border-blue-500/30">
                      <div className="text-sm text-blue-200">
                        <div className="font-medium mb-2">🎬 Multi-Track Recording:</div>
                        <div className="space-y-1 text-xs">
                          <div>• Track 0: Main video (background)</div>
                          <div>• Track 1: Overlay video (webcam, graphics)</div>
                          <div>• Select track before recording</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Recorder
