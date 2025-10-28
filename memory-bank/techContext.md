# NolanForge Technical Context

## Technology Stack

### Desktop Shell
- **Tauri (Rust)**: Lightweight, secure wrapper
- **Purpose**: Handles FFmpeg commands, file access, packaging
- **Benefits**: Small bundle size, native performance, security

### Frontend Framework
- **React + TypeScript**: Component-based UI
- **Vite**: Fast build tool and dev server
- **Purpose**: SPA with modular routing for workspaces

### Media Engine
- **FFmpeg**: Video processing and export (single + multi-clip)
- **Integration**: Rust bindings with Tauri commands
- **Purpose**: Trim/export, concatenation, and later merge/record functions

### UI Framework
- **Tailwind CSS**: Utility-first styling
- **Shadcn**: Component library for consistency
- **Purpose**: Responsive layout and modern design

### Canvas Library
- **Custom Timeline Components**: Timeline.tsx, ContinuousTimeline.tsx
- **Purpose**: Draggable markers, multi-clip timeline interaction, global trim handles

### Storage
- **Local filesystem**: Via Tauri API
- **SQLite**: For library metadata (optional)
- **Purpose**: Persistence across module switches

## Development Setup
- **Node.js**: For React development
- **Rust**: For Tauri backend
- **FFmpeg**: Must be installed on system
- **Platform**: Windows/macOS support

## Technical Constraints
- **Offline Operation**: No cloud dependencies
- **Cross-Platform**: Single codebase for multiple OS
- **Performance**: Smooth video scrubbing and timeline interaction
- **Bundle Size**: Minimize final app size
- **Security**: Tauri's security model for file access

### AI Integration
- **OpenAI Whisper API**: Video transcription service
- **Local Models**: Optional local transcription for offline use
- **Text Processing**: Transcript parsing and text overlay generation
- **API Management**: Robust error handling and progress tracking

## Development Methodology
- **Sub-PR Structure**: 54 sub-PRs for manageable development ✅ COMPLETE
- **Testing Strategy**: Unit tests for pure functions, integration tests for workflows ✅
- **State Management**: Zustand for simplicity and performance ✅
- **Error Handling**: Comprehensive error boundaries and user feedback ✅
- **Multi-Clip Architecture**: Advanced timeline with global trim state ✅
- **MVP Packaging**: Desktop app distribution ready ✅
