import React, { useEffect } from 'react'
import VideoPlayer from '../components/VideoPlayer'
import TrimControls from '../components/TrimControls'
import DualTimeline from '../components/DualTimeline'
import ExportPanel from '../components/ExportPanel'
import { useMediaStore } from '../state/mediaStore'
import { useEditState } from '../state/editState'
import { useExport } from '../hooks/useExport'

const Editor: React.FC = () => {
  const { getSelectedFile } = useMediaStore()
  const { 
    currentFile, 
    setCurrentFile, 
    setDuration, 
    setCurrentTime,
    setPlaying,
    setTrimStart,
    setTrimEnd,
    resetTrim,
    duration,
    currentTime,
    trimStart,
    trimEnd,
    getTrimDuration,
    isTrimValid,
    isPlaying
  } = useEditState()

  const { exportVideo, selectInputPath, selectOutputPath, isExporting, error: exportError, success } = useExport()

  // Sync with selected file from media store
  useEffect(() => {
    const selectedFile = getSelectedFile()
    if (selectedFile && selectedFile !== currentFile) {
      setCurrentFile(selectedFile)
    }
  }, [getSelectedFile, currentFile, setCurrentFile])

  // Show export success message
  useEffect(() => {
    if (success) {
      alert('✅ Video exported successfully!\n\nYou can find your trimmed video in the location you selected.')
    }
  }, [success])

  // Show export error message
  useEffect(() => {
    if (exportError) {
      alert(`❌ Export failed:\n\n${exportError}\n\nMake sure FFmpeg is installed and the file paths are accessible.`)
    }
  }, [exportError])

  const handleTimeUpdate = (time: number, videoDuration: number) => {
    setCurrentTime(time)
    if (duration !== videoDuration) {
      setDuration(videoDuration)
    }
  }

  const handleLoadedMetadata = (videoDuration: number) => {
    setDuration(videoDuration)
  }

  const handlePlay = () => {
    setPlaying(true)
  }

  const handlePause = () => {
    setPlaying(false)
  }

  const handleSeek = (time: number) => {
    setCurrentTime(time)
  }

  const handleSeekToTrimStart = () => {
    handleSeek(trimStart)
  }

  const handleSeekToTrimEnd = () => {
    handleSeek(trimEnd)
  }

  const handleSetTrimStartToCurrent = () => {
    setTrimStart(currentTime)
  }

  const handleSetTrimEndToCurrent = () => {
    setTrimEnd(currentTime)
  }

  const handlePlayPause = () => {
    setPlaying(!isPlaying)
  }

  const handleExport = async () => {
    if (!currentFile) return

    try {
      let inputPath = currentFile.originalPath
      
      // If we don't have the original path, ask user to select the file
      if (!inputPath) {
        alert('📁 Step 1: Please select the original video file from your computer')
        inputPath = await selectInputPath()
        
        if (!inputPath) {
          // User cancelled
          return
        }
      }

      // Ask where to save the output
      const outputFilename = currentFile.name.replace(/\.[^/.]+$/, '') + '_trimmed.mp4'
      const outputPath = await selectOutputPath(outputFilename)
      
      if (!outputPath) {
        // User cancelled
        return
      }

      // Export the video
      await exportVideo({
        inputPath,
        outputPath,
        trimStart,
        trimEnd,
      })
      
    } catch (error) {
      console.error('Export error:', error)
      alert(`❌ Export failed: ${error}`)
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Content with Modern Spacing */}
      <div className="flex-1 flex flex-col overflow-hidden p-6 bg-gradient-to-br from-gray-950 to-gray-900">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Keyboard Shortcuts Banner */}
          {currentFile && (
            <div className="glass rounded-xl border border-blue-500/20 p-4 mb-8 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-xl">⌨️</span>
                  <span className="font-semibold text-white">Keyboard Shortcuts:</span>
                </div>
                <div className="flex items-center gap-6 flex-wrap">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <kbd className="px-2 py-1 bg-gray-800/70 rounded text-gray-300 font-mono border border-gray-700/50">Space</kbd>
                    <kbd className="px-2 py-1 bg-gray-800/70 rounded text-gray-300 font-mono border border-gray-700/50">K</kbd>
                    <span>Play/Pause</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <kbd className="px-2 py-1 bg-gray-800/70 rounded text-gray-300 font-mono border border-gray-700/50">←</kbd>
                    <kbd className="px-2 py-1 bg-gray-800/70 rounded text-gray-300 font-mono border border-gray-700/50">→</kbd>
                    <span>Frame step</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <kbd className="px-2 py-1 bg-gray-800/70 rounded text-gray-300 font-mono border border-gray-700/50">I</kbd>
                    <span>Set In</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <kbd className="px-2 py-1 bg-gray-800/70 rounded text-gray-300 font-mono border border-gray-700/50">O</kbd>
                    <span>Set Out</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <kbd className="px-2 py-1 bg-gray-800/70 rounded text-gray-300 font-mono border border-gray-700/50">F</kbd>
                    <span>Fullscreen</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6 overflow-hidden">{/* Video Player - Takes 3 columns */}
            <div className="lg:col-span-3 flex flex-col overflow-hidden">
              {/* Video Player Container - Takes remaining space */}
              <div className="flex-1 glass rounded-3xl border border-gray-700/30 backdrop-blur-xl p-6 shadow-2xl overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                  <h2 className="text-2xl font-bold text-white">
                    Video Preview
                  </h2>
                  {currentFile && (
                    <div className="flex items-center gap-3 px-4 py-2 bg-green-500/20 border border-green-400/30 rounded-xl">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-300 font-medium text-sm">Ready</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 relative w-full overflow-hidden">
                  <VideoPlayer
                    file={currentFile}
                    className="absolute inset-0 w-full h-full"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onSeek={handleSeek}
                    externalIsPlaying={isPlaying}
                    seekToTime={currentTime}
                  />
                </div>
              </div>

              {/* Dual Timeline - Fixed height */}
              {currentFile && duration > 0 && (
                <div className="mt-6 flex-shrink-0">
                  <DualTimeline
                    duration={duration}
                    currentTime={currentTime}
                    trimStart={trimStart}
                    trimEnd={trimEnd}
                    onSeek={handleSeek}
                    onTrimStartChange={setTrimStart}
                    onTrimEndChange={setTrimEnd}
                  />
                </div>
              )}
            </div>

            {/* Editor Controls - Takes 2 columns */}
            <div className="lg:col-span-2 flex flex-col overflow-auto space-y-4">
              {/* Playback Control */}
              {currentFile && duration > 0 && (
                <div className="glass rounded-2xl border border-gray-700/30 backdrop-blur-xl p-4 shadow-xl">
                  <button
                    onClick={handlePlayPause}
                    className={`
                      w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3
                      ${isPlaying 
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600' 
                        : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                      }
                      text-white shadow-glow-lg hover:scale-[1.02] active:scale-95
                    `}
                  >
                    {isPlaying ? (
                      <>
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                        </svg>
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                        <span>Play</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Trim Controls */}
              {currentFile && duration > 0 && (
                <TrimControls
                  duration={duration}
                  currentTime={currentTime}
                  trimStart={trimStart}
                  trimEnd={trimEnd}
                  onTrimStartChange={setTrimStart}
                  onTrimEndChange={setTrimEnd}
                  onSeekToTrimStart={handleSeekToTrimStart}
                  onSeekToTrimEnd={handleSeekToTrimEnd}
                  onSetTrimStartToCurrent={handleSetTrimStartToCurrent}
                  onSetTrimEndToCurrent={handleSetTrimEndToCurrent}
                  onResetTrim={resetTrim}
                />
              )}

              {/* Export Panel */}
              {currentFile && duration > 0 && (
                <ExportPanel
                  fileName={currentFile.name}
                  trimStart={trimStart}
                  trimEnd={trimEnd}
                  isValid={isTrimValid()}
                  onExport={handleExport}
                  isExporting={isExporting}
                />
              )}

              {/* Instructions */}
              {!currentFile && (
                <div className="glass rounded-3xl border border-gray-700/30 backdrop-blur-xl p-16 shadow-xl h-full flex items-center justify-center">
                  <div className="text-center space-y-8">
                    <div className="relative mx-auto w-36 h-36 bg-gradient-to-br from-gray-700/30 to-gray-800/30 rounded-3xl flex items-center justify-center text-7xl group hover:scale-105 transition-transform duration-500">
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                      <span className="relative z-10">🎬</span>
                    </div>
          <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-white">
                        No video selected
                      </h3>
                      <p className="text-gray-300 text-lg">
                        Go to the Media Library to select a video file for editing
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Editor
