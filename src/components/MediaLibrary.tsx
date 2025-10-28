import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMediaStore } from '../state/mediaStore'
import { useEditState } from '../state/editState'
import MediaListItem from './MediaListItem'
import ConfirmationDialog from './ConfirmationDialog'
import { createMediaFile, validateMultipleFiles, getErrorMessage } from '../utils/fileUtils'

type ViewMode = 'grid' | 'list'

const MediaLibrary: React.FC = () => {
  const navigate = useNavigate()
  const { files, selectedFileId, selectFile, removeFile, isLoading, error, addFile, setLoading, setError, clearError } = useMediaStore()
  const { addClipToTimeline, getTotalDuration } = useEditState()
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [fileToDelete, setFileToDelete] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [previewFile, setPreviewFile] = useState<any>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [warnings, setWarnings] = useState<string[]>([])

  // Handle drag and drop for file upload
  const handleFilesAdded = useCallback(async (files: File[]) => {
    clearError()
    setWarnings([])
    setLoading(true)
    
    try {
      const validation = validateMultipleFiles(files)
      
      if (validation.warnings.length > 0) {
        const allWarnings = validation.warnings.flatMap(w => w.warnings)
        setWarnings(allWarnings)
      }
      
      if (validation.invalidFiles.length > 0) {
        const errorMessages = validation.invalidFiles.map(({ file, error }) => 
          `${file.name}: ${error}`
        )
        setError(errorMessages.join('; '))
      }
      
      // Process valid files asynchronously to extract metadata
      for (const file of validation.validFiles) {
        try {
          const mediaFile = await createMediaFile(file)
          addFile(mediaFile)
        } catch (err) {
          console.error(`Failed to process file ${file.name}:`, err)
          setError(`Failed to process ${file.name}`)
        }
      }
      
      if (validation.validFiles.length > 0) {
        const summary = `Successfully imported ${validation.validFiles.length} file(s)`
        if (validation.invalidFiles.length > 0) {
          console.warn(`${summary}, ${validation.invalidFiles.length} file(s) failed validation`)
        } else {
          console.log(summary)
        }
      }
      
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      setError(`Failed to process files: ${errorMessage}`)
      console.error('Error processing files:', error)
    } finally {
      setLoading(false)
    }
  }, [addFile, setLoading, setError, clearError])

  // Handle ESC key to close preview
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showPreview) {
        setShowPreview(false)
        setPreviewFile(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showPreview])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('🎯 Drag over MediaLibrary')
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('🎯 Drag leave MediaLibrary')
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('🎯 Drop on MediaLibrary', e.dataTransfer.files.length, 'files')
    setIsDragOver(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    console.log('🎯 Dropped files:', droppedFiles.map(f => f.name))
    if (droppedFiles.length > 0) {
      handleFilesAdded(droppedFiles)
    }
  }, [handleFilesAdded])

  // Additional drag event handlers for better compatibility
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('🎯 Drag enter MediaLibrary')
    setIsDragOver(true)
  }, [])

  const handleDragExit = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('🎯 Drag exit MediaLibrary')
    setIsDragOver(false)
  }, [])

  const handleEdit = (file: any) => {
    // Add file to timeline at the end and navigate to editor
    selectFile(file.id)
    // Add to main video track (track 0) at the end of current timeline
    const endTime = getTotalDuration()
    addClipToTimeline(file, 0, endTime)
    navigate('/editor')
  }

  const handlePreview = (file: any) => {
    // Show preview modal
    setPreviewFile(file)
    setShowPreview(true)
  }

  const handleDelete = (id: string) => {
    setFileToDelete(id)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = () => {
    if (fileToDelete) {
      removeFile(fileToDelete)
      setFileToDelete(null)
      setShowDeleteConfirm(false)
    }
  }

  const cancelDelete = () => {
    setFileToDelete(null)
    setShowDeleteConfirm(false)
  }

  const getFileToDeleteName = () => {
    if (!fileToDelete) return ''
    const file = files.find(f => f.id === fileToDelete)
    return file?.name || 'Unknown file'
  }

  if (isLoading) {
    return (
      <div className="glass rounded-3xl border border-gray-700/30 backdrop-blur-xl p-20">
        <div className="text-center space-y-6">
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-xl"></div>
          </div>
          <div className="space-y-2">
            <p className="text-white font-semibold text-lg">Loading your files...</p>
            <p className="text-gray-400 text-sm">Please wait a moment</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass rounded-3xl border border-red-500/30 backdrop-blur-xl p-8 bg-gradient-to-br from-red-500/10 to-red-600/5">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center text-3xl shadow-glow">
            ⚠️
          </div>
          <div>
            <h4 className="text-red-300 font-bold text-lg mb-1">Error</h4>
            <p className="text-red-200">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div 
        className={`glass rounded-3xl border backdrop-blur-xl p-20 transition-all duration-300 ${
          isDragOver 
            ? 'border-blue-500/60 bg-gradient-to-br from-blue-500/10 to-purple-500/10 scale-105' 
            : 'border-gray-700/30'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onDragEnter={(e) => {
          e.preventDefault()
          console.log('🎯 Drag enter MediaLibrary')
          setIsDragOver(true)
        }}
        onDragExit={(e) => {
          e.preventDefault()
          console.log('🎯 Drag exit MediaLibrary')
          setIsDragOver(false)
        }}
      >
        <div className="text-center space-y-6">
          <div className={`relative mx-auto w-32 h-32 bg-gradient-to-br from-gray-700/30 to-gray-800/30 rounded-3xl flex items-center justify-center text-7xl group transition-all duration-500 ${
            isDragOver ? 'scale-110' : 'hover:scale-105'
          }`}>
            <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 transition-opacity duration-500 blur-xl ${
              isDragOver ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}></div>
            <span className="relative z-10">{isDragOver ? '📥' : '📁'}</span>
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-white">
              {isDragOver ? 'Drop files here!' : 'No files imported yet'}
            </h3>
            <p className="text-gray-300 text-lg">
              {isDragOver ? 'Release to import your files' : 'Drop your video files here to get started'}
            </p>
            <div className="pt-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-700/30 border border-gray-600/30">
                <span className="text-gray-400 text-sm">
                  {isDragOver ? 'Release to import' : 'Drag & drop video files here'}
                </span>
                <span className="text-xl">{isDragOver ? '📥' : '👈'}</span>
              </div>
            </div>
            {/* File selection buttons */}
            <div className="pt-4 flex gap-4 justify-center">
              <button
                onClick={() => {
                  console.log('🧪 Test button clicked')
                  // Create a test file input
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.multiple = true
                  input.accept = 'video/*'
                  input.onchange = (e) => {
                    const files = Array.from((e.target as HTMLInputElement).files || [])
                    console.log('🧪 Files selected:', files.map(f => f.name))
                    if (files.length > 0) {
                      handleFilesAdded(files)
                    }
                  }
                  input.click()
                }}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105"
              >
                🧪 Test File Selection
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`space-y-6 h-full flex flex-col transition-all duration-300 relative ${
        isDragOver ? 'bg-blue-500/5 rounded-3xl p-4' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onDragEnter={handleDragEnter}
      onDragExit={handleDragExit}
    >
      {/* Drag Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-sm rounded-3xl border-2 border-dashed border-blue-500/60 z-10 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-6xl animate-bounce">📥</div>
            <div className="text-2xl font-bold text-white">Drop files to import</div>
            <div className="text-blue-300">Release to add files to your media library</div>
          </div>
        </div>
      )}

      {/* Error and Warning Display */}
      {(error || warnings.length > 0) && (
        <div className="space-y-4 animate-slide-in">
          {error && (
            <div className="glass rounded-xl border border-red-500/30 backdrop-blur-xl p-4 bg-gradient-to-br from-red-500/10 to-red-600/5">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-xl">
                  ⚠️
                </div>
                <div>
                  <h4 className="text-red-300 font-bold text-sm mb-1">Import Error</h4>
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
                <button
                  onClick={clearError}
                  className="ml-auto p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
          {warnings.length > 0 && (
            <div className="glass rounded-xl border border-yellow-500/30 backdrop-blur-xl p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/5">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center text-xl">
                  ⚠️
                </div>
                <div>
                  <h4 className="text-yellow-300 font-bold text-sm mb-1">Import Warnings</h4>
                  <ul className="text-yellow-200 text-sm space-y-1">
                    {warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Header with View Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-3xl">📁</span>
            Your Media
          </h2>
          <p className="text-base text-gray-400 mt-1 flex items-center gap-2">
            {files.length} {files.length === 1 ? 'file' : 'files'} imported
            {selectedFileId && (
              <>
                <span className="text-gray-600">•</span>
                <span className="text-blue-400">1 selected</span>
              </>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl text-gray-300 hover:text-white transition-all duration-200 text-sm font-medium border border-gray-700/30 group"
              title="Clear all files"
              onClick={() => {
                if (window.confirm(`Delete all ${files.length} files?`)) {
                  files.forEach(f => removeFile(f.id));
                }
              }}
            >
              <span className="flex items-center gap-2">
                <span className="group-hover:scale-110 transition-transform">🗑️</span>
                <span>Clear All</span>
              </span>
            </button>
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-2 border border-gray-700/30">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-6 py-3 text-base font-semibold rounded-xl transition-all duration-300 relative group/btn ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-glow scale-105'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
              title="Grid view - Better for browsing"
            >
              <span className="flex items-center gap-2">
                <span>🔲</span>
                <span>Grid</span>
              </span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-6 py-3 text-base font-semibold rounded-xl transition-all duration-300 relative group/btn ${
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-glow scale-105'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
              title="List view - More details"
            >
              <span className="flex items-center gap-2">
                <span>📋</span>
                <span>List</span>
              </span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Keyboard Shortcuts Hint */}
      {files.length > 0 && (
        <div className="glass rounded-xl border border-gray-700/30 p-4 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="font-semibold text-white">💡 Quick Tips:</span>
              <div className="flex items-center gap-2">
                <span>Click a file to select it</span>
                <span className="text-gray-600">•</span>
                <span>Double-click to edit</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs">
                <kbd className="px-2 py-1 bg-gray-800/70 rounded text-gray-300 font-mono border border-gray-700/50">↑</kbd>
                <kbd className="px-2 py-1 bg-gray-800/70 rounded text-gray-300 font-mono border border-gray-700/50">↓</kbd>
                <span className="text-gray-500">Navigate</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <kbd className="px-2 py-1 bg-gray-800/70 rounded text-gray-300 font-mono border border-gray-700/50">Del</kbd>
                <span className="text-gray-500">Delete</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Files Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 flex-1 overflow-y-auto pr-2">
          {files.map((file) => (
            <MediaListItem
              key={file.id}
              file={file}
              isSelected={selectedFileId === file.id}
              onSelect={selectFile}
              onEdit={handleEdit}
              onPreview={handlePreview}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4 flex-1 overflow-y-auto pr-2">
          {files.map((file) => (
            <MediaListItem
              key={file.id}
              file={file}
              isSelected={selectedFileId === file.id}
              onSelect={selectFile}
              onEdit={handleEdit}
              onPreview={handlePreview}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Delete File"
        message={`Are you sure you want to delete "${getFileToDeleteName()}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {/* Preview Modal */}
      {showPreview && previewFile && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass rounded-3xl border border-gray-700/30 backdrop-blur-xl w-[95vw] max-w-7xl max-h-[95vh] overflow-hidden shadow-2xl animate-scale-in flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700/30 flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center text-3xl">
                  👁️
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-white">Preview</h3>
                  <p className="text-base text-gray-400 truncate max-w-2xl mt-1">{previewFile.name}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPreview(false)
                  setPreviewFile(null)
                }}
                className="p-3 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all duration-200 hover:scale-110"
                title="Close (ESC)"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Video Preview */}
            <div className="flex-1 overflow-auto p-8">
              <div className="bg-black rounded-2xl overflow-hidden mb-6">
                <video
                  key={previewFile.path}
                  src={previewFile.path}
                  controls
                  autoPlay
                  preload="metadata"
                  className="w-full h-auto min-h-[500px] max-h-[calc(95vh-300px)]"
                  style={{ aspectRatio: '16/9' }}
                  onError={(e) => {
                    console.error('Video preview error:', e)
                    const target = e.target as HTMLVideoElement
                    console.error('Video src:', target.src)
                    console.error('Video error:', target.error)
                  }}
                  onLoadedMetadata={(e) => {
                    const target = e.target as HTMLVideoElement
                    console.log('Video loaded:', {
                      duration: target.duration,
                      width: target.videoWidth,
                      height: target.videoHeight
                    })
                  }}
                >
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* File Info */}
              <div className="grid grid-cols-4 gap-6">
                <div className="p-5 bg-gray-800/40 rounded-2xl backdrop-blur-sm">
                  <span className="block text-sm text-gray-400 uppercase tracking-wider mb-2">Size</span>
                  <span className="font-mono text-2xl font-bold text-white">{(previewFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                </div>
                <div className="p-5 bg-gray-800/40 rounded-2xl backdrop-blur-sm">
                  <span className="block text-sm text-gray-400 uppercase tracking-wider mb-2">Format</span>
                  <span className="font-mono text-2xl font-bold uppercase text-white">{previewFile.format}</span>
                </div>
                <div className="p-5 bg-gray-800/40 rounded-2xl backdrop-blur-sm">
                  <span className="block text-sm text-gray-400 uppercase tracking-wider mb-2">Duration</span>
                  <span className="font-mono text-2xl font-bold text-white">
                    {previewFile.duration ? `${previewFile.duration.toFixed(2)}s` : 'Loading...'}
                  </span>
                </div>
                <div className="p-5 bg-gray-800/40 rounded-2xl backdrop-blur-sm">
                  <span className="block text-sm text-gray-400 uppercase tracking-wider mb-2">Type</span>
                  <span className="font-mono text-2xl font-bold text-white">{previewFile.type}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-700/30 flex-shrink-0">
              <button
                onClick={() => {
                  setShowPreview(false)
                  setPreviewFile(null)
                }}
                className="px-8 py-4 bg-gray-700/50 hover:bg-gray-700/70 text-white font-semibold rounded-xl transition-all duration-200 text-lg"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleEdit(previewFile)
                  setShowPreview(false)
                  setPreviewFile(null)
                }}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-glow text-lg hover:scale-105"
              >
                ✂️ Edit This File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MediaLibrary
