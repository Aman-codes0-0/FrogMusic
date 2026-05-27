import React, { useEffect, useRef, useState, useCallback } from 'react';
import { fmt } from '../utils'; // BUG-29: use shared utility

// Detect touch/mobile device
const isTouchDevice = () =>
  typeof window !== 'undefined' &&
  ('ontouchstart' in window || navigator.maxTouchPoints > 0);

// Lock orientation to landscape and go fullscreen
async function lockLandscape(element) {
  try {
    await element.requestFullscreen?.();
  } catch (_) {}
  try {
    await screen.orientation?.lock?.('landscape');
  } catch (_) {
    // Not supported or not in fullscreen — silently ignore
  }
}

// Unlock orientation
function unlockOrientation() {
  try {
    screen.orientation?.unlock?.();
  } catch (_) {}
}

export default function VideoPlayer({ video, onClose, onVideoEnded, autoPlay }) {
  const containerRef = useRef(null);
  const miniRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMini, setIsMini] = useState(false);
  const [isLandscapeLocked, setIsLandscapeLocked] = useState(false);
  const [miniPos, setMiniPos] = useState({ x: null, y: null });
  const dragState = useRef(null);
  const isMobile = isTouchDevice();

  // ── Listen to YouTube Video End via postMessage ───────────────────────────
  useEffect(() => {
    const handleMessage = (e) => {
      if (!e.origin.includes('youtube.com')) return;
      try {
        // BUG-38 FIX: YouTube sends both string and object postMessages.
        // Safely parse and check type before accessing nested properties.
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data && typeof data === 'object' && data.event === 'infoDelivery' &&
            data.info && data.info.playerState === 0) {
          if (onVideoEnded) onVideoEnded(video);
        }
      } catch (err) {
        // Ignore non-JSON or unexpected messages
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [video, onVideoEnded]);

  // ── Fullscreen ──────────────────────────────────────────────────────────────
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => {
      const inFs = !!document.fullscreenElement;
      setIsFullscreen(inFs);
      // If exiting fullscreen, also unlock orientation
      if (!inFs) {
        unlockOrientation();
        setIsLandscapeLocked(false);
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // ── Landscape lock (mobile) ─────────────────────────────────────────────────
  const toggleLandscape = useCallback(async () => {
    if (isLandscapeLocked) {
      // Exit fullscreen → triggers orientation unlock via fullscreenchange
      document.exitFullscreen?.();
    } else {
      await lockLandscape(containerRef.current);
      setIsLandscapeLocked(true);
    }
  }, [isLandscapeLocked]);

  // ── Close: always unlock orientation ───────────────────────────────────────
  const handleClose = useCallback(() => {
    unlockOrientation();
    if (document.fullscreenElement) document.exitFullscreen?.();
    onClose();
  }, [onClose]);

  // ── Keyboard shortcuts ──────────────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      // BUG-37 FIX: Don't close VideoPlayer if NowPlaying overlay is open
      // (NowPlaying is fullscreen at z-index 200; VideoPlayer is z-index 300)
      const nowPlayingOpen = !!document.querySelector('.now-playing-overlay');
      if (e.key === 'Escape' && !isMini && !nowPlayingOpen) { handleClose(); return; }
      if (e.key === 'f' || e.key === 'F') { toggleFullscreen(); return; }
      if (e.key === 'm' || e.key === 'M') { setIsMini(true); return; }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [handleClose, toggleFullscreen, isMini]);

  // ── Mini player drag ────────────────────────────────────────────────────────
  // BUG-36 FIX: The old code added mousemove/mouseup via named functions defined
  // on the component body. Since components re-render, each render creates new
  // function references, so removeEventListener called a DIFFERENT reference than
  // the one added — meaning the listener was NEVER removed (memory leak + stale
  // closures). Fix: capture handlers inside onMiniMouseDown's closure.
  const onMiniMouseDown = useCallback((e) => {
    e.preventDefault();
    const rect = miniRef.current.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = rect.left;
    const origY = rect.top;

    const handleMove = (e) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      // BUG-35 FIX: Use position: fixed left/top directly from viewport coords.
      // origX/origY from getBoundingClientRect() are already viewport-relative,
      // matching what CSS left/top expects for position:fixed elements.
      setMiniPos({ x: origX + dx, y: origY + dy });
    };

    const handleUp = () => {
      dragState.current = null;
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      miniRef.current?.classList.remove('dragging');
    };

    dragState.current = { startX, startY, origX, origY };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    miniRef.current?.classList.add('dragging');
  }, []);

  useEffect(() => {
    return () => {
      // Safety cleanup on unmount
      unlockOrientation();
    };
  }, []);

  if (!video) return null;

  // ── Mini Player ─────────────────────────────────────────────────────────────
  if (isMini) {
    const miniStyle = miniPos.x !== null
      ? { left: miniPos.x, top: miniPos.y, right: 'auto', bottom: 'auto' }
      : {};
    return (
      <div className="vp-mini" ref={miniRef} style={miniStyle} id="video-mini-player">
        <div className="vp-mini-drag" onMouseDown={onMiniMouseDown}>
          <svg viewBox="0 0 24 24"><path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
        </div>
        <div className="vp-mini-iframe-wrap">
          <iframe
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="vp-mini-iframe"
          />
        </div>
        <div className="vp-mini-footer">
          <p className="vp-mini-title">{video.title}</p>
          <div className="vp-mini-actions">
            <button className="vp-mini-btn" id="video-mini-expand" title="Expand" onClick={() => setIsMini(false)}>
              <svg viewBox="0 0 24 24"><path d="M21 11V3h-8l3.29 3.29-10 10L3 13v8h8l-3.29-3.29 10-10z"/></svg>
            </button>
            <button className="vp-mini-btn vp-mini-close" id="video-mini-close" title="Close" onClick={handleClose}>
              <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Full Player ─────────────────────────────────────────────────────────────
  return (
    <div className="vp-backdrop" onClick={handleClose} id="video-player-modal">
      <div
        className={`vp-container ${isFullscreen ? 'vp-is-fullscreen' : ''}`}
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="vp-header">
          <div className="vp-title-wrap">
            <div className="vp-badge">
              <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, fill: '#fff' }}>
                <path d="M21 3H3a2 2 0 00-2 2v14a2 2 0 002 2h18a2 2 0 002-2V5a2 2 0 00-2-2zm-9 13l-6-4 6-4v8z"/>
              </svg>
              Frog Video
            </div>
            <h2 className="vp-title">{video.title}</h2>
            <p className="vp-channel">{video.channel} · {fmt(video.duration)}</p>
          </div>

          <div className="vp-header-actions">
            {/* Minimize — desktop only */}
            {!isMobile && (
              <button className="vp-action-btn" id="video-minimize-btn" title="Mini player (M)" onClick={() => setIsMini(true)}>
                <svg viewBox="0 0 24 24"><path d="M19 11H5v2h14z"/></svg>
              </button>
            )}

            {/* 🔄 Rotate to Landscape — mobile/tablet only */}
            {isMobile && (
              <button
                className={`vp-action-btn vp-rotate-btn ${isLandscapeLocked ? 'vp-rotate-active' : ''}`}
                id="video-rotate-btn"
                title={isLandscapeLocked ? 'Exit landscape' : 'Rotate to landscape'}
                onClick={toggleLandscape}
              >
                {isLandscapeLocked ? (
                  /* Exit landscape icon */
                  <svg viewBox="0 0 24 24">
                    <path d="M16.48 2.52c3.27 1.55 5.61 4.72 5.97 8.48h1.5C23.44 4.84 18.29 0 12 0l-.66.03 3.81 3.81 1.33-1.32zm-6.25-.77c-.59-.59-1.54-.59-2.12 0L1.75 8.11c-.59.59-.59 1.54 0 2.12l12.02 12.02c.59.59 1.54.59 2.12 0l6.36-6.36c.59-.59.59-1.54 0-2.12L10.23 1.75zm4.6 19.44L2.81 9.17l6.36-6.36 12.02 12.02-6.36 6.36zm-7.31.29C4.25 19.94 1.91 16.76 1.55 13H.05C.56 19.16 5.71 24 12 24l.66-.03-3.81-3.81-1.33 1.32z"/>
                  </svg>
                ) : (
                  /* Rotate icon */
                  <svg viewBox="0 0 24 24">
                    <path d="M7.34 6.41L.86 12.9l6.49 6.48 6.49-6.48-6.5-6.49zM3.69 12.9l3.65-3.65L11 12.9l-3.66 3.65-3.65-3.65zm15.67-6.26A8.95 8.95 0 0012.02 4V.76L7.77 5l4.25 4.25V5.9a7 7 0 11-6.6 9.4l-1.86.62A9 9 0 1019.36 6.64z"/>
                  </svg>
                )}
              </button>
            )}

            {/* Fullscreen */}
            <button
              className="vp-action-btn"
              id="video-fullscreen-btn"
              title={isFullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
              onClick={toggleFullscreen}
            >
              {isFullscreen ? (
                <svg viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>
              ) : (
                <svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
              )}
            </button>

            {/* Close */}
            <button className="vp-close" onClick={handleClose} id="video-player-close" aria-label="Close" title="Close (Esc)">
              <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>
        </div>

        {/* Iframe */}
        <div className="vp-iframe-wrap">
          <iframe
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            className="vp-iframe"
          />
        </div>

        {/* Footer — desktop hints / mobile landscape hint */}
        <div className="vp-footer">
          {isMobile ? (
            <span>
              Tap <b>🔄</b> to watch in landscape fullscreen
            </span>
          ) : (
            <>
              <span><kbd>Esc</kbd> Close</span>
              <span><kbd>F</kbd> Fullscreen</span>
              <span><kbd>M</kbd> Mini player</span>
              <span>Speed: Use <b>⚙️</b> inside player</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
