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

    // Reset input
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
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
        ${isDragOver 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }
        ${className}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="text-6xl">
          {isDragOver ? '📁' : '📂'}
        </div>
        <div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
            {isDragOver ? 'Drop your files here' : 'Drag and drop your video files here'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            or click to browse
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Supports MP4, MOV, AVI files
          </p>
        </div>
      </div>
    </div>
  )
}

export default FileDropZone
