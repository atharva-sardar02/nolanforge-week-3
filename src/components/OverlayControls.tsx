import React, { useState, useEffect } from 'react'
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

  // Sync overlay settings from clip when it changes
  useEffect(() => {
    if (clip && clip.trackId > 0) {
      setOverlaySettings({
        position: clip.overlayPosition || { x: 0, y: 0 },
        size: clip.overlaySize || { width: 300, height: 200 },
        opacity: clip.overlayOpacity ?? 0.8,
        blendMode: clip.overlayBlendMode || 'normal',
        visible: clip.overlayVisible ?? true
      })
    }
  }, [clip?.id, clip?.overlayPosition, clip?.overlaySize, clip?.overlayOpacity, clip?.overlayBlendMode, clip?.overlayVisible])

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
      <div className={`p-3 bg-gray-800/30 rounded-lg border border-gray-700/30 ${className}`}>
        <div className="text-center text-gray-400 text-sm">
          <span className="font-medium">No Overlay Selected</span>
          <span className="mx-2">•</span>
          <span>Select an overlay clip (Track 1+) to adjust its properties</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`glass rounded-lg border border-gray-700/30 backdrop-blur-xl p-4 shadow-xl ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span>🎛️</span>
          <span>Overlay Controls</span>
          <span className="text-xs font-normal text-gray-400">(Track {clip.trackId})</span>
        </h3>
        <button
          onClick={handleVisibilityToggle}
          className={`
            relative w-10 h-5 rounded-full transition-all duration-300
            ${overlaySettings.visible 
              ? 'bg-green-600' 
              : 'bg-gray-600 hover:bg-gray-500'
            }
          `}
          title={overlaySettings.visible ? 'Hide overlay' : 'Show overlay'}
        >
          <div 
            className={`
              absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-lg transition-transform duration-300
              ${overlaySettings.visible ? 'translate-x-5' : 'translate-x-0.5'}
            `}
          />
        </button>
      </div>

      <div className="space-y-3">
        {/* Position Controls - Compact */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-gray-400 font-medium">Position</label>
            <div className="flex gap-1">
              {(['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'] as const).map((preset) => (
                <button
                  key={preset}
                  onClick={() => handlePresetPosition(preset)}
                  className="w-6 h-6 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors"
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">X</span>
                <span className="text-xs text-gray-400">{overlaySettings.position.x}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                value={overlaySettings.position.x}
                onChange={(e) => handlePositionChange('x', parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Y</span>
                <span className="text-xs text-gray-400">{overlaySettings.position.y}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="600"
                value={overlaySettings.position.y}
                onChange={(e) => handlePositionChange('y', parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Size Controls - Compact */}
        <div>
          <label className="text-xs text-gray-400 font-medium mb-2 block">Size</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">W</span>
                <span className="text-xs text-gray-400">{overlaySettings.size.width}px</span>
              </div>
              <input
                type="range"
                min="100"
                max="800"
                value={overlaySettings.size.width}
                onChange={(e) => handleSizeChange('width', parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">H</span>
                <span className="text-xs text-gray-400">{overlaySettings.size.height}px</span>
              </div>
              <input
                type="range"
                min="100"
                max="600"
                value={overlaySettings.size.height}
                onChange={(e) => handleSizeChange('height', parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Opacity and Blend Mode - Compact Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-400 font-medium">Opacity</label>
              <span className="text-xs text-gray-400">{Math.round(overlaySettings.opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={overlaySettings.opacity}
              onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 font-medium mb-1 block">Blend Mode</label>
            <div className="grid grid-cols-2 gap-1">
              {(['normal', 'multiply', 'screen', 'overlay'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => handleBlendModeChange(mode)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
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
    </div>
  )
}

export default OverlayControls
