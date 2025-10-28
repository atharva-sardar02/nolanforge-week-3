import { invoke } from '@tauri-apps/api/core'
import { save, open } from '@tauri-apps/plugin-dialog'
import { useState, useCallback } from 'react'
import { MediaFile } from '../state/mediaStore'

export interface ExportOptions {
  inputPath: string
  outputPath: string
  trimStart: number
  trimEnd: number
}

export interface ClipForExport {
  inputPath: string
  trimStart: number
  trimEnd: number
  mediaFile?: MediaFile
}

export interface MultiTrackClipForExport {
  inputPath: string
  trackId: number
  startTime: number
  duration: number
  trimStart: number
  trimEnd: number
  overlayPosition?: { x: number; y: number }
  overlaySize?: { width: number; height: number }
  overlayOpacity?: number
  overlayBlendMode?: string
}

export interface ExportState {
  isExporting: boolean
  progress: number
  error: string | null
  success: boolean
}

export function useExport() {
  const [state, setState] = useState<ExportState>({
    isExporting: false,
    progress: 0,
    error: null,
    success: false,
  })

  const checkFFmpeg = useCallback(async (): Promise<boolean> => {
    try {
      const version = await invoke<string>('check_ffmpeg')
      console.log('FFmpeg version:', version)
      return true
    } catch (error) {
      console.error('FFmpeg check failed:', error)
      setState(prev => ({
        ...prev,
        error: 'FFmpeg is not installed. Please install FFmpeg to export videos.',
      }))
      return false
    }
  }, [])

  const exportVideo = useCallback(async (options: ExportOptions): Promise<boolean> => {
    // Reset state
    setState({
      isExporting: true,
      progress: 0,
      error: null,
      success: false,
    })

    try {
      // Check if FFmpeg is available
      const ffmpegAvailable = await checkFFmpeg()
      if (!ffmpegAvailable) {
        setState(prev => ({ ...prev, isExporting: false }))
        return false
      }

      setState(prev => ({ ...prev, progress: 10 }))

      // Call Tauri command to export video
      // Convert camelCase to snake_case for Rust
      const result = await invoke<string>('export_trimmed_video', { 
        options: {
          input_path: options.inputPath,
          output_path: options.outputPath,
          trim_start: options.trimStart,
          trim_end: options.trimEnd,
        }
      })
      
      setState({
        isExporting: false,
        progress: 100,
        error: null,
        success: true,
      })

      console.log('Export successful:', result)
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('Export failed:', errorMessage)
      
      setState({
        isExporting: false,
        progress: 0,
        error: errorMessage,
        success: false,
      })
      
      return false
    }
  }, [checkFFmpeg])

  const selectInputPath = useCallback(async (): Promise<string | null> => {
    try {
      const filePath = await open({
        multiple: false,
        filters: [{
          name: 'Video',
          extensions: ['mp4', 'mov', 'avi']
        }]
      })
      
      return filePath
    } catch (error) {
      console.error('Failed to select input path:', error)
      return null
    }
  }, [])

  const selectOutputPath = useCallback(async (defaultFilename: string): Promise<string | null> => {
    try {
      const filePath = await save({
        defaultPath: defaultFilename,
        filters: [{
          name: 'Video',
          extensions: ['mp4']
        }]
      })
      
      return filePath
    } catch (error) {
      console.error('Failed to select output path:', error)
      return null
    }
  }, [])

  const reset = useCallback(() => {
    setState({
      isExporting: false,
      progress: 0,
      error: null,
      success: false,
    })
  }, [])

  const exportMultiClipVideo = useCallback(async (clips: ClipForExport[]): Promise<boolean> => {
    // Reset state
    setState({
      isExporting: true,
      progress: 0,
      error: null,
      success: false,
    })

    try {
      // Check if FFmpeg is available
      const ffmpegAvailable = await checkFFmpeg()
      if (!ffmpegAvailable) {
        setState(prev => ({ ...prev, isExporting: false }))
        return false
      }

      setState(prev => ({ ...prev, progress: 10 }))

      // Ask where to save the output
      const outputPath = await selectOutputPath('combined_output.mp4')
      
      if (!outputPath) {
        setState(prev => ({ ...prev, isExporting: false }))
        return false
      }

      setState(prev => ({ ...prev, progress: 20 }))

      // Prepare clips data for Rust (convert to snake_case)
      const clipsData = clips.map(clip => ({
        input_path: clip.inputPath,
        trim_start: clip.trimStart,
        trim_end: clip.trimEnd,
      }))

      // Call Tauri command to export multiple clips
      const result = await invoke<string>('export_multi_clip_video', { 
        clips: clipsData,
        outputPath: outputPath,
      })
      
      setState({
        isExporting: false,
        progress: 100,
        error: null,
        success: true,
      })

      console.log('Multi-clip export successful:', result)
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('Multi-clip export failed:', errorMessage)
      
      setState({
        isExporting: false,
        progress: 0,
        error: errorMessage,
        success: false,
      })
      
      return false
    }
  }, [checkFFmpeg, selectOutputPath])

  const exportMultiTrackVideo = useCallback(async (
    clips: MultiTrackClipForExport[], 
    globalTrimStart: number, 
    globalTrimEnd: number
  ): Promise<boolean> => {
    // Reset state
    setState({
      isExporting: true,
      progress: 0,
      error: null,
      success: false,
    })

    try {
      // Check if FFmpeg is available
      const ffmpegAvailable = await checkFFmpeg()
      if (!ffmpegAvailable) {
        setState(prev => ({ ...prev, isExporting: false }))
        return false
      }

      setState(prev => ({ ...prev, progress: 10 }))

      // Ask where to save the output
      const outputPath = await selectOutputPath('multitrack_output.mp4')
      
      if (!outputPath) {
        setState(prev => ({ ...prev, isExporting: false }))
        return false
      }

      setState(prev => ({ ...prev, progress: 20 }))

      // Prepare clips data for Rust (convert to snake_case)
      const clipsData = clips.map(clip => ({
        input_path: clip.inputPath,
        track_id: clip.trackId,
        start_time: clip.startTime,
        duration: clip.duration,
        trim_start: clip.trimStart,
        trim_end: clip.trimEnd,
        overlay_position: clip.overlayPosition ? [clip.overlayPosition.x, clip.overlayPosition.y] : null,
        overlay_size: clip.overlaySize ? [clip.overlaySize.width, clip.overlaySize.height] : null,
        overlay_opacity: clip.overlayOpacity,
        overlay_blend_mode: clip.overlayBlendMode,
      }))

      // Call Tauri command to export multi-track video
      const result = await invoke<string>('export_multi_track_video', { 
        options: {
          clips: clipsData,
          output_path: outputPath,
          global_trim_start: globalTrimStart,
          global_trim_end: globalTrimEnd,
        }
      })
      
      setState({
        isExporting: false,
        progress: 100,
        error: null,
        success: true,
      })

      console.log('Multi-track export successful:', result)
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('Multi-track export failed:', errorMessage)
      
      setState({
        isExporting: false,
        progress: 0,
        error: errorMessage,
        success: false,
      })
      
      return false
    }
  }, [checkFFmpeg, selectOutputPath])

  return {
    ...state,
    exportVideo,
    exportMultiClipVideo,
    exportMultiTrackVideo,
    selectInputPath,
    selectOutputPath,
    checkFFmpeg,
    reset,
  }
}

