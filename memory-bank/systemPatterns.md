# NolanForge System Patterns

## Application Architecture

### Module-Based Design ✅ IMPLEMENTED
```
Tauri Shell (Rust Backend)
├── Uploader Module (React) - ✅ COMPLETE
├── Editor Module (React) - ✅ COMPLETE
└── Recorder Module (React) - Ready for PR7
```

### Current Architecture ✅ MVP COMPLETE
```
React Frontend (TypeScript + Vite)
├── App.tsx - Main app with routing
├── Navbar.tsx - Top navigation with NolanForge branding
├── Routes/
│   ├── Uploader.tsx - File import + Media Library ✅
│   ├── Editor.tsx - Video player + Timeline + Export ✅
│   └── Recorder.tsx - Screen recording (pending)
├── Components/
│   ├── FileDropZone.tsx - Drag-and-drop import ✅
│   ├── MediaLibrary.tsx - Grid/List view with preview ✅
│   ├── VideoPlayer.tsx - HTML5 video with controls ✅
│   ├── Timeline.tsx - Visual timeline with trim markers ✅
│   ├── TrimControls.tsx - In/Out point controls ✅
│   └── ExportPanel.tsx - Export UI ✅
├── State/
│   ├── appState.ts - Global UI state ✅
│   ├── mediaStore.ts - Media files ✅
│   └── editState.ts - Edit session ✅
├── Hooks/
│   ├── useTimelineSync.ts - Keyboard shortcuts ✅
│   └── useExport.ts - Export logic ✅
└── Utils/
    ├── fileUtils.ts - File operations + blob URLs ✅
    └── time.ts - Time formatting ✅
```

### Data Flow ✅ IMPLEMENTED
1. **Uploader** → Imports files → **MediaStore** (blob URLs + metadata)
2. **Editor** → Reads from **MediaStore** → Sets trim points → **ExportPanel**
3. **Export** → User selects file → **FFmpeg** (Rust) → Trimmed output

## Key Technical Decisions

### State Management ✅ IMPLEMENTED
- **appState**: Global UI (theme, route, sidebar) ✅
- **mediaStore**: Imported media files with metadata ✅
- **editState**: Current editing session (trim points, playback) ✅
- **Persistence**: Files cached in memory via Map

### FFmpeg Integration ✅ IMPLEMENTED
- **Rust Commands**: `export_trimmed_video()`, `check_ffmpeg()`
- **Tauri Plugins**: dialog (file pickers), fs (file system)
- **Export Method**: Stream copy (-c copy) for fast trimming
- **Error Handling**: FFmpeg availability check + error propagation

### File Handling ✅ IMPLEMENTED
- **Import**: HTML5 File API with drag-and-drop
- **Preview**: Blob URLs (URL.createObjectURL) for video playback
- **Export**: File path selection via Tauri dialog
- **Metadata**: Video duration extracted via hidden video element
- **Caching**: File objects stored in Map by ID

### Video Playback ✅ IMPLEMENTED
- **HTML5 Video**: Custom controls with keyboard shortcuts
- **Blob URLs**: Local file preview without file system access
- **Metadata Loading**: Duration, dimensions, format extraction
- **Events**: onloadedmetadata, oncanplay, ontimeupdate

## Design Patterns

### Component Architecture ✅ IMPLEMENTED
- **Route Components**: Uploader, Editor, Recorder (pages)
- **Feature Components**: VideoPlayer, Timeline, TrimControls
- **UI Components**: FileDropZone, MediaLibrary, ExportPanel
- **Custom Hooks**: useExport, useTimelineSync

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

### Core Components ✅ IMPLEMENTED
- **Navbar**: Top navigation with route links
- **FileDropZone**: Drag-and-drop import with validation
- **MediaLibrary**: Grid/List view with preview modal + edit action
- **VideoPlayer**: HTML5 video with blob URL support
- **Timeline**: Visual timeline with draggable trim markers
- **TrimControls**: In/Out point buttons + time displays
- **ExportPanel**: Export configuration + status

### State Stores ✅ IMPLEMENTED
- **appState**: Current route, theme, UI state
- **mediaStore**: Imported files, selection, file operations
- **editState**: Current file, trim points, playback state, duration

### Rust Backend ✅ IMPLEMENTED
- **commands.rs**: FFmpeg export commands
- **lib.rs**: Command registration + plugin initialization
- **Cargo.toml**: Dependencies (dialog, fs plugins)
- **capabilities/default.json**: Permissions for file access

## Export Workflow ✅ IMPLEMENTED
1. User sets trim points on timeline
2. Clicks "Export Trimmed Video" button
3. Alert prompts to select original video file
4. File picker dialog opens for input selection
5. File picker dialog opens for output location
6. FFmpeg processes video (stream copy mode)
7. Success/error alert displayed
8. Trimmed video saved to chosen location

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

## Development Patterns ✅ PROVEN EFFECTIVE
- **Focused PRs**: Each PR targets specific functionality
- **Iterative Development**: Build → Test → Polish cycle
- **User Feedback**: Quick iterations based on UI/UX issues
- **Modern Stack**: Latest Tauri, React, Tailwind versions
- **Progress Tracking**: 5/6 MVP PRs complete (83%)
