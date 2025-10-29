import React from 'react'
import SplitButton from './SplitButton'
import DeleteButton from './DeleteButton'
import TrimButton from './TrimButton'
import { formatDuration } from '../utils/fileUtils'

interface TimelineToolsProps {
  onSplit: () => void
  onDelete: () => void
  onTrim: () => void
  canSplit: boolean
  canDelete: boolean
  canTrim: boolean
  zoomLevel: number
  onZoomChange: (level: number) => void
  // Trim navigation buttons
  onGoToStart: () => void
  onGoToEnd: () => void
  onMarkStart: () => void
  onMarkEnd: () => void
  totalDuration: number
  currentTime: number
  globalTrimStart: number
  globalTrimEnd: number | null
  className?: string
}

const TimelineTools: React.FC<TimelineToolsProps> = ({
  onSplit,
  onDelete,
  onTrim,
  canSplit,
  canDelete,
  canTrim,
  zoomLevel,
  onZoomChange,
  onGoToStart,
  onGoToEnd,
  onMarkStart,
  onMarkEnd,
  totalDuration,
  currentTime,
  globalTrimStart,
  globalTrimEnd,
  className = ''
}) => {
  const isOutsideTrimRange = globalTrimEnd !== null && (currentTime < globalTrimStart || currentTime > globalTrimEnd)
  
  return (
    <div className={`
      flex flex-col gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700/30
      backdrop-blur-sm
      ${className}
    `}>
      {/* Main Tools Row */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-300">Timeline Tools:</span>
        </div>
        
        <div className="flex items-center gap-2">
          <SplitButton
            onSplit={onSplit}
            disabled={!canSplit}
          />
          <DeleteButton
            onDelete={onDelete}
            disabled={!canDelete}
          />
          <TrimButton
            onTrim={onTrim}
            disabled={!canTrim}
          />
          
          {/* Go to Start */}
          <button
            onClick={onGoToStart}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
            title="Go to timeline start"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 17l-5-5 5-5" />
              <path d="M18 17l-5-5 5-5" />
            </svg>
            <span>Go to Start</span>
          </button>

          {/* Go to End */}
          <button
            onClick={onGoToEnd}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
            title="Go to timeline end"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 17l5-5-5-5" />
              <path d="M6 17l5-5-5-5" />
            </svg>
            <span>Go to End</span>
          </button>

          {/* Mark Start */}
          <button
            onClick={onMarkStart}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
            title="Mark current position as trim start (green marker)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span>Mark Start</span>
          </button>

          {/* Mark End */}
          <button
            onClick={onMarkEnd}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
            title="Mark current position as trim end (purple marker)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span>Mark End</span>
          </button>
        </div>

        {/* Timeline Zoom Controls */}
        <div className="flex-1" />
        
        <div className="flex items-center gap-3 pl-3 border-l border-gray-700/30">
          <span className="text-xs text-gray-400 font-medium">Zoom:</span>
          
          {/* Zoom Out Button */}
          <button
            onClick={() => onZoomChange(Math.max(10, zoomLevel - 25))}
            disabled={zoomLevel <= 10}
            className="w-8 h-8 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 text-white text-sm font-bold disabled:opacity-50"
            title="Zoom Out (Ctrl + -)"
          >
            −
          </button>

          {/* Current Zoom Display */}
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-700/50 rounded-lg min-w-[60px] justify-center">
            <span className="text-xs text-gray-300 font-medium">
              {Math.round((zoomLevel / 50) * 100)}%
            </span>
          </div>

          {/* Zoom Reset Button */}
          <button
            onClick={() => onZoomChange(50)}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105"
            title="Reset Zoom (Ctrl + 0)"
          >
            Reset
          </button>

          {/* Zoom In Button */}
          <button
            onClick={() => onZoomChange(Math.min(200, zoomLevel + 25))}
            disabled={zoomLevel >= 200}
            className="w-8 h-8 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 text-white text-sm font-bold disabled:opacity-50"
            title="Zoom In (Ctrl + +)"
          >
            +
          </button>

          {/* Quick Zoom Presets */}
          <div className="flex items-center gap-1 ml-1">
            {[25, 50, 100, 150, 200].map((level) => (
              <button
                key={level}
                onClick={() => onZoomChange(level)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  zoomLevel === level
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                title={`${level}px/s (${Math.round((level / 50) * 100)}%)`}
              >
                {Math.round((level / 50) * 100)}%
              </button>
            ))}
          </div>
        </div>
      </div>
      
    </div>
  )
}

export default TimelineTools
