import React from 'react'

interface TrimButtonProps {
  onTrim: () => void
  disabled?: boolean
  className?: string
}

const TrimButton: React.FC<TrimButtonProps> = ({
  onTrim,
  disabled = false,
  className = ''
}) => {
  return (
    <button
      onClick={onTrim}
      disabled={disabled}
      className={`
        px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed
        text-white rounded-lg font-medium transition-colors duration-200
        flex items-center gap-2 shadow-sm hover:shadow-md
        ${className}
      `}
      title="Trim timeline to green and purple markers"
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
        <path d="M3 3l18 18" />
        <path d="M9 3v6m0 6v6" />
        <path d="M15 3v6m0 6v6" />
      </svg>
      <span>Trim</span>
    </button>
  )
}

export default TrimButton

