# NolanForge Task & PR Plan (with Tests)

This document is the working plan for NolanForge.  
Each PR block includes:
- Goal
- Files created / edited
- Tasks checklist
- Tests (unit / integration) you should add in that PR, if any
- Acceptance criteria

MVP PRs (PR1–PR6) must land first.  
Post-MVP PRs (PR7–PR11) extend toward full submission.

---

## PR1: Project Bootstrap (Tauri + React + Routing Shell)

### PR1.1: Initialize Tauri Project

**Goal:**  
Create the basic Tauri + React + TypeScript + Vite project structure.

**Files:**
- `package.json`
- `vite.config.ts`
- `tsconfig.json`
- `src-tauri/tauri.conf.json`
- `src-tauri/Cargo.toml`
- `src-tauri/src/main.rs`
- `src/main.tsx`
- `src/App.tsx`
- `src/index.css`
- `README.md`

**Tasks checklist:**
- [ ] Run `npm create tauri-app@latest nolanforge -- --template react-ts`
- [ ] Choose npm, React, TypeScript, Vite when prompted
- [ ] Verify `npm run tauri dev` opens desktop window
- [ ] Update project name to "NolanForge" in tauri.conf.json

**Acceptance criteria to merge PR1.1:**
- Tauri desktop app launches successfully
- Basic React app renders in desktop window
- No build errors

---

### PR1.2: Add Tailwind CSS & Styling

**Goal:**  
Set up Tailwind CSS styling pipeline and basic UI styling.

**Files:**
- `tailwind.config.js`
- `postcss.config.js`
- `src/index.css` (edit: add Tailwind directives)
- `src/App.tsx` (edit: add basic layout styling)

**Tasks checklist:**
- [ ] Install Tailwind CSS: `npm install -D tailwindcss postcss autoprefixer`
- [ ] Initialize Tailwind: `npx tailwindcss init -p`
- [ ] Configure tailwind.config.js with proper content paths
- [ ] Add Tailwind directives to src/index.css
- [ ] Add basic layout styling to App.tsx

**Acceptance criteria to merge PR1.2:**
- Tailwind CSS is properly configured
- Basic styling works in the app
- No CSS build errors

---

### PR1.3: Set Up Testing Framework

**Goal:**  
Configure Vitest + React Testing Library + jsdom for testing.

**Files:**
- `vitest.config.ts`
- `src/test/setup.ts`
- `package.json` (edit: add test scripts)

**Tasks checklist:**
- [ ] Install testing dependencies: `npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom`
- [ ] Create vitest.config.ts with jsdom environment
- [ ] Create src/test/setup.ts with jest-dom imports
- [ ] Update package.json scripts for testing
- [ ] Verify `npm test` runs without errors

**Acceptance criteria to merge PR1.3:**
- Testing framework is configured
- `npm test` command works
- No test configuration errors

---

### PR1.4: Add React Router & Basic Routes

**Goal:**  
Set up React Router with three basic route components.

**Files:**
- `src/routes/Uploader.tsx`
- `src/routes/Editor.tsx`
- `src/routes/Recorder.tsx`
- `src/App.tsx` (edit: add routing)

**Tasks checklist:**
- [ ] Install React Router: `npm install react-router-dom @types/react-router-dom`
- [ ] Create three route components with placeholder content
- [ ] Update App.tsx to use BrowserRouter and Routes
- [ ] Add route paths: `/uploader`, `/editor`, `/recorder`
- [ ] Set default route to `/uploader`

**Acceptance criteria to merge PR1.4:**
- React Router is properly configured
- All three routes render correctly
- Navigation between routes works

---

### PR1.5: Implement Sidebar Navigation

**Goal:**  
Create SidebarNav component with navigation buttons and active state.

**Files:**
- `src/components/SidebarNav.tsx`
- `src/App.tsx` (edit: add SidebarNav to layout)

**Tasks checklist:**
- [ ] Create SidebarNav component with navigation buttons
- [ ] Add icons for each module (📁 Uploader, ✂️ Editor, 🎥 Recorder)
- [ ] Implement active route highlighting
- [ ] Add hover states and transitions
- [ ] Integrate SidebarNav into App.tsx layout

**Acceptance criteria to merge PR1.5:**
- Sidebar navigation renders correctly
- Active route is highlighted
- Navigation buttons work and change routes
- Clean, modern UI design

---

### PR1.6: Add State Management

**Goal:**  
Set up Zustand for global app state management.

**Files:**
- `src/state/appState.ts`
- `src/components/SidebarNav.tsx` (edit: integrate with state)

**Tasks checklist:**
- [ ] Install Zustand: `npm install zustand`
- [ ] Create appState store with activeRoute and theme
- [ ] Add setter functions for state updates
- [ ] Integrate state with SidebarNav component
- [ ] Test state updates work correctly

**Acceptance criteria to merge PR1.6:**
- Zustand store is properly configured
- State updates work correctly
- SidebarNav integrates with global state
- No state management errors

