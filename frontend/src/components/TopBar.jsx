import React, { useState, useEffect } from 'react';
import logoImg from '../assets/logo.png';

export default function TopBar({ doSearch, mode, setMode, setView }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const st = setTimeout(() => {
      if (query.trim() !== '') {
        doSearch(query.trim());
      }
    }, 800);
    return () => clearTimeout(st);
  }, [query, doSearch]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      doSearch(query.trim());
    }
  };

  const handleModeToggle = () => {
    if (mode === 'video') {
      setMode('music');
      setView('home');
    } else {
      setMode('video');
      setView('search');
    }
  };

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="logo">
          <img src={logoImg} alt="Frog Music Logo" className="logo-img" />
          <span className="logo-text">FROG MUSIC</span>
        </div>
      </div>
      
      <div className="topbar-center">
        <div className="search-bar">
          <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          <input 
            type="text" 
            placeholder={mode === 'video' ? 'Search videos...' : 'Search songs, albums, artists, podcasts'} 
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>

      {setMode && setView && (
        <button 
          className={`mode-toggle-btn ${mode === 'video' ? 'mode-toggle-video' : 'mode-toggle-music'}`}
          style={{ marginRight: '16px' }}
          onClick={handleModeToggle}
        >
          {mode === 'video' ? (
            <>
              <svg viewBox="0 0 24 24"><path d="M12 3v10.55A4 4 0 1014 17V7h4V3h-6z"/></svg>
              <span>Music Mode</span>
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24"><path d="M21 3H3a2 2 0 00-2 2v14a2 2 0 002 2h18a2 2 0 002-2V5a2 2 0 00-2-2zm-9 13l-6-4 6-4v8z"/></svg>
              <span>Video Mode</span>
            </>
          )}
        </button>
      )}
      
      <div className="topbar-right">
      </div>
    </div>
  );
}
