---
title: Frogmusic
emoji: 🌍
colorFrom: pink
colorTo: indigo
sdk: docker
pinned: false
license: mit
---

# 🐸 Frog Music — Cozy Retro Music & Video Player

A premium, full-stack cozy music & video streaming web app powered by `yt-dlp` and React. Search and stream any song or video directly — with a beautiful, cozy pixel-art layout and offline PWA capability.

![Status](https://img.shields.io/badge/Status-Live-brightgreen)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB)
![Python](https://img.shields.io/badge/Backend-Python%203-3776AB)
![yt-dlp](https://img.shields.io/badge/Streaming-yt--dlp-FF0000)

![Frog Music Preview](preview.png)

---

## ✨ Features

### 🎵 Music Mode
- 🔍 **Instant Search** — Search any song, artist, or album with real-time results
- 🎧 **HQ Audio Streaming** — Selectable quality: Low / Normal / High via `yt-dlp`
- 🎚️ **Equalizer** — Real-time Bass, Mid, Treble control using Web Audio API
- 🎤 **Synced Lyrics** — Auto-scrolling lyrics display while playing
- 🌙 **Sleep Timer** — Auto-pause after 15 / 30 / 45 / 60 minutes
- ❤️ **Library & Playlists** — Like songs, create custom playlists (stored in localStorage)
- 🔀 **Queue, Shuffle & Repeat** — Full playback control with history
- 🔒 **Media Session API** — Lock-screen controls & background playback on mobile
- 📻 **Radio / Autoplay** — Smart genre/era detection (90s, Lofi, Romantic, Rap etc.) auto-queues similar songs when queue ends

### 🎬 Video Mode
- 📺 **YouTube Video Player** — Full-screen modal with keyboard shortcuts (`F` Fullscreen, `M` Mini, `Esc` Close)
- 🖼️ **Draggable Mini Player** — Floating PiP-style player for background browsing (desktop)
- 🔄 **Landscape Rotation** — One-tap rotate-to-fullscreen for mobile/tablet (Screen Orientation API)
- ▶️ **Video Autoplay** — Related videos auto-play when current video ends (with autoplay toggle)
- 📋 **Watch Later** — Save any video to Watch Later (synced with localStorage)
- 📡 **Channel View** — Click any channel name to browse that channel's videos
- 🏠 **Dedicated Video Home** — Cinematic banner, category filters, popular channels & format cards

### 🎨 UI & General
- 🌗 **Dual Mode Sidebar** — Music ↔ Video toggle with contextual Home button
- 🎨 **Dynamic Themes** — Multiple accent colors + auto-extract color from album art
- 📱 **Fully Responsive** — Optimized for desktop, tablet & mobile (1–4 column grid)
- 💾 **Persistent State** — Mode, queue, history, saved videos, theme all persisted via localStorage
- ⚡ **In-Memory Cache** — Fast repeated searches and streams
- 🔔 **Toast Notifications** — Smooth slide-in notifications for all actions
- ✨ **Glassmorphism UI** — Premium dark design with smooth micro-animations

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js, Vite, Vanilla CSS |
| **Backend** | Python 3 (stdlib `http.server`, `ThreadingMixIn`) |
| **Streaming** | yt-dlp (mweb client spoof for reliability) |
| **Styling** | Glassmorphism, CSS Grid, Responsive breakpoints |
| **Browser APIs** | Web Audio API, Media Session API, Screen Orientation API, Fullscreen API |
| **Storage** | localStorage (playlists, history, queue, saved videos, preferences) |

---

## 📁 Project Structure

```
frog-music/
├── backend/
│   ├── server.py          # Python HTTP server + yt-dlp API endpoints
│   └── requirements.txt   # yt-dlp, requests
├── frontend/
│   ├── src/
│   │   ├── App.jsx                    # Main app state, logic & radio engine
│   │   ├── index.css                  # All styles (responsive + animations)
│   │   └── components/
│   │       ├── TopBar.jsx             # Search bar
│   │       ├── Sidebar.jsx            # Navigation (Home, Library, Mode toggle)
│   │       ├── MainContent.jsx        # Home / Video Home / Search / Library / Channel views
│   │       ├── PlayerBar.jsx          # Bottom player controls
│   │       ├── NowPlaying.jsx         # Full-screen music player overlay
│   │       └── VideoPlayer.jsx        # YouTube video modal (fullscreen + mini + rotate)
│   ├── index.html
│   ├── package.json
│   └── vite.config.js                 # Vite + proxy config (→ :5000)
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 18+ & npm

### Development Setup (Hot Reload)

**1. Clone the repo:**
```bash
git clone https://github.com/Aman-codes0-0/FrogMusic.git
cd FrogMusic
```

**2. Install & start the backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python server.py                # Runs on http://localhost:5000
```

**3. Install & start the frontend:**
```bash
cd ../frontend
npm install
npm run dev                     # Runs on http://localhost:5173
```

Open **http://localhost:5173** in your browser. 🎵

> **Note:** The Vite dev server proxies `/api/*` requests to the Python backend on port 5000.

---

### Production Build

```bash
cd frontend
npm run build          # Builds to frontend/dist/

cd ../backend
python server.py       # Serves both API + built frontend at http://localhost:5000
```

---

## 📱 Mobile Usage

- **Responsive Grid** — 4 columns → 2 → 1 based on screen size
- **Bottom player bar** with full playback controls
- **Rotate button** inside video player locks orientation to landscape fullscreen
- **Watch Later** saves videos locally for offline browsing

---

## ⌨️ Keyboard Shortcuts (Video Player)

| Key | Action |
|-----|--------|
| `F` | Toggle fullscreen |
| `M` | Toggle mini player |
| `Esc` | Close player |

---

## 📻 Smart Radio / Autoplay

When the music queue runs out and **Autoplay** is enabled:

- Detects **genre/era keywords** in the current song title (e.g. `90s`, `lofi`, `sad`, `romantic`, `rap`, `bhajan`)
- Auto-fetches similar songs and plays them seamlessly
- In **Video Mode** — plays the next search result or fetches a related video automatically

---

## ⚡ Performance Notes

- Search uses `ytsearch20` (top 20 results) for fast response (~2s)
- `ThreadedHTTPServer` handles search + playback in parallel (non-blocking)
- All search and stream results cached in-memory for instant replay
- YouTube Iframe Player API (`enablejsapi=1`) used for video-end detection via `postMessage`

---

## 📄 License

MIT License — Made with ❤️ by [Aman](https://github.com/Aman-codes0-0)
