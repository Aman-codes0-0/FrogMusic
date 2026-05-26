import React, { useState, useEffect } from 'react';
import logoImg from '../assets/logo.png';

export default function TopBar({ doSearch, mode }) {
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
      
      <div className="topbar-right">
      </div>
    </div>
  );
}
