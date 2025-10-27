import React from 'react'

interface ErrorDisplayProps {
  error: string | null
  onDismiss?: () => void
  className?: string
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  onDismiss, 
  className = '' 
}) => {
  if (!error) return null

  return (
    <div className={`glass rounded-3xl border-2 border-red-500/50 backdrop-blur-xl p-6 bg-gradient-to-br from-red-500/10 to-red-600/5 shadow-glow animate-slide-in ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center text-3xl shadow-lg mr-4">
          ⚠️
        </div>
        <div className="flex-1">
          <h4 className="text-red-300 font-bold text-lg mb-1">Error</h4>
          <p className="text-red-200 font-medium">
            {error}
          </p>
        </div>
        {onDismiss && (
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={onDismiss}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-xl transition-all duration-200 hover:scale-110"
              title="Dismiss"
            >
              <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

interface WarningDisplayProps {
  warnings: string[]
  className?: string
}

export const WarningDisplay: React.FC<WarningDisplayProps> = ({ 
  warnings, 
  className = '' 
}) => {
  if (warnings.length === 0) return null

  return (
    <div className={`glass rounded-3xl border-2 border-yellow-500/50 backdrop-blur-xl p-6 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 shadow-glow animate-slide-in ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-yellow-500/20 flex items-center justify-center text-3xl shadow-lg mr-4">
          ⚠️
        </div>
        <div className="flex-1">
          <h4 className="text-yellow-300 font-bold text-lg mb-3">
            {warnings.length === 1 ? 'Warning' : `${warnings.length} Warnings`}
          </h4>
          <ul className="space-y-2">
            {warnings.map((warning, index) => (
              <li key={index} className="flex items-start">
                <span className="text-yellow-400 mr-3 mt-1">•</span>
                <span className="text-yellow-200 font-medium flex-1">{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ErrorDisplay
