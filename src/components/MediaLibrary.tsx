import React, { useState } from 'react'
import { useMediaStore } from '../state/mediaStore'
import MediaListItem from './MediaListItem'
import ConfirmationDialog from './ConfirmationDialog'

type ViewMode = 'grid' | 'list'

const MediaLibrary: React.FC = () => {
  const { files, selectedFileId, selectFile, removeFile, isLoading, error } = useMediaStore()
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [fileToDelete, setFileToDelete] = useState<string | null>(null)

  const handleEdit = (file: any) => {
    console.log('Edit file:', file.name)
  }

  const handlePreview = (file: any) => {
    console.log('Preview file:', file.name)
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
      <div className="glass rounded-3xl border border-gray-700/30 backdrop-blur-xl p-20">
        <div className="text-center space-y-6">
          <div className="relative mx-auto w-32 h-32 bg-gradient-to-br from-gray-700/30 to-gray-800/30 rounded-3xl flex items-center justify-center text-7xl group hover:scale-105 transition-transform duration-500">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
            <span className="relative z-10">📁</span>
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-white">
              No files imported yet
            </h3>
            <p className="text-gray-300 text-lg">
              Drop your video files to get started
            </p>
            <div className="pt-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-700/30 border border-gray-600/30">
                <span className="text-gray-400 text-sm">Try dragging files to the import zone</span>
                <span className="text-xl">👈</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
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
    </div>
  )
}

export default MediaLibrary
