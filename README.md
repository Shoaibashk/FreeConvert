<div align="center">
  <img src="public/android-chrome-512x512.png" alt="FreeConvert Logo" width="120" />
  
  # 🎬 FreeConvert

  **A privacy-first, browser-based video & audio converter powered by FFmpeg WebAssembly**

  [![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Visit_Site-blue?style=for-the-badge)](https://shoaibashk.github.io/FreeConvert)
  [![GitHub License](https://img.shields.io/github/license/Shoaibashk/FreeConvert?style=for-the-badge)](LICENSE)
  [![Deploy](https://img.shields.io/github/actions/workflow/status/Shoaibashk/FreeConvert/deploy.yml?style=for-the-badge&label=Deploy)](https://github.com/Shoaibashk/FreeConvert/actions/workflows/deploy.yml)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)

  <br />

  <img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" alt="line" />

  <p align="center">
    <strong>Zero uploads. Zero tracking. 100% client-side processing.</strong>
  </p>

  ![FreeConvert Demo](https://via.placeholder.com/800x450/1e293b/ffffff?text=FreeConvert+Demo+Screenshot)

</div>

---

## 🎯 Project Highlights

> **Why this project stands out for portfolio review:**

| Aspect | Implementation |
|--------|---------------|
| **🧠 Complex Problem** | Real-time video transcoding in the browser using WebAssembly |
| **🏗️ Architecture** | Custom React hooks, component composition, state management |
| **⚡ Performance** | Optimized FFmpeg args, progress streaming, memory management |
| **🎨 UI/UX** | Responsive design, dark mode, drag-and-drop, animations |
| **📱 PWA** | Offline-first, installable, service worker caching |
| **🔒 Privacy** | Zero-upload architecture, no analytics, no tracking |

---

## ✨ Features

<table>
  <tr>
    <td align="center" width="33%">
      <img src="https://img.icons8.com/fluency/96/000000/lock.png" width="48" />
      <br /><strong>100% Private</strong>
      <br /><sub>Files never leave your device</sub>
    </td>
    <td align="center" width="33%">
      <img src="https://img.icons8.com/fluency/96/000000/flash-on.png" width="48" />
      <br /><strong>Lightning Fast</strong>
      <br /><sub>Near-native WASM performance</sub>
    </td>
    <td align="center" width="33%">
      <img src="https://img.icons8.com/fluency/96/000000/wifi-off.png" width="48" />
      <br /><strong>Works Offline</strong>
      <br /><sub>Full PWA with service workers</sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="33%">
      <img src="https://img.icons8.com/fluency/96/000000/video-file.png" width="48" />
      <br /><strong>10 Formats</strong>
      <br /><sub>MP4, MOV, AVI, MKV, WEBM + Audio</sub>
    </td>
    <td align="center" width="33%">
      <img src="https://img.icons8.com/fluency/96/000000/full-moon.png" width="48" />
      <br /><strong>Dark Mode</strong>
      <br /><sub>System-aware theming</sub>
    </td>
    <td align="center" width="33%">
      <img src="https://img.icons8.com/fluency/96/000000/download.png" width="48" />
      <br /><strong>Installable</strong>
      <br /><sub>Add to home screen</sub>
    </td>
  </tr>
</table>

### Supported Formats

| Video Formats | Audio Formats |
|--------------|---------------|
| MP4, MOV, AVI, MKV, WEBM | MP3, OGG, WAV, AAC, FLAC |

---

## 🏗️ Architecture & Technical Deep Dive

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser Environment                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────────┐  │
│  │   React UI  │───▶│ Custom Hooks │───▶│ FFmpeg WASM Core  │  │
│  │  Components │    │  (Business   │    │  (Web Workers)    │  │
│  │             │◀───│   Logic)     │◀───│                   │  │
│  └─────────────┘    └──────────────┘    └───────────────────┘  │
│         │                  │                      │             │
│         ▼                  ▼                      ▼             │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────────┐  │
│  │  Tailwind   │    │ State Mgmt   │    │   Virtual FS      │  │
│  │  + Radix UI │    │ (useState)   │    │   (In-Memory)     │  │
│  └─────────────┘    └──────────────┘    └───────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                    Service Worker (PWA Cache)                    │
└─────────────────────────────────────────────────────────────────┘
```

### Core Hook: `useFFmpegConversion`

The heart of the application - a custom React hook that encapsulates all FFmpeg logic:

```typescript
// Simplified hook interface
const {
  loaded,              // FFmpeg WASM loaded state
  video,               // Current file reference
  videoPreviewURL,     // Blob URL for preview
  targetFormat,        // Selected output format
  progress,            // Real-time progress (0-100)
  isConverting,        // Conversion in progress
  convertedVideoURL,   // Output blob URL
  transcode,           // Start conversion
  cancel,              // Abort conversion
  resetState,          // Clear state
} = useFFmpegConversion();
```

### Key Technical Implementations

<details>
<summary><strong>🔧 FFmpeg WASM Integration</strong></summary>

```typescript
// Dynamic WASM loading with Blob URLs for cross-origin support
await ffmpeg.load({
  coreURL: await toBlobURL(ffmpegCore, "text/javascript"),
  wasmURL: await toBlobURL(ffmpegCoreWasm, "application/wasm"),
  workerURL: await toBlobURL(workerPath, "text/javascript"),
});
```

**Challenges Solved:**
- Cross-origin isolation for SharedArrayBuffer
- Memory management for large files
- Progress event streaming
- Graceful error handling (OOM, corrupt files)

</details>

<details>
<summary><strong>⚡ Optimized Encoding Presets</strong></summary>

```typescript
// Format-specific FFmpeg arguments for optimal quality/speed
const ffmpegArgs = {
  webm: ["-c:v", "libvpx", "-crf", "30", "-deadline", "realtime", "-cpu-used", "5"],
  mp4:  ["-c:v", "libx264", "-preset", "ultrafast", "-crf", "30", "-movflags", "+faststart"],
  mp3:  ["-c:a", "libmp3lame", "-b:a", "192k", "-ar", "44100"],
};
```

</details>

<details>
<summary><strong>📱 PWA Implementation</strong></summary>

```typescript
// Custom usePWA hook for install prompt handling
export function usePWA() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  
  // Captures beforeinstallprompt event for custom install UI
  // Handles appinstalled event for state sync
}
```

**PWA Features:**
- Workbox-powered service worker
- 50MB WASM file caching
- Offline-first architecture
- Custom install button

</details>

---

## 📁 Project Structure

```
src/
├── App.tsx                     # Main application component
├── main.tsx                    # React entry point
├── index.css                   # Global styles + Tailwind
│
├── components/
│   ├── converter/
│   │   ├── ConverterCard.tsx   # Main converter UI
│   │   ├── VideoPreview.tsx    # Video thumbnail + info
│   │   ├── ProgressBar.tsx     # Animated progress
│   │   ├── ActionButtons.tsx   # Convert/Download/Cancel
│   │   ├── StatusMessage.tsx   # Success/Error states
│   │   ├── StatsCard.tsx       # Privacy stats display
│   │   ├── TipsCard.tsx        # User tips
│   │   └── Footer.tsx          # App footer
│   │
│   └── ui/                     # Reusable UI components
│       ├── button.tsx          # CVA-powered button
│       ├── select.tsx          # Radix Select wrapper
│       ├── dropzone.tsx        # Drag-and-drop zone
│       ├── navbar.tsx          # Navigation + theme toggle
│       ├── confetti.tsx        # Success celebration
│       └── ...
│
├── hooks/
│   ├── useFFmpegConversion.ts  # 🧠 Core conversion logic
│   ├── usePWA.ts               # PWA install handling
│   └── useTheme.ts             # Dark mode management
│
├── lib/
│   └── utils.ts                # Utility functions (cn, etc.)
│
└── assets/
    └── ffmpeg-core.js          # FFmpeg WASM core
```

---

## 🛠️ Tech Stack

<table>
  <tr>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=react" width="48" height="48" alt="React" />
      <br>React 18
    </td>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=ts" width="48" height="48" alt="TypeScript" />
      <br>TypeScript
    </td>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=vite" width="48" height="48" alt="Vite" />
      <br>Vite
    </td>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=tailwind" width="48" height="48" alt="Tailwind" />
      <br>Tailwind
    </td>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=wasm" width="48" height="48" alt="WASM" />
      <br>FFmpeg WASM
    </td>
  </tr>
</table>

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 18, TypeScript 5.6, Vite 6 |
| **Styling** | Tailwind CSS 3.4, CVA, Framer Motion |
| **UI Components** | Radix UI, shadcn/ui patterns |
| **Video Processing** | FFmpeg WASM 0.12, Web Workers |
| **PWA** | Vite PWA Plugin, Workbox |
| **Code Quality** | ESLint, TypeScript strict mode |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **pnpm** (recommended) or npm

### Quick Start

```bash
# Clone the repository
git clone https://github.com/Shoaibashk/FreeConvert.git
cd FreeConvert

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Visit `http://localhost:5173` to see the app.

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with HMR |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build locally |
| `pnpm lint` | Run ESLint |
| `pnpm deploy` | Deploy to GitHub Pages |

---

## 🌐 Deployment

### GitHub Pages (Current)

```bash
pnpm build && pnpm deploy
```

### Vercel / Netlify / Cloudflare Pages

This project is **fully static** and works on any static hosting:

```bash
pnpm build
# Deploy the `dist/` folder
```

> **Note:** No special headers required! The app uses single-threaded FFmpeg WASM that doesn't need `SharedArrayBuffer` or COOP/COEP headers.

---

## 🔐 Privacy & Security

```
┌────────────────────────────────────────────────┐
│          YOUR VIDEO FILE                        │
│              │                                  │
│              ▼                                  │
│    ┌─────────────────┐                         │
│    │  Browser Memory │  ◀── Never leaves here  │
│    │   (In-Memory)   │                         │
│    └────────┬────────┘                         │
│             │                                  │
│             ▼                                  │
│    ┌─────────────────┐                         │
│    │  FFmpeg WASM    │                         │
│    │  (Processing)   │                         │
│    └────────┬────────┘                         │
│             │                                  │
│             ▼                                  │
│    ┌─────────────────┐                         │
│    │ Converted File  │  ◀── Downloaded locally │
│    └─────────────────┘                         │
│                                                │
│  ❌ No server uploads    ❌ No analytics       │
│  ❌ No tracking          ❌ No cookies         │
└────────────────────────────────────────────────┘
```

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Ideas for Contribution

- [ ] Batch file conversion
- [ ] Custom FFmpeg command input
- [ ] Video trimming/cropping
- [ ] Subtitle embedding
- [ ] Quality presets (Low/Medium/High)

---

## 📄 License

This project is licensed under the **Apache License 2.0** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/Shoaibashk">
        <img src="https://github.com/Shoaibashk.png" width="100px;" alt="Shoaibashk" style="border-radius:50%"/>
        <br />
        <sub><b>Shoaibashk</b></sub>
      </a>
      <br />
      <a href="https://shoaibashk.github.io" title="Website">🌐</a>
      <a href="https://github.com/Shoaibashk" title="GitHub">💻</a>
    </td>
  </tr>
</table>

---

## 🙏 Acknowledgments

- [FFmpeg](https://ffmpeg.org/) - The powerful multimedia framework
- [FFmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm) - FFmpeg WebAssembly port
- [Vite](https://vitejs.dev/) - The blazing fast build tool
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives

---

<div align="center">
  <br />
  <p>
    <strong>If you found this project helpful, please consider giving it a ⭐!</strong>
  </p>
  
  Made with ❤️ and lots of ☕
</div>
