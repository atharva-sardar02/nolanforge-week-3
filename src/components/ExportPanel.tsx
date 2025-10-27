import React from 'react'
import { formatDuration } from '../utils/fileUtils'

interface ExportPanelProps {
  fileName: string
  trimStart: number
  trimEnd: number
  isValid: boolean
  onExport: () => void
  isExporting?: boolean
  className?: string
}

const ExportPanel: React.FC<ExportPanelProps> = ({
  fileName,
  trimStart,
  trimEnd,
  isValid,
  onExport,
  isExporting = false,
  className = ''
}) => {
  const trimDuration = trimEnd - trimStart

  const handleExport = () => {
    if (!isValid || isExporting) return
    onExport()
  }

  return (
    <div className={`glass rounded-3xl border border-gray-700/30 backdrop-blur-xl p-8 shadow-2xl ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="text-3xl">💾</span>
              Export Video
            </h3>
            <p className="text-gray-400 mt-1">Save your trimmed video</p>
          </div>
          {isValid && (
            <div className={`px-4 py-2 rounded-xl font-bold text-sm border-2 ${
              isValid 
                ? 'bg-green-500/20 text-green-300 border-green-400/30 shadow-glow' 
                : 'bg-gray-500/20 text-gray-300 border-gray-400/30'
            }`}>
              {isValid ? '✓ Ready' : '✗ Not Ready'}
            </div>
          )}
        </div>

        {/* Export Info */}
        {isValid && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-gray-800/40 rounded-2xl backdrop-blur-sm">
                <span className="block text-xs text-gray-400 uppercase tracking-wider mb-2">Trim Start</span>
                <span className="font-mono text-xl font-bold text-blue-400">{formatDuration(trimStart)}</span>
              </div>
              <div className="p-4 bg-gray-800/40 rounded-2xl backdrop-blur-sm">
                <span className="block text-xs text-gray-400 uppercase tracking-wider mb-2">Trim End</span>
                <span className="font-mono text-xl font-bold text-purple-400">{formatDuration(trimEnd)}</span>
              </div>
              <div className="p-4 bg-gray-800/40 rounded-2xl backdrop-blur-sm">
                <span className="block text-xs text-gray-400 uppercase tracking-wider mb-2">Duration</span>
                <span className="font-mono text-xl font-bold text-green-400">{formatDuration(trimDuration)}</span>
              </div>
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-400/30 rounded-xl">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📁</span>
                <div className="flex-1">
                  <p className="text-sm text-blue-300 font-medium mb-1">Output File</p>
                  <p className="text-xs text-gray-300 font-mono break-all">
                    {fileName.replace(/\.[^/.]+$/, '')}_trimmed.mp4
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={!isValid || isExporting}
          className={`
            w-full py-6 px-8 rounded-2xl font-bold text-xl transition-all duration-300 flex items-center justify-center gap-4
            ${isValid && !isExporting
              ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-glow-lg hover:scale-[1.02] cursor-pointer'
              : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <span className="text-3xl">🎬</span>
              <span>{isValid ? 'Export Trimmed Video' : 'Set Valid Trim Range First'}</span>
              {isValid && <span className="text-2xl">→</span>}
            </>
          )}
        </button>

        {/* Info Note */}
        {!isValid && (
          <div className="p-4 bg-yellow-500/10 border border-yellow-400/30 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <p className="text-sm text-yellow-300 font-medium mb-1">Trim Range Required</p>
                <p className="text-xs text-gray-400">
                  Please set valid trim start and end points before exporting.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Features Coming Soon */}
        <div className="pt-6 border-t border-gray-700/30">
          <p className="text-xs text-gray-500 text-center mb-3">Export Features (Coming Soon)</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 bg-gray-800/30 rounded-lg text-center">
              <p className="text-xs text-gray-400">Quality</p>
              <p className="text-sm text-gray-500 font-medium">HD / 4K</p>
            </div>
            <div className="p-2 bg-gray-800/30 rounded-lg text-center">
              <p className="text-xs text-gray-400">Format</p>
              <p className="text-sm text-gray-500 font-medium">MP4 / MOV</p>
            </div>
            <div className="p-2 bg-gray-800/30 rounded-lg text-center">
              <p className="text-xs text-gray-400">Codec</p>
              <p className="text-sm text-gray-500 font-medium">H.264</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExportPanel

