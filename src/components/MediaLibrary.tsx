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
    // TODO: Navigate to editor with this file
  }

  const handlePreview = (file: any) => {
    console.log('Preview file:', file.name)
    // TODO: Open preview modal
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
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading files...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-red-500 text-xl mr-2">⚠️</div>
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="text-6xl mb-4">📁</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No files imported yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Drag and drop video files to get started
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Media Library ({files.length} files)
        </h2>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">View:</span>
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>
      
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        <div className="space-y-2">
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
