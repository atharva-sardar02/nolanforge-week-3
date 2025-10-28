import React from 'react'

interface PlayheadProps {
  currentTime: number
  pixelsPerSecond: number
  className?: string
}

const Playhead: React.FC<PlayheadProps> = ({
  currentTime,
  pixelsPerSecond,
  className = ''
}) => {
  const playheadX = currentTime * pixelsPerSecond

  return (
    <div
      className={`
        absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none
        shadow-lg shadow-red-500/50
        ${className}
      `}
      style={{
        left: `${playheadX}px`,
        transform: 'translateX(-50%)'
      }}
    >
      {/* Playhead Handle */}
      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg" />
      
      {/* Time Label */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
        {formatTime(currentTime)}
      </div>
    </div>
  )
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 100)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
}

export default Playhead
