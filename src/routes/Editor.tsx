import React, { useEffect } from 'react'
import VideoPlayer from '../components/VideoPlayer'
import TrimControls from '../components/TrimControls'
import Timeline from '../components/Timeline'
import { useMediaStore } from '../state/mediaStore'
import { useEditState } from '../state/editState'

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
    isTrimValid
  } = useEditState()

  // Sync with selected file from media store
  useEffect(() => {
    const selectedFile = getSelectedFile()
    if (selectedFile && selectedFile !== currentFile) {
      setCurrentFile(selectedFile)
    }
  }, [getSelectedFile, currentFile, setCurrentFile])

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

  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Content with Modern Spacing */}
      <div className="flex-1 overflow-auto p-12 bg-gradient-to-br from-gray-950 to-gray-900">
        <div className="w-full h-full">
          {/* Keyboard Shortcuts Banner */}
          {currentFile && (
            <div className="glass rounded-xl border border-blue-500/20 p-4 mb-8 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-xl">⌨️</span>
                  <span className="font-semibold text-white">Keyboard Shortcuts:</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <kbd className="px-2 py-1 bg-gray-800/70 rounded text-gray-300 font-mono border border-gray-700/50">Space</kbd>
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
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 h-full">{/* Video Player - Takes 3 columns */}
            <div className="lg:col-span-3 space-y-10">
              <div className="glass rounded-3xl border border-gray-700/30 backdrop-blur-xl p-10 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-white">
                    Video Preview
                  </h2>
                  {currentFile && (
                    <div className="flex items-center gap-3 px-6 py-3 bg-green-500/20 border border-green-400/30 rounded-xl">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-300 font-medium text-lg">Ready</span>
                    </div>
                  )}
                </div>
                <VideoPlayer
                  file={currentFile}
                  className="h-[500px]"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onPlay={handlePlay}
                  onPause={handlePause}
                  onSeek={handleSeek}
                />
              </div>

              {/* Timeline */}
              {currentFile && duration > 0 && (
                <div className="animate-fade-in">
                  <Timeline
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
            <div className="lg:col-span-2 space-y-8">
              {/* File Info */}
              {currentFile && (
                <div className="glass rounded-3xl border border-gray-700/30 backdrop-blur-xl p-8 shadow-xl animate-fade-in">
                  <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                    <span className="text-3xl">📄</span>
                    File Info
                  </h3>
                  <div className="space-y-5">
                    <div className="p-4 bg-gray-800/40 rounded-2xl">
                      <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Name</span>
                      <span className="text-white font-medium text-base break-all">
                        {currentFile.name}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-800/40 rounded-2xl">
                        <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Format</span>
                        <span className="text-white font-mono font-bold uppercase text-base">
                          {currentFile.format}
                        </span>
                      </div>
                      <div className="p-4 bg-gray-800/40 rounded-2xl">
                        <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Duration</span>
                        <span className="text-white font-mono font-bold text-base">
                          {duration > 0 ? `${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, '0')}` : '--:--'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Trim Controls */}
              {currentFile && duration > 0 && (
                <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
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
                </div>
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
