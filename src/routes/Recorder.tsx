import React from 'react'

const Recorder: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Content with Modern Spacing */}
      <div className="flex-1 overflow-auto p-12 bg-gradient-to-br from-gray-950 to-gray-900">
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-full max-w-6xl">
            <div className="glass rounded-3xl border border-gray-700/30 backdrop-blur-xl p-16 shadow-2xl">
              {/* Header Section */}
              <div className="text-center mb-16 space-y-8">
                <div className="relative mx-auto w-40 h-40 bg-gradient-to-br from-red-500/20 to-purple-500/20 rounded-3xl flex items-center justify-center text-9xl group hover:scale-105 transition-all duration-500 shadow-glow">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-red-500/20 to-purple-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
                  <span className="relative z-10">📹</span>
                </div>
                <div className="space-y-4">
                  <h2 className="text-4xl font-bold text-white">
                    Ready to Record
                  </h2>
                  <p className="text-gray-300 text-xl">
                    Choose your recording source to get started
                  </p>
                </div>
              </div>

              {/* Recording Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                <button className="group relative glass rounded-3xl p-12 border-2 border-blue-500/30 hover:border-blue-400/60 transition-all duration-500 hover:scale-105 hover:shadow-glow-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10 space-y-6">
                    <div className="w-28 h-28 mx-auto bg-gradient-to-br from-blue-500/30 to-blue-600/30 rounded-3xl flex items-center justify-center text-7xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      🖥️
                    </div>
                    <div className="space-y-3">
                      <div className="text-3xl font-bold text-white">Record Screen</div>
                      <div className="text-base text-gray-300">Capture your entire screen or a specific window</div>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-blue-400 font-medium text-base opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span>Start Recording</span>
                      <span>→</span>
                    </div>
                  </div>
                </button>

                <button className="group relative glass rounded-3xl p-12 border-2 border-green-500/30 hover:border-green-400/60 transition-all duration-500 hover:scale-105 hover:shadow-glow-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-green-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10 space-y-6">
                    <div className="w-28 h-28 mx-auto bg-gradient-to-br from-green-500/30 to-green-600/30 rounded-3xl flex items-center justify-center text-7xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      📷
                    </div>
                    <div className="space-y-3">
                      <div className="text-3xl font-bold text-white">Record Webcam</div>
                      <div className="text-base text-gray-300">Record directly from your camera device</div>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-green-400 font-medium text-base opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span>Start Recording</span>
                      <span>→</span>
                    </div>
                  </div>
                </button>
              </div>

              {/* Preview Area */}
              <div className="glass rounded-3xl border border-gray-700/30 p-16 bg-gradient-to-br from-gray-800/20 to-gray-900/30">
                <div className="text-center space-y-8">
                  <div className="relative mx-auto w-32 h-32 bg-gray-700/30 rounded-3xl flex items-center justify-center text-7xl">
                    <div className="absolute inset-0 rounded-3xl border-4 border-dashed border-gray-600/30 animate-pulse-slow"></div>
                    <span className="relative z-10">⏺️</span>
                  </div>
                  <div className="space-y-4">
                    <p className="text-2xl font-semibold text-white">Recording Preview</p>
                    <p className="text-gray-400 text-lg">
                      Your recording will appear here once you start
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-4 pt-4">
                    <div className="flex items-center gap-3 px-6 py-3 bg-gray-700/30 rounded-full border border-gray-600/30">
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <span className="text-gray-400 text-base font-medium">Standby</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="mt-12 pt-12 border-t border-gray-700/30">
                <h4 className="text-xl font-bold text-white mb-8 flex items-center gap-2 justify-center">
                  <span className="text-2xl">💡</span>
                  <span>Pro Recording Tips</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <div className="text-4xl mb-2">🎯</div>
                    <p className="text-lg text-white font-semibold">HD Quality</p>
                    <p className="text-sm text-gray-400">Crystal clear video output</p>
                  </div>
                  <div className="space-y-3">
                    <div className="text-4xl mb-2">⚡</div>
                    <p className="text-lg text-white font-semibold">Fast Encoding</p>
                    <p className="text-sm text-gray-400">Quick processing after recording</p>
                  </div>
                  <div className="space-y-3">
                    <div className="text-4xl mb-2">💾</div>
                    <p className="text-lg text-white font-semibold">Auto Save</p>
                    <p className="text-sm text-gray-400">Never lose your recordings</p>
                  </div>
                </div>
                
                {/* Keyboard Shortcuts */}
                <div className="mt-8 pt-8 border-t border-gray-700/30">
                  <div className="flex items-center justify-center gap-8 flex-wrap">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <kbd className="px-3 py-2 bg-gray-800/70 rounded text-gray-300 font-mono border border-gray-700/50">Ctrl</kbd>
                      <span>+</span>
                      <kbd className="px-3 py-2 bg-gray-800/70 rounded text-gray-300 font-mono border border-gray-700/50">R</kbd>
                      <span>Start Recording</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <kbd className="px-3 py-2 bg-gray-800/70 rounded text-gray-300 font-mono border border-gray-700/50">Ctrl</kbd>
                      <span>+</span>
                      <kbd className="px-3 py-2 bg-gray-800/70 rounded text-gray-300 font-mono border border-gray-700/50">S</kbd>
                      <span>Stop Recording</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <kbd className="px-3 py-2 bg-gray-800/70 rounded text-gray-300 font-mono border border-gray-700/50">Esc</kbd>
                      <span>Cancel</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Recorder
