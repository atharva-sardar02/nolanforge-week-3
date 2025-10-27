import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders NolanForge branding in sidebar', () => {
    render(<App />)
    expect(screen.getByText('NolanForge')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<App />)
    expect(screen.getByText('Uploader')).toBeInTheDocument()
    expect(screen.getByText('Editor')).toBeInTheDocument()
    expect(screen.getByText('Recorder')).toBeInTheDocument()
  })

  it('shows Uploader route by default', () => {
    render(<App />)
    expect(screen.getByText('📁 Uploader')).toBeInTheDocument()
    expect(screen.getByText('Import and organize your video files')).toBeInTheDocument()
  })
})