---

### PR1.7: Write Unit Tests

**Goal:**  
Add comprehensive unit tests for SidebarNav and appState.

**Files:**
- `src/components/__tests__/SidebarNav.test.tsx`
- `src/state/__tests__/appState.test.ts`

**Tasks checklist:**
- [ ] Write SidebarNav unit tests:
  - Renders all navigation links
  - Highlights active route
  - Handles click events
- [ ] Write appState unit tests:
  - Initializes with default values
  - Updates active route correctly
  - Updates theme correctly
- [ ] Run tests and ensure they pass

**Acceptance criteria to merge PR1.7:**
- All unit tests pass
- Test coverage for critical functionality
- No test failures or errors

---

### PR1.8: Final Integration & Verification

**Goal:**  
Verify complete PR1 functionality and clean up any issues.

**Tasks checklist:**
- [ ] Run full test suite: `npm test`
- [ ] Verify app launches: `npm run tauri dev`
- [ ] Test all navigation flows
- [ ] Check for linting errors: `npm run lint` (if configured)
- [ ] Verify build works: `npm run build`
- [ ] Update README with setup instructions

**Acceptance criteria to merge PR1:**
- App launches in dev mode without errors
- Navigation between all routes works smoothly
- All unit tests pass
- Clean build with no errors
- README updated with setup instructions

---

## PR2: Uploader Module (Import & Media Library)

### PR2.1: Create Media Types & Store

**Goal:**  
Set up TypeScript types and Zustand store for media management.

**Files:**
- `src/types/media.ts`
- `src/state/mediaStore.ts`

**Tasks checklist:**
- [ ] Define MediaClip interface with id, path, name, duration, thumbnail
- [ ] Create mediaStore with Zustand
- [ ] Add functions: addClip, removeClip, getClipById
- [ ] Add selectedClipId state for Editor integration
- [ ] Test store initialization and basic operations

**Acceptance criteria to merge PR2.1:**
- Media types are properly defined
- Store initializes correctly
- Basic CRUD operations work

---

### PR2.2: Build File Drop Zone Component

**Goal:**  
Create drag-and-drop file import component with file validation.

**Files:**
- `src/components/FileDropZone.tsx`
- `src/utils/fileValidation.ts`

**Tasks checklist:**
- [ ] Create FileDropZone component with drag/drop handlers
- [ ] Add file validation for .mp4/.mov extensions
- [ ] Implement fallback file picker input
- [ ] Add visual feedback for drag states (hover, valid, invalid)
- [ ] Handle multiple file drops
- [ ] Add error handling for invalid files

**Acceptance criteria to merge PR2.2:**
- Drag and drop works for video files
- File validation rejects non-video files
- Visual feedback is clear and responsive
- Error handling works for invalid files

---

### PR2.3: Create Media List Component

**Goal:**  
Display imported media clips in a clean, organized list.

**Files:**
- `src/components/MediaList.tsx`
- `src/components/MediaItem.tsx`

**Tasks checklist:**
- [ ] Create MediaList component to display all clips
- [ ] Create MediaItem component for individual clips
- [ ] Show clip name, duration, and thumbnail placeholder
- [ ] Add selection state for Editor integration
- [ ] Implement remove/delete functionality
- [ ] Add empty state when no clips imported

**Acceptance criteria to merge PR2.3:**
- Media list displays imported clips correctly
- Selection state works for Editor integration
- Remove functionality works
- Empty state is handled gracefully

---

### PR2.4: Add Metadata Extraction

**Goal:**  
Extract video metadata (duration, dimensions) for imported clips.

**Files:**
- `src/utils/metadata.ts`
- `src-tauri/src/commands/fs.rs`

**Tasks checklist:**
- [ ] Create metadata extraction utilities
- [ ] Add Tauri command for reading file metadata
- [ ] Extract duration using HTML5 video element
- [ ] Generate thumbnail previews (optional)
- [ ] Handle metadata extraction errors
- [ ] Cache metadata to avoid re-extraction

**Acceptance criteria to merge PR2.4:**
- Duration is extracted correctly for imported videos
- Metadata extraction handles errors gracefully
- Performance is acceptable for large files

---

### PR2.5: Integrate Uploader UI

**Goal:**  
Connect all components and create the complete Uploader experience.

**Files:**
- `src/routes/Uploader.tsx` (edit: integrate all components)

**Tasks checklist:**
- [ ] Integrate FileDropZone, MediaList, and MediaItem
- [ ] Connect to mediaStore for state management
- [ ] Handle file import flow: drop → validate → extract metadata → add to store
- [ ] Add loading states during metadata extraction
- [ ] Implement error handling and user feedback
- [ ] Test complete import workflow

**Acceptance criteria to merge PR2.5:**
- Complete file import workflow works end-to-end
- UI is responsive and provides good feedback
- Error states are handled gracefully

---

### PR2.6: Write Tests for Uploader Module

