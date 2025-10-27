import { create } from 'zustand'

export type Theme = 'light' | 'dark' | 'system'
export type ActiveRoute = '/uploader' | '/editor' | '/recorder' | '/welcome'

interface AppState {
  // Current active route
  activeRoute: ActiveRoute
  
  // Theme preference
  theme: Theme
  
  // UI state
  sidebarCollapsed: boolean
  
  // Actions
  setActiveRoute: (route: ActiveRoute) => void
  setTheme: (theme: Theme) => void
  toggleSidebar: () => void
  toggleTheme: () => void
}

export const useAppState = create<AppState>((set, get) => ({
  // Initial state
  activeRoute: '/uploader',
  theme: 'dark',
  sidebarCollapsed: false,

  // Actions
  setActiveRoute: (route: ActiveRoute) => {
    set({ activeRoute: route })
  },

  setTheme: (theme: Theme) => {
    set({ theme })
    // Apply theme to document
    if (typeof window !== 'undefined') {
      const root = document.documentElement
      if (theme === 'dark') {
        root.classList.add('dark')
      } else if (theme === 'light') {
        root.classList.remove('dark')
      } else {
        // System theme - check prefers-color-scheme
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (prefersDark) {
          root.classList.add('dark')
        } else {
          root.classList.remove('dark')
        }
      }
    }
  },

  toggleSidebar: () => {
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }))
  },

  toggleTheme: () => {
    const currentTheme = get().theme
    const newTheme: Theme = currentTheme === 'light' ? 'dark' : 'light'
    get().setTheme(newTheme)
  }
}))

// Initialize theme on app start
if (typeof window !== 'undefined') {
  const { theme } = useAppState.getState()
  useAppState.getState().setTheme(theme)
}
