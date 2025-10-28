# NolanForge Project Brief

## Project Overview
NolanForge is a **modular desktop video editor** built with **Tauri (Rust)** and **React**, designed for rapid, offline video editing. The project has a tight 48-hour deadline with an MVP target of 24 hours.

## Core Mission
Build a desktop application that enables users to:
1. **Import** MP4/MOV files via drag-and-drop
2. **Edit** multiple clips with advanced timeline and trim controls
3. **Export** trimmed segments or multi-clip compositions using FFmpeg
4. **Record** new footage (webcam/screen capture)
5. **Transcribe** videos with AI-powered text overlay

## Three Primary Modules
1. **Uploader** - Import and organize raw media (MP4/MOV)
2. **Editor** - Trim, preview, and arrange clips on timeline
3. **Recorder** - Capture new footage from screen or webcam

## Success Criteria
- **MVP (24 hours)**: Import → Multi-clip Timeline → Trim → Export workflow ✅ COMPLETE
- **Full (48 hours)**: Add recording + advanced timeline features + AI transcription
- **Deliverable**: Working desktop app with README and demo ✅ COMPLETE

## Technical Constraints
- Must work offline
- Cross-platform (Windows/macOS)
- Lightweight desktop app
- FFmpeg integration for video processing
- Modular architecture for maintainability

## Key Risks
- FFmpeg command complexity across OS
- State management between modules
- Performance with video scrubbing
- Build size optimization
- Screen capture API differences
- AI transcription API integration

## Timeline Pressure
- **Day 1**: Core MVP features (PR1-PR6) ✅ COMPLETE
- **Day 2**: Recording + advanced features + AI transcription (PR7-PR11)
- **Stretch**: Polish and additional features

## Sub-PR Structure
- **Total PRs**: 11 main PRs broken into 54 sub-PRs
- **MVP**: 30 sub-PRs (PR1.1-PR6.3)
- **Extensions**: 24 sub-PRs (PR7.1-PR11.6)
- **Benefits**: Manageable chunks, clear dependencies, better testing