**Goal:**  
Add comprehensive tests for all Uploader functionality.

**Files:**
- `src/state/__tests__/mediaStore.test.ts`
- `src/utils/__tests__/metadata.test.ts`
- `src/components/__tests__/FileDropZone.test.tsx`
- `src/components/__tests__/MediaList.test.tsx`
- `src/routes/__tests__/Uploader.integration.test.tsx`

**Tasks checklist:**
- [ ] Write mediaStore unit tests
- [ ] Write metadata utility tests
- [ ] Write FileDropZone component tests
- [ ] Write MediaList component tests
- [ ] Write Uploader integration tests
- [ ] Ensure all tests pass

**Acceptance criteria to merge PR2:**
- All tests pass
- Test coverage covers critical functionality
- Integration tests verify complete workflow

---

## PR3: Editor Module – Clip Selection + Video Preview Player

### PR3.1: Create Clip Selector Component

**Goal:**  
Build component to select clips from media library for editing.

**Files:**
- `src/components/ClipSelector.tsx`
- `src/state/mediaStore.ts` (edit: add selectedClipId)

**Tasks checklist:**
- [ ] Create ClipSelector component
- [ ] Display clips from mediaStore in a grid/list
- [ ] Add selection state and visual feedback
- [ ] Update mediaStore with selectedClipId
- [ ] Handle empty state when no clips available
- [ ] Add search/filter functionality (optional)

**Acceptance criteria to merge PR3.1:**
- Clip selector displays available clips
- Selection state works correctly
- Selected clip ID is stored in global state

---

### PR3.2: Build Video Player Component

**Goal:**  
Create HTML5 video player with custom controls for preview.

**Files:**
- `src/components/VideoPlayer.tsx`
- `src/hooks/useVideoPlayer.ts`

**Tasks checklist:**
- [ ] Create VideoPlayer component with HTML5 video element
- [ ] Add play/pause button functionality
- [ ] Implement current time and duration display
- [ ] Add scrub bar (range input) for seeking
- [ ] Handle video loading states and errors
- [ ] Add keyboard shortcuts (spacebar for play/pause)
- [ ] Create custom hook for video player logic

**Acceptance criteria to merge PR3.2:**
- Video player loads and plays selected clips
- All controls work correctly
- Error handling works for invalid video files

---

### PR3.3: Integrate Editor UI

**Goal:**  
Connect ClipSelector and VideoPlayer in the Editor route.

**Files:**
- `src/routes/Editor.tsx` (edit: integrate components)

**Tasks checklist:**
- [ ] Integrate ClipSelector and VideoPlayer components
- [ ] Handle clip selection → video loading flow
- [ ] Add layout for Editor workspace
- [ ] Handle "no clip selected" state gracefully
- [ ] Add loading states during video loading
- [ ] Test complete selection → preview workflow

**Acceptance criteria to merge PR3.3:**
- Editor displays selected clip in video player
- Selection changes update video player correctly
- UI handles all states gracefully

---

### PR3.4: Write Tests for Editor Module

**Goal:**  
Add comprehensive tests for Editor functionality.

**Files:**
- `src/components/__tests__/ClipSelector.test.tsx`
- `src/components/__tests__/VideoPlayer.test.tsx`
- `src/routes/__tests__/Editor.integration.test.tsx`

**Tasks checklist:**
- [ ] Write ClipSelector unit tests
- [ ] Write VideoPlayer unit tests
- [ ] Write Editor integration tests
- [ ] Test clip selection → preview flow
- [ ] Ensure all tests pass

**Acceptance criteria to merge PR3:**
- All tests pass
- Integration tests verify complete workflow
- Video player functionality is well tested

---

## PR4: Timeline + Trim Controls (In/Out Points)

### PR4.1: Create Edit State Management

**Goal:**  
Set up state management for editing operations (in/out points).

**Files:**
- `src/state/editState.ts`
- `src/utils/time.ts`

**Tasks checklist:**
- [ ] Create editState store with inPoint, outPoint, playheadPosition
- [ ] Add validation for in/out point ranges
- [ ] Create time utility functions (formatting, conversion)
- [ ] Add functions to set/reset trim points
- [ ] Handle edge cases (inPoint > outPoint, etc.)

**Acceptance criteria to merge PR4.1:**
- Edit state initializes correctly
- Time utilities work properly
- Validation prevents invalid ranges

---

### PR4.2: Build Timeline Component

**Goal:**  
Create visual timeline representation with draggable markers.

**Files:**
- `src/components/Timeline.tsx`
- `src/components/TimelineMarker.tsx`

**Tasks checklist:**
- [ ] Create horizontal timeline bar
- [ ] Add playhead position indicator
- [ ] Implement draggable in/out point markers
- [ ] Add timeline scrubbing functionality
- [ ] Show current time position
- [ ] Handle timeline zoom (optional)

