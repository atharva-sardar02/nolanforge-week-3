# NolanForge System Patterns

## Application Architecture

### Module-Based Design ✅ IMPLEMENTED
```
Tauri Shell (Rust Backend)
├── Uploader Module (React) - ✅ COMPLETE
├── Editor Module (React) - ✅ COMPLETE
└── Recorder Module (React) - Ready for PR7
```

### Current Architecture ✅ MVP COMPLETE + MULTI-CLIP TIMELINE
```
React Frontend (TypeScript + Vite)
├── App.tsx - Main app with routing
├── Navbar.tsx - Top navigation with NolanForge branding
├── Routes/
│   ├── Uploader.tsx - File import + Media Library ✅
│   ├── Editor.tsx - Multi-clip video player + Dual timeline + Export ✅
│   └── Recorder.tsx - Screen recording (pending)
├── Components/
│   ├── FileDropZone.tsx - Drag-and-drop import ✅
│   ├── MediaLibrary.tsx - Grid/List view with edit action ✅
│   ├── MediaListItem.tsx - Drag-and-drop to timeline ✅
│   ├── VideoPlayer.tsx - HTML5 video with continuous playback ✅
│   ├── Timeline.tsx - Single-clip timeline with trim markers ✅
│   ├── ContinuousTimeline.tsx - Multi-clip timeline with global trim ✅
│   ├── TrimControls.tsx - In/Out point controls ✅
│   └── ExportPanel.tsx - Export UI ✅
├── State/
│   ├── appState.ts - Global UI state ✅
│   ├── mediaStore.ts - Media files ✅
│   └── editState.ts - Multi-clip timeline state ✅
├── Hooks/
│   └── useExport.ts - Multi-clip export logic ✅
└── Utils/
    ├── fileUtils.ts - File operations + blob URLs ✅
    └── time.ts - Time formatting ✅
```

### Data Flow ✅ IMPLEMENTED + MULTI-CLIP
1. **Uploader** → Imports files → **MediaStore** (blob URLs + metadata)
2. **MediaLibrary** → "Edit" button → **addClipToTimeline** → **editState.timelineClips**
3. **Editor** → **ContinuousTimeline** (all clips) + **Timeline** (selected clip) → **ExportPanel**
4. **Export** → **globalTrimStart/End** → **FFmpeg** (Rust) → Multi-clip composition

## Key Technical Decisions

### State Management ✅ IMPLEMENTED + MULTI-CLIP
- **appState**: Global UI (theme, route, sidebar) ✅
- **mediaStore**: Imported media files with metadata ✅
- **editState**: Multi-clip timeline state (TimelineClip[], globalTrimStart/End, selectedClipId) ✅
- **Persistence**: Files cached in memory via Map, timeline state in memory

### FFmpeg Integration ✅ IMPLEMENTED + MULTI-CLIP
- **Rust Commands**: `export_trimmed_video()`, `export_multi_clip_video()`, `check_ffmpeg()`
- **Tauri Plugins**: dialog (file pickers), fs (file system)
- **Export Method**: Stream copy (-c copy) for fast trimming + concatenation
- **Error Handling**: FFmpeg availability check + error propagation

### File Handling ✅ IMPLEMENTED
- **Import**: HTML5 File API with drag-and-drop
- **Preview**: Blob URLs (URL.createObjectURL) for video playback
- **Export**: File path selection via Tauri dialog
- **Metadata**: Video duration extracted via hidden video element
- **Caching**: File objects stored in Map by ID

### Video Playback ✅ IMPLEMENTED + MULTI-CLIP
- **HTML5 Video**: Custom controls with continuous playback
- **Blob URLs**: Local file preview without file system access
- **Metadata Loading**: Duration, dimensions, format extraction
- **Events**: onloadedmetadata, oncanplay, ontimeupdate, onended
- **Multi-Clip**: Seamless transitions between clips with global timeline sync

## Design Patterns

### Component Architecture ✅ IMPLEMENTED + MULTI-CLIP
- **Route Components**: Uploader, Editor, Recorder (pages)
- **Feature Components**: VideoPlayer, Timeline, ContinuousTimeline, TrimControls
- **UI Components**: FileDropZone, MediaLibrary, MediaListItem, ExportPanel
- **Custom Hooks**: useExport (multi-clip support)

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

### Core Components ✅ IMPLEMENTED + MULTI-CLIP
- **Navbar**: Top navigation with route links
- **FileDropZone**: Drag-and-drop import with validation
- **MediaLibrary**: Grid/List view with edit action + drag-and-drop to timeline
- **MediaListItem**: Individual media item with drag-and-drop support
- **VideoPlayer**: HTML5 video with continuous multi-clip playback
- **Timeline**: Single-clip timeline with draggable trim markers
- **ContinuousTimeline**: Multi-clip timeline with global trim handles
- **TrimControls**: In/Out point buttons + time displays
- **ExportPanel**: Export configuration + status

### State Stores ✅ IMPLEMENTED + MULTI-CLIP
- **appState**: Current route, theme, UI state
- **mediaStore**: Imported files, selection, file operations
- **editState**: Multi-clip timeline (TimelineClip[], globalTrimStart/End, selectedClipId, playback state)

### Rust Backend ✅ IMPLEMENTED + MULTI-CLIP
- **commands.rs**: FFmpeg export commands (single + multi-clip)
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

## Development Patterns ✅ PROVEN EFFECTIVE + MVP COMPLETE
- **Focused PRs**: Each PR targets specific functionality ✅
- **Iterative Development**: Build → Test → Polish cycle ✅
- **User Feedback**: Quick iterations based on UI/UX issues ✅
- **Modern Stack**: Latest Tauri, React, Tailwind versions ✅
- **Progress Tracking**: 6/6 MVP PRs complete (100%) ✅
- **Multi-Clip Timeline**: Advanced timeline with global trim handles ✅
- **MVP Packaging**: Desktop app built and packaged for distribution ✅
