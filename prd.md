# NolanForge — Product Requirements Document (PRD)

**Goal:** Build a modular desktop video editor using **Tauri (Rust)** and **React**, capable of importing, editing, and exporting media clips — shipped in 48 hours, MVP in 24.

---

## 1. Product Overview

NolanForge is a **modular desktop application** for rapid, offline video editing.  
It consists of **three primary workspaces**:

1. **Uploader** — Import and organize raw media (MP4/MOV).  
2. **Editor** — Trim, preview, and arrange clips on a timeline.  
3. **Recorder** — Capture new footage from screen or webcam.  

Users can switch between modules seamlessly from a sidebar or top navigation bar.

---

## 2. User Stories

### Content Creator
> “I want to import and trim short clips for social media edits quickly.”
- Launch app → open **Uploader** → import files.  
- Switch to **Editor** → trim clip, preview result.  
- Export MP4 and close.

### Educator / Presenter
> “I record tutorials and want to cut out only the key parts.”
- Open **Recorder** → record screen + webcam.  
- Move to **Editor** → trim and align sections.  
- Export polished MP4 for upload.

### Casual User
> “I just need to cut the start and end of a single clip.”
- Open app → drag file into **Uploader** → auto-load in **Editor**.  
- Set in/out points → export immediately.

---

## 3. Key Features for MVP (24-Hour Focus)

| Module | Feature | Description |
|---------|----------|-------------|
| **Uploader** | Import MP4/MOV via drag-drop or picker | File validation + metadata preview. |
|  | Basic media library list | Displays imported clips with thumbnails and duration. |
| **Editor** | Video preview player | Play, pause, scrub with HTML5 `<video>`. |
|  | Simple timeline | Single track with draggable in/out markers. |
|  | Trim & export | Select start/end → FFmpeg export to MP4. |
| **Recorder** | *Optional placeholder* | UI stub for screen/webcam capture (actual capture added later). |

✅ **Navigation:** Users can move between modules using a left sidebar or tab bar.  
✅ **Persistence:** Imported clips stay accessible between module switches (local state or SQLite in Tauri backend).

---

## 4. Tech Stack

| Layer | Tool | Purpose |
|--------|------|---------|
| **Desktop Shell** | **Tauri (Rust)** | Lightweight, secure wrapper. Handles FFmpeg commands, file access, packaging. |
| **Frontend Framework** | **React + TypeScript (Vite)** | SPA with modular routing for each workspace. |
| **Media Engine** | **FFmpeg (Rust bindings or @ffmpeg/ffmpeg)** | Trim/export and, later, merge/record functions. |
| **UI Framework** | Tailwind CSS + Shadcn | Consistent design and responsive layout. |
| **Canvas Library (Timeline)** | Konva.js / Fabric.js | Timeline rendering and draggable markers. |
| **Storage** | Local filesystem via Tauri API or SQLite (for library metadata). |

---

## 5. Application Architecture

```mermaid
graph TD
    A[Tauri Shell] --> B[Uploader Module]
    A --> C[Editor Module]
    A --> D[Recorder Module]
    B -->|Pass Imported Files| C
    D -->|Pass Recorded Clips| C
    C -->|Export via FFmpeg| E[File System]
    subgraph UI
    B
    C
    D
    end
    subgraph Backend (Rust)
    E
    end
```

### Module Responsibilities
- **Uploader:** File ingestion, metadata extraction, thumbnail generation.  
- **Editor:** Trim, preview, export, timeline interaction.  
- **Recorder:** Capture (screen, webcam, audio) and push to library.

---

## 6. Non-MVP / Future Features

| Category | Features |
|-----------|-----------|
| **Recorder Expansion** | Screen + webcam + mic capture, PiP layout, recording to timeline. |
| **Editor Enhancements** | Multi-track timeline, clip splitting, snapping, transitions, filters. |
| **Uploader Upgrades** | Batch import, tagging, drag reordering, project folder management. |
| **Export Options** | Presets (YouTube, TikTok), resolution & bitrate control. |
| **Project Persistence** | Save/load project with serialized timeline state. |
| **Cloud Sync (Optional)** | Upload to Google Drive, Dropbox, etc. |

---

## 7. Potential Pitfalls & Considerations

| Area | Risk | Mitigation |
|-------|------|------------|
| **Inter-Module Data Flow** | State reset when switching modules. | Centralize app state (Zustand or Recoil) or use Rust backend store. |
| **FFmpeg Commands** | Syntax differences across OS. | Abstract via Tauri command layer, test on Windows/macOS. |
| **Performance** | Timeline re-render on video scrub. | Throttle time updates; lazy thumbnail updates. |
| **Build Size** | FFmpeg and Rust deps increase size. | Use static binaries, strip debug info, minify React. |
| **Permissions** | Screen capture APIs differ by OS. | Use conditional compile features in Rust for macOS/Windows. |

---

## 8. 24-Hour MVP Build Plan

| Phase | Task | Duration |
|--------|------|----------|
| **1. Setup** | Tauri + React + Routing (Uploader, Editor, Recorder views) | 1 hr |
| **2. Uploader** | Implement file import & preview metadata | 2 hr |
| **3. Editor** | Add `<video>` preview + timeline markers | 3 hr |
| **4. FFmpeg Trim/Export** | Rust command for trimming MP4 | 3 hr |
| **5. Navigation** | Enable module switching (React Router / tabs) | 1 hr |
| **6. Packaging** | Build desktop app via `tauri build` | 2 hr |
| **7. Testing & Docs** | Verify import → edit → export loop | 2 hr |
| **Total:** | 24 hrs | ✅ MVP shipped |

---

## 9. Definition of Done (MVP)

- App launches as a Tauri desktop build.  
- User can move between **Uploader → Editor → Recorder** views.  
- Can import, trim, preview, and export a clip successfully.  
- Core UI works offline.  
- README and short demo video ready.

---

## 10. Roadmap for Full 48-Hour Sprint

| Sprint Phase | Milestones |
|---------------|-------------|
| **MVP (Day 1)** | Import → Preview → Trim → Export. |
| **Final (Day 2)** | Add recording module + improve timeline & export options. |
| **Stretch Goals** | Add filters, transitions, or YouTube export presets. |

