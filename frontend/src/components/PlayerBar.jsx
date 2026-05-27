import React from 'react';
import { fmt } from '../utils'; // BUG-29: use shared utility

export default function PlayerBar({
  current,
  isPlaying,
  togglePlay,
  playNext,
  playPrev,
  shuffle,
  toggleShuffle,
  repeat,
  toggleRepeat,
  showQueue,
  currentTime,
  duration,
  volume,
  setVolume,
  seek,
  playlists,
  toggleLikeCurrent,
  openNowPlaying,
  themeColor,
  miniMode,
  setMiniMode
}) {
  const pct = duration ? (currentTime / duration) * 100 : 0;
  const isLiked = current && playlists["Liked Songs"]?.some(s => s.id === current.id);

  return (
    <div className="player-bar">
      <div className="player-left-group">
        <div className="player-controls">
          <button className="p-btn" onClick={playPrev} title="Previous">
            <svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
          </button>
          <button className="p-btn p-play" onClick={togglePlay} title={isPlaying ? "Pause" : "Play"}>
            {isPlaying ? (
              <svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            ) : (
              <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>
          <button className="p-btn" onClick={playNext} title="Next">
            <svg viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
          </button>
        </div>

        <div className="player-info" style={{ visibility: current ? 'visible' : 'hidden' }}>
          <div style={{display:'flex', alignItems:'center', gap:'12px', cursor:'pointer', minWidth:0}} onClick={openNowPlaying}>
            <img className="p-art" src={current?.thumbnail || ''} alt="" />
            <div className="p-meta">
              <span className="p-title">{current?.title || '—'}</span>
              <span className="p-artist">{current?.channel || '—'}</span>
            </div>
          </div>
          <button className="p-btn p-heart-btn" onClick={toggleLikeCurrent} style={{ marginLeft: '8px', flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" style={{ width: '20px', height: '20px', fill: isLiked ? themeColor : 'var(--text-muted)' }}>
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div className="player-center-group">
        <div className="progress-container">
          <span className="p-time">{fmt(currentTime)}</span>
          <input 
            type="range" 
            className="p-seek" 
            min="0" 
            max="100" 
            value={pct || 0} 
            onChange={(e) => seek(parseFloat(e.target.value))}
            style={{ background: `linear-gradient(to right, ${themeColor} ${pct}%, #333 ${pct}%)` }}
          />
          <span className="p-time">{fmt(duration)}</span>
        </div>
      </div>
      
      <div className="player-right-group">
        <button 
          className="p-btn" 
          onClick={toggleShuffle}
          style={{ color: shuffle ? themeColor : '' }}
          title="Shuffle"
        >
          <svg viewBox="0 0 24 24"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>
        </button>
        <button 
          className="p-btn" 
          onClick={toggleRepeat}
          style={{ color: repeat !== 'none' ? themeColor : '' }}
          title="Repeat"
        >
          <svg viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>
        </button>
        <button className="p-btn" onClick={() => setMiniMode(!miniMode)} title="Mini Player" style={{color: miniMode ? themeColor : '#fff'}}>
          <svg viewBox="0 0 24 24"><path d="M19 11h-8v6h8v-6zm4 8V4.98C23 3.88 22.1 3 21 3H3c-1.1 0-2 .88-2 1.98V19c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2zm-2 .02H3V4.97h18v14.05z"/></svg>
        </button>
        {/* BUG-41 FIX: Removed dead p-mobile-play button — it had display:none inline
            AND the CSS media query also sets it to display:none !important, making
            it completely unreachable in any breakpoint. */}
        <button className="p-btn" onClick={showQueue} title="Queue">
          <svg viewBox="0 0 24 24"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h10v2H4z"/></svg>
        </button>
        <div className="vol-container">
          <svg viewBox="0 0 24 24" style={{width: '20px', height: '20px', fill: 'var(--text-muted)'}}>
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
          <input 
            type="range" 
            className="p-vol" 
            min="0" 
            max="100" 
            value={volume * 100}
            onChange={(e) => setVolume(parseFloat(e.target.value) / 100)}
            style={{ background: `linear-gradient(to right, ${themeColor} ${volume * 100}%, #333 ${volume * 100}%)` }}
          />
        </div>
      </div>
    </div>
  );
}
