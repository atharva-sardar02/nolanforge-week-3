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
          confirmButton: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-glow',
          iconBg: 'bg-gradient-to-br from-red-500/30 to-red-600/30',
          borderColor: 'border-red-500/30'
        }
      case 'warning':
        return {
          icon: '⚠️',
          confirmButton: 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-glow',
          iconBg: 'bg-gradient-to-br from-yellow-500/30 to-yellow-600/30',
          borderColor: 'border-yellow-500/30'
        }
      default:
        return {
          icon: 'ℹ️',
          confirmButton: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-glow',
          iconBg: 'bg-gradient-to-br from-blue-500/30 to-blue-600/30',
          borderColor: 'border-blue-500/30'
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className={`glass rounded-3xl border ${styles.borderColor} backdrop-blur-xl shadow-2xl max-w-md w-full animate-scale-in`}>
        <div className="p-8">
          <div className="flex items-start mb-6">
            <div className={`w-16 h-16 rounded-2xl ${styles.iconBg} flex items-center justify-center text-4xl shadow-lg mr-4 flex-shrink-0`}>
              {styles.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-3">
                {title}
              </h3>
              <p className="text-gray-300 text-base leading-relaxed">
                {message}
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={onCancel}
              className="flex-1 relative overflow-hidden bg-gradient-to-r from-gray-600/20 to-gray-700/20 hover:from-gray-600/30 hover:to-gray-700/30 border border-gray-500/30 hover:border-gray-400/60 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 hover:scale-105 group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-600/10 to-gray-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 text-lg">{cancelText}</span>
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 relative overflow-hidden ${styles.confirmButton} font-bold py-4 px-6 rounded-2xl transition-all duration-300 hover:scale-105 group`}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 text-lg">{confirmText}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationDialog
