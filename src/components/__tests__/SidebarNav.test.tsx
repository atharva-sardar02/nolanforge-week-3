import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import SidebarNav from '../SidebarNav'
import { useAppState } from '../../state/appState'

// Mock the useAppState hook
vi.mock('../../state/appState', () => ({
  useAppState: vi.fn()
}))

const mockUseAppState = useAppState as any

// Helper component to wrap SidebarNav with Router
const SidebarNavWithRouter = () => (
  <BrowserRouter>
    <SidebarNav />
  </BrowserRouter>
)

describe('SidebarNav', () => {
  const mockState = {
    activeRoute: '/uploader',
    setActiveRoute: vi.fn(),
    theme: 'light',
    toggleTheme: vi.fn(),
    sidebarCollapsed: false,
    toggleSidebar: vi.fn()
  }

  beforeEach(() => {
    mockUseAppState.mockReturnValue(mockState)
    vi.clearAllMocks()
  })

  it('renders all navigation links', () => {
    render(<SidebarNavWithRouter />)
    
    expect(screen.getByText('Uploader')).toBeInTheDocument()
    expect(screen.getByText('Editor')).toBeInTheDocument()
    expect(screen.getByText('Recorder')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
  })

  it('renders NolanForge branding', () => {
    render(<SidebarNavWithRouter />)
    
    expect(screen.getByText('NolanForge')).toBeInTheDocument()
    expect(screen.getByText('Video Editor')).toBeInTheDocument()
  })

  it('highlights active route', () => {
    render(<SidebarNavWithRouter />)
    
    const uploaderLink = screen.getByText('Uploader').closest('a')
    expect(uploaderLink).toHaveClass('bg-blue-100', 'dark:bg-blue-900', 'text-blue-700', 'dark:text-blue-300', 'border-l-4', 'border-blue-500')
  })

  it('handles navigation click events', () => {
    render(<SidebarNavWithRouter />)
    
    const editorLink = screen.getByText('Editor').closest('a')
    fireEvent.click(editorLink!)
    
    expect(mockState.setActiveRoute).toHaveBeenCalledWith('/editor')
  })

  it('shows theme toggle button', () => {
    render(<SidebarNavWithRouter />)
    
    const themeButton = screen.getByText('Light')
    expect(themeButton).toBeInTheDocument()
  })

  it('handles theme toggle click', () => {
    render(<SidebarNavWithRouter />)
    
    const themeButton = screen.getByText('Light')
    fireEvent.click(themeButton)
    
    expect(mockState.toggleTheme).toHaveBeenCalled()
  })

  it('shows collapse button', () => {
    render(<SidebarNavWithRouter />)
    
    const collapseButton = screen.getByText('Collapse')
    expect(collapseButton).toBeInTheDocument()
  })

  it('handles sidebar collapse', () => {
    render(<SidebarNavWithRouter />)
    
    const collapseButton = screen.getByText('Collapse')
    fireEvent.click(collapseButton)
    
    expect(mockState.toggleSidebar).toHaveBeenCalled()
  })

  it('shows collapsed state correctly', () => {
    mockUseAppState.mockReturnValue({
      ...mockState,
      sidebarCollapsed: true
    })
    
    render(<SidebarNavWithRouter />)
    
    const nav = screen.getByRole('navigation')
    expect(nav).toHaveClass('w-16')
  })

  it('shows expanded state correctly', () => {
    render(<SidebarNavWithRouter />)
    
    const nav = screen.getByRole('navigation')
    expect(nav).toHaveClass('w-64')
  })

  it('displays correct theme icon', () => {
    mockUseAppState.mockReturnValue({
      ...mockState,
      theme: 'dark'
    })
    
    render(<SidebarNavWithRouter />)
    
    expect(screen.getByText('🌙')).toBeInTheDocument()
    expect(screen.getByText('Dark')).toBeInTheDocument()
  })

  it('displays correct collapse icon', () => {
    mockUseAppState.mockReturnValue({
      ...mockState,
      sidebarCollapsed: true
    })
    
    render(<SidebarNavWithRouter />)
    
    expect(screen.getByText('▶️')).toBeInTheDocument()
  })
})
