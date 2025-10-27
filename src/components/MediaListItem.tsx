import React from 'react'
import { MediaFile } from '../state/mediaStore'
import { formatFileSize, formatDuration } from '../utils/fileUtils'

interface MediaListItemProps {
  file: MediaFile
  isSelected: boolean
  onSelect: (id: string) => void
  onEdit?: (file: MediaFile) => void
  onPreview?: (file: MediaFile) => void
  onDelete?: (id: string) => void
}

const MediaListItem: React.FC<MediaListItemProps> = ({
  file,
  isSelected,
  onSelect,
  onEdit,
  onPreview,
  onDelete
}) => {
  const handleSelect = () => {
    onSelect(file.id)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit?.(file)
  }

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation()
    onPreview?.(file)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(file.id)
  }

  return (
    <div
      className={`
        bg-white dark:bg-gray-800 rounded-lg border-2 p-4 cursor-pointer transition-all duration-200
        ${isSelected 
          ? 'border-blue-500 shadow-lg' 
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }
      `}
      onClick={handleSelect}
    >
      <div className="flex items-start space-x-3">
        <div className="text-3xl flex-shrink-0">
          {file.type === 'video' ? '🎬' : '🎵'}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-white truncate">
            {file.name}
          </h3>
          
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center justify-between">
              <span>Size:</span>
              <span className="font-mono">{formatFileSize(file.size)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Format:</span>
              <span className="uppercase font-mono">{file.format}</span>
            </div>
            {file.duration && (
              <div className="flex items-center justify-between">
                <span>Duration:</span>
                <span className="font-mono">{formatDuration(file.duration)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span>Added:</span>
              <span className="font-mono">{file.createdAt.toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <div className="flex-shrink-0">
          <div className="flex space-x-1">
            <button
              onClick={handlePreview}
              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
              title="Preview"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button
              onClick={handleEdit}
              className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
              title="Edit"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {isSelected && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            <button 
              onClick={handleEdit}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-3 rounded transition-colors"
            >
              Edit
            </button>
            <button 
              onClick={handlePreview}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white text-sm py-2 px-3 rounded transition-colors"
            >
              Preview
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MediaListItem
