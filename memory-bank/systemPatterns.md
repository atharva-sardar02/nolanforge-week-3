# NolanForge System Patterns

## Application Architecture

### Module-Based Design ✅ IMPLEMENTED
```
Tauri Shell (Rust Backend)
├── Uploader Module (React) - ✅ COMPLETE
├── Editor Module (React) - ✅ COMPLETE
└── Recorder Module (React) - ✅ COMPLETE
```

### Current Architecture ✅ MVP COMPLETE + MULTI-CLIP TIMELINE + RECORDER MODULE + ADVANCED TIMELINE EDITING + AUDIO MIXING + TIMELINE ZOOM
```
React Frontend (TypeScript + Vite)
├── App.tsx - Main app with routing
├── Navbar.tsx - Top navigation with NolanForge branding
├── Routes/
│   ├── Uploader.tsx - File import + Media Library ✅
│   ├── Editor.tsx - Multi-clip video player + Dual timeline + Export ✅
│   └── Recorder.tsx - Complete recording module with three modes ✅
├── Components/
│   ├── FileDropZone.tsx - Drag-and-drop import ✅
│   ├── MediaLibrary.tsx - Grid/List view with edit action ✅
│   ├── MediaListItem.tsx - Drag-and-drop to timeline ✅
│   ├── VideoPlayer.tsx - HTML5 video with continuous playback ✅
│   ├── Timeline.tsx - Single-clip timeline with trim markers ✅
│   ├── ContinuousTimeline.tsx - Multi-clip timeline with global trim ✅
│   ├── TrimControls.tsx - In/Out point controls ✅
│   ├── ExportPanel.tsx - Export UI ✅
│   ├── PreviewWebcam.tsx - Webcam preview component ✅
│   ├── ScreenCapture.tsx - Screen capture with user-triggered sharing ✅
│   ├── CombinedCapture.tsx - Canvas-based video composition ✅
│   ├── RecorderControls.tsx - Recording controls with save/add options ✅
│   ├── SplitButton.tsx - UI button for splitting clips at playhead ✅
│   ├── DeleteButton.tsx - UI button for removing timeline segments ✅
│   ├── TimelineTools.tsx - Toolbar with editing tools and shortcuts ✅
│   ├── TrackLane.tsx - Individual track rendering component ✅
│   └── Playhead.tsx - Timeline navigation with time display ✅
├── State/
│   ├── appState.ts - Global UI state ✅
│   ├── mediaStore.ts - Media files ✅
│   ├── editState.ts - Multi-clip timeline state ✅
│   ├── recordingState.ts - Recording state management ✅
│   └── timelineState.ts - Separate timeline state management ✅
├── Hooks/
│   ├── useExport.ts - Multi-clip export logic ✅
│   └── useMediaRecorder.ts - MediaRecorder API integration ✅
└── Utils/
    ├── fileUtils.ts - File operations + blob URLs ✅
    ├── time.ts - Time formatting ✅
    ├── recordingUtils.ts - Recording file handling and blob management ✅
    └── timelineOps.ts - Comprehensive timeline operations utilities ✅
```

### Data Flow ✅ IMPLEMENTED + MULTI-CLIP + RECORDER + ADVANCED TIMELINE EDITING + AUDIO MIXING + TIMELINE ZOOM
1. **Uploader** → Imports files → **MediaStore** (blob URLs + metadata)
2. **MediaLibrary** → "Edit" button → **addClipToTimeline** → **editState.timelineClips**
3. **Editor** → **ContinuousTimeline** (all clips) + **Timeline** (selected clip) → **ExportPanel**
4. **Export** → **globalTrimStart/End** → **FFmpeg** (Rust) → Multi-clip composition
5. **Recorder** → **MediaRecorder API** → **Canvas Composition** → **Save/Add to Timeline**
6. **Timeline Editing** → **TimelineTools** → **SplitButton/DeleteButton** → **Keyboard Shortcuts**
7. **Timeline State** → **timelineState.ts** → **Validation** → **Operations History**
8. **Timeline Zoom** → **Zoom Controls** → **setZoomLevel** → **ContinuousTimeline pixelsPerSecond**
9. **Audio Mixing** → **Web Audio API** → **Gain Nodes** → **Mixed Audio Stream** → **Recording**

## Key Technical Decisions

