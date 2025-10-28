import React from 'react'

interface DeleteButtonProps {
  onDelete: () => void
  disabled?: boolean
  className?: string
}

const DeleteButton: React.FC<DeleteButtonProps> = ({
  onDelete,
  disabled = false,
  className = ''
}) => {
  return (
    <button
      onClick={onDelete}
      disabled={disabled}
      className={`
        px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed
        text-white rounded-lg font-medium transition-colors duration-200
        flex items-center gap-2 shadow-sm hover:shadow-md
        ${className}
      `}
      title="Delete selected clip (Delete key)"
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
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
      </svg>
      <span>Delete</span>
    </button>
  )
}

export default DeleteButton
