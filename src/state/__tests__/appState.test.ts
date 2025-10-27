import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAppState } from '../appState'

describe('AppState', () => {
  beforeEach(() => {
    // Reset state before each test
    useAppState.setState({
      activeRoute: '/uploader',
      theme: 'system',
      sidebarCollapsed: false
    })
  })

  it('initializes with default values', () => {
    const { result } = renderHook(() => useAppState())
    
    expect(result.current.activeRoute).toBe('/uploader')
    expect(result.current.theme).toBe('system')
    expect(result.current.sidebarCollapsed).toBe(false)
  })

  it('updates active route correctly', () => {
    const { result } = renderHook(() => useAppState())
    
    act(() => {
      result.current.setActiveRoute('/editor')
    })
    
    expect(result.current.activeRoute).toBe('/editor')
  })

  it('updates theme correctly', () => {
    const { result } = renderHook(() => useAppState())
    
    act(() => {
      result.current.setTheme('dark')
    })
    
    expect(result.current.theme).toBe('dark')
  })

  it('toggles sidebar correctly', () => {
    const { result } = renderHook(() => useAppState())
    
    act(() => {
      result.current.toggleSidebar()
    })
    
    expect(result.current.sidebarCollapsed).toBe(true)
    
    act(() => {
      result.current.toggleSidebar()
    })
    
    expect(result.current.sidebarCollapsed).toBe(false)
  })

  it('toggles theme correctly', () => {
    const { result } = renderHook(() => useAppState())
    
    act(() => {
      result.current.setTheme('light')
    })
    
    act(() => {
      result.current.toggleTheme()
    })
    
    expect(result.current.theme).toBe('dark')
  })
})