### State Management ✅ IMPLEMENTED + MULTI-CLIP + RECORDER + ADVANCED TIMELINE EDITING + AUDIO MIXING + TIMELINE ZOOM
- **appState**: Global UI (theme, route, sidebar) ✅
- **mediaStore**: Imported media files with metadata ✅
- **editState**: Multi-clip timeline state (TimelineClip[], globalTrimStart/End, selectedClipId, zoomLevel) ✅
- **recordingState**: Recording state (status, settings, blob, error) ✅
- **timelineState**: Separate timeline state management with validation and operations ✅
- **Persistence**: Files cached in memory via Map, timeline state in memory

### FFmpeg Integration ✅ IMPLEMENTED + MULTI-CLIP + RECORDER
- **Rust Commands**: `export_trimmed_video()`, `export_multi_clip_video()`, `check_ffmpeg()`, `save_recording_to_file()`
- **Tauri Plugins**: dialog (file pickers), fs (file system)
- **Export Method**: Stream copy (-c copy) for fast trimming + concatenation
- **Error Handling**: FFmpeg availability check + error propagation

### File Handling ✅ IMPLEMENTED + RECORDER
- **Import**: HTML5 File API with drag-and-drop
- **Preview**: Blob URLs (URL.createObjectURL) for video playback
- **Export**: File path selection via Tauri dialog
- **Recording**: Native file dialogs + Downloads folder integration
- **Metadata**: Video duration extracted via hidden video element
- **Caching**: File objects stored in Map by ID

### Video Playback ✅ IMPLEMENTED + MULTI-CLIP
- **HTML5 Video**: Custom controls with continuous playback
- **Blob URLs**: Local file preview without file system access
- **Metadata Loading**: Duration, dimensions, format extraction
- **Events**: onloadedmetadata, oncanplay, ontimeupdate, onended
- **Multi-Clip**: Seamless transitions between clips with global timeline sync

### Recording Patterns ✅ IMPLEMENTED
- **MediaRecorder API**: Browser-native recording with canvas composition
- **Canvas Composition**: Real-time video overlay for combined recording
- **Stream Management**: Proper cleanup and error handling
- **File Integration**: Native file dialogs and automatic timeline import
- **Format Optimization**: MP4 recording for better browser compatibility
- **Responsive UI**: Adaptive layout with controls positioned optimally
- **MediaFile Interface**: Fixed type compatibility issues for Media Library display
- **Timeline Playback**: Automatic clip transitions with seamless playback
- **Gap Handling**: Continuous playhead movement through gaps between clips
- **Overlap Handling**: Seamless transitions for overlapping clips
- **Boundary Resolution**: Smart clip selection at exact boundaries

### Timeline Editing Patterns ✅ IMPLEMENTED + AUDIO MIXING + TIMELINE ZOOM
- **Timeline State Management**: Separate state with validation and operation history
- **Timeline Operations**: Comprehensive utility functions for timeline manipulation
- **Component Architecture**: Modular timeline editing components
- **Keyboard Integration**: Professional keyboard shortcuts for editing
- **Timeline Interaction**: Click-to-seek functionality with playhead movement
- **Zoom System**: Configurable timeline zoom levels with UI controls, keyboard shortcuts, and mouse wheel
- **Recording Integration**: Fixed duration preservation for recordings
- **Seamless Playback**: Automatic clip transitions with continuous timeline movement
- **Gap Handling**: Continuous playhead movement through gaps between clips
- **Overlap Handling**: Seamless transitions for overlapping clips
- **Boundary Resolution**: Smart clip selection at exact boundaries
- **Audio Mixing**: Web Audio API with gain nodes for balanced system audio + microphone mixing
- **Zoom Controls**: Professional zoom UI with presets, real-time display, and multiple input methods

## Design Patterns

### Component Architecture ✅ IMPLEMENTED + MULTI-CLIP + RECORDER
- **Route Components**: Uploader, Editor, Recorder (pages)
- **Feature Components**: VideoPlayer, Timeline, ContinuousTimeline, TrimControls, Recording components
- **UI Components**: FileDropZone, MediaLibrary, MediaListItem, ExportPanel, RecorderControls
- **Custom Hooks**: useExport (multi-clip support), useMediaRecorder (recording API)

### Keyboard Shortcuts ✅ IMPLEMENTED
- **Playback**: Space/K (play/pause), ←/→ (frame step), J/L (seek)
- **Editing**: I (in point), O (out point)
- **Navigation**: Home/End (start/end), F (fullscreen), M (mute)

