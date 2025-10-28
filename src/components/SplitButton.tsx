import React from 'react'

interface SplitButtonProps {
  onSplit: () => void
  disabled?: boolean
  className?: string
}

const SplitButton: React.FC<SplitButtonProps> = ({
  onSplit,
  disabled = false,
  className = ''
}) => {
  return (
    <button
      onClick={onSplit}
      disabled={disabled}
      className={`
        px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed
        text-white rounded-lg font-medium transition-colors duration-200
        flex items-center gap-2 shadow-sm hover:shadow-md
        ${className}
      `}
      title="Split clip at playhead position (Ctrl+S)"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 12h18" />
        <path d="M3 6h18" />
        <path d="M3 18h18" />
      </svg>
      <span>Split</span>
    </button>
  )
}

export default SplitButton
