import React, { useEffect, useState } from 'react'
import VideoPlayer from '../components/VideoPlayer'
import Timeline from '../components/Timeline'
import ContinuousTimeline from '../components/ContinuousTimeline'
import TrimControls from '../components/TrimControls'
import { useMediaStore } from '../state/mediaStore'
import { useEditState } from '../state/editState'
import { useExport } from '../hooks/useExport'

const Editor: React.FC = () => {
  const { getFileById } = useMediaStore()
  const { 
    timelineClips,
    selectedClipId,
    currentTime,
    isPlaying,
    globalTrimStart,
    globalTrimEnd,
    setPlaying,
    setCurrentTime,
    selectClip,
    removeClipFromTimeline,
    moveClip,
    getTotalDuration,
    setGlobalTrimStart,
    setGlobalTrimEnd
  } = useEditState()

  const { exportMultiClipVideo, isExporting, error: exportError, success } = useExport()

  const [currentDisplayClip, setCurrentDisplayClip] = useState<any>(null)
  const [localTime, setLocalTime] = useState(0)

  // Auto-select first clip when clips are added
  useEffect(() => {
    if (timelineClips.length > 0 && !selectedClipId) {
      const firstClip = timelineClips.find(c => c.trackId === 0)
      if (firstClip) {
        selectClip(firstClip.id)
      }
    }
  }, [timelineClips.length, selectedClipId, timelineClips, selectClip])

  const totalDuration = getTotalDuration()
  const selectedClip = selectedClipId ? timelineClips.find(c => c.id === selectedClipId) : undefined

  useEffect(() => {
    if (success) alert('✅ Video exported successfully!')
  }, [success])

  useEffect(() => {
    if (exportError) alert(`❌ Export failed:\n\n${exportError}`)
  }, [exportError])

  // Update video display based on currentTime on the global timeline
  useEffect(() => {
    if (timelineClips.length === 0) {
      setCurrentDisplayClip(null)
      setLocalTime(0)
      return
    }

    // Find which clip should be playing at the current global time
    const mainTrackClips = timelineClips
      .filter(c => c.trackId === 0)
      .sort((a, b) => a.startTime - b.startTime)
    
    // Find the clip that contains currentTime
    let clipToDisplay = mainTrackClips.find(clip => 
      currentTime >= clip.startTime && currentTime < (clip.startTime + clip.duration)
    )
    
    // If no clip found at exact time, find the closest one before currentTime
    if (!clipToDisplay && mainTrackClips.length > 0) {
      // Find last clip that starts before or at currentTime
      const clipsBeforeOrAt = mainTrackClips.filter(clip => clip.startTime <= currentTime)
      if (clipsBeforeOrAt.length > 0) {
        clipToDisplay = clipsBeforeOrAt[clipsBeforeOrAt.length - 1]
      } else {
        // If currentTime is before all clips, use first clip
        clipToDisplay = mainTrackClips[0]
      }
    }
    
    if (clipToDisplay) {
      const mediaFile = getFileById(clipToDisplay.mediaFileId)
      if (mediaFile && mediaFile.id !== currentDisplayClip?.id) {
        console.log('🎥 Loading clip at time', currentTime, ':', mediaFile.name)
        setCurrentDisplayClip(mediaFile)
      }
      
      // Calculate the local time within this clip's source video
      const timeIntoClip = currentTime - clipToDisplay.startTime
      const sourceTime = clipToDisplay.trimStart + timeIntoClip
      setLocalTime(Math.max(clipToDisplay.trimStart, Math.min(sourceTime, clipToDisplay.trimEnd)))
      
      // Auto-select this clip if not already selected
      if (clipToDisplay.id !== selectedClipId) {
        console.log('🎯 Auto-selecting clip:', clipToDisplay.id)
        selectClip(clipToDisplay.id)
      }
    }
  }, [currentTime, timelineClips, getFileById, selectedClipId, selectClip, currentDisplayClip?.id])

  const handleTimeUpdate = (time: number) => {
    // Update local time to show position within current clip
    setLocalTime(time)
    
    // Find which clip is currently loaded
    const mainTrackClips = timelineClips
      .filter(c => c.trackId === 0)
      .sort((a, b) => a.startTime - b.startTime)
    
    const currentClip = mainTrackClips.find(c => c.id === selectedClipId)
    if (!currentClip) return
    
    // ALWAYS update global timeline position based on video time (whether playing or paused)
    const newGlobalTime = currentClip.startTime + (time - currentClip.trimStart)
    setCurrentTime(newGlobalTime)
    
    // Note: Clip transitions are now handled by the onEnded event
    // This prevents race conditions between timeupdate and ended events
  }

  const handleExport = async () => {
    if (timelineClips.length === 0) {
      alert('⚠️ No clips on timeline to export')
      return
    }

    try {
      const mainTrackClips = timelineClips
        .filter(c => c.trackId === 0)
        .sort((a, b) => a.startTime - b.startTime)
      
      // Use global trim range (default to full timeline if not set)
      const exportStart = globalTrimStart
      const exportEnd = globalTrimEnd || totalDuration
      
      console.log(`📤 Exporting from ${exportStart}s to ${exportEnd}s (total: ${exportEnd - exportStart}s)`)
      
      // Find clips that intersect with the export range
      const clipsForExport = mainTrackClips
        .filter(clip => {
          const clipEnd = clip.startTime + clip.duration
          // Check if clip intersects with export range
          return clip.startTime < exportEnd && clipEnd > exportStart
        })
        .map(clip => {
          const mediaFile = getFileById(clip.mediaFileId)
          const clipEnd = clip.startTime + clip.duration
          
          // Calculate how much of this clip falls within the export range
          const clipExportStart = Math.max(exportStart, clip.startTime)
          const clipExportEnd = Math.min(exportEnd, clipEnd)
          
          // Convert to source video time
          const timeIntoClip = clipExportStart - clip.startTime
          const sourceTrimStart = clip.trimStart + timeIntoClip
          
          const exportDuration = clipExportEnd - clipExportStart
          const sourceTrimEnd = sourceTrimStart + exportDuration
          
          console.log(`  Clip: ${mediaFile?.name}`)
          console.log(`    Global range: ${clipExportStart}s - ${clipExportEnd}s`)
          console.log(`    Source range: ${sourceTrimStart}s - ${sourceTrimEnd}s`)
          
          return {
            inputPath: mediaFile?.originalPath || '',
            trimStart: sourceTrimStart,
            trimEnd: sourceTrimEnd,
            mediaFile
          }
        })

      if (clipsForExport.length === 0) {
        alert('⚠️ No clips in the selected export range')
        return
      }

      const missingPaths = clipsForExport.filter(c => !c.inputPath)
      if (missingPaths.length > 0) {
        alert('⚠️ Some clips are missing file paths. Please re-import the files.')
        return
      }

      console.log(`📤 Exporting ${clipsForExport.length} clip(s)`)
      await exportMultiClipVideo(clipsForExport)
      
    } catch (error) {
      console.error('Export error:', error)
      alert(`❌ Export failed: ${error}`)
    }
  }
  
  // Handler for continuous timeline seeking
  const handleContinuousTimelineSeek = (time: number) => {
    console.log('Seeking to global time:', time)
    setCurrentTime(time)
    
    // If currently playing, keep playing
    // The useEffect will handle loading the correct clip
  }

  const handleTrimStartChange = (time: number) => {
    if (!selectedClip) return
    const state = useEditState.getState()
    const updatedClips = state.timelineClips.map(c => {
      if (c.id === selectedClip.id) {
        const newDuration = c.trimEnd - time
        return { ...c, trimStart: time, duration: newDuration }
      }
      return c
    })
    useEditState.setState({ timelineClips: updatedClips })
  }

  const handleTrimEndChange = (time: number) => {
    if (!selectedClip) return
    const state = useEditState.getState()
    const updatedClips = state.timelineClips.map(c => {
      if (c.id === selectedClip.id) {
        const newDuration = time - c.trimStart
        return { ...c, trimEnd: time, duration: newDuration }
      }
      return c
    })
    useEditState.setState({ timelineClips: updatedClips })
  }

  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Top Control Bar */}
      <div className="flex-shrink-0 glass border-b border-gray-700/30 backdrop-blur-xl">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Play Button */}
            <button
              onClick={() => setPlaying(!isPlaying)}
              disabled={timelineClips.length === 0}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-3 text-lg ${
                timelineClips.length === 0 
                  ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed' 
                  : isPlaying 
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-glow' 
                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-glow'
              }`}
            >
              {isPlaying ? '⏸️ Pause' : '▶️ Play'}
            </button>

            {/* Clip Count */}
            {timelineClips.length > 0 && (
              <div className="flex items-center gap-3 px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-xl">
                <span className="text-blue-300 font-medium text-sm">
                  {timelineClips.length} clip{timelineClips.length !== 1 ? 's' : ''} on timeline
                </span>
                </div>
            )}

            {/* Export Button */}
            <button
              onClick={handleExport}
              disabled={isExporting || timelineClips.length === 0}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 text-lg ${
                isExporting || timelineClips.length === 0
                  ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-glow hover:scale-105'
              }`}
            >
              {isExporting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Exporting...</span>
                </>
              ) : (
                <>⬇️ Export</>
              )}
            </button>
                  </div>
                </div>
              </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Video Player */}
          <div className="glass rounded-3xl border border-gray-700/30 backdrop-blur-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Video Preview</h2>
              {currentDisplayClip && (
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-400">
                    Playing: {currentDisplayClip.name}
                  </div>
                  {timelineClips.length > 1 && (
                    <div className="px-3 py-1 bg-green-500/20 border border-green-400/30 rounded-lg text-green-300 text-xs font-semibold">
                      ▶️ Continuous Playback Active
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {currentDisplayClip ? (
              <div className="w-full" style={{ height: '500px' }}>
                  <VideoPlayer
                  file={currentDisplayClip}
                  className="w-full h-full"
                    onTimeUpdate={handleTimeUpdate}
                    externalIsPlaying={isPlaying}
                    seekToTime={localTime}
                    onEnded={() => {
                      // Get fresh state directly from Zustand to avoid stale closure
                      const currentState = useEditState.getState()
                      const wasPlaying = currentState.isPlaying
                      
                      console.log('🎬 Video ended event triggered')
                      console.log('   Current isPlaying state:', wasPlaying)
                      console.log('   Will attempt transition...')
                      
                      // Trigger clip transition
                      const mainTrackClips = currentState.timelineClips
                        .filter(c => c.trackId === 0)
                        .sort((a, b) => a.startTime - b.startTime)
                      const currentClipIndex = mainTrackClips.findIndex(c => c.id === currentState.selectedClipId)
                      
                      console.log(`Current clip index: ${currentClipIndex}, total clips: ${mainTrackClips.length}`)
                      
                      if (currentClipIndex >= 0 && currentClipIndex < mainTrackClips.length - 1) {
                        // There's a next clip - transition to it
                        const nextClip = mainTrackClips[currentClipIndex + 1]
                        console.log(`🎬 Moving to next clip: ${nextClip.id}`)
                        console.log(`   Next clip start: ${nextClip.startTime}, trimStart: ${nextClip.trimStart}`)
                        
                        // ALWAYS continue playing when transitioning (ignore wasPlaying state)
                        // The video ended naturally, so we should continue
                        console.log('   Setting playing state to TRUE for continuation')
                        setPlaying(true)
                        
                        // Move to the next clip's start time
                        setCurrentTime(nextClip.startTime)
                        // Select the next clip (this will trigger video load)
                        selectClip(nextClip.id)
                      } else {
                        // No more clips - stop playback
                        console.log('🎬 No more clips - stopping')
                        setPlaying(false)
                        setCurrentTime(0)
                        if (mainTrackClips.length > 0) {
                          selectClip(mainTrackClips[0].id)
                        }
                      }
                    }}
                />
              </div>
            ) : (
              <div className="w-full flex items-center justify-center bg-black rounded-lg" style={{ height: '500px' }}>
                <div className="text-center text-gray-400">
                  <div className="text-4xl mb-4">🎬</div>
                  <p>No video loaded</p>
                  <p className="text-sm mt-2">Clips: {timelineClips.length}</p>
                  <p className="text-sm">Selected: {selectedClipId || 'none'}</p>
                </div>
                </div>
              )}
            </div>

          {/* Continuous Timeline - Shows all clips */}
          {timelineClips.length > 0 && (
            <ContinuousTimeline
              clips={timelineClips}
              selectedClipId={selectedClipId}
              currentTime={currentTime}
              totalDuration={totalDuration}
              globalTrimStart={globalTrimStart}
              globalTrimEnd={globalTrimEnd}
              onClipSelect={selectClip}
              onClipMove={(clipId, newStartTime) => moveClip(clipId, 0, newStartTime)}
              onClipRemove={removeClipFromTimeline}
              onSeek={handleContinuousTimelineSeek}
              onGlobalTrimStartChange={setGlobalTrimStart}
              onGlobalTrimEndChange={setGlobalTrimEnd}
            />
          )}

          {/* Individual Clip Timeline - For trimming selected clip */}
          {timelineClips.length > 0 && selectedClip && (
            <div className="glass rounded-3xl border border-gray-700/30 backdrop-blur-xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Trim Selected Clip</h3>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm">
                    {getFileById(selectedClip.mediaFileId)?.name}
                  </span>
                </div>
              </div>
              
              <Timeline
                duration={selectedClip.sourceDuration}
                currentTime={localTime}
                trimStart={selectedClip.trimStart}
                trimEnd={selectedClip.trimEnd}
                onSeek={(time) => {
                  // Allow seeking anywhere in the source video, not constrained by trim points
                  setLocalTime(time)
                  const newGlobalTime = selectedClip.startTime + (time - selectedClip.trimStart)
                  setCurrentTime(newGlobalTime)
                }}
                onTrimStartChange={handleTrimStartChange}
                onTrimEndChange={handleTrimEndChange}
              />
                </div>
              )}

              {/* Trim Controls */}
          {selectedClip && (
                <TrimControls
              duration={selectedClip.sourceDuration}
              currentTime={localTime}
              trimStart={selectedClip.trimStart}
              trimEnd={selectedClip.trimEnd}
              onTrimStartChange={handleTrimStartChange}
              onTrimEndChange={handleTrimEndChange}
              onSeekToTrimStart={() => setCurrentTime(selectedClip.startTime)}
              onSeekToTrimEnd={() => setCurrentTime(selectedClip.startTime + selectedClip.duration)}
              onSetTrimStartToCurrent={() => handleTrimStartChange(localTime)}
              onSetTrimEndToCurrent={() => handleTrimEndChange(localTime)}
              onResetTrim={() => {
                handleTrimStartChange(0)
                handleTrimEndChange(selectedClip.sourceDuration)
              }}
            />
          )}

          {/* Empty State */}
          {timelineClips.length === 0 && (
            <div className="glass rounded-3xl border border-gray-700/30 backdrop-blur-xl p-16 shadow-2xl">
              <div className="text-center space-y-6">
                <div className="text-6xl">🎬</div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-white">No Clips Yet</h3>
                  <p className="text-gray-400 text-lg">
                    Go to Uploader and click "Edit" on videos to add them to the timeline
                      </p>
                    </div>
                  </div>
                </div>
              )}
        </div>
      </div>
    </div>
  )
}

export default Editor
