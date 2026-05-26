"""
Frog Music – Minimal HTTP server (stdlib only) + yt-dlp
No Flask, no extra dependencies — just Python + yt-dlp
"""
import json
import os
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler
from socketserver import ThreadingMixIn
from urllib.parse import urlparse, parse_qs, quote
import yt_dlp
import requests
import time

# ── Simple in-memory cache ────────────────────────────────────────────────────
_cache = {}
_lock = threading.Lock()

def get_cache(key):
    with _lock:
        return _cache.get(key)

def set_cache(key, value):
    with _lock:
        _cache[key] = value

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "frontend"))

# ── Keep-Alive (Ping) ────────────────────────────────────────────────────────
def keep_alive(url):
    """Simple loop to ping the server every 10 minutes to prevent sleeping."""
    while True:
        try:
            # We use a short timeout so we don't hang if the server is slow
            requests.get(url, timeout=10)
            print(f"  [Keep-Alive] Pinged {url} successfully.")
        except Exception as e:
            print(f"  [Keep-Alive] Ping failed: {e}")
        # Wait 10 minutes (600 seconds)
        time.sleep(600)

# ── Invidious Fallback APIs ──────────────────────────────────────────────────
INVIDIOUS_INSTANCES = [
    "https://yt.chocolatemoo53.com",
    "https://invidious.privacydev.net",
    "https://invidious.lunar.icu",
    "https://invidious.no-logs.com",
    "https://invidious.flokinet.to"
]

def invidious_search(query):
    for url in INVIDIOUS_INSTANCES:
        try:
            print(f"  [Invidious Fallback] Attempting search via: {url}")
            r = requests.get(f"{url}/api/v1/search?q={quote(query)}", timeout=7)
            if r.status_code == 200:
                data = r.json()
                if isinstance(data, list):
                    results = []
                    for item in data:
                        if item.get("type") == "video":
                            vid = item.get("videoId")
                            results.append({
                                "id":        vid,
                                "title":     item.get("title", "Unknown"),
                                "channel":   item.get("author", "Unknown"),
                                "duration":  item.get("lengthSeconds", 0),
                                "thumbnail": f"https://img.youtube.com/vi/{vid}/mqdefault.jpg",
                            })
                    if results:
                        print(f"  [Invidious Fallback] Successfully fetched {len(results)} results from {url}")
                        return results
        except Exception as e:
            print(f"  [Invidious Fallback] Search failed for {url}: {e}")
    return None

