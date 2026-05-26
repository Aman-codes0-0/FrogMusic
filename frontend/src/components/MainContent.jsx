import React, { useState } from 'react';
import logoImg from '../assets/logo.png';
import bannerImg from '../assets/banner.png';

function fmt(s) {
  if (!s || isNaN(s)) return '0:00';
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
}

export default function MainContent({
  view,
  mode,
  results,
  loading,
  error,
  searchQuery,
  channelName,
  current,
  playlists,
  setPlaylists,
  queue,
  playSong,
  toggleLike,
  addToQueue,
  playNext,
  addToPlaylist,
  doSearch,
  doChannelSearch,
  setView,
  themeColor,
  setThemeColor,
  quality,
  setQuality,
  autoPlay,
  setAutoPlay,
  bgGradient,
  setBgGradient,
  autoTheme,
  setAutoTheme,
  onPlayVideo,
  savedVideos = [],
  toggleSaveVideo,
  activePlaylist,
  setActivePlaylist
}) {
  const [showAddMenu, setShowAddMenu] = useState(null);

  const isSaved = (id) => savedVideos.some(v => v.id === id);

  const handleCreatePlaylist = () => {
    const name = window.prompt("Playlist name:");
    if (name && !playlists[name]) {
      setPlaylists({ ...playlists, [name]: [] });
    }
  };

  const isLiked = (id) => playlists["Liked Songs"]?.some(s => s.id === id);

  if (error) return <main className="main"><div className="empty-msg">Error: {error}</div></main>;

  const Loading = () => (
    <div style={{position:'absolute', top:0, left:0, right:0, height:'3px', background:'var(--accent)', zIndex:100, animation:'loading-bar 2s infinite'}}>
      <style>{`@keyframes loading-bar { 0% { left: -100%; width: 100%; } 100% { left: 100%; width: 100%; } }`}</style>
    </div>
  );

  if (view === 'artists') {
    const allArtists = [
      { name: 'Arijit Singh', img: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300' },
      { name: 'Sidhu Moose Wala', img: 'https://images.unsplash.com/photo-1520127877030-df4f6a4b33b9?w=300' },
      { name: 'Diljit Dosanjh', img: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300' },
      { name: 'The Weeknd', img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300' },
      { name: 'Taylor Swift', img: 'https://images.unsplash.com/photo-1514525253361-bee8718a300a?w=300' },
      { name: 'Badshah', img: 'https://ui-avatars.com/api/?name=Badshah&background=random' },
      { name: 'Neha Kakkar', img: 'https://ui-avatars.com/api/?name=Neha+Kakkar&background=random' },
      { name: 'Jubin Nautiyal', img: 'https://ui-avatars.com/api/?name=Jubin+Nautiyal&background=random' },
      { name: 'Guru Randhawa', img: 'https://ui-avatars.com/api/?name=Guru+Randhawa&background=random' },
      { name: 'Darshan Raval', img: 'https://ui-avatars.com/api/?name=Darshan+Raval&background=random' },
      { name: 'Shreya Ghoshal', img: 'https://ui-avatars.com/api/?name=Shreya+Ghoshal&background=random' },
      { name: 'Armaan Malik', img: 'https://ui-avatars.com/api/?name=Armaan+Malik&background=random' },
      { name: 'Sunidhi Chauhan', img: 'https://ui-avatars.com/api/?name=Sunidhi+Chauhan&background=random' },
      { name: 'Atif Aslam', img: 'https://ui-avatars.com/api/?name=Atif+Aslam&background=random' },
      { name: 'Sonu Nigam', img: 'https://ui-avatars.com/api/?name=Sonu+Nigam&background=random' },
      { name: 'KK', img: 'https://ui-avatars.com/api/?name=KK&background=random' },
      { name: 'Lata Mangeshkar', img: 'https://ui-avatars.com/api/?name=Lata+Mangeshkar&background=random' },
      { name: 'Kishore Kumar', img: 'https://ui-avatars.com/api/?name=Kishore+Kumar&background=random' },
      { name: 'Mohit Chauhan', img: 'https://ui-avatars.com/api/?name=Mohit+Chauhan&background=random' },
      { name: 'Pritam', img: 'https://ui-avatars.com/api/?name=Pritam&background=random' },
      { name: 'Yo Yo Honey Singh', img: 'https://ui-avatars.com/api/?name=Honey+Singh&background=random' },
      { name: 'Drake', img: 'https://ui-avatars.com/api/?name=Drake&background=random' },
      { name: 'Justin Bieber', img: 'https://ui-avatars.com/api/?name=Justin+Bieber&background=random' },
      { name: 'Ed Sheeran', img: 'https://ui-avatars.com/api/?name=Ed+Sheeran&background=random' },
      { name: 'Dua Lipa', img: 'https://ui-avatars.com/api/?name=Dua+Lipa&background=random' },
      { name: 'Ariana Grande', img: 'https://ui-avatars.com/api/?name=Ariana+Grande&background=random' },
      { name: 'Billie Eilish', img: 'https://ui-avatars.com/api/?name=Billie+Eilish&background=random' },
      { name: 'Post Malone', img: 'https://ui-avatars.com/api/?name=Post+Malone&background=random' },
      { name: 'Bruno Mars', img: 'https://ui-avatars.com/api/?name=Bruno+Mars&background=random' },
      { name: 'Eminem', img: 'https://ui-avatars.com/api/?name=Eminem&background=random' },
      // ... and many more to reach 100+ list
    ];

    // Generating 100 names for the grid
    const extendedList = [...allArtists];
    const extraNames = ["Raftaar", "Emiway Bantai", "Krsna", "Divine", "Seedhe Maut", "Ritviz", "Prateek Kuhad", "Anuv Jain", "Taba Chake", "The Local Train", "A.R. Rahman", "Amit Trivedi", "Vishal Dadlani", "Shekhar Ravjiani", "Alka Yagnik", "Udit Narayan", "Kumar Sanu", "Asha Bhosle", "R.D. Burman", "Jagjit Singh", "Nusrat Fateh Ali Khan", "Rahat Fateh Ali Khan", "Shafqat Amanat Ali", "Ali Zafar", "Asim Azhar", "Momina Mustehsan", "Katy Perry", "Coldplay", "Imagine Dragons", "One Direction", "Zayn Malik", "Harry Styles", "Shawn Mendes", "Camila Cabello", "Selena Gomez", "Miley Cyrus", "Lady Gaga", "Beyonce", "Rihanna", "Shakira", "Sia", "Halsey", "Lana Del Rey", "Olivia Rodrigo", "Kendrick Lamar", "Travis Scott", "Kanye West", "Jay Z", "Future", "21 Savage", "Lil Baby", "Young Thug", "J. Cole", "Doja Cat", "Megan Thee Stallion", "Cardi B", "Nicki Minaj", "Lil Nas X", "Charlie Puth", "Sam Smith", "Adele", "Sia", "Kygo", "Alan Walker", "Marshmello", "Martin Garrix", "Avicii", "David Guetta", "Calvin Harris", "Zedd", "The Chainsmokers", "Blackpink", "BTS", "Twice", "NewJeans", "Fifty Fifty", "Stray Kids", "Red Velvet", "Exo", "Got7"];
    
    extraNames.forEach(name => {
      extendedList.push({ name, img: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff` });
    });

    return (
      <main className="main">
        {loading && <Loading />}
        <button className="btn-back" onClick={() => setView('home')}>← Back to Home</button>
        <h1 className="header-title" style={{marginBottom:'32px'}}>Top Artists</h1>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:'32px'}}>
          {extendedList.map((artist, idx) => (
            <div key={idx} onClick={() => doSearch(artist.name)} className="artist-card" style={{textAlign:'center', cursor:'pointer', transition:'transform 0.3s'}}>
              <div style={{width:'120px', height:'120px', borderRadius:'50%', marginBottom:'16px', margin:'0 auto 16px', overflow:'hidden', boxShadow:'0 8px 16px rgba(0,0,0,0.4)', border:'2px solid rgba(255,255,255,0.1)'}}>
                <img src={artist.img} alt={artist.name} style={{width:'100%', height:'100%', objectFit:'cover'}} />
              </div>
              <div style={{fontSize:'15px', fontWeight:'700', color:'#fff'}}>{artist.name}</div>
              <div style={{fontSize:'12px', color:'var(--text-muted)'}}>Artist</div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  if (view === 'home') {
    if (mode === 'video') {
      return (
        <main className="main">
          {loading && <Loading />}
          
          {/* Cozy Video Hero Banner */}
          <div className="hero-banner video-hero-banner" style={{
            width: '100%',
            height: '340px',
            borderRadius: '20px',
            marginBottom: '36px',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'flex-end',
            padding: '30px 40px',
            border: '3px solid var(--wood-dark)',
            boxShadow: '0 12px 24px rgba(0,0,0,0.5)',
            cursor: 'pointer'
          }} onClick={() => doSearch('Trending Music Videos')}>
            <img 
              src={logoImg} 
              alt="Video Hero" 
              style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', objectFit:'cover', zIndex:-1 }}
            />
            <div className="hero-banner-overlay" style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(20, 24, 18, 0.9) 0%, rgba(20, 24, 18, 0.2) 60%, rgba(20, 24, 18, 0) 100%)',
              zIndex: 0
            }} />
            <div className="hero-content" style={{ zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div>
                <span className="pixel-font" style={{ background:'var(--accent)', border: '1.5px solid var(--wood-dark)', color:'#fff', fontSize:'11px', fontWeight:'800', padding:'4px 10px', borderRadius:'4px', textTransform:'uppercase', display:'inline-block', marginBottom:'10px' }}>Video Space</span>
                <h1 className="pixel-font" style={{ fontSize:'28px', color:'var(--text)', marginBottom:'4px', textShadow:'0 2px 4px var(--wood-dark)' }}>
                  Hop Into Video Space
                </h1>
                <p style={{ fontSize:'14px', color:'var(--text-muted)' }}>
                  Explore cozy music videos, live streams, and playlists.
                </p>
              </div>
              <div style={{ display:'flex', gap:'12px' }}>
                <button className="btn-play pixel-font" onClick={(e) => { e.stopPropagation(); doSearch('Trending Music Videos'); }} style={{ padding:'10px 24px', fontSize:'14px', borderRadius:'6px', background:'var(--accent)', border:'2px solid var(--wood-dark)', color:'#fff', cursor:'pointer', fontWeight:'bold' }}>
                  Watch Trending
                </button>
                <button className="btn-secondary pixel-font" onClick={(e) => { e.stopPropagation(); setView('library'); }} style={{ padding:'10px 24px', fontSize:'14px', borderRadius:'6px', background:'rgba(255,255,255,0.1)', border:'2px solid var(--wood-dark)', color:'#fff', cursor:'pointer' }}>
                  Watch Later
                </button>
              </div>
            </div>
          </div>

          {/* Quick Categories Shelf */}
          <div className="video-categories-pills" style={{ display:'flex', gap:'12px', overflowX:'auto', paddingBottom:'8px', marginBottom:'40px', scrollbarWidth:'none' }}>
            {['Trending', 'Hindi Music', 'Lo-Fi Videos', 'Podcasts', 'Live Streams', 'Gaming', 'Tech Reviews', 'Comedy'].map(cat => (
              <button 
                key={cat} 
                className="video-cat-pill pixel-font" 
                onClick={() => doSearch(cat)}
                style={{ 
                  padding:'6px 16px', 
                  borderRadius:'6px', 
                  background:'var(--surface-2)', 
                  border:'2px solid var(--wood-dark)',
                  color:'var(--text)',
                  fontSize:'13px',
                  fontWeight:'600',
                  cursor:'pointer',
                  whiteSpace:'nowrap',
                  transition:'all 0.25s',
                  boxShadow: '0 3px 6px rgba(0,0,0,0.2)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text)'; }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="home-sections">
            {/* Video Categories Grid */}
            <section className="shelf" style={{marginBottom:'56px'}}>
              <h2 className="shelf-title" style={{fontSize:'26px', fontWeight:'800', marginBottom:'24px'}}>Browse Video Formats</h2>
              <div className="shelf-grid" style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:'24px'}}>
                {[
                  { name: 'Trending Clips', color: '#4E9F3D', color2: '#1D231A', icon: '🎬' },
                  { name: 'Live Gaming Streams', color: '#3B7A57', color2: '#28211a', icon: '🎮' },
                  { name: 'Premium Podcasts', color: '#B5825F', color2: '#2C1A11', icon: '🎙️' },
                  { name: 'Cinematic Hits', color: '#5C9E66', color2: '#141812', icon: '🎥' },
                  { name: 'Educational Tutorials', color: '#8D6E63', color2: '#3E2723', icon: '🎓' },
                  { name: 'Comedy & Vlogs', color: '#8FBC8F', color2: '#2F4F4F', icon: '🔥' },
                ].map(genre => (
                  <div 
                    key={genre.name} 
                    onClick={() => doSearch(genre.name)} 
                    style={{
                      height:'150px', 
                      background: `linear-gradient(135deg, ${genre.color}, ${genre.color2})`, 
                      borderRadius:'16px', 
                      padding:'24px', 
                      position:'relative',
                      cursor:'pointer',
                      boxShadow:'0 15px 30px rgba(0,0,0,0.4)',
                      overflow:'hidden',
                      transition:'all 0.3s',
                      border: '3px solid var(--wood-dark)'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.boxShadow = '0 25px 50px rgba(0,0,0,0.6)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.4)'; }}
                  >
                    <div className="pixel-font" style={{ fontSize:'20px', fontWeight:'700', color:'#fff', lineHeight:'1.2', textShadow:'0 2px 4px rgba(0,0,0,0.3)' }}>{genre.name}</div>
                    <div style={{ position:'absolute', bottom:'-10px', right:'-10px', fontSize:'80px', opacity:'0.25', transform:'rotate(-15deg)' }}>{genre.icon}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      );
    }

    return (
      <main className="main">
        {loading && <Loading />}
        
        {/* Premium Hero Banner */}
        <div className="hero-banner" style={{
          width: '100%',
          height: '340px',
          borderRadius: '20px',
          marginBottom: '48px',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'flex-end',
          padding: '30px 40px',
          border: '3px solid var(--wood-dark)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.5)',
          cursor: 'pointer'
        }} onClick={() => doSearch('Cozy Acoustic Lofi')}>
          <img 
            src={bannerImg} 
            alt="Frog Music Hero" 
            style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', objectFit:'cover', zIndex:-1 }}
          />
          <div className="hero-banner-overlay" style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(20, 24, 18, 0.9) 0%, rgba(20, 24, 18, 0.2) 60%, rgba(20, 24, 18, 0) 100%)',
            zIndex: 0
          }} />
          <div className="hero-content" style={{ zIndex:1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div>
              <h1 className="pixel-font" style={{ fontSize:'28px', color:'var(--text)', marginBottom:'4px', textShadow:'0 2px 4px var(--wood-dark)' }}>
                Hop Into Cozy Vibes
              </h1>
              <p style={{ fontSize:'14px', color:'var(--text-muted)' }}>
                Enjoy hand-picked lofi tunes, accordion jams, and acoustic sessions.
              </p>
            </div>
            <button className="btn-play pixel-font" style={{ padding:'10px 24px', fontSize:'14px', borderRadius:'6px', display:'flex', alignItems:'center', gap:'8px', background:'var(--accent)', border:'2px solid var(--wood-dark)', color:'#fff', cursor:'pointer', fontWeight:'bold' }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> Play Radio
            </button>
          </div>
        </div>

        <div className="home-sections">
          {playlists["Most Played"]?.length > 0 && (
            <section className="shelf" style={{marginBottom:'56px'}}>
              <h2 className="shelf-title" style={{fontSize:'26px', fontWeight:'800', marginBottom:'24px'}}>Your Top Tracks</h2>
              <div className="shelf-grid" style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:'24px'}}>
                {playlists["Most Played"].slice(0, 6).map(s => (
                  <div key={s.id} className="playlist-card" onClick={() => playSong(s)} style={{background:'rgba(255,255,255,0.03)', padding:'16px', borderRadius:'16px', transition:'all 0.3s'}}>
                    <img src={s.thumbnail} alt="" style={{width:'100%', aspectRatio:'1', objectFit:'cover', borderRadius:'12px', marginBottom:'16px', boxShadow:'0 8px 16px rgba(0,0,0,0.3)'}} />
                    <div className="p-title" style={{fontSize:'16px', fontWeight:'700', marginBottom:'4px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{s.title}</div>
                    <div className="p-count" style={{fontSize:'14px', color:'var(--accent)'}}>{s.playCount} plays</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    );
  }

  if (view === 'library') {
    if (activePlaylist) {
      const tracks = playlists[activePlaylist] || [];
      return (
        <main className="main">
          {loading && <Loading />}
          <button className="btn-back" onClick={() => setActivePlaylist(null)}>← Back to Library</button>
          <div className="header-section">
            <div style={{width:'200px', height:'200px', background:'linear-gradient(135deg,#1565C0,#b92b27)', borderRadius:'4px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
              <svg viewBox="0 0 24 24" style={{width:'60px', height:'60px', fill:'#fff'}}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            </div>
            <div className="header-info">
              <h1 className="header-title">{activePlaylist}</h1>
              <p className="header-subtitle">Playlist · {tracks.length} songs</p>
              <div className="header-actions">
                {tracks.length > 0 && (
                  <button className="btn-play" onClick={() => playSong(tracks[0])}>
                    <svg viewBox="0 0 24 24" style={{width:'20px', height:'20px'}}><path d="M8 5v14l11-7z"/></svg> Play
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="track-list">
            {tracks.map((s, i) => (
              <div key={s.id + i} className={`track-item ${current?.id === s.id ? 'playing' : ''}`}>
                <div className="track-num" onClick={() => playSong(s)}>
                  {current?.id === s.id ? (
                    <svg className="playing-icon" viewBox="0 0 24 24" style={{width:'16px', height:'16px', fill:'var(--accent)'}}><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
                  ) : i + 1}
                </div>
                <div className={`track-heart ${isLiked(s.id) ? 'liked' : ''}`} onClick={(e) => { e.stopPropagation(); toggleLike(s.id, s.title); }}>
                  <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                </div>
                <div className="track-title-cell" onClick={() => playSong(s)}>
                  <img className="track-thumb" src={s.thumbnail} alt="" loading="lazy" />
                  <div className="track-meta">
                    <div className="track-title">{s.title}</div>
                    <div className="track-artist">{s.channel}</div>
                  </div>
                </div>
                <div className="track-album" onClick={() => playSong(s)}>{s.channel}</div>
                <div className="track-plus" onClick={(e) => { e.stopPropagation(); setShowAddMenu(showAddMenu === s.id ? null : s.id); }}>+</div>
                <div className="track-dur">{fmt(s.duration)}</div>
              </div>
            ))}
          </div>
        </main>
      );
    }

    return (
      <main className="main">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'32px'}}>
          <h1 className="header-title">Your Library</h1>
          <button className="btn-play" onClick={handleCreatePlaylist}>+ New Playlist</button>
        </div>

        {/* ── Saved Videos (Watch Later) ── */}
        {savedVideos.length > 0 && (
          <section style={{marginBottom:'48px'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
              <h2 style={{fontSize:'20px', fontWeight:'700', display:'flex', alignItems:'center', gap:'10px'}}>
                <svg viewBox="0 0 24 24" style={{width:22,height:22,fill:'var(--accent)'}}><path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"/></svg>
                Watch Later
              </h2>
              <span style={{fontSize:'13px', color:'var(--text-muted)'}}>{savedVideos.length} videos</span>
            </div>
            <div className="video-grid">
              {savedVideos.map((v, i) => (
                <div key={`saved-${v.id}-${i}`} className="video-card">
                  <div className="video-thumb-wrap" onClick={() => onPlayVideo(v)}>
                    <img src={v.thumbnail} alt={v.title} className="video-thumb" loading="lazy" />
                    <div className="video-play-overlay">
                      <div className="video-play-btn"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>
                    </div>
                    {v.duration > 0 && <span className="video-duration-badge">{fmt(v.duration)}</span>}
                  </div>
                  <div className="video-card-info">
                    <p className="video-card-title" onClick={() => onPlayVideo(v)}>{v.title}</p>
                    <div className="video-card-meta">
                      <span className="video-card-channel video-card-channel-link" onClick={() => doChannelSearch(v.channel)}>{v.channel}</span>
                      <button className="video-save-btn saved" onClick={() => toggleSaveVideo(v)} title="Remove">
                        <svg viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>
                        Saved
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Music Playlists ── */}
        <h2 style={{fontSize:'20px', fontWeight:'700', marginBottom:'20px'}}>Music Playlists</h2>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:'24px'}}>
          {Object.keys(playlists).map(name => (
            <div key={name} className="playlist-card" onClick={() => setActivePlaylist(name)} style={{cursor:'pointer'}}>
              <div style={{aspectRatio:'1', background:'linear-gradient(135deg,#333,#111)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'12px', boxShadow:'0 4px 12px rgba(0,0,0,0.3)'}}>
                <svg viewBox="0 0 24 24" style={{width:'40px', height:'40px', fill:'#666'}}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
              </div>
              <p style={{fontWeight:'500', fontSize:'16px'}}>{name}</p>
              <p style={{fontSize:'14px', color:'var(--text-muted)'}}>{playlists[name].length} songs</p>
            </div>
          ))}
        </div>
      </main>
    );
  }

  // ── CHANNEL VIEW ─────────────────────────────────────────────────────
  if (view === 'channel') {
    return (
      <main className="main">
        {loading && <Loading />}
        <button className="btn-back" onClick={() => setView('search')}>← Back to Results</button>
        <div className="channel-header">
          <div className="channel-avatar">
            {channelName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="header-title" style={{marginBottom:6}}>{channelName}</h1>
            <p style={{color:'var(--text-muted)', fontSize:14}}>{results.length} videos found</p>
          </div>
        </div>
        {results.length === 0 ? (
          <div className="video-empty">
            <p style={{color:'var(--text-muted)'}}>No videos found for this channel</p>
          </div>
        ) : (
          <div className="video-grid">
            {results.map((v, i) => (
              <div key={`ch-${v.id}-${i}`} className="video-card">
                <div className="video-thumb-wrap" onClick={() => onPlayVideo(v)}>
                  <img src={v.thumbnail} alt={v.title} className="video-thumb" loading="lazy" />
                  <div className="video-play-overlay">
                    <div className="video-play-btn"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>
                  </div>
                  {v.duration > 0 && <span className="video-duration-badge">{fmt(v.duration)}</span>}
                  {v.duration > 0 && v.duration < 60 && <span className="video-shorts-badge">Shorts</span>}
                </div>
                <div className="video-card-info">
                  <p className="video-card-title" onClick={() => onPlayVideo(v)}>{v.title}</p>
                  <div className="video-card-meta">
                    <span className="video-card-channel">{v.channel}</span>
                    <button
                      className={`video-save-btn ${isSaved(v.id) ? 'saved' : ''}`}
                      onClick={(e) => { e.stopPropagation(); toggleSaveVideo(v); }}
                    >
                      {isSaved(v.id) ? (
                        <svg viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>
                      ) : (
                        <svg viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"/></svg>
                      )}
                      {isSaved(v.id) ? 'Saved' : 'Watch Later'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    );
  }

  if (view === 'charts') {
    const featuredCharts = [
      { name: 'Global Top 50', desc: 'The hottest tracks worldwide, updated daily.', color: '#4E9F3D', color2: '#1D231A', query: 'Global Top 50 Hits', icon: '🌍' },
      { name: 'Cozy Lofi Beats', desc: 'Chill lofi hip hop beats to study, work or relax to.', color: '#3B7A57', color2: '#28211a', query: 'lofi hip hop beats', icon: '🐸' },
      { name: '90s & 80s Retro Jams', desc: 'Classics and nostalgic hits from the golden eras.', color: '#B5825F', color2: '#2C1A11', query: '80s 90s classic retro hits', icon: '📻' },
      { name: 'Unplugged & Acoustic', desc: 'Warm acoustic sessions, covers, and cozy performances.', color: '#5C9E66', color2: '#141812', query: 'acoustic songs live unplugged', icon: '🎸' },
    ];

    return (
      <main className="main">
        {loading && <Loading />}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h1 className="header-title">Trending Charts</h1>
        </div>

        <div className="shelf-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          {featuredCharts.map(chart => (
            <div 
              key={chart.name} 
              onClick={() => doSearch(chart.query)} 
              style={{
                background: `linear-gradient(135deg, ${chart.color}, ${chart.color2})`, 
                borderRadius: '16px', 
                padding: '24px', 
                position: 'relative',
                cursor: 'pointer',
                boxShadow: '0 12px 24px rgba(0,0,0,0.4)',
                overflow: 'hidden',
                transition: 'all 0.3s',
                border: '2px solid var(--wood-dark)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.6)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.4)'; }}
            >
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>{chart.icon}</div>
              <h2 className="pixel-font" style={{ fontSize: '20px', fontWeight: '700', color: '#fff', marginBottom: '8px', lineHeight: '1.2' }}>{chart.name}</h2>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.4' }}>{chart.desc}</p>
            </div>
          ))}
        </div>

        {playlists["Most Played"]?.length > 0 && (
          <section className="shelf" style={{ marginTop: '24px' }}>
            <h2 className="shelf-title" style={{ fontSize: '22px', fontWeight: '800', marginBottom: '20px' }}>Top Songs on Frog Music</h2>
            <div className="track-list">
              {playlists["Most Played"].slice(0, 10).map((s, i) => (
                <div key={s.id + i} className={`track-item ${current?.id === s.id ? 'playing' : ''}`} onClick={() => playSong(s)}>
                  <div className="track-num">{i + 1}</div>
                  <div className={`track-heart ${isLiked(s.id) ? 'liked' : ''}`} onClick={(e) => { e.stopPropagation(); toggleLike(s.id, s.title); }}>
                    <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                  </div>
                  <div className="track-title-cell">
                    <img className="track-thumb" src={s.thumbnail} alt="" loading="lazy" />
                    <div className="track-meta">
                      <div className="track-title">{s.title}</div>
                      <div className="track-artist">{s.channel}</div>
                    </div>
                  </div>
                  <div className="track-album">{s.channel}</div>
                  <div className="track-plus" onClick={(e) => { e.stopPropagation(); setShowAddMenu(showAddMenu === s.id ? null : s.id); }}>+</div>
                  <div className="track-dur">{fmt(s.duration)}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    );
  }

  if (view === 'queue') {
    const recentlyPlayed = playlists["Recently Played"] || [];
    return (
      <main className="main">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px' }}>
          {/* Queue Column */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h1 className="header-title" style={{ fontSize: '22px' }}>Up Next (Queue)</h1>
              {queue.length > 0 && <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{queue.length} songs</span>}
            </div>
            {queue.length === 0 ? (
              <div style={{ padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1.5px dashed rgba(255,255,255,0.08)', textAlign: 'center', color: 'var(--text-muted)' }}>
                Queue is empty. Select a song to start listening.
              </div>
            ) : (
              <div className="track-list">
                {queue.map((s, i) => (
                  <div key={`queue-${s.id}-${i}`} className="track-item" onClick={() => playSong(s)}>
                    <div className="track-num">{i + 1}</div>
                    <div className={`track-heart ${isLiked(s.id) ? 'liked' : ''}`} onClick={(e) => { e.stopPropagation(); toggleLike(s.id, s.title); }}>
                      <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    </div>
                    <div className="track-title-cell">
                      <img className="track-thumb" src={s.thumbnail} alt="" loading="lazy" />
                      <div className="track-meta">
                        <div className="track-title">{s.title}</div>
                        <div className="track-artist">{s.channel}</div>
                      </div>
                    </div>
                    <div className="track-dur">{fmt(s.duration)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* History Column */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h1 className="header-title" style={{ fontSize: '22px' }}>Recently Played (History)</h1>
              {recentlyPlayed.length > 0 && <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{recentlyPlayed.length} songs</span>}
            </div>
            {recentlyPlayed.length === 0 ? (
              <div style={{ padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1.5px dashed rgba(255,255,255,0.08)', textAlign: 'center', color: 'var(--text-muted)' }}>
                No play history yet. Play some tracks first!
              </div>
            ) : (
              <div className="track-list">
                {recentlyPlayed.map((s, i) => (
                  <div key={`history-${s.id}-${i}`} className="track-item" onClick={() => playSong(s)}>
                    <div className="track-num">{i + 1}</div>
                    <div className={`track-heart ${isLiked(s.id) ? 'liked' : ''}`} onClick={(e) => { e.stopPropagation(); toggleLike(s.id, s.title); }}>
                      <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    </div>
                    <div className="track-title-cell">
                      <img className="track-thumb" src={s.thumbnail} alt="" loading="lazy" />
                      <div className="track-meta">
                        <div className="track-title">{s.title}</div>
                        <div className="track-artist">{s.channel}</div>
                      </div>
                    </div>
                    <div className="track-dur">{fmt(s.duration)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  if (view === 'search') {
    // ── VIDEO MODE ───────────────────────────────────────────────────────────
    if (mode === 'video') {
      if (results.length === 0) return (
        <main className="main">
          {loading && <Loading />}
          <div className="video-empty">
            <svg viewBox="0 0 24 24" style={{width:64,height:64,fill:'rgba(255,255,255,0.15)',marginBottom:16}}>
              <path d="M21 3H3a2 2 0 00-2 2v14a2 2 0 002 2h18a2 2 0 002-2V5a2 2 0 00-2-2zm-9 13l-6-4 6-4v8z"/>
            </svg>
            <p style={{color:'var(--text-muted)',fontSize:16}}>Search for videos above</p>
          </div>
        </main>
      );
      return (
        <main className="main">
          {loading && <Loading />}
          <div className="video-mode-header">
            <h1 className="header-title" style={{marginBottom:0}}>Results for "{searchQuery}"</h1>
            <p style={{color:'var(--text-muted)',fontSize:14,marginTop:4}}>{results.length} videos found</p>
          </div>
          <div className="video-grid">
            {results.map((v, i) => (
              <div
                key={`${v.id}-${i}`}
                className="video-card"
                id={`video-card-${v.id}`}
              >
                <div className="video-thumb-wrap" onClick={() => onPlayVideo(v)}>
                  <img src={v.thumbnail} alt={v.title} className="video-thumb" loading="lazy" />
                  <div className="video-play-overlay">
                    <div className="video-play-btn">
                      <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                  </div>
                  {v.duration > 0 && (
                    <span className="video-duration-badge">{fmt(v.duration)}</span>
                  )}
                </div>
                <div className="video-card-info">
                  <p className="video-card-title" onClick={() => onPlayVideo(v)}>{v.title}</p>
                  <div className="video-card-meta">
                    <span
                      className="video-card-channel video-card-channel-link"
                      onClick={() => doChannelSearch(v.channel)}
                      title={`See videos from ${v.channel}`}
                    >
                      {v.channel}
                    </span>
                    <button
                      className={`video-save-btn ${isSaved(v.id) ? 'saved' : ''}`}
                      title={isSaved(v.id) ? 'Remove from Watch Later' : 'Save to Watch Later'}
                      onClick={(e) => { e.stopPropagation(); toggleSaveVideo(v); }}
                    >
                      {isSaved(v.id) ? (
                        <svg viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>
                      ) : (
                        <svg viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"/></svg>
                      )}
                      {isSaved(v.id) ? 'Saved' : 'Watch Later'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      );
    }

    // ── MUSIC MODE ─────────────────────────────────────────────────────────────
    if (results.length === 0) return <main className="main">{loading && <Loading />}<div className="empty-msg">No results found</div></main>;
    const topHit = results[0];
    return (
      <main className="main">
        {loading && <Loading />}
        <div className="header-section">
          <img className="header-art" src={topHit.thumbnail} alt="" />
          <div className="header-info">
            <h1 className="header-title">{topHit.title}</h1>
            <p className="header-subtitle">Top result · {topHit.channel} · {fmt(topHit.duration)}</p>
            <div className="header-actions">
              <button className="btn-play" onClick={() => playSong(topHit)}>
                <svg viewBox="0 0 24 24" style={{width:'18px', height:'18px'}}><path d="M8 5v14l11-7z"/></svg> Play
              </button>
              <button className="btn-secondary" onClick={() => addToQueue(topHit)}>
                <svg viewBox="0 0 24 24" style={{width:'18px', height:'18px'}}><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h10v2H4z"/></svg> Add to Queue
              </button>
            </div>
          </div>
        </div>

        {/* Resso-style track list header */}
        <div className="track-list-header">
          <span style={{textAlign:'center'}}>#</span>
          <span></span>
          <span>Title</span>
          <span className="track-album-head">Album</span>
          <span></span>
          <span style={{textAlign:'right'}}>Time</span>
        </div>

        <div className="track-list">
          {results.map((s, i) => (
            <div key={`${s.id}-${i}`} className={`track-item ${current?.id === s.id ? 'playing' : ''}`} style={{position:'relative'}}>
              {/* # number */}
              <div className="track-num" onClick={() => playSong(s)}>
                {current?.id === s.id ? (
                  <svg className="playing-icon" viewBox="0 0 24 24" style={{width:'16px', height:'16px', fill:'var(--accent)'}}><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
                ) : i + 1}
              </div>

              {/* Heart icon */}
              <div
                className={`track-heart ${isLiked(s.id) ? 'liked' : ''}`}
                onClick={(e) => { e.stopPropagation(); toggleLike(s.id, s.title); }}
              >
                <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              </div>

              {/* Thumbnail + Title + Artist */}
              <div className="track-title-cell" onClick={() => playSong(s)}>
                <img className="track-thumb" src={s.thumbnail} alt="" loading="lazy" />
                <div className="track-meta">
                  <div className="track-title">{s.title}</div>
                  <div className="track-artist">{s.channel}</div>
                </div>
              </div>

              {/* Album / Channel */}
              <div className="track-album">{s.channel}</div>

              {/* Add to playlist */}
              <div className="track-plus" onClick={(e) => { e.stopPropagation(); setShowAddMenu(showAddMenu === s.id ? null : s.id); }}>+</div>

              {/* Duration */}
              <div className="track-dur">{fmt(s.duration)}</div>

              {showAddMenu === s.id && (
                <div className="add-menu" style={{position:'absolute', right:'80px', top:'44px', background:'#1e1e2a', borderRadius:'10px', zIndex:'20', boxShadow:'0 16px 40px rgba(0,0,0,0.8)', padding:'8px 0', minWidth:'180px', border:'1px solid rgba(255,255,255,0.08)'}}>
                  {Object.keys(playlists).map(pname => (
                    <div key={pname} className="add-menu-item" onClick={() => { addToPlaylist(pname, s); setShowAddMenu(null); }} style={{padding:'10px 16px', cursor:'pointer', fontSize:'14px'}}>Add to {pname}</div>
                  ))}
                  <div className="add-menu-item" onClick={() => { handleCreatePlaylist(); setShowAddMenu(null); }} style={{padding:'10px 16px', cursor:'pointer', borderTop:'1px solid rgba(255,255,255,0.06)', fontSize:'14px'}}>+ New Playlist</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    );
  }

  if (view === 'themes') {
    const themeColors = [
      { name: "Cozy Frog Green", hex: "#4E9F3D" },
      { name: "Wood Accordion", hex: "#B5825F" },
      { name: "Classic Red", hex: "#FF0000" },
      { name: "Electric Blue", hex: "#0066FF" },
      { name: "Spotify Green", hex: "#1DB954" },
      { name: "Vivid Purple", hex: "#9933FF" },
      { name: "Neon Pink", hex: "#FF00FF" },
      { name: "Deep Orange", hex: "#FF5722" },
      { name: "Sky Blue", hex: "#00CCFF" },
      { name: "Emerald Green", hex: "#2ECC71" },
      { name: "Golden Yellow", hex: "#FFD700" },
      { name: "Royal Indigo", hex: "#3F51B5" },
      { name: "Teal", hex: "#008080" },
      { name: "Rose Gold", hex: "#B76E79" },
      { name: "Amber", hex: "#FFBF00" },
      { name: "Deep Crimson", hex: "#DC143C" },
      { name: "Lavender", hex: "#E6E6FA" },
      { name: "Mint", hex: "#98FF98" },
      { name: "Forest Green", hex: "#228B22" },
      { name: "Ocean Blue", hex: "#0077BE" },
    ];

    return (
      <main className="main">
        <div className="header-section">
          <div className="header-info">
            <h1 className="header-title">Themes</h1>
            <p className="header-subtitle">Customize your accent color</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '20px', marginBottom:'40px' }}>
          {themeColors.map(c => (
            <div 
              key={c.hex} 
              className="playlist-card" 
              onClick={() => setThemeColor(c.hex)}
              style={{ 
                textAlign: 'center', 
                border: themeColor === c.hex ? `2px solid ${c.hex}` : '1px solid rgba(255,255,255,0.05)',
                cursor: 'pointer'
              }}
            >
              <div style={{ width: '60px', height: '60px', background: c.hex, borderRadius: '50%', margin: '0 auto 12px', boxShadow: `0 8px 16px ${c.hex}44` }}></div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{c.name}</div>
            </div>
          ))}
        </div>

        <div className="settings-section" style={{maxWidth:'600px'}}>
          <h2 style={{fontSize:'20px', marginBottom:'20px'}}>General Settings</h2>
          <div className="settings-row" style={{display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(255,255,255,0.03)', padding:'20px', borderRadius:'12px', marginBottom:'15px'}}>
            <div>
              <div style={{fontSize:'16px', fontWeight:'500'}}>Dynamic Theme</div>
              <div style={{fontSize:'13px', color:'var(--text-muted)'}}>Match color to current song artwork</div>
            </div>
            <button 
              onClick={() => setAutoTheme(!autoTheme)}
              style={{
                width: '50px',
                height: '26px',
                borderRadius: '13px',
                background: autoTheme ? themeColor : 'rgba(255,255,255,0.1)',
                border: 'none',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#fff',
                position: 'absolute',
                top: '4px',
                left: autoTheme ? '28px' : '4px',
                transition: 'all 0.3s'
              }}></div>
            </button>
          </div>

          <div className="settings-row" style={{display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(255,255,255,0.03)', padding:'20px', borderRadius:'12px', marginBottom:'15px'}}>
            <div>
              <div style={{fontSize:'16px', fontWeight:'500'}}>Auto-Play</div>
              <div style={{fontSize:'13px', color:'var(--text-muted)'}}>Play similar songs automatically</div>
            </div>
            <button 
              onClick={() => setAutoPlay(!autoPlay)}
              style={{
                width: '50px',
                height: '26px',
                borderRadius: '13px',
                background: autoPlay ? themeColor : 'rgba(255,255,255,0.1)',
                border: 'none',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#fff',
                position: 'absolute',
                top: '4px',
                left: autoPlay ? '28px' : '4px',
                transition: 'all 0.3s'
              }}></div>
            </button>
          </div>

          <div className="settings-row" style={{display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(255,255,255,0.03)', padding:'20px', borderRadius:'12px'}}>
            <div>
              <div style={{fontSize:'16px', fontWeight:'500'}}>Audio Quality</div>
              <div style={{fontSize:'13px', color:'var(--text-muted)'}}>Higher quality uses more data</div>
            </div>
            <div style={{display:'flex', gap:'10px'}}>
              {['low', 'normal', 'high'].map(q => (
                <button 
                  key={q} 
                  onClick={() => setQuality(q)}
                  style={{
                    padding:'8px 16px',
                    borderRadius:'8px',
                    border:'none',
                    background: quality === q ? themeColor : 'rgba(255,255,255,0.05)',
                    color: quality === q ? '#000' : '#fff',
                    fontWeight:'600',
                    textTransform:'capitalize',
                    cursor:'pointer'
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="settings-section" style={{maxWidth:'600px', marginTop:'40px'}}>
          <h2 style={{fontSize:'20px', marginBottom:'20px'}}>Background Style</h2>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))', gap:'20px'}}>
            {[
              { name: 'Midnight', value: 'linear-gradient(135deg, #030303 0%, #000000 100%)' },
              { name: 'Deep Sea', value: 'linear-gradient(135deg, #080a1a 0%, #000000 100%)' },
              { name: 'Obsidian', value: 'linear-gradient(135deg, #1a0a0a 0%, #000000 100%)' },
              { name: 'Forest', value: 'linear-gradient(135deg, #0a1a0a 0%, #000000 100%)' },
            ].map(bg => (
              <div 
                key={bg.name}
                onClick={() => setBgGradient(bg.value)}
                style={{
                  height:'80px',
                  background: bg.value,
                  borderRadius:'12px',
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  cursor:'pointer',
                  border: bgGradient === bg.value ? `2px solid ${themeColor}` : '1px solid rgba(255,255,255,0.1)',
                  fontWeight:'600',
                  fontSize:'14px',
                  color: '#fff'
                }}
              >
                {bg.name}
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return <main className="main"></main>;
}
