import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAppState } from '../state/appState'
import { SettingsPanel } from './SettingsPanel'

const Navbar: React.FC = () => {
  const location = useLocation()
  const { activeRoute, setActiveRoute } = useAppState()
  const [showSettingsPanel, setShowSettingsPanel] = useState(false)

  const navItems = [
    { path: '/uploader', icon: '📁', label: 'Media Library' },
    { path: '/editor', icon: '✂️', label: 'Editor' },
    { path: '/recorder', icon: '🎥', label: 'Recorder' }
  ]

  const isActive = (path: string) => activeRoute === path || location.pathname === path

  return (
    <>
      <nav className="w-full bg-gray-900/50 backdrop-blur-xl border-b border-gray-800/50 shadow-2xl relative z-40">
        <div className="flex items-center justify-between px-10 py-5">
          {/* Logo and Brand */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-blue-500/20">
              🎬
            </div>
            <div>
              <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                NolanForge
              </h1>
              <p className="text-xs text-gray-400 font-medium">Professional Video Editor</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setActiveRoute(item.path as any)}
                className="group relative"
              >
                <div className={`
                  flex items-center gap-3 px-6 py-3 rounded-2xl font-semibold transition-all duration-300
                  ${isActive(item.path)
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-glow scale-105'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white hover:scale-105'
                  }
                `}>
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-base">{item.label}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Settings Button */}
          <button
            onClick={() => setShowSettingsPanel(true)}
            className="w-12 h-12 rounded-2xl bg-gray-800/50 hover:bg-gray-700/50 flex items-center justify-center text-2xl transition-all duration-300 hover:scale-105"
            title="Settings"
          >
            ⚙️
          </button>
        </div>
      </nav>

      {/* Settings Panel - Rendered outside nav for proper z-index stacking */}
      {showSettingsPanel && (
        <SettingsPanel onClose={() => setShowSettingsPanel(false)} />
      )}
    </>
  )
}

export default Navbar

