# NolanForge Architecture Documentation

## Overview

NolanForge is a modular desktop video editor built with Tauri (Rust) for the backend and React (TypeScript) for the frontend. The application follows a three-module architecture: Uploader, Editor, and Recorder.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Tauri Desktop Shell                       │
│                        (Rust Backend)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  FFmpeg      │  │  OpenAI API │  │  File System  │      │
│  │  Commands    │  │  Service    │  │  Access       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                          ↕ IPC
┌─────────────────────────────────────────────────────────────┐
│              React Frontend (TypeScript)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Uploader    │  │   Editor     │  │  Recorder    │      │
│  │   Module     │  │   Module     │  │   Module     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────────────────────────────────────────┐     │
│  │        Shared State Management (Zustand)         │     │
│  │  mediaStore | editState | recordingState | ...   │     │
│  └──────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## Module Architecture

### Uploader Module
**Purpose**: Import and manage media files

**Components**:
- `FileDropZone.tsx` - Drag-and-drop file import
- `MediaLibrary.tsx` - Grid/List view of imported files
- `MediaListItem.tsx` - Individual media item with actions

**State**:
- `mediaStore.ts` - Stores imported files, metadata, thumbnails

**Features**:
- Drag-and-drop file import
- Thumbnail generation and caching
- Media metadata extraction
- File validation (MP4/MOV)

### Editor Module
**Purpose**: Video editing with timeline and trim controls

**Components**:
- `VideoPlayer.tsx` - Single clip video player
- `MultiTrackVideoPlayer.tsx` - Multi-track composition preview
- `ContinuousTimeline.tsx` - Multi-clip timeline visualization
- `Timeline.tsx` - Single clip timeline with trim markers
- `TrimControls.tsx` - In/Out point controls
- `TimelineTools.tsx` - Split, delete, and editing tools
- `TrackHeader.tsx` / `TrackRow.tsx` - Multi-track UI
- `OverlayControls.tsx` - Overlay property controls
- `ExportPanel.tsx` - Export configuration UI
- `TranscriptionPanel.tsx` - AI transcription UI

**State**:
- `editState.ts` - Timeline clips, playback state, global trim
- `trackState.ts` - Multi-track state and controls

**Hooks**:
- `useExport.ts` - Multi-clip export logic

**Features**:
- Multi-clip timeline editing
- Multi-track editing (Track 0: main, Track 1: overlay)
- Timeline zoom (10-200px/second)
- Click-to-seek functionality
- Global trim range for export
- Split and delete operations
- AI transcription integration

### Recorder Module
**Purpose**: Capture new footage from screen or webcam

**Components**:
- `PreviewWebcam.tsx` - Webcam preview component
- `ScreenCapture.tsx` - Screen capture component
- `CombinedCapture.tsx` - Canvas-based video composition
- `RecorderControls.tsx` - Recording controls and settings

**State**:
- `recordingState.ts` - Recording status, settings, blob

**Hooks**:
- `useMediaRecorder.ts` - MediaRecorder API integration

**Features**:
- Webcam recording
- Screen recording
- Combined recording (screen + webcam)
- Audio mixing (system audio + microphone)
- Save to disk or add to timeline

## Data Flow

### File Import Flow
```
User drops file
    ↓
FileDropZone validates (MP4/MOV)
    ↓
Extract metadata (duration, dimensions)
    ↓
Generate thumbnail (Canvas API)
    ↓
Store in mediaStore
    ↓
Display in MediaLibrary
```

### Timeline Editing Flow
```
User clicks "Edit" or drags to timeline
    ↓
addClipToTimeline() adds to editState
    ↓
ContinuousTimeline displays clip
    ↓
User sets trim points / moves clips
    ↓
Timeline state updates in real-time
    ↓
VideoPlayer plays according to timeline
```

### Export Flow
```
User sets global trim range
    ↓
Export button clicked
    ↓
useExport calculates clip intersections
    ↓
Tauri command: export_multi_clip_video()
    ↓
FFmpeg trims each clip
    ↓
FFmpeg concatenates with concat demuxer
    ↓
Output file saved
```

### Recording Flow
```
User selects recording mode
    ↓
Request media permissions (getUserMedia/getDisplayMedia)
    ↓
Initialize MediaRecorder
    ↓
Start recording → Stream to MediaRecorder
    ↓
(Combined mode: Canvas composition)
    ↓
Stop recording → Get blob
    ↓
User chooses: Save to Disk OR Add to Timeline
    ↓
If Save: Native file dialog → Write file
If Add: Download blob → Import to mediaStore → Add to timeline
```

