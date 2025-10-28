import React, { useState } from 'react'
import { TimelineClip } from '../state/editState'

interface OverlayControlsProps {
  clip: TimelineClip | null
  onUpdateClip: (clipId: string, updates: Partial<TimelineClip>) => void
  className?: string
}

interface OverlaySettings {
  position: { x: number; y: number }
  size: { width: number; height: number }
  opacity: number
  blendMode: 'normal' | 'multiply' | 'screen' | 'overlay'
  visible: boolean
}

const OverlayControls: React.FC<OverlayControlsProps> = ({
  clip,
  onUpdateClip,
  className = ''
}) => {
  const [overlaySettings, setOverlaySettings] = useState<OverlaySettings>({
    position: { x: 0, y: 0 },
    size: { width: 300, height: 200 },
    opacity: 0.8,
    blendMode: 'normal',
    visible: true
  })

  const handlePositionChange = (axis: 'x' | 'y', value: number) => {
    const newSettings = {
      ...overlaySettings,
      position: { ...overlaySettings.position, [axis]: value }
    }
    setOverlaySettings(newSettings)
    
    if (clip) {
      onUpdateClip(clip.id, {
        overlayPosition: newSettings.position,
        overlaySize: newSettings.size,
        overlayOpacity: newSettings.opacity,
        overlayBlendMode: newSettings.blendMode,
        overlayVisible: newSettings.visible
      })
    }
  }

  const handleSizeChange = (axis: 'width' | 'height', value: number) => {
    const newSettings = {
      ...overlaySettings,
      size: { ...overlaySettings.size, [axis]: value }
    }
    setOverlaySettings(newSettings)
    
    if (clip) {
      onUpdateClip(clip.id, {
        overlayPosition: newSettings.position,
        overlaySize: newSettings.size,
        overlayOpacity: newSettings.opacity,
        overlayBlendMode: newSettings.blendMode,
        overlayVisible: newSettings.visible
      })
    }
  }

  const handleOpacityChange = (opacity: number) => {
    const newSettings = { ...overlaySettings, opacity }
    setOverlaySettings(newSettings)
    
    if (clip) {
      onUpdateClip(clip.id, {
        overlayPosition: newSettings.position,
        overlaySize: newSettings.size,
        overlayOpacity: newSettings.opacity,
        overlayBlendMode: newSettings.blendMode,
        overlayVisible: newSettings.visible
      })
    }
  }

  const handleBlendModeChange = (blendMode: 'normal' | 'multiply' | 'screen' | 'overlay') => {
    const newSettings = { ...overlaySettings, blendMode }
    setOverlaySettings(newSettings)
    
    if (clip) {
      onUpdateClip(clip.id, {
        overlayPosition: newSettings.position,
        overlaySize: newSettings.size,
        overlayOpacity: newSettings.opacity,
        overlayBlendMode: newSettings.blendMode,
        overlayVisible: newSettings.visible
      })
    }
  }

  const handleVisibilityToggle = () => {
    const newSettings = { ...overlaySettings, visible: !overlaySettings.visible }
    setOverlaySettings(newSettings)
    
    if (clip) {
      onUpdateClip(clip.id, {
        overlayPosition: newSettings.position,
        overlaySize: newSettings.size,
        overlayOpacity: newSettings.opacity,
        overlayBlendMode: newSettings.blendMode,
        overlayVisible: newSettings.visible
      })
    }
  }

  const handlePresetPosition = (preset: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center') => {
    let position = { x: 0, y: 0 }
    
    switch (preset) {
      case 'top-left':
        position = { x: 20, y: 20 }
        break
      case 'top-right':
        position = { x: 680, y: 20 }
        break
      case 'bottom-left':
        position = { x: 20, y: 380 }
        break
      case 'bottom-right':
        position = { x: 680, y: 380 }
        break
      case 'center':
        position = { x: 350, y: 200 }
        break
    }
    
    const newSettings = { ...overlaySettings, position }
    setOverlaySettings(newSettings)
    
    if (clip) {
      onUpdateClip(clip.id, {
        overlayPosition: newSettings.position,
        overlaySize: newSettings.size,
        overlayOpacity: newSettings.opacity,
        overlayBlendMode: newSettings.blendMode,
        overlayVisible: newSettings.visible
      })
    }
  }

  if (!clip || clip.trackId === 0) {
    return (
      <div className={`glass rounded-3xl border border-gray-700/30 backdrop-blur-xl p-6 shadow-2xl ${className}`}>
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-2">🎥</div>
          <h3 className="text-lg font-medium mb-2">No Overlay Selected</h3>
          <p className="text-sm">Select an overlay clip (Track 1+) to adjust its properties</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`glass rounded-3xl border border-gray-700/30 backdrop-blur-xl p-6 shadow-2xl ${className}`}>
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
        <span className="text-2xl">🎛️</span>
        <span>Overlay Controls</span>
        <span className="ml-auto text-sm font-normal text-gray-400">
          Track {clip.trackId}
        </span>
      </h3>

      <div className="space-y-6">
        {/* Visibility Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="text-lg">👁️</span>
            <span className="text-gray-300">Visibility</span>
          </div>
          <button
            onClick={handleVisibilityToggle}
            className={`
              relative w-12 h-6 rounded-full transition-all duration-300
              ${overlaySettings.visible 
                ? 'bg-green-600 shadow-lg shadow-green-500/25' 
                : 'bg-gray-600 hover:bg-gray-500'
              }
            `}
          >
            <div 
              className={`
                absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-300
                ${overlaySettings.visible ? 'translate-x-6' : 'translate-x-0.5'}
              `}
            />
          </button>
        </div>

        {/* Position Controls */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white flex items-center gap-2">
            <span>📍</span>
            <span>Position</span>
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">X Position</label>
              <input
                type="range"
                min="0"
                max="1000"
                value={overlaySettings.position.x}
                onChange={(e) => handlePositionChange('x', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-xs text-gray-500 mt-1">{overlaySettings.position.x}px</div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Y Position</label>
              <input
                type="range"
                min="0"
                max="600"
                value={overlaySettings.position.y}
                onChange={(e) => handlePositionChange('y', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-xs text-gray-500 mt-1">{overlaySettings.position.y}px</div>
            </div>
          </div>

          {/* Position Presets */}
          <div className="space-y-2">
            <label className="block text-sm text-gray-400">Quick Position</label>
            <div className="grid grid-cols-5 gap-2">
              {(['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'] as const).map((preset) => (
                <button
                  key={preset}
                  onClick={() => handlePresetPosition(preset)}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-lg transition-colors"
                  title={preset.replace('-', ' ')}
                >
                  {preset === 'top-left' && '↖️'}
                  {preset === 'top-right' && '↗️'}
                  {preset === 'center' && '🎯'}
                  {preset === 'bottom-left' && '↙️'}
                  {preset === 'bottom-right' && '↘️'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Size Controls */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white flex items-center gap-2">
            <span>📏</span>
            <span>Size</span>
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Width</label>
              <input
                type="range"
                min="100"
                max="800"
                value={overlaySettings.size.width}
                onChange={(e) => handleSizeChange('width', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-xs text-gray-500 mt-1">{overlaySettings.size.width}px</div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Height</label>
              <input
                type="range"
                min="100"
                max="600"
                value={overlaySettings.size.height}
                onChange={(e) => handleSizeChange('height', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-xs text-gray-500 mt-1">{overlaySettings.size.height}px</div>
            </div>
          </div>
        </div>

        {/* Opacity Control */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white flex items-center gap-2">
            <span>🌫️</span>
            <span>Opacity</span>
          </h4>
          
          <div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={overlaySettings.opacity}
              onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-xs text-gray-500 mt-1">{Math.round(overlaySettings.opacity * 100)}%</div>
          </div>
        </div>

        {/* Blend Mode */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white flex items-center gap-2">
            <span>🎨</span>
            <span>Blend Mode</span>
          </h4>
          
          <div className="grid grid-cols-2 gap-2">
            {(['normal', 'multiply', 'screen', 'overlay'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => handleBlendModeChange(mode)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  overlaySettings.blendMode === mode
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OverlayControls
