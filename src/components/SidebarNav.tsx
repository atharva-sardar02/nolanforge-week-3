import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAppState } from '../state/appState'

const SidebarNav: React.FC = () => {
  const location = useLocation()
  const { activeRoute, setActiveRoute, theme, toggleTheme, sidebarCollapsed, toggleSidebar } = useAppState()

  const navItems = [
    {
      path: '/uploader',
      icon: '📁',
      label: 'Uploader',
      description: 'Import files'
    },
    {
      path: '/editor',
      icon: '✂️',
      label: 'Editor',
      description: 'Edit clips'
    },
    {
      path: '/recorder',
      icon: '🎥',
      label: 'Recorder',
      description: 'Record new'
    }
  ]

  const isActive = (path: string) => activeRoute === path || location.pathname === path

  const handleNavClick = (path: string) => {
    setActiveRoute(path as any)
  }

  return (
    <nav className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 z-10 transition-all duration-300 ${
      sidebarCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="p-6">
        <div className="mb-8">
          <h1 className={`text-2xl font-bold text-gray-900 dark:text-white transition-opacity duration-300 ${
            sidebarCollapsed ? 'opacity-0' : 'opacity-100'
          }`}>
            NolanForge
          </h1>
          <p className={`text-sm text-gray-500 dark:text-gray-400 transition-opacity duration-300 ${
            sidebarCollapsed ? 'opacity-0' : 'opacity-100'
          }`}>
            Video Editor
          </p>
        </div>

        <div className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`
                flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                ${isActive(item.path)
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-l-4 border-blue-500'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }
              `}
            >
              <span className="text-2xl flex-shrink-0">{item.icon}</span>
              <div className={`flex-1 transition-opacity duration-300 ${
                sidebarCollapsed ? 'opacity-0' : 'opacity-100'
              }`}>
                <div className="font-medium">{item.label}</div>
                <div className="text-xs opacity-75">{item.description}</div>
              </div>
              {isActive(item.path) && (
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
              )}
            </Link>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-2">
            <Link
              to="/welcome"
              className="flex items-center space-x-3 px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <span className="text-lg">ℹ️</span>
              <span className={`text-sm transition-opacity duration-300 ${
                sidebarCollapsed ? 'opacity-0' : 'opacity-100'
              }`}>About</span>
            </Link>
            
            <button
              onClick={toggleTheme}
              className="flex items-center space-x-3 px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors w-full"
            >
              <span className="text-lg">{theme === 'dark' ? '🌙' : '☀️'}</span>
              <span className={`text-sm transition-opacity duration-300 ${
                sidebarCollapsed ? 'opacity-0' : 'opacity-100'
              }`}>
                {theme === 'dark' ? 'Dark' : 'Light'}
              </span>
            </button>

            <button
              onClick={toggleSidebar}
              className="flex items-center space-x-3 px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors w-full"
            >
              <span className="text-lg">{sidebarCollapsed ? '▶️' : '◀️'}</span>
              <span className={`text-sm transition-opacity duration-300 ${
                sidebarCollapsed ? 'opacity-0' : 'opacity-100'
              }`}>
                Collapse
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default SidebarNav
