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

  const isWithinRange = currentTime >= trimStart && currentTime <= trimEnd
  
  return (
    <div className={`glass rounded-lg border border-gray-700/30 backdrop-blur-xl p-3 shadow-xl ${className}`}>
      {/* Line 1: Sliders and Range Info */}
      <div className="flex items-center gap-3 mb-2">
        {/* Trim Start */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-gray-400 font-medium">Start</label>
            <span className="font-mono text-xs text-blue-400">{formatDuration(trimStart)}</span>
          </div>
          <input
            type="range"
            min="0"
            max={duration}
            step="0.1"
            value={trimStart}
            onChange={handleTrimStartChange}
            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        
        {/* Duration Display */}
        <div className="px-2 py-1 bg-gray-800/50 rounded text-xs">
          <span className="text-gray-400">Dur: </span>
          <span className="font-mono text-green-400 font-medium">{formatDuration(trimDuration)}</span>
        </div>

        {/* Trim End */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-gray-400 font-medium">End</label>
            <span className="font-mono text-xs text-purple-400">{formatDuration(trimEnd)}</span>
          </div>
          <input
            type="range"
            min="0"
            max={duration}
            step="0.1"
            value={trimEnd}
            onChange={handleTrimEndChange}
            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* Line 2: Action Buttons, Current Time, Warning */}
      <div className="flex items-center gap-2">
        {/* Action Buttons */}
        <button
          onClick={onSeekToTrimStart}
          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1"
          title="Go to trim start"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 17l-5-5 5-5" />
            <path d="M18 17l-5-5 5-5" />
          </svg>
          <span>Start</span>
        </button>
        
        <button
          onClick={onSeekToTrimEnd}
          className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1"
          title="Go to trim end"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 17l5-5-5-5" />
            <path d="M6 17l5-5-5-5" />
          </svg>
          <span>End</span>
        </button>

        <button
          onClick={onSetTrimStartToCurrent}
          className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1"
          title="Mark current as trim start"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <span>Mark S</span>
        </button>

        <button
          onClick={onSetTrimEndToCurrent}
          className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1"
          title="Mark current as trim end"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <span>Mark E</span>
        </button>

        <button
          onClick={onResetTrim}
          className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1"
          title="Reset trim"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 4v6h6" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          <span>Reset</span>
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Current Time */}
        <span className="text-xs text-gray-400">
          Current: <span className="font-mono text-gray-300">{formatDuration(currentTime)}</span>
        </span>

        {/* Warning */}
        {!isWithinRange && (
          <div className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 border border-orange-500/50 rounded text-xs text-orange-300">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L1 21h22L12 2zm1 15h-2v-2h2v2zm0-4h-2V9h2v4z"/>
            </svg>
            <span>Outside trim range</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default TrimControls
