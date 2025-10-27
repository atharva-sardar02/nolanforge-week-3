import React, { useCallback, useState } from 'react'
import { useMediaStore } from '../state/mediaStore'

interface FileDropZoneProps {
  onFilesAdded?: (files: File[]) => void
  className?: string
}

const FileDropZone: React.FC<FileDropZoneProps> = ({ 
  onFilesAdded, 
  className = '' 
}) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const { setLoading, setError } = useMediaStore()

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    const videoFiles = files.filter(file => 
      file.type.startsWith('video/') && 
      (file.type.includes('mp4') || file.type.includes('mov') || file.type.includes('avi'))
    )

    if (videoFiles.length === 0) {
      setError('Please drop only MP4, MOV, or AVI video files')
      return
    }

    if (videoFiles.length !== files.length) {
      setError(`Only ${videoFiles.length} of ${files.length} files are supported video formats`)
    }

    setLoading(true)
    onFilesAdded?.(videoFiles)
  }, [onFilesAdded, setError, setLoading])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const videoFiles = files.filter(file => 
      file.type.startsWith('video/') && 
      (file.type.includes('mp4') || file.type.includes('mov') || file.type.includes('avi'))
    )

    if (videoFiles.length > 0) {
      setLoading(true)
      onFilesAdded?.(videoFiles)
    }

    e.target.value = ''
  }, [onFilesAdded, setLoading])

  const handleClick = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = 'video/mp4,video/mov,video/avi'
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement
      if (target.files) {
        handleFileInput({ target } as React.ChangeEvent<HTMLInputElement>)
      }
    }
    input.click()
  }, [handleFileInput])

  return (
    <div
      className={`
        glass relative overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-500 cursor-pointer group
        ${isDragOver 
          ? 'border-blue-400 bg-gradient-to-br from-blue-500/20 to-purple-500/20 scale-[1.02] shadow-glow-lg' 
          : 'border-gray-700/50 bg-gradient-to-br from-gray-800/40 to-gray-900/40 hover:border-blue-500/50 hover:shadow-glow'
        }
        backdrop-blur-xl
        ${className}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      style={{
        background: isDragOver 
          ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))' 
          : 'linear-gradient(135deg, rgba(31, 41, 55, 0.4), rgba(17, 24, 39, 0.6))'
      }}
    >
      <div className="p-16">
        <div className="flex flex-col items-center space-y-6 text-center">
          {/* Icon with Glow */}
          <div className={`
            relative w-28 h-28 rounded-3xl flex items-center justify-center text-6xl transition-all duration-500
            ${isDragOver 
              ? 'bg-gradient-to-br from-blue-500/30 to-purple-500/30 scale-110 animate-pulse-slow shadow-glow-lg' 
              : 'bg-gradient-to-br from-gray-700/30 to-gray-800/30 group-hover:scale-105 group-hover:shadow-glow'
            }
          `}>
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <span className="relative z-10">{isDragOver ? '📥' : '📁'}</span>
          </div>

          {/* Text */}
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {isDragOver ? '✨ Drop your files here' : '📂 Import Video Files'}
            </h3>
            <p className="text-base text-gray-300">
              {isDragOver 
                ? 'Release to add files to your library' 
                : 'Drag and drop or click to browse'}
            </p>
          </div>

          {/* Keyboard Shortcut Hint */}
          {!isDragOver && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-xl border border-gray-700/30">
              <span className="text-xs text-gray-400">Quick tip:</span>
              <kbd className="px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-300 font-mono border border-gray-600/30">Ctrl</kbd>
              <span className="text-xs text-gray-400">+</span>
              <kbd className="px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-300 font-mono border border-gray-600/30">O</kbd>
              <span className="text-xs text-gray-400">to open files</span>
            </div>
          )}

          {/* Supported Formats with Pills */}
          <div className="flex flex-wrap gap-3 justify-center pt-4">
            {[
              { format: 'MP4', desc: 'Most compatible' },
              { format: 'MOV', desc: 'Apple format' },
              { format: 'AVI', desc: 'Windows format' }
            ].map(({ format, desc }) => (
              <div 
                key={format}
                className="group/pill relative"
              >
                <span className="px-5 py-2 bg-gradient-to-r from-gray-700/60 to-gray-800/60 backdrop-blur-sm rounded-full text-sm text-gray-200 font-semibold border border-gray-600/30 shadow-lg hover:scale-105 transition-transform duration-200 cursor-help inline-block">
                  {format}
                </span>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-gray-300 text-xs rounded-lg opacity-0 group-hover/pill:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                  {desc}
                </div>
              </div>
            ))}
          </div>

          {/* File Limits */}
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>📏</span>
              <span>Max file size: <strong className="text-gray-300">2GB</strong></span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>🎬</span>
              <span>Multiple files supported</span>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Gradient Background */}
      <div className={`
        absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl
        ${isDragOver ? 'opacity-100 animate-pulse' : ''}
      `} />
      
      {/* Border Glow Effect */}
      <div className={`
        absolute inset-0 rounded-3xl transition-all duration-500 pointer-events-none
        ${isDragOver ? 'shadow-[inset_0_0_30px_rgba(59,130,246,0.3)]' : ''}
      `} />
    </div>
  )
}

export default FileDropZone
