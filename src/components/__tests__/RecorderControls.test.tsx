import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from 'react'
import RecorderControls from '../../components/RecorderControls'

// Mock the hooks
vi.mock('../../hooks/useMediaRecorder', () => ({
  useMediaRecorder: () => ({
    isRecording: false,
    duration: 0,
    error: null,
    videoStream: new MediaStream(),
    startRecording: vi.fn(),
    stopRecording: vi.fn(),
    getFormattedDuration: () => '00:00'
  })
}))

vi.mock('../../state/recordingState', () => ({
  useRecordingState: () => ({
    settings: {
      quality: 'high',
      audioEnabled: true,
      format: 'webm'
    },
    setSettings: vi.fn(),
    recordedBlob: null,
    resetRecording: vi.fn()
  })
}))

describe('RecorderControls', () => {
  const mockProps = {
    onRecordingStart: vi.fn(),
    onRecordingStop: vi.fn(),
    onRecordingError: vi.fn()
  }
  
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  it('should render correctly', () => {
    render(<RecorderControls {...mockProps} />)
    
    expect(screen.getByText('Standby')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /⏺️/i })).toBeInTheDocument()
  })
  
  it('should show recording status when recording', () => {
    // Mock recording state
    vi.mocked(require('../../hooks/useMediaRecorder').useMediaRecorder).mockReturnValue({
      isRecording: true,
      duration: 65,
      error: null,
      videoStream: new MediaStream(),
      startRecording: vi.fn(),
      stopRecording: vi.fn(),
      getFormattedDuration: () => '01:05'
    })
    
    render(<RecorderControls {...mockProps} />)
    
    expect(screen.getByText('Recording')).toBeInTheDocument()
    expect(screen.getByText('01:05')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /⏹️/i })).toBeInTheDocument()
  })
  
  it('should handle start recording', async () => {
    const mockStartRecording = vi.fn()
    vi.mocked(require('../../hooks/useMediaRecorder').useMediaRecorder).mockReturnValue({
      isRecording: false,
      duration: 0,
      error: null,
      videoStream: new MediaStream(),
      startRecording: mockStartRecording,
      stopRecording: vi.fn(),
      getFormattedDuration: () => '00:00'
    })
    
    render(<RecorderControls {...mockProps} />)
    
    const startButton = screen.getByRole('button', { name: /⏺️/i })
    fireEvent.click(startButton)
    
    await waitFor(() => {
      expect(mockStartRecording).toHaveBeenCalled()
    })
  })
  
  it('should handle stop recording', async () => {
    const mockStopRecording = vi.fn()
    vi.mocked(require('../../hooks/useMediaRecorder').useMediaRecorder).mockReturnValue({
      isRecording: true,
      duration: 30,
      error: null,
      videoStream: new MediaStream(),
      startRecording: vi.fn(),
      stopRecording: mockStopRecording,
      getFormattedDuration: () => '00:30'
    })
    
    render(<RecorderControls {...mockProps} />)
    
    const stopButton = screen.getByRole('button', { name: /⏹️/i })
    fireEvent.click(stopButton)
    
    await waitFor(() => {
      expect(mockStopRecording).toHaveBeenCalled()
    })
  })
  
  it('should disable start button when no video stream', () => {
    vi.mocked(require('../../hooks/useMediaRecorder').useMediaRecorder).mockReturnValue({
      isRecording: false,
      duration: 0,
      error: null,
      videoStream: null,
      startRecording: vi.fn(),
      stopRecording: vi.fn(),
      getFormattedDuration: () => '00:00'
    })
    
    render(<RecorderControls {...mockProps} />)
    
    const startButton = screen.getByRole('button', { name: /⏺️/i })
    expect(startButton).toBeDisabled()
  })
  
  it('should show error message when error occurs', () => {
    vi.mocked(require('../../hooks/useMediaRecorder').useMediaRecorder).mockReturnValue({
      isRecording: false,
      duration: 0,
      error: 'Camera access denied',
      videoStream: null,
      startRecording: vi.fn(),
      stopRecording: vi.fn(),
      getFormattedDuration: () => '00:00'
    })
    
    render(<RecorderControls {...mockProps} />)
    
    expect(screen.getByText('Camera access denied')).toBeInTheDocument()
  })
  
  it('should handle quality change', () => {
    const mockSetSettings = vi.fn()
    vi.mocked(require('../../state/recordingState').useRecordingState).mockReturnValue({
      settings: {
        quality: 'high',
        audioEnabled: true,
        format: 'webm'
      },
      setSettings: mockSetSettings,
      recordedBlob: null,
      resetRecording: vi.fn()
    })
    
    render(<RecorderControls {...mockProps} />)
    
    const lowQualityButton = screen.getByText('Low')
    fireEvent.click(lowQualityButton)
    
    expect(mockSetSettings).toHaveBeenCalledWith({
      quality: 'low',
      resolution: { width: 1280, height: 720 },
      frameRate: 24
    })
  })
  
  it('should handle audio toggle', () => {
    const mockSetSettings = vi.fn()
    vi.mocked(require('../../state/recordingState').useRecordingState).mockReturnValue({
      settings: {
        quality: 'high',
        audioEnabled: true,
        format: 'webm'
      },
      setSettings: mockSetSettings,
      recordedBlob: null,
      resetRecording: vi.fn()
    })
    
    render(<RecorderControls {...mockProps} />)
    
    const audioButton = screen.getByText('🔊 On')
    fireEvent.click(audioButton)
    
    expect(mockSetSettings).toHaveBeenCalledWith({
      audioEnabled: false
    })
  })
  
  it('should disable controls when recording', () => {
    vi.mocked(require('../../hooks/useMediaRecorder').useMediaRecorder).mockReturnValue({
      isRecording: true,
      duration: 30,
      error: null,
      videoStream: new MediaStream(),
      startRecording: vi.fn(),
      stopRecording: vi.fn(),
      getFormattedDuration: () => '00:30'
    })
    
    render(<RecorderControls {...mockProps} />)
    
    const qualityButtons = screen.getAllByRole('button')
    const audioButton = screen.getByText('🔊 On')
    
    // Quality buttons should be disabled
    qualityButtons.forEach(button => {
      if (button.textContent?.includes('Low') || button.textContent?.includes('Medium') || button.textContent?.includes('High')) {
        expect(button).toBeDisabled()
      }
    })
    
    // Audio button should be disabled
    expect(audioButton).toBeDisabled()
  })
  
  it('should show reset button when recording is complete', () => {
    const mockResetRecording = vi.fn()
    vi.mocked(require('../../state/recordingState').useRecordingState).mockReturnValue({
      settings: {
        quality: 'high',
        audioEnabled: true,
        format: 'webm'
      },
      setSettings: vi.fn(),
      recordedBlob: new Blob(['test']),
      resetRecording: mockResetRecording
    })
    
    render(<RecorderControls {...mockProps} />)
    
    const resetButton = screen.getByText('Reset Recording')
    expect(resetButton).toBeInTheDocument()
    
    fireEvent.click(resetButton)
    expect(mockResetRecording).toHaveBeenCalled()
  })
  
  it('should display keyboard shortcuts', () => {
    render(<RecorderControls {...mockProps} />)
    
    expect(screen.getByText('Ctrl')).toBeInTheDocument()
    expect(screen.getByText('R')).toBeInTheDocument()
    expect(screen.getByText('Esc')).toBeInTheDocument()
  })
})