def invidious_stream(vid, quality="high"):
    for url in INVIDIOUS_INSTANCES:
        try:
            print(f"  [Invidious Fallback] Attempting stream fetch via: {url}")
            r = requests.get(f"{url}/api/v1/videos/{vid}", timeout=7)
            if r.status_code == 200:
                data = r.json()
                adaptive = data.get("adaptiveFormats", [])
                # Filter for audio streams
                audio_streams = [f for f in adaptive if f.get("audioQuality") or (f.get("acodec") and not f.get("vcodec"))]
                if not audio_streams and data.get("formatStreams"):
                    audio_streams = data.get("formatStreams")
                
                if audio_streams:
                    if quality == "low":
                        target = audio_streams[-1]
                    elif quality == "normal" and len(audio_streams) > 1:
                        target = audio_streams[len(audio_streams)//2]
                    else:
                        target = audio_streams[0]
                    
                    stream_url = target.get("url")
                    if stream_url:
                        print(f"  [Invidious Fallback] Successfully fetched stream URL from {url}")
                        return {
                            "id": vid,
                            "stream_url": stream_url,
                            "title": data.get("title", "Unknown"),
                            "channel": data.get("author", "Unknown"),
                            "duration": data.get("lengthSeconds", 0),
                            "thumbnail": f"https://img.youtube.com/vi/{vid}/maxresdefault.jpg",
                        }
        except Exception as e:
            print(f"  [Invidious Fallback] Stream fetch failed for {url}: {e}")
    return None

def invidious_related(vid):
    for url in INVIDIOUS_INSTANCES:
        try:
            print(f"  [Invidious Fallback] Attempting related fetch via: {url}")
            r = requests.get(f"{url}/api/v1/videos/{vid}", timeout=7)
            if r.status_code == 200:
                data = r.json()
                related = data.get("recommendedVideos", [])
                results = []
                for e in related[:5]:
                    results.append({
                        "id":        e.get("videoId"),
                        "title":     e.get("title", "Unknown"),
                        "channel":   e.get("author", "Unknown"),
                        "duration":  e.get("lengthSeconds", 0),
                        "thumbnail": f"https://img.youtube.com/vi/{e.get('videoId')}/mqdefault.jpg",
                    })
                if results:
                    print(f"  [Invidious Fallback] Successfully fetched {len(results)} related videos from {url}")
                    return results
        except Exception as e:
            print(f"  [Invidious Fallback] Related fetch failed for {url}: {e}")
    return None

# ── Request Handler ───────────────────────────────────────────────────────────
class Handler(BaseHTTPRequestHandler):

    def do_OPTIONS(self):
        """Handle CORS preflight requests."""
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path   = parsed.path
        qs     = parse_qs(parsed.query)

        if path == "/api/search":
            self._search(qs.get("q", [""])[0].strip())
            return
        elif path.startswith("/api/stream/"):
            vid = path.split("/")[-1]
            q   = qs.get("quality", ["high"])[0]
            self._stream(vid, q)
            return
        elif path.startswith("/api/lyrics/"):
            self._lyrics(path.split("/")[-1])
            return
        elif path.startswith("/api/related/"):
            self._related(path.split("/")[-1])
            return

        # Serve static files from frontend/dist
        if path == "/":
            fp = os.path.join(FRONTEND_DIR, "dist", "index.html")
            if not os.path.isfile(fp):
                # No frontend deployed — show API status page
                self._api_status()
                return

        fp = os.path.join(FRONTEND_DIR, "dist", path.lstrip("/"))
        if not os.path.isfile(fp):
            # Fallback to index.html for SPA
            fp = os.path.join(FRONTEND_DIR, "dist", "index.html")

        if not os.path.isfile(fp):
            self.send_error(404, "Not found")
            return

        ext = os.path.splitext(fp)[1]
        ctypes = {
            ".html": "text/html; charset=utf-8",
            ".css": "text/css",
            ".js": "application/javascript",
            ".json": "application/json",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".svg": "image/svg+xml",
            ".ico": "image/x-icon",
        }
        ctype = ctypes.get(ext, "application/octet-stream")

        try:
            with open(fp, "rb") as f:
                data = f.read()
            self.send_response(200)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(len(data)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(data)
        except Exception as e:
            self.send_error(500, str(e))

    def _api_status(self):
        html_lines = [
            b"<!DOCTYPE html>",
            b"<html lang=\"en\">",
            b"<head>",
            b"  <meta charset=\"UTF-8\"/>",
            b"  <title>Frog Music API</title>",
            b"  <style>",
            b"    * { margin:0; padding:0; box-sizing:border-box; }",
            b"    body { background:#0f0f0f; color:#fff; font-family:'Segoe UI',sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; }",
            b"    .card { background:#1a1a1a; border:1px solid #333; border-radius:16px; padding:40px 48px; max-width:540px; width:90%; text-align:center; }",
            b"    .badge { display:inline-flex; align-items:center; gap:8px; background:#1f3a1f; border:1px solid #2d6a2d; color:#4caf50; padding:6px 16px; border-radius:100px; font-size:14px; font-weight:600; margin-bottom:24px; }",
            b"    .dot { width:8px; height:8px; border-radius:50%; background:#4caf50; animation:pulse 1.5s infinite; }",
            b"    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }",
            b"    h1 { font-size:28px; margin-bottom:8px; }",
            b"    p  { color:#888; margin-bottom:32px; font-size:15px; }",
            b"    .endpoints { text-align:left; background:#111; border-radius:12px; padding:20px 24px; }",
            b"    .ep { padding:10px 0; border-bottom:1px solid #222; font-size:14px; }",
            b"    .ep:last-child { border-bottom:none; }",
            b"    .method { background:#1a3a5c; color:#64b5f6; padding:2px 8px; border-radius:4px; font-size:12px; font-weight:700; margin-right:8px; }",
            b"    .path { color:#fff; font-family:monospace; }",
            b"    .desc { color:#666; font-size:12px; margin-top:4px; padding-left:48px; }",
            b"  </style>",
            b"</head>",
            b"<body>",
            b"  <div class=\"card\">",
            b"    <div class=\"badge\"><div class=\"dot\"></div> API is Live</div>",
            b"    <h1>&#127925; Frog Music Backend</h1>",
            b"    <p>Powered by yt-dlp &mdash; ready to serve requests.</p>",
            b"    <div class=\"endpoints\">",
            b"      <div class=\"ep\">",
            b"        <span class=\"method\">GET</span><span class=\"path\">/api/search?q=</span>",
            b"        <div class=\"desc\">Search songs and videos</div>",
            b"      </div>",
            b"      <div class=\"ep\">",
            b"        <span class=\"method\">GET</span><span class=\"path\">/api/stream/&lt;id&gt;</span>",
            b"        <div class=\"desc\">Stream audio for a video ID</div>",
            b"      </div>",
            b"      <div class=\"ep\">",
            b"        <span class=\"method\">GET</span><span class=\"path\">/api/lyrics/&lt;id&gt;</span>",
            b"        <div class=\"desc\">Fetch lyrics</div>",
            b"      </div>",
            b"    </div>",
            b"  </div>",
            b"</body>",
            b"</html>"
        ]
        html = b"\n".join(html_lines)
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(html)))
        self.end_headers()
        self.wfile.write(html)

    def _json(self, obj, status=200):
        body = json.dumps(obj).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _search(self, query):
        if not query:
            self._json({"error": "Empty query"}, 400)
            return
        key = f"search:{query}"
        hit = get_cache(key)
        if hit:
            self._json(hit)
            return
        opts = {
            "quiet": True, 
            "no_warnings": True, 
            "extract_flat": True, 
            "skip_download": True,
            "socket_timeout": 8,
            "retries": 1,
            # Use mweb client — avoids YouTube bot-detection that blocks default web client
            "extractor_args": {"youtube": {"player_client": ["mweb"]}},
        }
        try:
            print(f"  [Search] Querying yt-dlp for: {query}")
            with yt_dlp.YoutubeDL(opts) as ydl:
                # Using a slightly different search query to avoid direct patterns
                info = ydl.extract_info(f"ytsearch20:{query}", download=False)
            results = []
            for e in (info.get("entries") or []):
                if not e: continue
                vid = e.get("id")
                results.append({
                    "id":        vid,
                    "title":     e.get("title", "Unknown"),
                    "channel":   e.get("channel") or e.get("uploader", "Unknown"),
                    "duration":  e.get("duration", 0),
                    "thumbnail": f"https://img.youtube.com/vi/{vid}/mqdefault.jpg",
                })
            set_cache(key, results)
            self._json(results)
        except Exception as ex:
            print(f"  [Search] yt-dlp search failed/timed out: {ex}. Trying Invidious fallback...")
            results = invidious_search(query)
            if results:
                set_cache(key, results)
                self._json(results)
            else:
                self._json({"error": f"Search failed: {str(ex)}"}, 500)

    def _stream(self, vid, quality="high"):
        if not vid:
            self._json({"error": "No video id"}, 400)
            return
        key = f"stream:{vid}:{quality}"
        hit = get_cache(key)
        if hit:
            self._json(hit)
            return
        opts = {
            "quiet": True, 
            "no_warnings": True, 
            "skip_download": True,
            "socket_timeout": 8,
            "retries": 1,
            # Force certain clients that are less likely to be blocked
            "extractor_args": {"youtube": {"player_client": ["ios", "android", "web"]}},
            "http_headers": {
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1",
            }
        }
        try:
            print(f"  [Stream] Querying yt-dlp for video stream: {vid}")
            with yt_dlp.YoutubeDL(opts) as ydl:
                info = ydl.extract_info(f"https://www.youtube.com/watch?v={vid}", download=False)
            audio_url = None
            formats = info.get("formats", [])
            af = [f for f in formats if f.get("vcodec") == "none" and f.get("acodec") != "none"]
            if af:
                if quality == "low": target = min(af, key=lambda f: f.get("abr") or 999)
                elif quality == "normal":
                    af_sorted = sorted(af, key=lambda f: f.get("abr") or 0)
                    target = af_sorted[len(af_sorted)//2]
                else: target = max(af, key=lambda f: f.get("abr") or 0)
                audio_url = target.get("url")
            if not audio_url: audio_url = info.get("url")
            result = {
                "id": vid, "stream_url": audio_url, "title": info.get("title", "Unknown"),
                "channel": info.get("channel") or info.get("uploader", "Unknown"),
                "duration": info.get("duration", 0),
                "thumbnail": (info.get("thumbnail") or f"https://img.youtube.com/vi/{vid}/maxresdefault.jpg"),
            }
            set_cache(key, result)
            self._json(result)
        except Exception as ex:
            print(f"  [Stream] yt-dlp stream fetch failed/timed out: {ex}. Trying Invidious fallback...")
            result = invidious_stream(vid, quality)
            if result:
                set_cache(key, result)
                self._json(result)
            else:
                self._json({"error": f"Streaming failed: {str(ex)}"}, 500)

    def _lyrics(self, vid):
        lrc = [
            {"time": 0, "text": "♪ Music Playing ♪"},
            {"time": 10, "text": "Welcome to Music"},
            {"time": 20, "text": "Enjoy your favorite tracks"},
            {"time": 30, "text": "With high-fidelity sound"},
            {"time": 40, "text": "And premium features"},
            {"time": 50, "text": "♪ Instrumental Break ♪"},
            {"time": 70, "text": "Music: Your Music, Your Way"},
            {"time": 90, "text": "Thank you for listening!"}
        ]
        self._json({"lyrics": lrc})

    def _related(self, vid):
        key = f"related:{vid}"
        hit = get_cache(key)
        if hit:
            self._json(hit)
            return
        opts = {
            "quiet": True,
            "no_warnings": True,
            "extract_flat": True,
            "skip_download": True,
            "socket_timeout": 8,
            "retries": 1,
            "extractor_args": {"youtube": {"player_client": ["mweb"]}},
        }
        try:
            print(f"  [Related] Querying yt-dlp for related: {vid}")
            with yt_dlp.YoutubeDL(opts) as ydl:
                info = ydl.extract_info(f"https://www.youtube.com/watch?v={vid}", download=False)
                entries = info.get("entries") or []
                if not entries:
                    query = info.get("title", "")
                    info = ydl.extract_info(f"ytsearch3:{query}", download=False)
                    entries = info.get("entries") or []
            results = []
            for e in entries[:5]:
                if not e or e.get("id") == vid: continue
                results.append({
                    "id": e.get("id"), "title": e.get("title", "Unknown"),
                    "channel": e.get("channel") or e.get("uploader", "Unknown"),
                    "duration": e.get("duration", 0),
                    "thumbnail": f"https://img.youtube.com/vi/{e.get('id')}/mqdefault.jpg",
                })
            set_cache(key, results)
            self._json(results)
        except Exception as ex:
            print(f"  [Related] yt-dlp related fetch failed/timed out: {ex}. Trying Invidious fallback...")
            results = invidious_related(vid)
            if results:
                set_cache(key, results)
                self._json(results)
            else:
                self._json({"error": f"Related fetch failed: {str(ex)}"}, 500)

    def log_message(self, fmt, *args):
        print(f"  {fmt % args}")

class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    """Handle each request in a separate thread (non-blocking)."""
    allow_reuse_address = True
    daemon_threads = True


if __name__ == "__main__":
    import os
    # Default to 5000 for local development, but use PORT env var for deployment
    port = int(os.environ.get("PORT", 5000))
    
    # Start Keep-Alive thread if APP_URL is set in environment variables
    app_url = os.environ.get("APP_URL")
    if app_url:
        print(f"  [Keep-Alive] Starting pinger for: {app_url}")
        threading.Thread(target=keep_alive, args=(app_url,), daemon=True).start()

    print(f"\n[Frog Music] Backend running at http://localhost:{port}\n")
    ThreadedHTTPServer(("0.0.0.0", port), Handler).serve_forever()
