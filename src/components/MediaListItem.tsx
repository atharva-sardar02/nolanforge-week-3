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
  // Multi-track support
  multiTrackMode?: boolean
  onAddToTrack?: (file: MediaFile, trackId: number) => void
}

const MediaListItem: React.FC<MediaListItemProps> = ({
  file,
  isSelected,
  onSelect,
  onEdit,
  onPreview,
  onDelete,
  multiTrackMode = false,
  onAddToTrack
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

  const handleAddToTrack = (trackId: number) => {
    onAddToTrack?.(file, trackId)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(file.id)
  }

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'copy'
    e.dataTransfer.setData('mediaFileId', file.id)
    e.dataTransfer.setData('application/json', JSON.stringify(file))
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={`
        glass relative rounded-3xl border-2 p-6 cursor-pointer transition-all duration-300 group overflow-hidden
        ${isSelected 
          ? 'border-blue-400 shadow-glow-lg scale-[1.02] bg-gradient-to-br from-blue-500/10 to-purple-500/10' 
          : 'border-gray-700/50 hover:border-blue-500/50 hover:shadow-glow hover:scale-[1.01]'
        }
      `}
      onClick={handleSelect}
    >
      {/* Animated Background Glow */}
      <div className={`
        absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500
        ${isSelected ? 'opacity-100' : ''}
      `} />

      <div className="relative z-10 flex items-start space-x-4">
        {/* Thumbnail or Icon */}
        <div className={`
          flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden transition-all duration-300
          ${isSelected 
            ? 'shadow-glow ring-2 ring-blue-400' 
            : 'group-hover:scale-110'
          }
        `}>
          {file.type === 'video' && file.thumbnail ? (
            <img 
              src={file.thumbnail} 
              alt={file.name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                // Fallback to icon if thumbnail fails to load
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const parent = target.parentElement
                if (parent) {
                  parent.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-gray-700/30 to-gray-800/30 flex items-center justify-center text-2xl">🎬</div>'
                }
              }}
            />
          ) : (
            <div className={`
              w-full h-full flex items-center justify-center text-2xl transition-all duration-300
              ${file.type === 'video' 
                ? 'bg-gradient-to-br from-gray-700/30 to-gray-800/30' 
                : 'bg-gradient-to-br from-purple-700/30 to-pink-700/30'
              }
            `}>
              {file.type === 'video' ? '🎬' : '🎵'}
            </div>
          )}
        </div>
        
        {/* File Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-lg truncate mb-3">
            {file.name}
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="px-3 py-2 bg-gray-800/40 rounded-xl backdrop-blur-sm">
              <span className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Size</span>
              <span className="font-mono font-semibold text-white text-sm">{formatFileSize(file.size)}</span>
            </div>
            <div className="px-3 py-2 bg-gray-800/40 rounded-xl backdrop-blur-sm">
              <span className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Format</span>
              <span className="font-mono font-semibold uppercase text-white text-sm">{file.format}</span>
            </div>
            {file.duration && (
              <div className="px-3 py-2 bg-gray-800/40 rounded-xl backdrop-blur-sm">
                <span className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Duration</span>
                <span className="font-mono font-semibold text-white text-sm">{formatDuration(file.duration)}</span>
              </div>
            )}
            <div className="px-3 py-2 bg-gray-800/40 rounded-xl backdrop-blur-sm">
              <span className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Added</span>
              <span className="font-mono font-semibold text-white text-sm">{file.createdAt.toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex-shrink-0">
          <div className="flex flex-col space-y-2">
            <button
              onClick={handlePreview}
              className="p-3 text-gray-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-xl transition-all duration-200 hover:scale-110 group/btn"
              title="Preview"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button
              onClick={handleEdit}
              className="p-3 text-gray-400 hover:text-green-400 hover:bg-green-500/20 rounded-xl transition-all duration-200 hover:scale-110 group/btn"
              title="Edit"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              className="p-3 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-xl transition-all duration-200 hover:scale-110 group/btn"
              title="Delete"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Expanded Actions when Selected */}
      {isSelected && (
        <div className="relative z-10 mt-6 pt-6 border-t border-gray-700/50">
          {multiTrackMode ? (
            <div className="space-y-4">
              <div className="text-center">
                <h4 className="text-sm font-medium text-gray-300 mb-3">Add to Track:</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => handleAddToTrack(0)}
                    className="group/action relative overflow-hidden bg-gradient-to-r from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30 border border-blue-400/30 hover:border-blue-400/60 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-300 hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-blue-600/10 opacity-0 group-hover/action:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10 flex items-center justify-center gap-2 text-sm">
                      <span>📹</span>
                      <span>Track 0</span>
                    </span>
                  </button>
                  <button 
                    onClick={() => handleAddToTrack(1)}
                    className="group/action relative overflow-hidden bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 border border-red-400/30 hover:border-red-400/60 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-300 hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-red-600/10 opacity-0 group-hover/action:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10 flex items-center justify-center gap-2 text-sm">
                      <span>🎥</span>
                      <span>Track 1</span>
                    </span>
                  </button>
                </div>
                <div className="mt-3 text-xs text-gray-400">
                  Track 0: Main video • Track 1: Overlay
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleEdit}
                  className="group/action relative overflow-hidden bg-gradient-to-r from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 border border-green-400/30 hover:border-green-400/60 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-300 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-green-600/10 opacity-0 group-hover/action:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center justify-center gap-2 text-sm">
                    <span>✂️</span>
                    <span>Edit</span>
                  </span>
                </button>
                <button 
                  onClick={handlePreview}
                  className="group/action relative overflow-hidden bg-gradient-to-r from-purple-500/20 to-purple-600/20 hover:from-purple-500/30 hover:to-purple-600/30 border border-purple-400/30 hover:border-purple-400/60 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-300 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-purple-600/10 opacity-0 group-hover/action:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center justify-center gap-2 text-sm">
                    <span>👁️</span>
                    <span>Preview</span>
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={handleEdit}
                className="group/action relative overflow-hidden bg-gradient-to-r from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30 border border-blue-400/30 hover:border-blue-400/60 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-glow"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-blue-600/10 opacity-0 group-hover/action:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <span>✂️</span>
                  <span>Edit</span>
                </span>
              </button>
              <button 
                onClick={handlePreview}
                className="group/action relative overflow-hidden bg-gradient-to-r from-purple-500/20 to-purple-600/20 hover:from-purple-500/30 hover:to-purple-600/30 border border-purple-400/30 hover:border-purple-400/60 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-glow"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-purple-600/10 opacity-0 group-hover/action:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <span>👁️</span>
                  <span>Preview</span>
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MediaListItem