**Acceptance criteria to merge PR4.2:**
- Timeline renders correctly
- Markers are draggable
- Playhead position updates correctly

---

### PR4.3: Create Trim Controls

**Goal:**  
Build UI controls for setting precise trim points.

**Files:**
- `src/components/TrimControls.tsx`

**Tasks checklist:**
- [ ] Create numeric input fields for in/out points
- [ ] Add buttons for common trim operations (set to current time)
- [ ] Implement keyboard shortcuts for trim operations
- [ ] Add visual feedback for trim point changes
- [ ] Handle precision (frame-level accuracy)

**Acceptance criteria to merge PR4.3:**
- Trim controls work correctly
- Numeric inputs update timeline
- Keyboard shortcuts function properly

---

### PR4.4: Integrate Timeline & Trim Controls

**Goal:**  
Connect timeline and trim controls with video player.

**Files:**
- `src/routes/Editor.tsx` (edit: add timeline components)
- `src/hooks/useTimelineSync.ts`

**Tasks checklist:**
- [ ] Integrate Timeline and TrimControls into Editor
- [ ] Sync timeline with video player position
- [ ] Handle trim point changes → video preview updates
- [ ] Add keyboard shortcuts for timeline navigation
- [ ] Test complete trim workflow

**Acceptance criteria to merge PR4.4:**
- Timeline syncs with video player
- Trim operations work correctly
- UI is responsive and intuitive

---

### PR4.5: Write Tests for Timeline Module

**Goal:**  
Add comprehensive tests for timeline and trim functionality.

**Files:**
- `src/state/__tests__/editState.test.ts`
- `src/utils/__tests__/time.test.ts`
- `src/components/__tests__/Timeline.test.tsx`
- `src/components/__tests__/TrimControls.test.tsx`

**Tasks checklist:**
- [ ] Write editState unit tests
- [ ] Write time utility tests
- [ ] Write Timeline component tests
- [ ] Write TrimControls component tests
- [ ] Ensure all tests pass

**Acceptance criteria to merge PR4:**
- All tests pass
- Timeline functionality is well tested
- Trim validation works correctly

---

## PR5: Export via FFmpeg (Trimmed MP4) ✅ COMPLETED

### PR5.1: Create FFmpeg Command Builder ✅

**Goal:**  
Build Rust command layer for FFmpeg operations.

**Files:**
- `src-tauri/src/commands.rs` (created)
- `src-tauri/src/lib.rs` (edited: register export command)
- `src-tauri/Cargo.toml` (edited: add dialog and fs plugins)
- `src-tauri/capabilities/default.json` (edited: add permissions)

**Tasks checklist:**
- [x] Create exportTrimmedClip Tauri command
- [x] Implement FFmpeg argument building logic
- [x] Add proper error handling for FFmpeg failures
- [x] Handle file path validation and escaping
- [x] Add check_ffmpeg command to verify FFmpeg installation

**Acceptance criteria to merge PR5.1:**
- FFmpeg commands are generated correctly ✅
- Error handling works for invalid inputs ✅
- File paths are properly escaped ✅

---

### PR5.2: Build Export Panel UI ✅

**Goal:**  
Create user interface for export configuration and status.

**Files:**
- `src/components/ExportPanel.tsx` (created)
- `src/hooks/useExport.ts` (created)

**Tasks checklist:**
- [x] Create ExportPanel component
- [x] Add output filename/location selection
- [x] Implement export progress indicator
- [x] Add export status display (Exporting/Done/Error)
- [x] Add export quality/resolution options (UI placeholder)

**Acceptance criteria to merge PR5.2:**
- Export panel UI is intuitive ✅
- Progress indication works correctly ✅
- Error states are handled gracefully ✅

---

### PR5.3: Integrate Export Functionality ✅

**Goal:**  
Connect export UI with FFmpeg backend.

**Files:**
- `src/routes/Editor.tsx` (edited: add ExportPanel and export logic)

**Tasks checklist:**
- [x] Integrate ExportPanel into Editor
- [x] Connect export button to Tauri command
- [x] Handle export progress updates
- [x] Add export completion feedback
- [x] Implement file picker for input/output paths

**Acceptance criteria to merge PR5.3:**
- Export workflow works end-to-end ✅
- Progress updates are accurate ✅
- Export completion is handled properly ✅

---

### PR5.4: Write Tests for Export Module (DEFERRED)

**Goal:**  
Add comprehensive tests for export functionality.

**Status:** DEFERRED - Export functionality working, tests can be added later

**Files:**
- `src-tauri/src/commands/__tests__/export_args.test.rs`
- `src/components/__tests__/ExportPanel.integration.test.tsx`

**Tasks checklist:**
- [ ] Write FFmpeg argument builder tests (DEFERRED)
- [ ] Write ExportPanel integration tests (DEFERRED)
- [ ] Test export command with various inputs (DEFERRED)
- [ ] Ensure all tests pass (DEFERRED)