### UI/UX Patterns ✅ IMPLEMENTED
- **Dark Theme**: Tailwind CSS v4 with custom colors
- **Glassmorphism**: backdrop-blur effects on cards
- **Gradients**: Subtle background gradients
- **Animations**: fade-in, scale, glow effects
- **Responsive**: Grid/List views, adaptive layouts

## Component Relationships

### Core Components ✅ IMPLEMENTED + MULTI-CLIP + RECORDER
- **Navbar**: Top navigation with route links
- **FileDropZone**: Drag-and-drop import with validation
- **MediaLibrary**: Grid/List view with edit action + drag-and-drop to timeline
- **MediaListItem**: Individual media item with drag-and-drop support
- **VideoPlayer**: HTML5 video with continuous multi-clip playback
- **Timeline**: Single-clip timeline with draggable trim markers
- **ContinuousTimeline**: Multi-clip timeline with global trim handles
- **TrimControls**: In/Out point buttons + time displays
- **ExportPanel**: Export configuration + status
- **PreviewWebcam**: Webcam preview with live feed
- **ScreenCapture**: Screen capture with user-triggered sharing
- **CombinedCapture**: Canvas-based video composition with overlay
- **RecorderControls**: Recording controls with save/add options

### State Stores ✅ IMPLEMENTED + MULTI-CLIP + RECORDER
- **appState**: Current route, theme, UI state
- **mediaStore**: Imported files, selection, file operations
- **editState**: Multi-clip timeline (TimelineClip[], globalTrimStart/End, selectedClipId, playback state)
- **recordingState**: Recording state (status, settings, blob, error, duration)

### Rust Backend ✅ IMPLEMENTED + MULTI-CLIP + RECORDER
- **commands.rs**: FFmpeg export commands (single + multi-clip) + recording file save
- **lib.rs**: Command registration + plugin initialization
- **Cargo.toml**: Dependencies (dialog, fs plugins)
- **capabilities/default.json**: Permissions for file access

## Export Workflow ✅ IMPLEMENTED + MULTI-CLIP
1. User adds clips to timeline via MediaLibrary "Edit" button
2. User sets global trim range on ContinuousTimeline (blue/purple handles)
3. User clicks "Export" button
4. System calculates which clips intersect with global trim range
5. FFmpeg processes each clip with individual trim points
6. FFmpeg concatenates trimmed clips into single output
7. Success/error alert displayed
8. Multi-clip composition saved to chosen location

## Recording Workflow ✅ IMPLEMENTED
1. User selects recording mode (Webcam, Screen, or Combined)
2. System requests appropriate media permissions (getUserMedia/getDisplayMedia)
3. Live preview displays the recording feed
4. User clicks "Start Recording" to begin capture
5. MediaRecorder API records the stream (with canvas composition for combined mode)
6. User clicks "Stop Recording" to end capture
7. User can "Save to Disk" (native file dialog) or "Add to Timeline" (automatic import)
8. Recording automatically added to MediaLibrary and timeline for editing

## Technical Constraints & Solutions

### Blob URL Limitation
- **Problem**: FFmpeg needs file paths, not blob URLs
- **Solution**: Two-step file selection (input + output)
- **Trade-off**: User experience vs. implementation complexity

### Video Duration Extraction
- **Problem**: File API doesn't provide video duration
- **Solution**: Hidden video element with onloadedmetadata
- **Timeout**: 10 seconds max for metadata loading

### Tailwind CSS v4
- **Change**: New `@import "tailwindcss"` syntax
- **Benefit**: Simplified configuration, better performance
- **Migration**: Removed old @tailwind directives

### Recording Format Compatibility
- **Problem**: WebM recordings not compatible with video player
- **Solution**: Switched to MP4 recording format with proper codec support
- **Trade-off**: Slightly larger file sizes for better compatibility

### Canvas Composition Performance
- **Problem**: Real-time video composition can be CPU intensive
- **Solution**: Optimized canvas rendering with proper frame rate control
- **Trade-off**: Higher CPU usage for advanced combined recording features

### MediaFile Interface Compatibility
- **Problem**: Recorded files causing Media Library blank screen due to type mismatches
- **Solution**: Fixed MediaFile object creation to match interface exactly (type, dates, properties)
- **Trade-off**: Removed extra properties for strict interface compliance

