import React from 'react';

export default function Sidebar({ view, setView, mode, setMode, activePlaylist, setActivePlaylist }) {
  const handleModeToggle = () => {
    if (mode === 'video') {
      setMode('music');
      setView('home');
    } else {
      setMode('video');
      setView('search');
    }
  };

  const handleNav = (v, playlistName = null) => {
    setView(v);
    if (setActivePlaylist) {
      setActivePlaylist(playlistName);
    }
  };

  return (
    <nav className="sidebar">
      {/* ── Main Navigation ── */}
      <button
        className={`nav-item ${view === 'home' ? 'active' : ''}`}
        onClick={() => handleNav('home')}
      >
        <svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
        <span>For You</span>
      </button>

      <button
        className={`nav-item ${view === 'search' ? 'active' : ''}`}
        onClick={() => handleNav('search')}
      >
        <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        <span>Browse</span>
      </button>

      <button
        className={`nav-item ${view === 'charts' ? 'active' : ''}`}
        onClick={() => handleNav('charts')}
      >
        <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
        <span>Charts</span>
      </button>

      {/* ── Divider ── */}
      <div className="sidebar-divider" />

      {/* ── My Library ── */}
      <div className="sidebar-section-label">My Library</div>

      <button
        className={`nav-item ${view === 'library' && activePlaylist === 'Liked Songs' ? 'active' : ''}`}
        onClick={() => handleNav('library', 'Liked Songs')}
      >
        <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        <span>Favorite Songs</span>
      </button>

      {/* BUG-44 FIX: Renamed from "Albums" to "My Playlists" — this nav item
          sets view='library' with activePlaylist=null, which shows all playlists.
          "Albums" was a misleading label since there is no albums-specific view. */}
      <button
        className={`nav-item hide-mobile ${view === 'library' && activePlaylist !== 'Liked Songs' ? 'active' : ''}`}
        onClick={() => handleNav('library', null)}
      >
        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
        <span>My Playlists</span>
      </button>

      <button
        className={`nav-item hide-mobile ${view === 'artists' ? 'active' : ''}`}
        onClick={() => handleNav('artists')}
      >
        <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
        <span>Artists</span>
      </button>

      {/* BUG-45 FIX: Renamed "History" to "Queue & History" — the queue view
          shows both "Up Next" (queue) and "Recently Played" (history), so the
          old label was only half-accurate and confused users expecting pure history. */}
      <button
        className={`nav-item hide-mobile ${view === 'queue' ? 'active' : ''}`}
        onClick={() => handleNav('queue')}
      >
        <svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm3.23 15.4L11 15V7h1.5v7.25l3.25 1.93-1.03 1.72-1.5-.5z"/></svg>
        <span>Queue &amp; History</span>
      </button>

      {/* ── Divider ── */}
      <div className="sidebar-divider" />

      {/* ── Mode Toggle ── */}
      <button
        className={`nav-item hide-mobile nav-mode-toggle ${mode === 'video' ? 'nav-mode-video' : 'nav-mode-music'}`}
        id="nav-mode-toggle"
        onClick={handleModeToggle}
      >
        {mode === 'video' ? (
          <>
            <svg viewBox="0 0 24 24"><path d="M12 3v10.55A4 4 0 1014 17V7h4V3h-6z"/></svg>
            <span>Music</span>
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24"><path d="M21 3H3a2 2 0 00-2 2v14a2 2 0 002 2h18a2 2 0 002-2V5a2 2 0 00-2-2zm-9 13l-6-4 6-4v8z"/></svg>
            <span>Video</span>
          </>
        )}
      </button>

      <button
        className={`nav-item ${view === 'themes' ? 'active' : ''}`}
        onClick={() => handleNav('themes')}
      >
        <svg viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
        <span>Themes</span>
      </button>
    </nav>
  );
}
