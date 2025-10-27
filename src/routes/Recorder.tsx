import React from 'react'

const Recorder: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          🎥 Recorder
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Capture new footage from your screen or webcam
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md">
          <div className="space-y-4">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
              📹 Record Screen
            </button>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
              📷 Record Webcam
            </button>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-gray-600 dark:text-gray-300">
                Recording preview will appear here
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Recorder