## Development Patterns ✅ PROVEN EFFECTIVE + MVP COMPLETE + RECORDER
- **Focused PRs**: Each PR targets specific functionality ✅
- **Iterative Development**: Build → Test → Polish cycle ✅
- **User Feedback**: Quick iterations based on UI/UX issues ✅
- **Modern Stack**: Latest Tauri, React, Tailwind versions ✅
- **Progress Tracking**: 7/7 MVP PRs complete (100%) ✅
- **Multi-Clip Timeline**: Advanced timeline with global trim handles ✅
- **MVP Packaging**: Desktop app built and packaged for distribution ✅
- **Recording Module**: Complete webcam, screen, and combined recording ✅
- **Canvas Composition**: Advanced video overlay system ✅
- **File Integration**: Native file dialogs and automatic timeline import ✅
- **MediaFile Interface**: Fixed type compatibility for Media Library display ✅
- **Timeline Zoom**: Professional zoom controls with UI, keyboard shortcuts, and mouse wheel ✅
- **Audio Mixing**: Web Audio API mixing for system audio + microphone ✅
- **Recording Fixes**: Fixed duplicate recordings and infinite loop issues ✅
# # #   A u d i o   M i x i n g   P a t t e r n s   � S&   I M P L E M E N T E D 
 
 -   * * W e b   A u d i o   A P I * * :   A d v a n c e d   a u d i o   p r o c e s s i n g   w i t h   A u d i o C o n t e x t   a n d   M e d i a S t r e a m S o u r c e 
 
 -   * * G a i n   N o d e s * * :   V o l u m e   c o n t r o l   f o r   b a l a n c e d   a u d i o   m i x i n g   ( s y s t e m   6 0 - 7 0 % ,   m i c   1 0 0 % ) 
 
 -   * * M e d i a S t r e a m D e s t i n a t i o n * * :   S i n g l e   m i x e d   a u d i o   t r a c k   f o r   r e c o r d i n g 
 
 -   * * S t r e a m   M a n a g e m e n t * * :   P r o p e r   c l e a n u p   a n d   e r r o r   h a n d l i n g   f o r   a u d i o   c o n t e x t s 
 
 -   * * M u l t i - S o u r c e   M i x i n g * * :   S y s t e m   a u d i o   +   m i c r o p h o n e   a u d i o   i n   s c r e e n   a n d   c o m b i n e d   r e c o r d i n g 
 
 -   * * C a n v a s   I n t e g r a t i o n * * :   A u d i o   m i x i n g   i n t e g r a t e d   w i t h   v i d e o   c o m p o s i t i o n   f o r   c o m b i n e d   r e c o r d i n g 
 
 
 
 # # #   T i m e l i n e   Z o o m   P a t t e r n s   � S&   I M P L E M E N T E D 
 
 -   * * Z o o m   S t a t e   M a n a g e m e n t * * :   z o o m L e v e l   s t a t e   i n   e d i t S t a t e   w i t h   b o u n d s   c h e c k i n g   ( 1 0 - 2 0 0 p x / s ) 
 
 -   * * U I   C o n t r o l s * * :   P r o f e s s i o n a l   z o o m   c o n t r o l s   w i t h   I n / O u t / R e s e t   b u t t o n s   a n d   p r e s e t s 
 
 -   * * K e y b o a r d   S h o r t c u t s * * :   C t r l   +   P l u s / M i n u s / 0   f o r   z o o m   o p e r a t i o n s 
 
 -   * * M o u s e   W h e e l   S u p p o r t * * :   C t r l   +   M o u s e   W h e e l   f o r   s m o o t h   z o o m   w i t h   b o u n d s   c h e c k i n g 
 
 -   * * R e a l - t i m e   D i s p l a y * * :   C u r r e n t   z o o m   l e v e l   a n d   p e r c e n t a g e   i n d i c a t o r s 
 
 -   * * P r e s e t   S y s t e m * * :   Q u i c k   z o o m   b u t t o n s   ( 2 5 % ,   5 0 % ,   1 0 0 % ,   1 5 0 % ,   2 0 0 % ) 
 
 -   * * C o n t i n u o u s T i m e l i n e   I n t e g r a t i o n * * :   p i x e l s P e r S e c o n d   p r o p   f o r   d y n a m i c   z o o m   l e v e l s 
 
 