### Transcription Flow
```
User clicks transcribe button
    ↓
Extract audio from video (FFmpeg)
    ↓
Send to OpenAI Whisper API
    ↓
Receive transcript with timestamps
    ↓
Display in TranscriptionPanel
    ↓
User exports transcript (SRT/VTT/TXT/JSON)
```

## State Management

### Zustand Stores

**mediaStore.ts**
- `files: MediaFile[]` - Imported media files
- `selectedFileId: string | null` - Currently selected file
- Actions: `addFile()`, `removeFile()`, `getFileById()`

**editState.ts**
- `timelineClips: TimelineClip[]` - Clips on timeline
- `selectedClipId: string | null` - Currently selected clip
- `currentTime: number` - Playhead position
- `globalTrimStart/End: number` - Export range
- `zoomLevel: number` - Timeline zoom (pixels per second)
- Actions: Timeline manipulation, playback control

**recordingState.ts**
- `status: RecordingStatus` - idle | recording | stopped
- `blob: Blob | null` - Recorded video blob
- `settings: RecordingSettings` - Quality, format, etc.
- Actions: Recording control

**trackState.ts**
- `tracks: Track[]` - Multi-track data
- `selectedTrackId: number | null` - Selected track
- Actions: Track management, overlay controls

## Backend Architecture (Rust/Tauri)

### Commands (src-tauri/src/commands.rs)

**FFmpeg Commands**:
- `export_trimmed_video()` - Single clip trim
- `export_multi_clip_video()` - Multi-clip concatenation
- `export_multi_track_video()` - Multi-track composition with FFmpeg filtergraph
- `check_ffmpeg()` - Verify FFmpeg installation
- `extract_audio_for_transcription()` - Extract audio from video

**File Operations**:
- `save_recording_to_file()` - Save recording blob to disk

**OpenAI Integration**:
- `transcribe_video()` - Send audio to Whisper API
- `store_api_key()` - Store API key securely
- `get_stored_api_key()` - Retrieve stored API key
- `test_api_key()` - Validate API key

### Services (src-tauri/src/services/)

**openai.rs**:
- OpenAI Whisper API client
- Multipart form data handling
- Error handling and retries

**config.rs**:
- API key management
- Secure storage in app data directory

## UI/UX Patterns

### Design System
- **Theme**: Dark mode with glassmorphism
- **Colors**: Gradient backgrounds, blue/purple accents
- **Typography**: System fonts with Tailwind CSS
- **Components**: Reusable React components with consistent styling

### Keyboard Shortcuts
- **Playback**: Space/K (play/pause), ←/→ (frame step), J/L (seek)
- **Editing**: I (in point), O (out point), Ctrl+S (split), Delete (remove)
- **Zoom**: Ctrl+Plus/Minus (zoom), Ctrl+0 (reset), Ctrl+Mouse Wheel

### Responsive Design
- Grid/List view toggle in Media Library
- Adaptive layouts for different screen sizes
- Optimized controls positioning

## Performance Optimizations

### Thumbnail Caching
- Thumbnails generated once and cached
- Lazy loading for thumbnail images
- Automatic cache cleanup on file removal

### Video Playback
- Blob URLs for efficient local playback
- Seamless transitions between clips
- Optimized video element reuse

### Timeline Rendering
- Virtual scrolling for large timelines
- Zoom-based rendering optimization
- Efficient clip intersection calculations

### Canvas Composition
- Optimized rendering loop for combined recording
- Proper frame rate control
- Memory-efficient canvas operations

## Security Considerations

### API Key Storage
- API keys stored locally in app data directory
- Never sent to external servers (except OpenAI)
- Secure key validation before saving

### File Access
- Tauri security model restricts file system access
- User-initiated file operations only
- No automatic file system scanning

## Testing Strategy

### Current Test Coverage
- Unit tests for pure functions (`time.ts`, `timelineOps.ts`)
- Component tests (`SidebarNav`, `App`)
- State management tests (`appState`)

### Future Testing
- Integration tests for workflows
- FFmpeg command tests
- End-to-end workflow tests

## Deployment

### Build Process
1. Frontend: `npm run build` (Vite)
2. Backend: `cargo build --release` (Rust)
3. Package: `tauri build` (creates installers)

### Distribution
- Windows: MSI and NSIS installers
- macOS: DMG installer (future)
- Linux: AppImage/DEB (future)

## Future Enhancements

### Planned Features
- Undo/Redo system (structure exists, needs implementation)
- Autosave functionality
- Text overlay tools
- Transition effects
- Export presets (YouTube, TikTok)
- Export quality/resolution options

### Technical Debt
- Complete undo/redo implementation
- Add comprehensive test coverage
- Improve export progress tracking
- Add export cancellation support

