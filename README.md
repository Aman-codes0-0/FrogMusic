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

Welcome to **Frog Music**, a cozy, premium music and video streaming web app. It combines the aesthetic charm of retro pixel art and warm glassmorphism with a modern, high-performance streaming engine powered by `yt-dlp` and React.

Whether you want to relax to high-quality lo-fi beats, stream your favorite music videos, or tune into auto-generated radio channels, Frog Music is designed to provide a warm, seamless, and distraction-free listening experience.

---

## ✨ Features You'll Love

### 🎵 Music Mode
*   🔍 **Instant Search** – Find any song, artist, or album instantly.
*   🎧 **High-Quality Audio** – Choose your preferred audio quality (Low, Normal, or High).
*   🎚️ **Equalizer** – Fine-tune your listening experience with real-time controls for Bass, Mid, and Treble.
*   🎤 **Synced Lyrics** – Sing along with automatically scrolling lyrics that match the song.
*   🔀 **Smart Playback** – Shuffle, repeat, and manage your play queue with ease.
*   📻 **Smart Radio Autoplay** – When your queue ends, our smart autoplay engine detects genres/eras (Lofi, 90s, Romantic, Rap, Devotional) in your playing song to keep the music going.
*   📱 **Lock-Screen Controls** – Supports the Media Session API, allowing you to pause, skip, and view song details directly on your phone's lock screen or notification drawer.

### 🎬 Video Mode
*   📺 **Immersive Player** – Enjoy a large, gorgeous video frame with support for keyboard shortcuts (`F` for Fullscreen, `M` for Mini-player, `Esc` to Close).
*   🖼️ **Draggable Mini-Player** – Float the video picture-in-picture style in the corner of your screen so you can browse other tracks while watching.
*   🔄 **Mobile Landscape Mode** – Tap the rotation button to automatically rotate the screen to landscape fullscreen.
*   🏠 **Dedicated Video Hub** – Browse filtered categories, popular channels, and featured content cards on a specialized video homepage.

### 🎨 Design & Customization
*   🌗 **Seamless Mode Switch** – Toggle between Music Mode and Video Mode instantly from the sidebar.
*   🎨 **Dynamic Palette Extraction** – The app dynamically extracts primary accent colors from the active song's album art to tint the entire UI harmoniously.
*   📱 **Mobile-Optimized Grid** – Fully responsive layout that scales beautifully from desktops to small phone screens.
*   💾 **Persistent Library** – Likes, watch later lists, history, and custom playlists are all saved locally in your browser.

---

## 🛠️ Tech Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React.js, Vite, Vanilla CSS |
| **Backend** | Python 3 (built-in `http.server` & `ThreadingMixIn`) |
| **Streaming Engine** | `yt-dlp` (configured with client-spoofing for high reliability) |
| **Styles** | Custom glassmorphism, responsive grids, HSL dynamic CSS variables |
| **Browser Integrations** | Web Audio API (Equalizer), Media Session API (lock-screen controls), Screen Orientation API (mobile rotation) |
| **Data Storage** | LocalStorage (user preferences, library, history, playlists) |

---

## 🚀 Quick Setup (Local Development)

Getting Frog Music running on your computer takes just a couple of minutes!

### Prerequisites
Make sure you have the following installed on your machine:
*   [Python 3.8+](https://www.python.org/downloads/)
*   [Node.js 18+](https://nodejs.org/) (includes `npm`)

---

### Step-by-Step Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/Aman-codes0-0/FrogMusic.git
cd FrogMusic
```

#### 2. Start the Python Backend
The Python server handles video searches, audio stream extraction, and lyrics.
```bash
cd backend
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python server.py                # Runs on http://localhost:5000
```

#### 3. Start the React Frontend
Open a new terminal window or tab and run:
```bash
cd frontend
npm install
npm run dev                     # Runs on http://localhost:5173
```
Now, open your browser and navigate to **`http://localhost:5173`**! 🎵

---

## 🐋 Docker & HuggingFace Deployment

Frog Music is configured for production deployments using a multi-stage Docker build:

*   **Stage 1** builds the optimized Vite frontend bundle.
*   **Stage 2** installs python dependencies, installs system packages (`ffmpeg` for audio streaming, `node.js` for signature decryption), copies backend code, and configures python to serve the static frontend directory.

The server dynamically binds to the environment variable `PORT` (defaulting to `7860` for HuggingFace Spaces).

---

## 📄 License & Credits

This project is licensed under the MIT License. Created with ❤️ by [Aman](https://github.com/Aman-codes0-0).
