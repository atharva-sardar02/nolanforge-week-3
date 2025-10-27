import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAppState } from '../state/appState'

const SidebarNav: React.FC = () => {
  const location = useLocation()
  const { activeRoute, setActiveRoute } = useAppState()

  const navItems = [
    { path: '/uploader', icon: '📁', label: 'Media' },
    { path: '/editor', icon: '✂️', label: 'Editor' },
    { path: '/recorder', icon: '🎥', label: 'Record' }
  ]

  const isActive = (path: string) => activeRoute === path || location.pathname === path

  return (
    <nav className="w-20 bg-gray-900/50 backdrop-blur-xl border-r border-gray-800/50 flex flex-col items-center py-6 space-y-8">
      {/* Logo */}
      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-blue-500/20">
        🎬
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setActiveRoute(item.path as any)}
            className="group relative"
            title={item.label}
          >
            <div className={`
              w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300
              ${isActive(item.path)
                ? 'bg-blue-500 shadow-lg shadow-blue-500/50 scale-110'
                : 'bg-gray-800/50 hover:bg-gray-700/50 hover:scale-105'
              }
            `}>
              {item.icon}
            </div>
            
            {/* Tooltip */}
            <div className="absolute left-full ml-4 px-3 py-1.5 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {item.label}
            </div>
          </Link>
        ))}
      </div>

      {/* Theme Toggle */}
      <button
        className="w-14 h-14 rounded-2xl bg-gray-800/50 hover:bg-gray-700/50 flex items-center justify-center text-xl transition-all duration-300 hover:scale-105"
        title="Dark Mode"
      >
        🌙
      </button>
    </nav>
  )
}

export default SidebarNav
