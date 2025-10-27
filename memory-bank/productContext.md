# NolanForge Product Context

## Why This Project Exists
NolanForge addresses the need for a **lightweight, offline desktop video editor** that doesn't require cloud services or heavy installations. It's designed for content creators, educators, and casual users who need quick video trimming and basic editing capabilities.

## Problems It Solves
1. **Heavy Software**: Avoids bloated video editors like Premiere Pro
2. **Cloud Dependencies**: Works completely offline
3. **Quick Edits**: Streamlined workflow for simple trim operations
4. **Cross-Platform**: Single codebase for Windows/macOS
5. **Performance**: Native desktop app with Rust backend
6. **AI-Powered**: Automatic transcription and text overlay generation

## Target Users

### Content Creator
- **Need**: Quick social media clip trimming
- **Workflow**: Import → Trim → Export
- **Pain Point**: Current tools are too complex for simple tasks

### Educator/Presenter
- **Need**: Cut out key parts from tutorial recordings
- **Workflow**: Record → Trim → Export
- **Pain Point**: Need to capture and edit in same tool

### Casual User
- **Need**: Basic start/end trimming
- **Workflow**: Drag file → Set points → Export
- **Pain Point**: Don't want to learn complex software

## How It Should Work
1. **Seamless Module Switching**: Users move between Uploader/Editor/Recorder without losing context
2. **Drag-and-Drop**: Intuitive file import with visual feedback
3. **Real-time Preview**: See changes immediately in video player
4. **Simple Timeline**: Visual representation of trim points
5. **One-Click Export**: Export trimmed clips with minimal configuration
6. **AI Transcription**: Automatically generate subtitles and enable text-based editing
7. **Sub-PR Development**: Manageable development chunks for rapid iteration

## User Experience Goals
- **Fast**: Quick startup and responsive UI
- **Intuitive**: Minimal learning curve
- **Reliable**: Consistent behavior across platforms
- **Offline**: No internet required
- **Modular**: Use only the features you need
