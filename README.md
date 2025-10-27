# NolanForge

A modular desktop video editor built with Tauri (Rust) and React, designed for rapid, offline video editing.

## Features

- **📁 Uploader**: Import and organize video files (MP4/MOV)
- **✂️ Editor**: Trim, preview, and arrange clips on timeline
- **🎥 Recorder**: Capture new footage from screen or webcam
- **🎨 Modern UI**: Clean interface with dark/light theme support
- **⚡ Fast**: Native desktop performance with Rust backend
- **🔒 Offline**: Works completely offline, no cloud dependencies

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Tauri (Rust)
- **State Management**: Zustand
- **Testing**: Vitest + React Testing Library
- **Routing**: React Router

## Prerequisites

- **Node.js** (v18 or higher)
- **Rust** (latest stable)
- **FFmpeg** (for video processing)

## Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nolanforge-week-3
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run tauri dev
   ```

4. **Run tests**
   ```bash
   npm test
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── SidebarNav.tsx  # Navigation sidebar
│   └── __tests__/      # Component tests
├── routes/             # Page components
│   ├── Uploader.tsx    # File import module
│   ├── Editor.tsx      # Video editing module
│   └── Recorder.tsx    # Recording module
├── state/              # State management
│   ├── appState.ts     # Global app state (Zustand)
│   └── __tests__/      # State tests
├── test/               # Test configuration
│   └── setup.ts        # Test setup and mocks
└── App.tsx             # Main app component
```

## Available Scripts

- `npm run dev` - Start Vite dev server
- `npm run tauri dev` - Start Tauri development
- `npm run build` - Build for production
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:ui` - Run tests with UI

## Development Status

### ✅ Completed (PR 1.1 - PR 1.8)
- [x] Tauri project initialization
- [x] Tailwind CSS styling
- [x] Testing framework setup
- [x] React Router with 3 routes
- [x] Sidebar navigation with state management
- [x] Zustand state management
- [x] Comprehensive unit tests
- [x] Build verification

### 🚧 Next Steps (PR 2.1 - PR 6.3)
- [ ] File import and media library
- [ ] Video preview and clip selection
- [ ] Timeline and trim controls
- [ ] FFmpeg export functionality
- [ ] Packaging and distribution

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License.