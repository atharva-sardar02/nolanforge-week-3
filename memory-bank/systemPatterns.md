# NolanForge System Patterns

## Application Architecture

### Module-Based Design ✅ IMPLEMENTED
```
Tauri Shell (Rust Backend)
├── Uploader Module (React) - Ready for PR2.1
├── Editor Module (React) - Ready for PR3.1
└── Recorder Module (React) - Ready for PR7.1
```

### Bootstrap Architecture ✅ COMPLETE
```
React Frontend (TypeScript + Vite)
├── App.tsx - Main app with routing
├── SidebarNav.tsx - Navigation with state management
├── Routes/ - Uploader, Editor, Recorder placeholders
├── State/ - Zustand stores (appState.ts)
├── Components/ - Reusable UI components
└── Test/ - Comprehensive test coverage (20 tests)
```

### Data Flow
1. **Uploader** → Imports files → **MediaStore**
2. **Editor** → Reads from **MediaStore** → Exports via **FFmpeg**
3. **Recorder** → Captures media → **MediaStore**

## Key Technical Decisions

### State Management ✅ IMPLEMENTED
- **Centralized Stores**: Zustand implemented with appState.ts
- **Module State**: Ready for uploaderState.ts, editorState.ts, recorderState.ts
- **Persistence**: Ready for SQLite or local filesystem for media library
- **Status**: Global app state working with theme, routing, sidebar management

### FFmpeg Integration
- **Rust Commands**: Tauri commands for FFmpeg operations
- **Argument Building**: Pure functions for FFmpeg command construction
- **Error Handling**: Proper error propagation from Rust to React

### File Handling
- **Tauri API**: Use Tauri's secure file access
- **Path Management**: Centralized path utilities
- **Validation**: File type and metadata validation

## Design Patterns

### Component Architecture
- **Container Components**: Route-level components (Uploader, Editor, Recorder)
- **Presentational Components**: Reusable UI components
- **Custom Hooks**: Business logic extraction

### Testing Strategy ✅ IMPLEMENTED
- **Unit Tests**: Pure functions and utilities (20 tests passing)
- **Integration Tests**: Component interactions (SidebarNav + appState)
- **E2E Tests**: Ready for full workflow validation
- **Status**: Vitest + React Testing Library + jsdom configured

### Error Handling
- **Rust Side**: Proper error types and propagation
- **React Side**: Error boundaries and user feedback
- **FFmpeg**: Command validation and error reporting

## Component Relationships

### Core Components ✅ IMPLEMENTED
- **SidebarNav**: Navigation between modules with state management
- **App**: Main application with routing and layout
- **FileDropZone**: Ready for PR2.1 file import with drag-and-drop
- **VideoPlayer**: Ready for PR3.1 HTML5 video with custom controls
- **Timeline**: Ready for PR4.1 visual timeline with trim markers
- **ExportPanel**: Ready for PR5.1 export configuration and status

### State Stores ✅ IMPLEMENTED
- **appState**: Global UI state (active route, theme, sidebar) - COMPLETE
- **mediaStore**: Ready for PR2.2 imported media clips and selection
- **editState**: Ready for PR3.2 current clip editing state (in/out points)
- **timelineState**: Ready for PR4.2 multi-clip timeline arrangement
- **recordingState**: Ready for PR7.1 recording session state
- **transcriptionState**: Ready for PR11.1 AI transcription data and text overlays
- **settingsState**: Ready for PR10.1 app configuration and preferences

## Sub-PR Development Pattern ✅ PROVEN EFFECTIVE
- **Focused Scope**: Each sub-PR has a single, clear goal
- **Testable**: Every sub-PR includes specific test requirements
- **Manageable**: Sub-PRs are sized for 1-2 hour completion
- **Dependencies**: Clear ordering prevents blocking issues
- **Progress Tracking**: Individual sub-PR completion provides visibility
- **Status**: 8/54 sub-PRs complete (15%) - Bootstrap phase finished
- **Next**: PR2.1-PR2.6 Uploader module (6 sub-PRs)
