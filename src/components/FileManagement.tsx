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
      <div className={`glass rounded-3xl border border-gray-700/30 backdrop-blur-xl p-8 shadow-2xl ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">🗂️</span>
            Bulk Actions
          </h3>
          <div className="px-4 py-2 bg-gray-800/40 rounded-xl border border-gray-700/30">
            <span className="text-white font-bold">{selectedFiles.length}</span>
            <span className="text-gray-400 ml-1">of</span>
            <span className="text-white font-bold ml-1">{files.length}</span>
            <span className="text-gray-400 ml-1">selected</span>
          </div>
        </div>

        <div className="space-y-6">
          {/* Select All */}
          <div className="flex items-center p-4 bg-gray-800/30 rounded-2xl hover:bg-gray-800/50 transition-colors cursor-pointer group">
            <input
              type="checkbox"
              id="select-all"
              checked={selectedFiles.length === files.length && files.length > 0}
              onChange={handleSelectAll}
              className="w-5 h-5 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
            />
            <label htmlFor="select-all" className="ml-4 text-lg font-semibold text-white cursor-pointer select-none">
              Select all files
            </label>
          </div>

          {/* File List with Checkboxes */}
          <div className="max-h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {files.map((file) => (
              <div key={file.id} className="flex items-center p-4 bg-gray-800/20 hover:bg-gray-800/40 rounded-2xl transition-all duration-200 group cursor-pointer">
                <input
                  type="checkbox"
                  id={`file-${file.id}`}
                  checked={selectedFiles.includes(file.id)}
                  onChange={() => handleSelectFile(file.id)}
                  className="w-5 h-5 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                />
                <label 
                  htmlFor={`file-${file.id}`}
                  className="flex-1 ml-4 text-base text-gray-300 font-medium truncate cursor-pointer select-none group-hover:text-white transition-colors"
                >
                  {file.name}
                </label>
                {selectedFileId === file.id && (
                  <span className="px-3 py-1 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold rounded-full">
                    ACTIVE
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-700/30">
            <button
              onClick={handleDeleteSelected}
              disabled={selectedFiles.length === 0}
              className="group relative overflow-hidden bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 disabled:from-gray-700/20 disabled:to-gray-700/20 border border-red-400/30 hover:border-red-400/60 disabled:border-gray-600/20 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50 disabled:scale-100"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center justify-center gap-2 text-lg">
                <span>🗑️</span>
                <span>Delete ({selectedFiles.length})</span>
              </span>
            </button>
            <button
              onClick={handleClearAll}
              disabled={files.length === 0}
              className="group relative overflow-hidden bg-gradient-to-r from-gray-600/20 to-gray-700/20 hover:from-gray-600/30 hover:to-gray-700/30 disabled:from-gray-700/20 disabled:to-gray-700/20 border border-gray-500/30 hover:border-gray-400/60 disabled:border-gray-600/20 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50 disabled:scale-100"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-600/10 to-gray-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center justify-center gap-2 text-lg">
                <span>🧹</span>
                <span>Clear All</span>
              </span>
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
