import React from 'react'

interface ConfirmationDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  variant?: 'danger' | 'warning' | 'info'
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'info'
}) => {
  if (!isOpen) return null

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: '⚠️',
          confirmButton: 'bg-red-500 hover:bg-red-600 text-white',
          iconColor: 'text-red-500'
        }
      case 'warning':
        return {
          icon: '⚠️',
          confirmButton: 'bg-yellow-500 hover:bg-yellow-600 text-white',
          iconColor: 'text-yellow-500'
        }
      default:
        return {
          icon: 'ℹ️',
          confirmButton: 'bg-blue-500 hover:bg-blue-600 text-white',
          iconColor: 'text-blue-500'
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-start">
            <div className={`text-2xl mr-3 ${styles.iconColor}`}>
              {styles.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {message}
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${styles.confirmButton}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationDialog
