import React, { useCallback } from 'react'
import { formatDuration } from '../utils/fileUtils'

interface TrimControlsProps {
  duration: number
  currentTime: number
  trimStart: number
  trimEnd: number
  onTrimStartChange: (time: number) => void
  onTrimEndChange: (time: number) => void
  onSeekToTrimStart: () => void
  onSeekToTrimEnd: () => void
  onSetTrimStartToCurrent: () => void
  onSetTrimEndToCurrent: () => void
  onResetTrim: () => void
  className?: string
}

const TrimControls: React.FC<TrimControlsProps> = ({
  duration,
  currentTime,
  trimStart,
  trimEnd,
  onTrimStartChange,
  onTrimEndChange,
  onSeekToTrimStart,
  onSeekToTrimEnd,
  onSetTrimStartToCurrent,
  onSetTrimEndToCurrent,
  onResetTrim,
  className = ''
}) => {
  const trimDuration = trimEnd - trimStart
  const isValid = trimStart < trimEnd && trimEnd > 0

  const handleTrimStartChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    onTrimStartChange(time)
  }, [onTrimStartChange])

  const handleTrimEndChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    onTrimEndChange(time)
  }, [onTrimEndChange])

  return (
    <div className={`glass rounded-3xl border border-gray-700/30 backdrop-blur-xl p-8 shadow-2xl ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">✂️</span>
          Trim Controls
        </h3>
        <div className={`px-4 py-2 rounded-xl font-bold text-sm border-2 ${
          isValid 
            ? 'bg-green-500/20 text-green-300 border-green-400/30 shadow-glow' 
            : 'bg-red-500/20 text-red-300 border-red-400/30'
        }`}>
          {isValid ? '✓ Valid' : '✗ Invalid'}
        </div>
      </div>

      <div className="space-y-6">
        {/* Trim Range Display */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-gray-800/40 rounded-2xl backdrop-blur-sm">
            <span className="block text-xs text-gray-400 uppercase tracking-wider mb-2">Start</span>
            <span className="font-mono text-2xl font-bold text-blue-400">{formatDuration(trimStart)}</span>
          </div>
          <div className="p-4 bg-gray-800/40 rounded-2xl backdrop-blur-sm">
            <span className="block text-xs text-gray-400 uppercase tracking-wider mb-2">Duration</span>
            <span className="font-mono text-2xl font-bold text-green-400">{formatDuration(trimDuration)}</span>
          </div>
          <div className="p-4 bg-gray-800/40 rounded-2xl backdrop-blur-sm">
            <span className="block text-xs text-gray-400 uppercase tracking-wider mb-2">End</span>
            <span className="font-mono text-2xl font-bold text-purple-400">{formatDuration(trimEnd)}</span>
          </div>
        </div>

        {/* Trim Range Sliders */}
        <div className="space-y-5">
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-base font-bold text-white">
                🟦 Trim Start
              </label>
              <span className="font-mono text-sm font-semibold text-blue-400">
                {formatDuration(trimStart)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={duration}
              step="0.1"
              value={trimStart}
              onChange={handleTrimStartChange}
              className="w-full h-3 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(trimStart / duration) * 100}%, #374151 ${(trimStart / duration) * 100}%, #374151 100%)`
              }}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-base font-bold text-white">
                🟪 Trim End
              </label>
              <span className="font-mono text-sm font-semibold text-purple-400">
                {formatDuration(trimEnd)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={duration}
              step="0.1"
              value={trimEnd}
              onChange={handleTrimEndChange}
              className="w-full h-3 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #9333ea 0%, #9333ea ${(trimEnd / duration) * 100}%, #374151 ${(trimEnd / duration) * 100}%, #374151 100%)`
              }}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onSeekToTrimStart}
              className="group relative overflow-hidden bg-gradient-to-r from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30 border border-blue-400/30 hover:border-blue-400/60 text-white font-bold py-3 px-4 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-glow"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center justify-center gap-2">
                <span>⏮️</span>
                <span>Go to Start</span>
              </span>
            </button>
            <button
              onClick={onSeekToTrimEnd}
              className="group relative overflow-hidden bg-gradient-to-r from-purple-500/20 to-purple-600/20 hover:from-purple-500/30 hover:to-purple-600/30 border border-purple-400/30 hover:border-purple-400/60 text-white font-bold py-3 px-4 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-glow"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center justify-center gap-2">
                <span>⏭️</span>
                <span>Go to End</span>
              </span>
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onSetTrimStartToCurrent}
              className="group relative overflow-hidden bg-gradient-to-r from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 border border-green-400/30 hover:border-green-400/60 text-white font-bold py-3 px-4 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-glow"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center justify-center gap-2">
                <span>📍</span>
                <span>Mark Start</span>
              </span>
            </button>
            <button
              onClick={onSetTrimEndToCurrent}
              className="group relative overflow-hidden bg-gradient-to-r from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 border border-green-400/30 hover:border-green-400/60 text-white font-bold py-3 px-4 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-glow"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center justify-center gap-2">
                <span>📍</span>
                <span>Mark End</span>
              </span>
            </button>
          </div>

          <button
            onClick={onResetTrim}
            className="group w-full relative overflow-hidden bg-gradient-to-r from-gray-600/20 to-gray-700/20 hover:from-gray-600/30 hover:to-gray-700/30 border border-gray-500/30 hover:border-gray-400/60 text-white font-bold py-3 px-4 rounded-2xl transition-all duration-300 hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-600/10 to-gray-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span>🔄</span>
              <span>Reset Trim</span>
            </span>
          </button>
        </div>

        {/* Current Time Info */}
        <div className="text-center pt-4 border-t border-gray-700/30">
          <div className="mb-2 text-base font-semibold text-gray-300">
            Current: <span className="font-mono text-white">{formatDuration(currentTime)}</span>
          </div>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm ${
            currentTime >= trimStart && currentTime <= trimEnd
              ? 'bg-green-500/20 text-green-300 border-2 border-green-400/30'
              : 'bg-orange-500/20 text-orange-300 border-2 border-orange-400/30'
          }`}>
            {currentTime >= trimStart && currentTime <= trimEnd ? (
              <>
                <span>✓</span>
                <span>Within trim range</span>
              </>
            ) : (
              <>
                <span>⚠</span>
                <span>Outside trim range</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrimControls
