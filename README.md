# NolanForge - Video Editor

A modern, intuitive desktop video editor built with Tauri, React, and FFmpeg. NolanForge provides a lightweight, offline solution for rapid video editing with professional features.

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [System Requirements](#system-requirements)
- [Installation](#installation)
  - [Quick Start (Using Pre-built Installer)](#quick-start-using-pre-built-installer)
  - [Building from Source](#building-from-source)
- [Prerequisites Setup](#prerequisites-setup)
  - [FFmpeg Installation](#ffmpeg-installation)
  - [Node.js Installation](#nodejs-installation)
  - [Rust Installation](#rust-installation)
- [Development Setup](#development-setup)
- [Usage Guide](#usage-guide)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## About

NolanForge is a desktop video editing application designed for content creators, educators, and casual users who need quick video trimming and basic editing capabilities. Unlike heavy video editors, NolanForge is lightweight, works completely offline, and focuses on essential editing features with a modern, intuitive interface.

**Key Advantages:**
- ✅ **Lightweight**: Small bundle size compared to traditional video editors
- ✅ **Offline**: No cloud dependencies, works without internet
- ✅ **Fast**: Quick startup and responsive UI
- ✅ **Cross-Platform**: Windows, macOS, and Linux support
- ✅ **Professional Features**: Multi-track editing, AI transcription, advanced timeline

## Features

### Core Editing
✅ **Media Library** - Import and manage video files with drag-and-drop support  
✅ **Video Player** - High-quality video playback with seamless multi-clip playback  
✅ **Multi-Clip Timeline** - Visual timeline with multiple clips and global trim handles  
✅ **Trim Controls** - Precise in/out point selection with keyboard shortcuts  
✅ **Multi-Track Editing** - Professional multi-track timeline with overlay support  
✅ **Timeline Zoom** - Configurable zoom levels with keyboard shortcuts and mouse wheel  
✅ **Thumbnail Previews** - Automatic thumbnail generation for media library and timeline  
✅ **Export** - Export trimmed videos or multi-clip compositions with FFmpeg  

### Recording Module
✅ **Webcam Recording** - Record from your webcam with live preview  
✅ **Screen Recording** - Capture your screen with display selection  
✅ **Combined Recording** - Record screen + webcam simultaneously with canvas composition  
✅ **Audio Mixing** - Web Audio API mixing for system audio + microphone  

### Advanced Features
✅ **Timeline Editing Tools** - Split and delete clips with keyboard shortcuts  
✅ **Drag & Drop** - Intuitive drag-and-drop for media library and timeline  
✅ **Multi-Clip Export** - Export multiple clips with global trim range  
✅ **AI Transcription** - OpenAI Whisper integration for video transcription  
✅ **Transcript Export** - Export transcripts in multiple formats (SRT, VTT, TXT, JSON)  
✅ **Settings Panel** - Secure API key management for transcription features

## System Requirements

### Minimum Requirements

**Windows:**
- Windows 10 (64-bit) or later
- 4 GB RAM
- 500 MB free disk space
- FFmpeg installed and accessible in PATH

**macOS:**
- macOS 10.15 (Catalina) or later
- 4 GB RAM
- 500 MB free disk space
- FFmpeg installed (via Homebrew recommended)

**Linux:**
- Ubuntu 20.04 / Debian 11 or later
- 4 GB RAM
- 500 MB free disk space
- FFmpeg installed via package manager

### Recommended Requirements

- 8 GB RAM or more
- 2 GB free disk space
- Multi-core processor (for faster video processing)
- Dedicated graphics card (for smoother video playback)

## Installation

### Quick Start (Using Pre-built Installer)

**For End Users:** Download and run the installer - no development tools needed!

1. **Download the Latest Release**
   - Go to the [Releases](../../releases) page
   - Download `NolanForge_1.0.0_x64-setup.exe` (NSIS installer) for Windows
   - Or download `NolanForge_1.0.0_x64_en-US.msi` (MSI installer) for Windows

2. **Install FFmpeg** (Required)
   - See [FFmpeg Installation](#ffmpeg-installation) section below
   - Verify installation: Open terminal and run `ffmpeg -version`

3. **Run the Installer**
   - Double-click the downloaded installer file
   - Follow the installation wizard
   - Accept the license agreement
   - Choose installation location (default is recommended)
   - Click "Install" and wait for completion

4. **Launch NolanForge**
   - Find "NolanForge" in your Start Menu (Windows) or Applications folder (macOS)
   - Double-click to launch
   - The app will verify FFmpeg installation on first launch

**Note:** If you see an error about FFmpeg not being found, refer to the [Troubleshooting](#troubleshooting) section.

### Building from Source

**For Developers:** Build the application from source code.

#### Step 1: Install Prerequisites

Install all required tools before proceeding:

1. **Install Node.js** (v18 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify: `node --version` (should show v18+)
   - Verify: `npm --version` (should show v9+)

2. **Install Rust** (Latest stable version)
   - Download from [rustup.rs](https://rustup.rs/)
   - Windows: Download and run `rustup-init.exe`
   - macOS/Linux: Run `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
   - Verify: `rustc --version` (should show rustc 1.70+)
   - Verify: `cargo --version`

3. **Install FFmpeg** (See detailed instructions below)

4. **Install Git** (for cloning repository)
   - Windows: Download from [git-scm.com](https://git-scm.com/download/win)
   - macOS: `brew install git` or download from git-scm.com
   - Linux: `sudo apt install git`

#### Step 2: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/nolanforge-week-3.git

# Navigate to project directory
cd nolanforge-week-3
```

#### Step 3: Install Dependencies

```bash
# Install Node.js dependencies
npm install

# This will download all required packages (~200MB)
# Wait for completion - may take 2-5 minutes
```

**Expected Output:**
```
added 1234 packages in 2m
```

**If you encounter errors:**
- Ensure Node.js version is v18+: `node --version`
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`, then run `npm install` again

#### Step 4: Verify Prerequisites

Before running the app, verify all prerequisites:

```bash
# Check Node.js
node --version  # Should be v18 or higher

# Check npm
npm --version   # Should be v9 or higher

# Check Rust
rustc --version # Should show version number

# Check cargo
cargo --version # Should show version number

# Check FFmpeg (CRITICAL)
ffmpeg -version # Should show FFmpeg version and build info
```

**If FFmpeg check fails:** See [FFmpeg Installation](#ffmpeg-installation) section.

#### Step 5: Run Development Server

```bash
# Start the development server
npm run tauri dev
```

**What to Expect:**
1. First time: Cargo will download Rust dependencies (~5-10 minutes)
2. Vite dev server starts (frontend)
3. Tauri builds the Rust backend
4. Desktop window opens automatically

**Expected Output:**
```
  VITE v7.x.x  ready in 500 ms
  ➜  Local:   http://localhost:1420/
  ➜  Network: use --host to expose
  App: Compiling Rust...
  App: Build complete!
  App window opened!
```

**First Build Time:** 5-15 minutes (downloads Rust dependencies)  
**Subsequent Builds:** 30 seconds - 2 minutes

#### Step 6: Build for Production

```bash
# Build production-ready installer
npm run tauri build
```

**What to Expect:**
1. TypeScript compilation
2. React production build (Vite)
3. Rust release build (optimized)
4. Installer creation (MSI/EXE for Windows)

**Build Time:** 10-20 minutes (first time), 5-10 minutes (subsequent)

**Output Location:**
- Windows: `src-tauri/target/release/bundle/msi/` and `nsis/`
- macOS: `src-tauri/target/release/bundle/dmg/`
- Linux: `src-tauri/target/release/bundle/appimage/` or `deb/`

## Prerequisites Setup

### FFmpeg Installation

FFmpeg is **required** for video processing. The app will not work without it.

#### Windows

**Option 1: Using Chocolatey (Easiest)**
```bash
# Install Chocolatey first (if not installed)
# Run PowerShell as Administrator, then:
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install FFmpeg
choco install ffmpeg

# Verify installation
ffmpeg -version
```

**Option 2: Using Scoop**
```bash
# Install Scoop first (if not installed)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Install FFmpeg
scoop install ffmpeg

# Verify installation
ffmpeg -version
```

**Option 3: Using Winget**
```bash
# Install FFmpeg
winget install --id=Gyan.FFmpeg -e

# Verify installation
ffmpeg -version
```

**Option 4: Manual Installation**
1. Download FFmpeg from [gyan.dev/ffmpeg/builds](https://www.gyan.dev/ffmpeg/builds/)
   - Get "ffmpeg-release-essentials.zip"
2. Extract to `C:\ffmpeg` (create folder if needed)
3. Add to PATH:
   - Press `Win + R`, type `sysdm.cpl`, press Enter
   - Go to "Advanced" tab → "Environment Variables"
   - Under "System variables", select "Path" → "Edit"
   - Click "New" and add: `C:\ffmpeg\bin`
   - Click "OK" on all windows
4. **Restart your terminal/PowerShell** (important!)
5. Verify: `ffmpeg -version`

#### macOS

**Using Homebrew (Recommended)**
```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install FFmpeg
brew install ffmpeg

# Verify installation
ffmpeg -version
```

**Manual Installation**
1. Download FFmpeg from [evermeet.cx/ffmpeg](https://evermeet.cx/ffmpeg/)
2. Extract and move `ffmpeg` to `/usr/local/bin/`
3. Or use the static build and add to PATH manually

#### Linux (Ubuntu/Debian)

```bash
# Update package list
sudo apt update

# Install FFmpeg
sudo apt install ffmpeg

# Verify installation
ffmpeg -version
```

**For other Linux distributions:**
- Fedora: `sudo dnf install ffmpeg`
- Arch: `sudo pacman -S ffmpeg`
- OpenSUSE: `sudo zypper install ffmpeg`

#### Verify FFmpeg Installation

After installation, verify it works:

```bash
ffmpeg -version
```

**Expected Output:**
```
ffmpeg version 6.x.x (or higher)
built with ...
configuration: ...
libavutil      57.xx.xxx
libavcodec     59.xx.xxx
libavformat    59.xx.xxx
...
```

**If you get "command not found":**
- FFmpeg is not in your PATH
- Restart your terminal/PowerShell
- Check PATH environment variable
- Reinstall FFmpeg or add to PATH manually

### Node.js Installation

**Required Version:** Node.js v18 or higher

#### Windows

1. Download from [nodejs.org](https://nodejs.org/)
2. Choose "LTS" version (recommended)
3. Run installer (.msi file)
4. Follow installation wizard
5. Verify: Open PowerShell and run:
   ```bash
   node --version  # Should show v18.x.x or higher
   npm --version   # Should show v9.x.x or higher
   ```

#### macOS

**Using Homebrew:**
```bash
brew install node
```

**Manual Installation:**
1. Download from [nodejs.org](https://nodejs.org/)
2. Run installer (.pkg file)
3. Verify: `node --version` and `npm --version`

#### Linux

**Ubuntu/Debian:**
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version
npm --version
```

### Rust Installation

**Required Version:** Latest stable Rust

#### All Platforms

1. Go to [rustup.rs](https://rustup.rs/)
2. Download and run the installer:
   - **Windows:** Download `rustup-init.exe` and run it
   - **macOS/Linux:** Run `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
3. Follow the prompts (default options are fine)
4. Verify installation:
   ```bash
   rustc --version  # Should show rustc 1.70+ or higher
   cargo --version  # Should show cargo version
   ```

**Note:** First Rust installation downloads ~200MB of toolchain components. This is normal.

## Development Setup

### Initial Setup

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd nolanforge-week-3
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Rust** (if not already installed)
   - See [Rust Installation](#rust-installation) above

4. **Install FFmpeg** (required)
   - See [FFmpeg Installation](#ffmpeg-installation) above

### Running Development Server

```bash
npm run tauri dev
```

**What Happens:**
- Frontend dev server starts (Vite on http://localhost:1420)
- Rust backend compiles
- Desktop window opens automatically
- Hot reload enabled (changes auto-refresh)

### Available Scripts

```bash
# Development
npm run tauri dev          # Start development server
npm run dev                # Start Vite dev server only (no Tauri)

# Testing
npm test                   # Run tests in watch mode
npm run test:ui            # Run tests with UI
npm run test:run           # Run tests once

# Building
npm run build              # Build frontend only
npm run tauri build        # Build full desktop app
```

### Project Structure

```
nolanforge-week-3/
├── src/                          # Frontend source
│   ├── components/               # React components
│   │   ├── VideoPlayer.tsx       # Video playback component
│   │   ├── ContinuousTimeline.tsx # Multi-clip timeline
│   │   ├── MultiTrackVideoPlayer.tsx # Multi-track preview
│   │   ├── MediaLibrary.tsx      # Media library with thumbnails
│   │   ├── RecorderControls.tsx  # Recording controls
│   │   ├── TranscriptionPanel.tsx # AI transcription UI
│   │   └── ...                   # Other components
│   ├── routes/                   # Page components
│   │   ├── Uploader.tsx          # File import module
│   │   ├── Editor.tsx            # Video editing module
│   │   └── Recorder.tsx          # Recording module
│   ├── state/                    # Zustand stores
│   │   ├── mediaStore.ts         # Media file management
│   │   ├── editState.ts          # Timeline editing state
│   │   ├── recordingState.ts     # Recording state
│   │   └── trackState.ts         # Multi-track state
│   ├── hooks/                    # Custom React hooks
│   │   ├── useExport.ts          # Export logic
│   │   ├── useMediaRecorder.ts   # Recording API
│   │   └── useTranscription.ts    # Transcription state
│   ├── utils/                    # Utility functions
│   │   ├── fileUtils.ts           # File operations & thumbnails
│   │   ├── timelineOps.ts        # Timeline operations
│   │   ├── videoComposition.ts    # Canvas composition
│   │   └── ...                   # Other utilities
│   └── types/                    # TypeScript types
├── src-tauri/                    # Rust/Tauri backend
│   └── src/
│       ├── commands.rs           # FFmpeg & API commands
│       ├── services/
│       │   └── openai.rs         # OpenAI integration
│       └── lib.rs                # Main entry point
├── docs/                         # Documentation
│   ├── architecture.md           # Architecture documentation
│   └── tasks.md                  # Development tasks reference
├── memory-bank/                  # Project documentation
└── LICENSE                       # MIT License
```

## Usage Guide

### Basic Workflow

1. **Import Videos**: Go to the Uploader tab and drag & drop or browse for video files (MP4/MOV)
2. **Add to Timeline**: Click "Edit" on any video or drag it directly to the timeline
3. **Edit Clips**:
   - Use the timeline to drag trim markers
   - Or click "Set In" / "Set Out" buttons
   - Use keyboard shortcuts: `I` (in point), `O` (out point)
   - Click on timeline to seek to specific position
4. **Multi-Clip Editing**: 
   - Add multiple clips to the timeline
   - Set global trim range (green/purple handles) for export
   - Use multi-track mode for overlay effects
5. **Export**: Click the "Export Trimmed Video" button and select where to save

### Recording

1. **Go to Recorder**: Navigate to the Recorder tab
2. **Choose Mode**: Select Webcam, Screen, or Combined recording
3. **Start Recording**: Click "Start Recording" after granting permissions
4. **Stop & Save**: Click "Stop Recording" then choose:
   - "Save to Disk" - Save to a file location
   - "Add to Timeline" - Automatically import to timeline

### AI Transcription

1. **Configure API Key**: Go to Settings (⚙️) and enter your OpenAI API key
2. **Transcribe**: Click the transcription button on any video in Media Library or Editor
3. **Export Transcript**: Choose format (SRT, VTT, TXT, JSON) and save

### Keyboard Shortcuts

#### Playback Controls
- `Space` / `K` - Play/Pause
- `←` / `→` - Step backward/forward by 1 frame
- `J` / `L` - Rewind/Fast forward
- `Home` / `End` - Go to start/end of video
- `F` - Toggle fullscreen
- `M` - Toggle mute

#### Editing Controls
- `I` - Set trim start (in point)
- `O` - Set trim end (out point)
- `Ctrl + S` - Split clip at playhead
- `Delete` - Remove selected clip from timeline

#### Timeline Zoom
- `Ctrl + Plus` / `Ctrl + =` - Zoom in
- `Ctrl + Minus` - Zoom out
- `Ctrl + 0` - Reset zoom
- `Ctrl + Mouse Wheel` - Zoom with mouse wheel

## Troubleshooting

### Common Issues

#### "FFmpeg not found" Error

**Symptom:** App shows error: "FFmpeg is not installed"

**Solutions:**
1. **Verify FFmpeg is installed:**
   ```bash
   ffmpeg -version
   ```
   If this fails, FFmpeg is not in your PATH.

2. **Windows:**
   - Restart your terminal/PowerShell after installing FFmpeg
   - Check PATH: `echo $env:PATH` (PowerShell) or `echo %PATH%` (CMD)
   - Manually add FFmpeg to PATH if needed

3. **macOS/Linux:**
   - Check PATH: `echo $PATH`
   - Ensure FFmpeg binary is in a directory listed in PATH
   - Try: `which ffmpeg` to find installed location

4. **Restart the app** after fixing PATH

#### "npm install" Fails

**Symptoms:** Errors during `npm install`

**Solutions:**
1. **Check Node.js version:**
   ```bash
   node --version  # Must be v18+
   ```

2. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

3. **Delete and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Check internet connection** (npm needs to download packages)

5. **Try different npm registry:**
   ```bash
   npm install --registry https://registry.npmjs.org/
   ```

#### "cargo build" Fails

**Symptoms:** Rust compilation errors

**Solutions:**
1. **Update Rust:**
   ```bash
   rustup update
   ```

2. **Check Rust installation:**
   ```bash
   rustc --version
   cargo --version
   ```

3. **Clean build:**
   ```bash
   cd src-tauri
   cargo clean
   cd ..
   npm run tauri dev
   ```

4. **Check disk space** (Rust toolchain needs ~1GB)

#### App Window Doesn't Open

**Symptoms:** `npm run tauri dev` completes but no window appears

**Solutions:**
1. **Check console output** for errors
2. **Check firewall/antivirus** blocking app
3. **Try running as administrator** (Windows)
4. **Check graphics drivers** are up to date
5. **Try building and running installer** instead

#### Video Won't Play

**Symptoms:** Video loads but doesn't play

**Solutions:**
1. **Check video format** - Supported: MP4, MOV, WebM
2. **Check codec** - H.264 video codec recommended
3. **Check file permissions** - Ensure file is readable
4. **Try different video file** to isolate issue
5. **Check browser console** (F12) for errors

#### Export Fails

**Symptoms:** Export button doesn't work or shows error

**Solutions:**
1. **Verify FFmpeg installation** (see above)
2. **Check output path** - Ensure write permissions
3. **Check disk space** - Ensure enough free space
4. **Check video file paths** - Ensure source files still exist
5. **Try simpler export** - Single clip before multi-clip

#### Recording Doesn't Work

**Symptoms:** Can't record webcam/screen

**Solutions:**
1. **Grant permissions** - Browser/app permissions for camera/microphone
2. **Check devices** - Ensure camera/microphone are connected
3. **Check other apps** - Close apps using camera/microphone
4. **Try different browser** - If using web version
5. **Check system settings** - Privacy settings for camera/microphone access

### Getting Help

If you encounter issues not covered here:

1. **Check existing issues:** [GitHub Issues](../../issues)
2. **Create a new issue:** Include:
   - Operating system and version
   - Node.js version (`node --version`)
   - Rust version (`rustc --version`)
   - FFmpeg version (`ffmpeg -version`)
   - Error messages or logs
   - Steps to reproduce

3. **Check documentation:**
   - [Architecture Documentation](docs/architecture.md)
   - [Development Tasks](docs/tasks.md)

## FAQ

### Do I need an internet connection?

**Answer:** No! NolanForge works completely offline. The only feature that requires internet is AI transcription (OpenAI Whisper API), which is optional.

### Can I use this without FFmpeg?

**Answer:** No. FFmpeg is required for video processing. The app will not work without it. See [FFmpeg Installation](#ffmpeg-installation) section.

### What video formats are supported?

**Answer:** 
- Import: MP4, MOV, WebM
- Export: MP4 (H.264 codec)

### Is this free?

**Answer:** Yes! NolanForge is open-source and free to use. However, AI transcription requires an OpenAI API key (you pay OpenAI for usage).

### Can I contribute?

**Answer:** Yes! Contributions are welcome. See [Contributing](#contributing) section.

### Does this work on Mac/Linux?

**Answer:** Yes! NolanForge supports Windows, macOS, and Linux. Build instructions are the same, but installers may differ.

### Why is the first build so slow?

**Answer:** First build downloads Rust toolchain (~200MB) and compiles everything from source. Subsequent builds are much faster (cached).

### Can I customize keyboard shortcuts?

**Answer:** Not yet, but this feature is planned for a future release.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS v4
- **Desktop Shell**: Tauri (Rust)
- **Video Processing**: FFmpeg (for trimming, concatenation, and audio extraction)
- **State Management**: Zustand
- **Audio Processing**: Web Audio API
- **Canvas Composition**: HTML5 Canvas API
- **AI Integration**: OpenAI Whisper API
- **Testing**: Vitest, React Testing Library

## Features in Detail

### Multi-Clip Timeline
- Visual representation of all clips on a horizontal timeline
- Global trim handles (green start, purple end) for export range
- Click-to-seek functionality
- Drag-and-drop clip positioning
- Seamless playback between clips

### Multi-Track Editing
- Track 0 (Main): Primary video track
- Track 1 (Overlay): Picture-in-picture overlay track
- Track controls: Mute, Solo, Lock, Visibility
- Overlay controls: Position, Size, Opacity, Blend modes
- Real-time preview with canvas composition

### Recording Features
- **Webcam**: Full HD webcam recording with live preview
- **Screen**: Capture entire screen or specific window
- **Combined**: Screen + webcam with customizable overlay position
- **Audio Mixing**: System audio + microphone with balanced levels
- **Save Options**: Save to disk or automatically add to timeline

### AI Transcription
- Powered by OpenAI Whisper API
- Multiple export formats: SRT, VTT, TXT, JSON
- Word-level and segment-level timestamps
- Language detection
- Secure API key storage (local only)

### Timeline Editing
- Split clips at playhead position
- Delete clips from timeline
- Drag and drop clips between tracks
- Zoom controls (25% to 200%)
- Grid snapping (optional)
- Keyboard shortcuts for all operations

## Current Feature Set

NolanForge focuses on essential video editing features. The following features are **intentionally not included** in the current version:

- **Export Quality Options**: Currently exports at source quality. Quality/resolution presets are not planned.
- **Undo/Redo**: Basic undo/redo structure exists but is not fully implemented. This is intentional for MVP scope.
- **Text Overlays**: Transcription generates subtitle files (SRT/VTT) but video text overlay rendering is not included.
- **Transition Effects**: Seamless playback between clips without transition effects. This is intentional.
- **Autosave**: Manual saving via export is the current workflow. Autosave is not planned.

These decisions were made to keep NolanForge lightweight and focused on core editing workflows. The current feature set is considered complete for the MVP.

## Contributing

Contributions are welcome! Here's how you can help:

1. **Report Bugs:** Open an issue with detailed information
2. **Suggest Features:** Share your ideas in discussions
3. **Submit Pull Requests:** 
   - Fork the repository
   - Create a feature branch
   - Make your changes
   - Submit a pull request

**Development Guidelines:**
- Follow existing code style
- Add tests for new features
- Update documentation
- Ensure all tests pass before submitting

See [docs/tasks.md](docs/tasks.md) for development roadmap.

## License

MIT License - see [LICENSE](LICENSE) file for details

---

**Made with ❤️ using Tauri, React, and FFmpeg**
