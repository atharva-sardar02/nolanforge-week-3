import React, { useState } from 'react'
import { useMediaStore } from '../state/mediaStore'
import ConfirmationDialog from './ConfirmationDialog'

interface FileManagementProps {
  className?: string
}

const FileManagement: React.FC<FileManagementProps> = ({ className = '' }) => {
  const { files, removeFiles, clearAllFiles, selectedFileId } = useMediaStore()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])

  const handleSelectAll = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([])
    } else {
      setSelectedFiles(files.map(file => file.id))
    }
  }

  const handleSelectFile = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    )
  }

  const handleDeleteSelected = () => {
    if (selectedFiles.length > 0) {
      setShowDeleteConfirm(true)
    }
  }

  const handleClearAll = () => {
    if (files.length > 0) {
      setShowClearConfirm(true)
    }
  }

  const confirmDelete = () => {
    removeFiles(selectedFiles)
    setSelectedFiles([])
    setShowDeleteConfirm(false)
  }

  const confirmClearAll = () => {
    clearAllFiles()
    setSelectedFiles([])
    setShowClearConfirm(false)
  }

  if (files.length === 0) {
    return null
  }

  return (
    <>
      <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            File Management
          </h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {selectedFiles.length} of {files.length} selected
          </div>
        </div>

        <div className="space-y-3">
          {/* Select All */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="select-all"
              checked={selectedFiles.length === files.length}
              onChange={handleSelectAll}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="select-all" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Select all files
            </label>
          </div>

          {/* File List with Checkboxes */}
          <div className="max-h-40 overflow-y-auto space-y-2">
            {files.map((file) => (
              <div key={file.id} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id={`file-${file.id}`}
                  checked={selectedFiles.includes(file.id)}
                  onChange={() => handleSelectFile(file.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label 
                  htmlFor={`file-${file.id}`}
                  className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate cursor-pointer"
                >
                  {file.name}
                </label>
                {selectedFileId === file.id && (
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                    Active
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleDeleteSelected}
              disabled={selectedFiles.length === 0}
              className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm py-2 px-3 rounded transition-colors"
            >
              Delete Selected ({selectedFiles.length})
            </button>
            <button
              onClick={handleClearAll}
              disabled={files.length === 0}
              className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm py-2 px-3 rounded transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Delete Files"
        message={`Are you sure you want to delete ${selectedFiles.length} file(s)? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Clear All Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showClearConfirm}
        title="Clear All Files"
        message={`Are you sure you want to delete all ${files.length} files? This action cannot be undone.`}
        confirmText="Clear All"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmClearAll}
        onCancel={() => setShowClearConfirm(false)}
      />
    </>
  )
}

export default FileManagement
