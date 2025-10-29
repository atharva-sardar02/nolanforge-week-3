import React, { useEffect, useState, useCallback } from 'react'
import VideoPlayer from '../components/VideoPlayer'
import MultiTrackVideoPlayer from '../components/MultiTrackVideoPlayer'
import Timeline from '../components/Timeline'
import ContinuousTimeline from '../components/ContinuousTimeline'
import TrimControls from '../components/TrimControls'
import TimelineTools from '../components/TimelineTools'
import OverlayControls from '../components/OverlayControls'
import { TranscriptionPanel } from '../components/TranscriptionPanel'
import { useMediaStore } from '../state/mediaStore'
import { useEditState } from '../state/editState'
import { useExport } from '../hooks/useExport'

const Editor: React.FC = () => {
  const { getFileById, files } = useMediaStore()
  const { 
    timelineClips,
    selectedClipId,
    currentTime,
    isPlaying,
    globalTrimStart,
    globalTrimEnd,
    zoomLevel,
    setPlaying,
    setCurrentTime,
    selectClip,
    removeClipFromTimeline,
    moveClip,
    updateClip,
    splitClipAtPlayhead,
    getTotalDuration,
    setGlobalTrimStart,
    setGlobalTrimEnd,
    setZoomLevel
  } = useEditState()

  const { exportMultiClipVideo, exportMultiTrackVideo, isExporting, error: exportError, success } = useExport()

  const [currentDisplayClip, setCurrentDisplayClip] = useState<any>(null)
  const [localTime, setLocalTime] = useState(0)
  const [multiTrackMode, setMultiTrackMode] = useState(true)
  const [showTranscriptionPanel, setShowTranscriptionPanel] = useState(false)

  // Keyboard shortcuts for zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle zoom shortcuts when Ctrl is pressed
      if (!e.ctrlKey) return
      
      switch (e.key) {
        case '+':
        case '=':
          e.preventDefault()
          setZoomLevel(Math.min(200, zoomLevel + 25))
          console.log('🔍 Zoom In:', Math.min(200, zoomLevel + 25))
          break
        case '-':
          e.preventDefault()
          setZoomLevel(Math.max(10, zoomLevel - 25))
          console.log('🔍 Zoom Out:', Math.max(10, zoomLevel - 25))
          break
        case '0':
          e.preventDefault()
          setZoomLevel(50)
          console.log('🔍 Zoom Reset: 50')
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [zoomLevel, setZoomLevel])
  const [forcePlay, setForcePlay] = useState(false) // Force play trigger

  // Timeline tool handlers
  const handleSplitClip = useCallback(() => {
    if (selectedClipId) {
      splitClipAtPlayhead()
    }
  }, [selectedClipId, splitClipAtPlayhead])

  const handleDeleteClip = useCallback(() => {
    if (selectedClipId) {
      removeClipFromTimeline(selectedClipId)
    }
  }, [selectedClipId, removeClipFromTimeline])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default behavior for our shortcuts
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        handleSplitClip()
      } else if (e.key === 'Delete' && selectedClipId) {
        e.preventDefault()
        handleDeleteClip()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSplitClip, handleDeleteClip, selectedClipId])

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
  // FORCE REFRESH - Updated debugging
  useEffect(() => {
    console.log('🚨 EDITOR USEEFFECT CALLED - multiTrackMode:', multiTrackMode, 'currentTime:', currentTime)
    console.log('🔍 Editor useEffect - multiTrackMode:', multiTrackMode)
    // Skip single-track logic when in multi-track mode
    if (multiTrackMode) {
      console.log('⏭️ Skipping single-track logic - in multi-track mode')
      return
    }
    
    console.log('🎬 Running single-track logic')
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
    // If there's ambiguity (e.g., at exact boundaries), prioritize the currently selected clip
    let clipToDisplay = mainTrackClips.find(clip => 
      currentTime >= clip.startTime && currentTime <= (clip.startTime + clip.duration)
    )
    
    // If we found a clip but it's not the selected one, and we're at a boundary,
    // prioritize the selected clip if it also contains this time
    if (clipToDisplay && clipToDisplay.id !== selectedClipId && selectedClipId) {
      const selectedClip = mainTrackClips.find(c => c.id === selectedClipId)
      if (selectedClip && currentTime >= selectedClip.startTime && currentTime <= (selectedClip.startTime + selectedClip.duration)) {
        console.log('   Boundary ambiguity - prioritizing selected clip:', selectedClip.id)
        clipToDisplay = selectedClip
      }
    }
    
    console.log('🔍 Finding clip for currentTime:', currentTime)
    console.log('   Available clips:', mainTrackClips.map(c => ({ id: c.id, startTime: c.startTime, duration: c.duration, endTime: c.startTime + c.duration })))
    console.log('   Found clip:', clipToDisplay ? { id: clipToDisplay.id, startTime: clipToDisplay.startTime, duration: clipToDisplay.duration } : 'none')
    
    // If no clip found at exact time, check if we're in a gap
    if (!clipToDisplay && mainTrackClips.length > 0) {
      // Check if currentTime is before the first clip
      if (currentTime < mainTrackClips[0].startTime) {
        // Before first clip - show blank screen
        setCurrentDisplayClip(null)
        setLocalTime(0)
        return
      }
      
      // Check if currentTime is after the last clip
      const lastClip = mainTrackClips[mainTrackClips.length - 1]
      if (currentTime >= lastClip.startTime + lastClip.duration) {
        // After last clip - show blank screen and pause if playing
        setCurrentDisplayClip(null)
        setLocalTime(0)
        // Note: We can't check isPlaying here due to dependency issues
        // The pause logic is handled in the onEnded handler instead
        return
      }
      
      // We're in a gap between clips - show blank screen
      setCurrentDisplayClip(null)
      setLocalTime(0)
      return
    }
    
    if (clipToDisplay) {
      const mediaFile = getFileById(clipToDisplay.mediaFileId)
      const isNewClip = mediaFile && mediaFile.id !== currentDisplayClip?.id
      
      if (mediaFile && isNewClip) {
        console.log('🎥 Loading NEW clip at time', currentTime, ':', mediaFile.name)
        console.log('   Clip details:', { 
          id: clipToDisplay.id, 
          startTime: clipToDisplay.startTime, 
          duration: clipToDisplay.duration,
          trimStart: clipToDisplay.trimStart,
          trimEnd: clipToDisplay.trimEnd
        })
        setCurrentDisplayClip(mediaFile)
        
        // For new clips, always start from trimStart
        console.log('   Setting localTime to:', clipToDisplay.trimStart, '(NEW CLIP - starting from beginning)')
        setLocalTime(clipToDisplay.trimStart)
      } else if (mediaFile) {
        // For existing clips, calculate the proper time
        const timeIntoClip = currentTime - clipToDisplay.startTime
        const sourceTime = clipToDisplay.trimStart + timeIntoClip
        const finalLocalTime = Math.max(clipToDisplay.trimStart, Math.min(sourceTime, clipToDisplay.trimEnd))
        
        console.log('   Setting localTime to:', finalLocalTime, '(EXISTING CLIP - timeIntoClip:', timeIntoClip, ', sourceTime:', sourceTime, ')')
        setLocalTime(finalLocalTime)
      }
      
      // Auto-select this clip if not already selected
      if (clipToDisplay.id !== selectedClipId) {
        console.log('🎯 Auto-selecting clip:', clipToDisplay.id)
        selectClip(clipToDisplay.id)
      }
    }
  }, [currentTime, timelineClips, getFileById, selectClip, multiTrackMode])

  // Reset force play trigger after it's been used
  useEffect(() => {
    if (forcePlay) {
      console.log('🔄 Force play triggered, resetting...')
      const timer = setTimeout(() => {
        setForcePlay(false)
        console.log('🔄 Force play reset')
      }, 500) // Reset after 500ms
      return () => clearTimeout(timer)
    }
  }, [forcePlay])

  const handleTimeUpdate = (time: number) => {
    // Update local time to show position within current clip
    setLocalTime(time)
    
    // Find which clip is currently loaded
    const mainTrackClips = timelineClips
      .filter(c => c.trackId === 0)
      .sort((a, b) => a.startTime - b.startTime)
    
    const currentClip = mainTrackClips.find(c => c.id === selectedClipId)
    if (!currentClip) return
    
    // Calculate global timeline position
    const newGlobalTime = currentClip.startTime + (time - currentClip.trimStart)
    
    // Only update currentTime if we're not near the end of the clip
    // This allows the video to reach its natural end and trigger the 'ended' event
    const timeUntilEnd = currentClip.duration - (time - currentClip.trimStart)
    if (timeUntilEnd > 0.1) { // Only update if more than 0.1 seconds from end
      setCurrentTime(newGlobalTime)
    }
    
    // Note: Clip transitions are now handled by the onEnded event
    // This prevents race conditions between timeupdate and ended events
  }

  const handleExport = async () => {
    if (timelineClips.length === 0) {
      alert('⚠️ No clips on timeline to export')
      return
    }

    try {
      // Use global trim range (default to full timeline if not set)
      const exportStart = globalTrimStart
      const exportEnd = globalTrimEnd || totalDuration
      
      console.log(`📤 Exporting from ${exportStart}s to ${exportEnd}s (total: ${exportEnd - exportStart}s)`)
      
      if (multiTrackMode) {
        // Multi-track export: compose video with overlays and main track audio
        const clipsForExport = timelineClips
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
            
            console.log(`  Multi-track Clip (Track ${clip.trackId}): ${mediaFile?.name}`)
            console.log(`    Global range: ${clipExportStart}s - ${clipExportEnd}s`)
            console.log(`    Source range: ${sourceTrimStart}s - ${sourceTrimEnd}s`)
            
            return {
              inputPath: mediaFile?.originalPath || '',
              trackId: clip.trackId,
              startTime: clipExportStart,
              duration: exportDuration,
              trimStart: sourceTrimStart,
              trimEnd: sourceTrimEnd,
              overlayPosition: clip.overlayPosition,
              overlaySize: clip.overlaySize,
              overlayOpacity: clip.overlayOpacity,
              overlayBlendMode: clip.overlayBlendMode,
            }
          })

        if (clipsForExport.length === 0) {
          alert('⚠️ No clips in the selected export range')
          return
        }

        const missingPaths = clipsForExport.filter(c => !c.inputPath || c.inputPath.trim() === '')
        if (missingPaths.length > 0) {
          alert('⚠️ Some clips are missing file paths. Please re-import the files using the file browser (not drag & drop).')
          return
        }

        console.log(`📤 Exporting ${clipsForExport.length} multi-track clip(s)`)
        await exportMultiTrackVideo(clipsForExport, exportStart, exportEnd)
      } else {
        // Single-track export: use existing logic
        const mainTrackClips = timelineClips
          .filter(c => c.trackId === 0)
          .sort((a, b) => a.startTime - b.startTime)
        
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

        const missingPaths = clipsForExport.filter(c => !c.inputPath || c.inputPath.trim() === '')
        if (missingPaths.length > 0) {
          alert('⚠️ Some clips are missing file paths. Please re-import the files using the file browser (not drag & drop).')
          return
        }

        console.log(`📤 Exporting ${clipsForExport.length} clip(s)`)
        await exportMultiClipVideo(clipsForExport)
      }
      
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

  // Trim timeline to green/purple markers range
  const handleTrimTimeline = () => {
    const state = useEditState.getState()
    const { timelineClips, globalTrimStart, globalTrimEnd, selectedClipId, currentTime, getTotalDuration } = state
    const totalDuration = getTotalDuration()
    
    // Calculate trim range
    const trimStart = globalTrimStart
    const trimEnd = globalTrimEnd !== null ? globalTrimEnd : totalDuration
    
    // Validate trim range
    if (trimStart >= trimEnd || trimStart < 0 || trimEnd > totalDuration) {
      alert('⚠️ Invalid trim range. Please set green and purple markers correctly.')
      return
    }
    
    // If range covers entire timeline, nothing to do
    if (trimStart === 0 && Math.abs(trimEnd - totalDuration) < 0.01) {
      alert('ℹ️ Timeline already covers the full range.')
      return
    }
    
    // Filter and process clips that intersect with trim range
    const trimmedClips: typeof timelineClips = []
    let newSelectedClipId: string | null = null
    
    for (const clip of timelineClips) {
      const clipEnd = clip.startTime + clip.duration
      
      // Check if clip intersects with trim range
      if (clip.startTime < trimEnd && clipEnd > trimStart) {
        // Calculate the portion of this clip within the trim range
        const clipNewStart = Math.max(trimStart, clip.startTime)
        const clipNewEnd = Math.min(trimEnd, clipEnd)
        const clipNewDuration = clipNewEnd - clipNewStart
        
        // Skip if duration is too small (less than 0.01 seconds)
        if (clipNewDuration < 0.01) {
          continue
        }
        
        // Calculate how much time into the original clip we need
        const timeIntoOriginalClip = clipNewStart - clip.startTime
        
        // Update source trim points
        const timeIntoSource = clip.trimStart + timeIntoOriginalClip
        const newSourceTrimStart = timeIntoSource
        const newSourceTrimEnd = newSourceTrimStart + clipNewDuration
        
        // Ensure source trim points are valid
        if (newSourceTrimEnd > clip.sourceDuration) {
          // Clip would extend beyond source - adjust duration
          const maxAllowedDuration = clip.sourceDuration - newSourceTrimStart
          if (maxAllowedDuration < 0.01) {
            continue // Skip this clip
          }
          const adjustedDuration = Math.min(clipNewDuration, maxAllowedDuration)
          
          // Create trimmed clip with adjusted duration
          // Spread operator preserves all properties (trackId, mediaFileId, overlayPosition, etc.)
          const trimmedClip: typeof clip = {
            ...clip,
            startTime: clipNewStart - trimStart, // Shift to start at 0
            duration: adjustedDuration,
            trimStart: newSourceTrimStart,
            trimEnd: newSourceTrimStart + adjustedDuration,
          }
          trimmedClips.push(trimmedClip)
        } else {
          // Normal case - clip fits within source
          // Spread operator preserves all properties (trackId, mediaFileId, overlayPosition, etc.)
          const trimmedClip: typeof clip = {
            ...clip,
            startTime: clipNewStart - trimStart, // Shift to start at 0
            duration: clipNewDuration,
            trimStart: newSourceTrimStart,
            trimEnd: newSourceTrimEnd,
          }
          trimmedClips.push(trimmedClip)
        }
        
        // If this was the selected clip, keep it selected
        if (clip.id === selectedClipId) {
          newSelectedClipId = clip.id
        }
      }
    }
    
    if (trimmedClips.length === 0) {
      alert('⚠️ No clips remain after trimming. Trim range is outside all clips.')
      return
    }
    
    // Calculate new total duration
    const newTotalDuration = trimEnd - trimStart
    
    // Update state
    const newState = {
      timelineClips: trimmedClips,
      selectedClipId: newSelectedClipId,
      currentTime: Math.max(0, Math.min(currentTime - trimStart, newTotalDuration)),
      globalTrimStart: 0,
      globalTrimEnd: newTotalDuration,
      isPlaying: false // Pause playback after trim
    }
    
    useEditState.setState(newState)
    
    console.log(`✂️ Trimmed timeline: ${timelineClips.length} clips → ${trimmedClips.length} clips`)
    console.log(`   Range: ${trimStart}s - ${trimEnd}s (${newTotalDuration.toFixed(2)}s)`)
  }

  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Top Control Bar */}
      <div className="flex-shrink-0 glass border-b border-gray-700/30 backdrop-blur-xl">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left Side: Play Button and Clip Count */}
            <div className="flex items-center gap-4">
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
            </div>

            {/* Right Side: Timeline Mode Toggle and Export Button */}
            <div className="flex items-center gap-4">
              {/* Timeline Mode Toggle */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className={multiTrackMode ? 'text-gray-500' : 'text-blue-400'}>Single</span>
                  <span className="text-gray-600">•</span>
                  <span className={multiTrackMode ? 'text-blue-400' : 'text-gray-500'}>Multi</span>
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
                  title={multiTrackMode ? 'Switch to Single Track' : 'Switch to Multi-Track'}
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
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-8">
        <div className="w-full space-y-8 max-w-full">
          
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
            
            {multiTrackMode ? (
              /* Multi-Track Video Player */
              <div className="w-full" style={{ height: '500px' }}>
                <MultiTrackVideoPlayer
                  clips={timelineClips}
                  mediaFiles={files}
                  currentTime={currentTime}
                  totalDuration={getTotalDuration()}
                  isPlaying={isPlaying}
                  className="w-full h-full"
                  onTimeUpdate={(time) => {
                    // Update global timeline time
                    setCurrentTime(time)
                  }}
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                  onSeek={(time) => {
                    setCurrentTime(time)
                  }}
                  onEnded={() => {
                    console.log('🎬 Multi-track playback ended')
                    setPlaying(false)
                  }}
                />
              </div>
            ) : currentDisplayClip ? (
              /* Single-Track Video Player */
              <div className="w-full" style={{ height: '500px' }}>
                  <VideoPlayer
                  key={currentDisplayClip?.id || 'no-clip'}
                  file={currentDisplayClip}
                  className="w-full h-full"
                    onTimeUpdate={handleTimeUpdate}
                    externalIsPlaying={isPlaying || forcePlay}
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
                        
                        // Check if there's a gap between current and next clip
                        const currentClip = mainTrackClips[currentClipIndex]
                        const currentClipEnd = currentClip.startTime + currentClip.duration
                        const gapDuration = nextClip.startTime - currentClipEnd
                        
                        if (gapDuration > 0.1) {
                          // There's a significant gap - continue playing through the gap
                          console.log(`🎬 Gap detected: ${gapDuration}s between clips`)
                          console.log(`   Advancing to gap start: ${currentClipEnd}`)
                          setCurrentTime(currentClipEnd)
                          // Keep playing through the gap
                          setPlaying(true)
                          console.log('   Continuing playback through gap')
                          
                          // Set up a timer to advance through the gap
                          const gapTimer = setInterval(() => {
                            const currentState = useEditState.getState()
                            const newTime = currentState.currentTime + 0.1 // Advance by 0.1 seconds
                            if (newTime >= nextClip.startTime) {
                              // Reached the next clip
                              clearInterval(gapTimer)
                              console.log('   Gap completed, transitioning to next clip')
                              setCurrentTime(nextClip.startTime)
                              selectClip(nextClip.id)
                              setForcePlay(true)
                            } else {
                              setCurrentTime(newTime)
                            }
                          }, 100) // Update every 100ms
                        } else {
                          // No significant gap - check if clips overlap
                          if (gapDuration < 0) {
                            // Clips overlap - transition to the end of current clip
                            console.log('   Clips overlap - transitioning to end of current clip')
                            console.log('   Setting playing state to TRUE')
                            setPlaying(true)
                            console.log('   Setting currentTime to:', currentClipEnd)
                            setCurrentTime(currentClipEnd)
                            console.log('   Selecting clip:', nextClip.id)
                            selectClip(nextClip.id)
                            console.log('   Triggering force play')
                            setForcePlay(true) // Trigger force play
                            console.log('   Transition complete - next clip should start playing')
                          } else {
                            // No gap and no overlap - transition directly to next clip
                            console.log('   No gap and no overlap - transitioning directly to next clip')
                            console.log('   Setting playing state to TRUE')
                            setPlaying(true)
                            console.log('   Setting currentTime to:', nextClip.startTime)
                            setCurrentTime(nextClip.startTime)
                            console.log('   Selecting clip:', nextClip.id)
                            selectClip(nextClip.id)
                            console.log('   Triggering force play')
                            setForcePlay(true) // Trigger force play
                            console.log('   Transition complete - next clip should start playing')
                          }
                        }
                      } else {
                        // No more clips - stop playback and reset to beginning
                        console.log('🎬 No more clips - stopping and resetting to beginning')
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
                  <div className="text-6xl mb-4">📺</div>
                  <div className="text-xl font-semibold mb-2">Blank Screen</div>
                  <div className="text-sm">
                    {timelineClips.length === 0 
                      ? 'No clips on timeline' 
                      : 'Gap between clips or end of timeline'
                    }
                  </div>
                </div>
                </div>
              )}
            </div>

          {/* Continuous Timeline - Shows all clips */}
          {timelineClips.length > 0 && (
            <div className="space-y-4">
              <ContinuousTimeline
                clips={timelineClips}
                mediaFiles={files}
                selectedClipId={selectedClipId}
                currentTime={currentTime}
                totalDuration={totalDuration}
                globalTrimStart={globalTrimStart}
                globalTrimEnd={globalTrimEnd}
                pixelsPerSecond={zoomLevel}
                onClipSelect={selectClip}
                onClipMove={(clipId: string, newTrackId: number, newStartTime: number) => {
                  moveClip(clipId, newTrackId, newStartTime)
                }}
                onClipRemove={removeClipFromTimeline}
                onSeek={handleContinuousTimelineSeek}
                onGlobalTrimStartChange={setGlobalTrimStart}
                onGlobalTrimEndChange={setGlobalTrimEnd}
                onZoomChange={setZoomLevel}
                multiTrackMode={multiTrackMode}
              />
            </div>
          )}

          {/* Timeline Tools */}
          {timelineClips.length > 0 && (
            <TimelineTools
              onSplit={handleSplitClip}
              onDelete={handleDeleteClip}
              onTrim={handleTrimTimeline}
              canSplit={!!selectedClipId}
              canDelete={!!selectedClipId}
              canTrim={globalTrimStart > 0 || (globalTrimEnd !== null && Math.abs((globalTrimEnd || 0) - totalDuration) > 0.01)}
              zoomLevel={zoomLevel}
              onZoomChange={setZoomLevel}
              onGoToStart={() => setCurrentTime(0)}
              onGoToEnd={() => setCurrentTime(totalDuration)}
              onMarkStart={() => setGlobalTrimStart(currentTime)}
              onMarkEnd={() => setGlobalTrimEnd(currentTime)}
            />
          )}

          {/* Overlay Controls */}
          {multiTrackMode && timelineClips.length > 0 && (
            <OverlayControls
              clip={timelineClips.find(clip => clip.id === selectedClipId) || null}
              onUpdateClip={updateClip}
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

          {/* Multi-Track Features Info - At bottom of page */}
          {multiTrackMode && (
            <div className="mt-8 glass rounded-3xl border border-blue-500/30 backdrop-blur-xl p-6 shadow-2xl bg-blue-600/20">
              <div className="text-sm text-blue-200">
                <div className="font-medium mb-3 text-lg">🎬 Multi-Track Features:</div>
                <ul className="text-sm space-y-2 text-blue-300">
                  <li>• Track 0: Main video (background)</li>
                  <li>• Track 1+: Overlay videos (webcam, graphics)</li>
                  <li>• Individual track controls (mute, solo, lock)</li>
                  <li>• Drag clips between tracks</li>
                  <li>• Professional video composition</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transcription Panel */}
      {showTranscriptionPanel && (
        <TranscriptionPanel onClose={() => setShowTranscriptionPanel(false)} />
      )}

    </div>
  )
}

export default Editor
