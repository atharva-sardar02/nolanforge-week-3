# NolanForge - Video Editor

A modern, intuitive desktop video editor built with Tauri, React, and FFmpeg.

## Features

✅ **Media Library** - Import and manage your video files  
✅ **Video Player** - High-quality video playback with controls  
✅ **Timeline** - Visual timeline with trim markers  
✅ **Trim Controls** - Precise in/out point selection  
✅ **Export** - Export trimmed videos with FFmpeg  
🚧 **Recorder** - Screen recording (coming soon)

## Prerequisites

Before running NolanForge, you need to install **FFmpeg**:

### Windows

**Option 1: Using Chocolatey (Recommended)**
```bash
choco install ffmpeg
```

**Option 2: Using Scoop**
```bash
scoop install ffmpeg
```

**Option 3: Using Winget**
```bash
winget install --id=Gyan.FFmpeg -e
```

**Option 4: Manual Installation**
1. Download from [gyan.dev/ffmpeg/builds](https://www.gyan.dev/ffmpeg/builds/) (get "ffmpeg-release-essentials.zip")
2. Extract to `C:\ffmpeg`
3. Add to PATH:
   - Press `Win + R`, type `sysdm.cpl`, press Enter
   - Go to "Advanced" tab → "Environment Variables"
   - Under "System variables", select "Path" → "Edit"
   - Click "New" and add `C:\ffmpeg\bin`
   - Click "OK" on all windows
4. Restart your terminal/PowerShell

### macOS
```bash
brew install ffmpeg
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install ffmpeg
```

### Verify Installation
After installing, verify FFmpeg is accessible:
```bash
ffmpeg -version
```

## Development

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run tauri dev
```

### Build for Production
```bash
npm run tauri build
```

## Usage

1. **Import Videos**: Go to the Uploader tab and drag & drop or browse for video files
2. **Edit Video**: Click "Edit" on any video in the Media Library
3. **Set Trim Points**: 
   - Use the timeline to drag trim markers
   - Or click "Set In" / "Set Out" buttons
   - Keyboard shortcuts: `I` (in point), `O` (out point)
4. **Export**: Click the "Export Trimmed Video" button and select where to save

### Keyboard Shortcuts

- `Space` / `K` - Play/Pause
- `←` / `→` - Step backward/forward by 1 frame
- `J` / `L` - Rewind/Fast forward
- `I` - Set trim start (in point)
- `O` - Set trim end (out point)
- `Home` / `End` - Go to start/end of video
- `F` - Toggle fullscreen
- `M` - Toggle mute

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Desktop Shell**: Tauri (Rust)
- **Video Processing**: FFmpeg
- **State Management**: Zustand
- **Testing**: Vitest, React Testing Library

## Project Structure

```
nolanforge-week-3/
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── routes/            # Page components
│   ├── state/             # Zustand stores
│   ├── hooks/             # Custom React hooks
│   └── utils/             # Utility functions
├── src-tauri/             # Rust/Tauri backend
│   └── src/
│       ├── commands.rs    # Tauri commands
│       └── lib.rs         # Main entry point
└── memory-bank/           # Project documentation
```

## License

MIT
