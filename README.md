# 🎬 FreeConvert

> Free, private, and fast video converter that works entirely in your browser using FFmpeg WebAssembly.

[![GitHub License](https://img.shields.io/github/license/Shoaibashk/FreeConvert)](LICENSE)
[![Deploy](https://github.com/Shoaibashk/FreeConvert/actions/workflows/deploy.yml/badge.svg)](https://github.com/Shoaibashk/FreeConvert/actions/workflows/deploy.yml)

## ✨ Features

- **🔒 100% Private** - Your files never leave your device. All processing happens locally in your browser.
- **⚡ Lightning Fast** - Powered by FFmpeg WebAssembly for near-native performance.
- **📱 Responsive Design** - Modern UI that works seamlessly on desktop and mobile devices.
- **📲 Installable PWA** - Install as a Progressive Web App and use offline.
- **🌙 Dark Mode** - Toggle between light and dark themes.
- **🎥 Multiple Formats** - Convert between MP4, MOV, AVI, MKV, and WEBM.
- **💾 No Upload Required** - Convert files up to 50GB without uploading to any server.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/Shoaibashk/FreeConvert.git
cd FreeConvert

# Install dependencies
npm install
# or
pnpm install
```

### Development

```bash
# Start development server
npm run dev
# or
pnpm dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
# Build for production
npm run build
# or
pnpm build
```

### Deploy

```bash
# Deploy to GitHub Pages
npm run deploy
# or
pnpm deploy
```

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Next-generation frontend tooling
- **Tailwind CSS** - Utility-first CSS framework
- **FFmpeg WASM** - WebAssembly port of FFmpeg for video processing
- **Framer Motion** - Animation library
- **Radix UI** - Unstyled, accessible components
- **vite-plugin-pwa** - PWA support with Workbox

## 📱 PWA Support

FreeConvert is a fully-featured Progressive Web App:

- **Installable** - Click "Install App" in the navigation to install on your device
- **Offline Support** - Works without internet connection after installation
- **Fast Loading** - Service worker caches assets for instant loading

## 🔐 Privacy

FreeConvert is designed with privacy in mind:

- All video processing happens locally in your browser using WebAssembly
- No files are ever uploaded to any server
- No analytics or tracking
- No user data collection

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Shoaibashk**

- Website: [shoaibashk.github.io](https://shoaibashk.github.io)
- GitHub: [@Shoaibashk](https://github.com/Shoaibashk)

## 🙏 Acknowledgments

- [FFmpeg](https://ffmpeg.org/) - The powerful multimedia framework
- [FFmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm) - FFmpeg WebAssembly port
- [Vite](https://vitejs.dev/) - The blazing fast build tool
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