**Acceptance criteria to merge PR5:**
- ✅ All core functionality works
- ✅ Export workflow tested manually
- ✅ FFmpeg integration works correctly

**Note:** PR5 is functionally complete. Export works end-to-end with:
- File path stored on import
- FFmpeg trimming with stream copy
- Success/error feedback
- User-friendly workflow

---

## PR6: Packaging & Distribution (Installable Build)

### PR6.1: Configure Tauri Build Settings

**Goal:**  
Set up Tauri configuration for production builds.

**Files:**
- `src-tauri/tauri.conf.json` (edit: productName, identifiers)
- `src-tauri/Cargo.toml` (edit: optimize settings)

**Tasks checklist:**
- [x] Update productName to "NolanForge"
- [x] Set proper app identifier
- [x] Configure build settings for optimization
- [x] Set up code signing (if needed)
- [x] Configure bundle settings

**Acceptance criteria to merge PR6.1:**
- [x] Tauri configuration is production-ready
- [x] App identifier is properly set
- [x] Build settings are optimized
- [x] Production installers built successfully (.msi and .exe)

---

### PR6.2: Create Project Documentation

**Goal:**  
Write comprehensive project documentation.

**Files:**
- `README.md` (edit: build + install steps, platform notes)
- `docs/architecture.md` (create)
- `docs/tasks.md` (create from this file)
- `LICENSE`
- `CONTRIBUTING.md` (optional)

**Tasks checklist:**
- [ ] Update README with setup instructions
- [ ] Add prerequisites (Rust, Node, FFmpeg)
- [ ] Document build and run steps
- [ ] Create architecture documentation
- [ ] Add this task list as docs/tasks.md
- [ ] Add LICENSE file

**Acceptance criteria to merge PR6.2:**
- Documentation is complete and clear
- Setup instructions work correctly
- Architecture is well documented

---

### PR6.3: Build and Test Package

**Goal:**  
Create production build and verify functionality.

**Tasks checklist:**
- [ ] Run `tauri build` for target platform
- [ ] Test packaged app launches correctly
- [ ] Verify all MVP features work in packaged app
- [ ] Test import → edit → export workflow
- [ ] Check app size and performance
- [ ] Fix any packaging issues

**Acceptance criteria to merge PR6:**
- Packaged app builds successfully
- All MVP features work in production build
- App size is reasonable
- No runtime errors in packaged version

---

## PR7: Recorder Module (Screen/Webcam Capture)

### PR7.1: Create Recording State Management

**Goal:**  
Set up state management for recording operations.

**Files:**
- `src/state/recordingState.ts`
- `src/hooks/useMediaRecorder.ts`

**Tasks checklist:**
- [ ] Create recordingState store
- [ ] Add recording status (idle, recording, stopped)
- [ ] Handle recording settings (quality, format)
- [ ] Add recording duration tracking
- [ ] Create custom hook for MediaRecorder API

**Acceptance criteria to merge PR7.1:**
- Recording state initializes correctly
- State updates work properly
- MediaRecorder hook functions correctly

---

### PR7.2: Build Webcam Preview Component

**Goal:**  
Create webcam preview and recording interface.

**Files:**
- `src/components/PreviewWebcam.tsx`
- `src/components/RecorderControls.tsx`

**Tasks checklist:**
- [ ] Create webcam preview component
- [ ] Implement getUserMedia for webcam access
- [ ] Add recording controls (start/stop)
- [ ] Handle recording status display
- [ ] Add recording quality settings
- [ ] Handle permission requests

**Acceptance criteria to merge PR7.2:**
- Webcam preview works correctly
- Recording controls function properly
- Permission handling works

---

### PR7.3: Integrate Recording with Media Store

**Goal:**  
Connect recorded clips to the media library.

**Files:**
- `src/routes/Recorder.tsx` (edit: integrate components)
- `src/utils/recordingUtils.ts`

**Tasks checklist:**
- [ ] Integrate recording components into Recorder route
- [ ] Save recorded clips to mediaStore
- [ ] Handle recording file management
- [ ] Add recording to Editor workflow
- [ ] Test complete recording workflow

**Acceptance criteria to merge PR7.3:**
- Recorded clips appear in media library
- Recording workflow is complete
- Integration with Editor works

---

### PR7.4: Write Tests for Recorder Module

**Goal:****
Add comprehensive tests for recording functionality.

**Files:**
- `src/state/__tests__/recordingState.test.ts`
- `src/components/__tests__/RecorderControls.test.tsx`
- `src/routes/__tests__/Recorder.integration.test.tsx`

**Tasks checklist:**
- [ ] Write recordingState unit tests
- [ ] Write RecorderControls component tests
- [ ] Write Recorder integration tests
- [ ] Mock MediaRecorder API for tests
- [ ] Ensure all tests pass

**Acceptance criteria to merge PR7:**
- All tests pass
- Recording functionality is well tested
- MediaRecorder integration works correctly

---

## PR8: Advanced Timeline Editing (Multi-Clip, Split, Tracks)

### PR8.1: Create Timeline State Management

**Goal:**  
Set up state management for multi-clip timeline operations.

**Files:**
- `src/state/timelineState.ts`
- `src/utils/timelineOps.ts`

**Tasks checklist:**
- [ ] Create timelineState store for multi-clip editing
- [ ] Define timeline segment data structure
- [ ] Add functions for timeline operations (add, split, delete, move)
- [ ] Handle track management (main, overlay)
- [ ] Add timeline validation logic

**Acceptance criteria to merge PR8.1:**
- Timeline state initializes correctly
- Timeline operations work properly
- Validation prevents invalid states

---

### PR8.2: Build Multi-Track Timeline Component

**Goal:**  
Create advanced timeline with multiple tracks and segments.

**Files:**
- `src/components/Timeline.tsx` (edit: enhance)
- `src/components/TrackLane.tsx`
- `src/components/Playhead.tsx`

**Tasks checklist:**
- [ ] Enhance Timeline component for multi-clip support
- [ ] Create TrackLane component for individual tracks
- [ ] Add Playhead component for timeline navigation
- [ ] Implement drag-and-drop for clips
- [ ] Add timeline zoom functionality
- [ ] Handle segment selection and editing

**Acceptance criteria to merge PR8.2:**
- Multi-track timeline renders correctly
- Drag-and-drop works for clips
- Timeline navigation functions properly

---

### PR8.3: Add Timeline Editing Tools

**Goal:**  
Implement timeline editing tools (split, delete, move).

**Files:**
- `src/components/SplitButton.tsx`
- `src/components/DeleteButton.tsx`
- `src/components/TimelineTools.tsx`

**Tasks checklist:**
- [ ] Create SplitButton for splitting clips
- [ ] Create DeleteButton for removing segments
- [ ] Add timeline tools toolbar
- [ ] Implement keyboard shortcuts for editing
- [ ] Add undo/redo functionality
- [ ] Handle edge cases in editing operations

**Acceptance criteria to merge PR8.3:**
- Timeline editing tools work correctly
- Split and delete operations function properly
- Keyboard shortcuts work as expected

---

### PR8.4: Write Tests for Advanced Timeline

**Goal:**  
Add comprehensive tests for advanced timeline functionality.

**Files:**
- `src/state/__tests__/timelineState.test.ts`
- `src/utils/__tests__/timelineOps.test.ts`
- `src/components/__tests__/Timeline.advanced.test.tsx`

**Tasks checklist:**
- [ ] Write timelineState unit tests
- [ ] Write timelineOps utility tests
- [ ] Write advanced Timeline component tests
- [ ] Test timeline editing operations
- [ ] Ensure all tests pass

**Acceptance criteria to merge PR8:**
- All tests pass
- Advanced timeline functionality is well tested
- Timeline operations work correctly

---

## PR9: Full Timeline Export (Multi-Clip Render)

### PR9.1: Create Export Plan Builder

**Goal:**  
Build system to generate export plans from timeline state.

**Files:**
- `src/utils/exportPlan.ts`
- `src/types/export.ts`

**Tasks checklist:**
- [ ] Create export plan data structure
- [ ] Build render plan from timelineState
- [ ] Handle multi-clip concatenation logic
- [ ] Add resolution preset support
- [ ] Handle overlay track rendering

**Acceptance criteria to merge PR9.1:**
- Export plans are generated correctly
- Multi-clip logic works properly
- Resolution presets function correctly

---

### PR9.2: Enhance FFmpeg Export Commands

**Goal:**  
Extend FFmpeg integration for multi-clip exports.

**Files:**
- `src-tauri/src/commands/export.rs` (edit: add multi-clip support)
- `src-tauri/src/commands/__tests__/export_args_full_timeline.test.rs`

**Tasks checklist:**
- [ ] Add exportFullTimeline Tauri command
- [ ] Implement FFmpeg filtergraph for multi-clip
- [ ] Add resolution scaling support
- [ ] Handle overlay track rendering
- [ ] Add progress reporting for long exports

**Acceptance criteria to merge PR9.2:**
- Multi-clip FFmpeg commands work correctly
- Resolution scaling functions properly
- Progress reporting is accurate

---

### PR9.3: Update Export Panel for Timeline

**Goal:**  
Enhance export UI for timeline-based exports.

**Files:**
- `src/components/ExportPanel.tsx` (edit: add timeline export mode)
- `src/hooks/useTimelineExport.ts`

**Tasks checklist:**
- [ ] Add timeline export mode to ExportPanel
- [ ] Add resolution preset selection
- [ ] Implement export progress tracking
- [ ] Add export quality options
- [ ] Handle export cancellation

**Acceptance criteria to merge PR9.3:**
- Timeline export UI is intuitive
- Progress tracking works correctly
- Export options function properly

---

### PR9.4: Write Tests for Timeline Export

**Goal:**  
Add comprehensive tests for timeline export functionality.

**Files:**
- `src/utils/__tests__/exportPlan.test.ts`
- `src-tauri/src/commands/__tests__/export_args_full_timeline.test.rs`
- `src/components/__tests__/ExportPanel.timeline.test.tsx`

**Tasks checklist:**
- [ ] Write exportPlan utility tests
- [ ] Write multi-clip FFmpeg command tests
- [ ] Write timeline export panel tests
- [ ] Test export with various timeline configurations
- [ ] Ensure all tests pass

**Acceptance criteria to merge PR9:**
- All tests pass
- Timeline export functionality is well tested
- Multi-clip rendering works correctly

---

## PR10: Polish & Creator UX

### PR10.1: Implement Undo/Redo System

**Goal:**  
Add undo/redo functionality for timeline operations.

**Files:**
- `src/state/timelineState.ts` (edit: add undo/redo stack)
- `src/utils/undoRedo.ts`

**Tasks checklist:**
- [ ] Add undo/redo stack to timelineState
- [ ] Implement action history tracking
- [ ] Add undo/redo functions
- [ ] Handle undo/redo UI integration
- [ ] Test undo/redo with various operations

**Acceptance criteria to merge PR10.1:**
- Undo/redo system works correctly
- Action history is properly maintained
- UI integration functions properly

---

### PR10.2: Add Autosave Functionality

**Goal:**  
Implement automatic saving of timeline state.

**Files:**
- `src/utils/autosave.ts`
- `src-tauri/src/commands/autosave.rs` (optional)

**Tasks checklist:**
- [ ] Create autosave utility
- [ ] Implement periodic saving of timeline state
- [ ] Add autosave restoration on app startup
- [ ] Handle autosave file management
- [ ] Add autosave status indicators

**Acceptance criteria to merge PR10.2:**
- Autosave works correctly
- Timeline state is restored on startup
- Autosave files are managed properly

---

### PR10.3: Add Text Overlay Tools

**Goal:**  
Implement text overlay functionality for videos.

**Files:**
- `src/components/OverlayTextTool.tsx`
- `src/components/TextOverlayEditor.tsx`

**Tasks checklist:**
- [ ] Create text overlay tool component
- [ ] Add text overlay editor
- [ ] Implement text positioning and styling
- [ ] Add text overlay to timeline
- [ ] Handle text overlay export

**Acceptance criteria to merge PR10.3:**
- Text overlay tools work correctly
- Text positioning and styling function properly
- Text overlays export correctly

---

### PR10.4: Add Transition Effects

**Goal:**  
Implement basic transition effects between clips.

**Files:**
- `src/components/TransitionPicker.tsx`
- `src/utils/transitions.ts`

**Tasks checklist:**
- [ ] Create transition picker component
- [ ] Implement basic transition effects (fade, crossfade)
- [ ] Add transition to timeline segments
- [ ] Handle transition export
- [ ] Add transition preview

**Acceptance criteria to merge PR10.4:**
- Transition effects work correctly
- Transition picker is intuitive
- Transitions export properly

---

### PR10.5: Add Settings Panel

**Goal:**  
Create settings panel for app configuration.

**Files:**
- `src/components/SettingsPanel.tsx`
- `src/state/settingsState.ts`

**Tasks checklist:**
- [ ] Create settings panel component
- [ ] Add settings state management
- [ ] Implement export defaults configuration
- [ ] Add theme settings
- [ ] Handle settings persistence

**Acceptance criteria to merge PR10.5:**
- Settings panel works correctly
- Settings are persisted properly
- Export defaults function correctly

---

### PR10.6: Write Tests for Polish Features

**Goal:**  
Add comprehensive tests for polish features.

**Files:**
- `src/state/__tests__/timelineState.undoRedo.test.ts`
- `src/utils/__tests__/autosave.test.ts`
- `src/components/__tests__/SettingsPanel.test.tsx`

**Tasks checklist:**
- [ ] Write undo/redo tests
- [ ] Write autosave tests
- [ ] Write settings panel tests
- [ ] Test text overlay functionality
- [ ] Test transition effects
- [ ] Ensure all tests pass

**Acceptance criteria to merge PR10:**
- All tests pass
- Polish features are well tested
- UX improvements work correctly

---

## PR11: AI Video Transcription & Text Overlay

### PR11.1: Set Up Transcription Service

**Goal:**  
Integrate AI transcription service (OpenAI Whisper or local model).

**Files:**
- `src-tauri/src/commands/transcription.rs`
- `src/utils/transcription.ts`

**Tasks checklist:**
- [ ] Create transcription Tauri command
- [ ] Integrate with OpenAI Whisper API or local model
- [ ] Handle transcription request/response
- [ ] Add transcription error handling
- [ ] Implement transcription progress tracking

**Acceptance criteria to merge PR11.1:**
- Transcription service integration works
- API calls are handled correctly
- Error handling functions properly

---

### PR11.2: Create Transcription State Management

**Goal:**  
Set up state management for transcription data.

**Files:**
- `src/state/transcriptionState.ts`
- `src/types/transcription.ts`

**Tasks checklist:**
- [ ] Create transcriptionState store
- [ ] Define transcript data structure
- [ ] Add functions for transcript management
- [ ] Handle transcript editing
- [ ] Add transcript synchronization with video

**Acceptance criteria to merge PR11.2:**
- Transcription state initializes correctly
- Transcript data is properly managed
- Editing functions work correctly

---

### PR11.3: Build Transcription Panel

**Goal:**  
Create UI for viewing and editing transcripts.

**Files:**
- `src/components/TranscriptionPanel.tsx`
- `src/components/TranscriptionControls.tsx`

**Tasks checklist:**
- [ ] Create transcription panel component
- [ ] Display transcript with timestamps
- [ ] Add transcript editing functionality
- [ ] Implement transcript search
- [ ] Add transcript export options

**Acceptance criteria to merge PR11.3:**
- Transcription panel displays correctly
- Transcript editing works properly
- Search functionality functions correctly

---

### PR11.4: Create Text Overlay Editor

**Goal:**  
Build text overlay editor for transcript-based subtitles.

**Files:**
- `src/components/TextOverlayEditor.tsx`
- `src/components/SubtitlePreview.tsx`

**Tasks checklist:**
- [ ] Create text overlay editor component
- [ ] Generate text overlays from transcript
- [ ] Add subtitle styling options
- [ ] Implement subtitle positioning
- [ ] Add subtitle preview functionality

**Acceptance criteria to merge PR11.4:**
- Text overlay editor works correctly
- Subtitle generation functions properly
- Styling options work as expected

---

### PR11.5: Integrate Transcription with Editor

**Goal:**  
Connect transcription features with the Editor module.

**Files:**
- `src/routes/Editor.tsx` (edit: add transcription features)
- `src/hooks/useTranscription.ts`

**Tasks checklist:**
- [ ] Integrate transcription features into Editor
- [ ] Add transcription button to Editor
- [ ] Handle transcript → text overlay workflow
- [ ] Add transcript-based editing features
- [ ] Test complete transcription workflow

**Acceptance criteria to merge PR11.5:**
- Transcription integrates with Editor
- Complete workflow functions correctly
- Text-based editing works properly

---

### PR11.6: Write Tests for Transcription Module

**Goal:**  
Add comprehensive tests for transcription functionality.

**Files:**
- `src/state/__tests__/transcriptionState.test.ts`
- `src/utils/__tests__/transcription.test.ts`
- `src/components/__tests__/TranscriptionPanel.test.tsx`
- `src-tauri/src/commands/__tests__/transcription_args.test.rs`

**Tasks checklist:**
- [ ] Write transcriptionState unit tests
- [ ] Write transcription utility tests
- [ ] Write TranscriptionPanel component tests
- [ ] Write transcription command tests
- [ ] Test transcription workflow end-to-end
- [ ] Ensure all tests pass

**Acceptance criteria to merge PR11:**
- All tests pass
- Transcription functionality is well tested
- AI integration works correctly

---

## Repo Structure Reference

```text
clipforge/
  README.md
  LICENSE
  CONTRIBUTING.md
  docs/
    architecture.md
    tasks.md

  package.json
  vite.config.ts
  tsconfig.json
  tailwind.config.js
  postcss.config.js

  src/
    main.tsx
    App.tsx
    index.css

    routes/
      Uploader.tsx
      Editor.tsx
      Recorder.tsx

    components/
      SidebarNav.tsx
      FileDropZone.tsx
      MediaList.tsx
      ClipSelector.tsx
      VideoPlayer.tsx
      Timeline.tsx
      TrimControls.tsx
      ExportPanel.tsx
      RecorderControls.tsx
      PreviewWebcam.tsx
      TrackLane.tsx
      Playhead.tsx
      SplitButton.tsx
      DeleteButton.tsx
      OverlayTextTool.tsx
      TransitionPicker.tsx
      SettingsPanel.tsx
      TranscriptionPanel.tsx
      TextOverlayEditor.tsx
      TranscriptionControls.tsx

    state/
      appState.ts
      mediaStore.ts
      editState.ts
      timelineState.ts
      recordingState.ts
      transcriptionState.ts

    utils/
      metadata.ts
      time.ts
      timelineOps.ts
      exportPlan.ts
      autosave.ts
      transcription.ts

    config/
      paths.ts

  src-tauri/
    tauri.conf.json
    Cargo.toml
    src/
      main.rs
      commands/
        fs.rs
        export.rs
        record.rs
        autosave.rs
        transcription.rs
      __tests__/
        export_args.test.rs
        export_args_full_timeline.test.rs
        transcription_args.test.rs

  src/components/__tests__/
  src/routes/__tests__/
  src/state/__tests__/
  src/utils/__tests__/
