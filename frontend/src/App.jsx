import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import MainContent from './components/MainContent';
import PlayerBar from './components/PlayerBar';
import NowPlaying from './components/NowPlaying';
import VideoPlayer from './components/VideoPlayer';
import { api } from './api';
import logoImg from './assets/logo.png';
import './index.css';

// LocalStorage helpers to migrate and read 'ytm_' to 'frog_' keys seamlessly
const getStorageItem = (key, defaultValue) => {
  const frogVal = localStorage.getItem(`frog_${key}`);
  if (frogVal !== null) return frogVal;
  const ytmVal = localStorage.getItem(`ytm_${key}`);
  if (ytmVal !== null) {
    // Migrate to new prefix immediately
    localStorage.setItem(`frog_${key}`, ytmVal);
    return ytmVal;
  }
  return defaultValue;
};

const setStorageItem = (key, value) => {
  localStorage.setItem(`frog_${key}`, value);
};

const getStorageJSON = (key, defaultValue) => {
  const val = getStorageItem(key, null);
  if (val === null) return defaultValue;
  try {
    return JSON.parse(val);
  } catch (e) {
    return defaultValue;
  }
};

const setStorageJSON = (key, value) => {
  setStorageItem(key, JSON.stringify(value));
};

export default function App() {
  const [view, setView] = useState('home');
  const [activePlaylist, setActivePlaylist] = useState(null);
  const [mode, setMode] = useState(() => getStorageItem('mode', 'music'));
  const [activeVideo, setActiveVideo] = useState(null);
  const [channelName, setChannelName] = useState(''); // for channel view
  const [savedVideos, setSavedVideos] = useState(() => getStorageJSON('saved_videos', []));
  const [nowPlaying, setNowPlaying] = useState(false);
  const [splash, setSplash] = useState(true);
  const [current, setCurrent] = useState(() => getStorageJSON('current', null));
  const [queue, setQueue] = useState(() => getStorageJSON('queue', []));
  const [history, setHistory] = useState(() => getStorageJSON('history', []));
  const [results, setResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState('none'); // none, all, one
  const [playlists, setPlaylists] = useState(() => {
    const saved = getStorageJSON('playlists', null);
    if (saved) return saved;
    const legacyLiked = getStorageJSON('liked', []);
    return { "Liked Songs": legacyLiked };
  });
  
  const [themeColor, setThemeColor] = useState(() => getStorageItem('theme', '#FF0000'));
  const [eqSettings, setEqSettings] = useState({ bass: 0, mid: 0, treble: 0 });
  const [sleepTimer, setSleepTimer] = useState(0); // seconds
  const [quality, setQuality] = useState(() => getStorageItem('quality', 'high'));
  const [lyrics, setLyrics] = useState(null);
  const [autoPlay, setAutoPlay] = useState(() => getStorageItem('autoplay', 'false') === 'true');
  const [bgGradient, setBgGradient] = useState(() => getStorageItem('bg', 'linear-gradient(135deg, #030303 0%, #000000 100%)'));
  const [autoTheme, setAutoTheme] = useState(() => getStorageItem('autotheme', 'true') !== 'false');
  const [miniMode, setMiniMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', themeColor);
    setStorageItem('theme', themeColor);
  }, [themeColor]);

  useEffect(() => {
    setStorageItem('mode', mode);
  }, [mode]);

  useEffect(() => {
    setStorageJSON('saved_videos', savedVideos);
  }, [savedVideos]);

  const toggleSaveVideo = (video) => {
    setSavedVideos(prev => {
      const exists = prev.find(v => v.id === video.id);
      if (exists) return prev.filter(v => v.id !== video.id);
      return [video, ...prev];
    });
  };

  const doChannelSearch = (channel) => {
    setChannelName(channel);
    setView('channel');
    doSearch(channel);
  };

  const [currentTime, setCurrentTime] = useState(() => parseFloat(getStorageItem('currentTime', '0')) || 0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => parseFloat(getStorageItem('volume', '0.8')) || 0.8);

  const audioRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  useEffect(() => {
    setStorageJSON('playlists', playlists);
  }, [playlists]);

  useEffect(() => {
    if (current) setStorageJSON('current', current);
    setStorageJSON('queue', queue);
    setStorageJSON('history', history);
  }, [current, queue, history]);

  useEffect(() => {
    setStorageItem('currentTime', currentTime.toString());
  }, [currentTime]);

  useEffect(() => {
    setStorageItem('volume', volume.toString());
  }, [volume]);

  useEffect(() => {
    const timer = setTimeout(() => setSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (sleepTimer > 0) {
      const t = setInterval(() => {
        setSleepTimer(prev => {
          if (prev <= 1) {
            setIsPlaying(false);
            if (audioRef.current) audioRef.current.pause();
            showToast("Sleep timer finished");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(t);
    }
  }, [sleepTimer]);

  const showToast = (msg) => {
    setToastMsg(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastMsg(''), 2200);
  };

  const toggleLike = (id, title) => {
    addToPlaylist("Liked Songs", { id, title, channel: current?.channel || 'Frog Music', duration: current?.duration || 0, thumbnail: current?.thumbnail });
  };

  const addToPlaylist = (playlistName, song) => {
    setPlaylists(prev => {
      const p = prev[playlistName] || [];
      // check if already exists
      const exists = p.find(s => s.id === song.id);
      if (exists) {
        if (playlistName === "Liked Songs") {
          showToast('Removed from library');
          return { ...prev, [playlistName]: p.filter(s => s.id !== song.id) };
        }
        showToast('Already in playlist');
        return prev;
      }
      showToast('Added to ' + playlistName);
      return { ...prev, [playlistName]: [...p, song] };
    });
  };

  const toggleLikeCurrent = () => {
    if (current) toggleLike(current.id, current.title);
  };

  const addToQueue = (song) => {
    setQueue(prev => [...prev, song]);
    showToast('Added to queue');
  };

  const doSearch = useCallback(async (q) => {
    setSearchQuery(q);
    setView('search');
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(api.search(q));
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Smart Radio Query Builder ────────────────────────────────
  const buildRadioQuery = (song) => {
    const title = song.title || '';
    const channel = song.channel || '';

    // Genre / era keywords detection
    const eraMap = [
      { keys: ['90s', '1990', '1991','1992','1993','1994','1995','1996','1997','1998','1999'], label: '90s hits songs' },
      { keys: ['80s', '1980','1981','1982','1983','1984','1985','1986','1987','1988','1989'], label: '80s classic songs' },
      { keys: ['2000s', '2000','2001','2002','2003','2004','2005'], label: '2000s popular songs' },
      { keys: ['retro', 'classic', 'old', 'purana', 'purani'], label: 'classic retro songs' },
      { keys: ['lofi', 'lo-fi', 'chill'], label: 'lofi chill music' },
      { keys: ['party', 'dance', 'club'], label: 'party dance songs' },
      { keys: ['sad', 'emotional', 'dard', 'broken'], label: 'sad emotional songs' },
      { keys: ['romantic', 'love', 'pyaar', 'mohabbat'], label: 'romantic love songs' },
      { keys: ['devotional', 'bhajan', 'mantra', 'spiritual'], label: 'devotional bhajan songs' },
      { keys: ['rap', 'hip hop', 'hiphop'], label: 'hindi rap songs' },
    ];

    const lower = (title + ' ' + channel).toLowerCase();
    for (const era of eraMap) {
      if (era.keys.some(k => lower.includes(k))) {
        return era.label;
      }
    }

    // Fallback: use artist name + 'songs'
    const artist = channel.split(' ').slice(0, 3).join(' ');
    return `${artist} songs`;
  };

  const buildVideoRadioQuery = (video) => {
    const title = video.title || '';
    const channel = video.channel || '';
    // Use first 4-5 meaningful words from title
    const words = title.replace(/[|\-–—:]/g, ' ').split(' ').filter(w => w.length > 3).slice(0, 4).join(' ');
    return words || channel;
  };

  // ── Radio fetch refs (initialized before playSong) ──────────
  const radioFetchingRef = useRef(false);


  const getDominantColor = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = url;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let r=0, g=0, b=0;
        for (let i=0; i<data.length; i+=40) { // sample every 10th pixel
          r += data[i]; g += data[i+1]; b += data[i+2];
        }
        const count = data.length / 40;
        const hex = "#" + ((1 << 24) + (Math.round(r/count) << 16) + (Math.round(g/count) << 8) + Math.round(b/count)).toString(16).slice(1);
        resolve(hex);
      };
      img.onerror = () => resolve('#FF0000');
    });
  };

  const playSong = useCallback(async (song) => {
    if (current) setHistory(prev => [...prev, current]);
    setCurrent(song);

    // Track play count for Smart Playlists
    const updatedPlaylists = { ...playlists };
    const p = updatedPlaylists["Most Played"] || [];
    const existingIdx = p.findIndex(s => s.id === song.id);
    if (existingIdx !== -1) {
      p[existingIdx] = { ...p[existingIdx], playCount: (p[existingIdx].playCount || 1) + 1 };
    } else {
      p.push({ ...song, playCount: 1 });
    }
    // Track Recently Played
    const rp = updatedPlaylists["Recently Played"] || [];
    const filteredRp = rp.filter(s => s.id !== song.id);
    updatedPlaylists["Recently Played"] = [song, ...filteredRp].slice(0, 20);

    updatedPlaylists["Most Played"] = [...p].sort((a,b) => (b.playCount||0) - (a.playCount||0)).slice(0, 20);
    setPlaylists(updatedPlaylists);
    
    if (autoTheme) {
      const color = await getDominantColor(song.thumbnail);
      setThemeColor(color);
    }
    try {
      const res = await fetch(api.stream(song.id, quality));
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      const lres = await fetch(api.lyrics(song.id));
      const ldata = await lres.json();
      setLyrics(ldata.lyrics);

      const audio = audioRef.current;
      audio.src = data.stream_url;
      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      showToast('❌ ' + err.message);
      setIsPlaying(false);
    }
  }, [current, playlists, autoTheme, quality]);

  // ── Radio / Autoplay (defined after playSong to avoid TDZ) ───
  const fetchMusicRadio = useCallback(async (song) => {
    if (radioFetchingRef.current) return false;
    radioFetchingRef.current = true;
    try {
      const q = buildRadioQuery(song);
      const res = await fetch(api.search(q));
      const data = await res.json();
      if (!data.error && Array.isArray(data) && data.length > 0) {
        const radio = data.filter(s => s.id !== song.id).slice(0, 5);
        if (radio.length > 0) {
          const [nextPlay, ...remaining] = radio;
          setQueue(prev => [...prev, ...remaining]);
          showToast(`📻 Radio: Playing similar songs...`);
          playSong(nextPlay);
          return true;
        }
      }
    } catch (_) {}
    finally { radioFetchingRef.current = false; }
    return false;
  }, [playSong]);

  const fetchVideoRadio = useCallback(async (video) => {
    if (radioFetchingRef.current) return [];
    radioFetchingRef.current = true;
    try {
      const q = buildVideoRadioQuery(video);
      const res = await fetch(api.search(q));
      const data = await res.json();
      if (!data.error && Array.isArray(data) && data.length > 0) {
        const related = data.filter(v => v.id !== video.id).slice(0, 5);
        return related;
      }
    } catch (_) {}
    finally { radioFetchingRef.current = false; }
    return [];
  }, []);

  const playNextVideo = useCallback(async (currentVid) => {
    if (!autoPlay) return;
    let nextVid = null;
    if (results && results.length > 0 && mode === 'video') {
      const idx = results.findIndex(v => v.id === currentVid.id);
      if (idx !== -1 && idx < results.length - 1) {
        nextVid = results[idx + 1];
      }
    }
    if (!nextVid) {
      const related = await fetchVideoRadio(currentVid);
      if (related && related.length > 0) nextVid = related[0];
    }
    if (nextVid) {
      setActiveVideo(nextVid);
      showToast(`🎬 Autoplay: Playing next related video`);
    } else {
      showToast(`No more videos to play`);
    }
  }, [results, mode, autoPlay, fetchVideoRadio]);

  const togglePlay = useCallback(async () => {
    if (!current) return;
    const audio = audioRef.current;
    
    if (!audio.src || audio.src === window.location.href) {
      try {
        const res = await fetch(api.stream(current.id));
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        audio.src = data.stream_url;
        audio.currentTime = currentTime;
      } catch (err) {
        showToast('❌ ' + err.message);
        return;
      }
    }

    if (audio.paused) {
      audio.play().then(() => setIsPlaying(true)).catch(e => {
        showToast('Play error: ' + e.message);
        setIsPlaying(false);
      });
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, [current, currentTime]);

  const playNext = useCallback(() => {
    if (queue.length > 0) {
      const [next, ...rest] = queue;
      setQueue(rest);
      playSong(next);
    } else if (repeat === 'all' && results.length > 0) {
      const idx = results.findIndex(s => s.id === current?.id);
      playSong(results[(idx + 1) % results.length]);
    }
  }, [queue, repeat, results, current, playSong]);

  const playPrev = useCallback(() => {
    const audio = audioRef.current;
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
    } else if (history.length > 0) {
      const prevHistory = [...history];
      const prev = prevHistory.pop();
      setHistory(prevHistory);
      playSong(prev);
    }
  }, [history, playSong]);

  useEffect(() => {
    setStorageItem('quality', quality);
  }, [quality]);

  const toggleShuffle = () => {
    setShuffle(s => {
      showToast(!s ? 'Shuffle on' : 'Shuffle off');
      return !s;
    });
  };

  const toggleRepeat = () => {
    const modes = ['none', 'all', 'one'];
    setRepeat(r => {
      const next = modes[(modes.indexOf(r) + 1) % 3];
      const labels = { none: 'Repeat off', all: 'Repeat all', one: 'Repeat one' };
      showToast(labels[next]);
      return next;
    });
  };

  useEffect(() => {
    const audio = audioRef.current;
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);

      // Simple Fade-out at end (last 2 seconds)
      if (audio.duration && audio.duration - audio.currentTime < 2) {
        const fadeRatio = (audio.duration - audio.currentTime) / 2;
        audio.volume = volume * fadeRatio;
      } else {
        audio.volume = volume;
      }
    };
    const handleEnded = async () => {
      if (repeat === 'one') {
        audio.play();
      } else if (queue.length > 0) {
        playNext();
      } else if (autoPlay && current) {
        const startedRadio = await fetchMusicRadio(current);
        if (!startedRadio) {
          playNext();
        }
      } else {
        playNext();
      }
    };
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [repeat, queue, current, playNext, volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [isPlaying]);

  const seek = (pct) => {
    const audio = audioRef.current;
    if (audio.duration) {
      audio.currentTime = (pct / 100) * audio.duration;
    }
  };

  useEffect(() => {
    setStorageItem('autoplay', autoPlay.toString());
  }, [autoPlay]);

  useEffect(() => {
    document.documentElement.style.setProperty('--bg-gradient', bgGradient);
    setStorageItem('bg', bgGradient);
  }, [bgGradient]);

  useEffect(() => {
    if ('mediaSession' in navigator && current) {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: current.title,
        artist: current.channel,
        album: 'Music',
        artwork: [
          { src: current.thumbnail, sizes: '512x512', type: 'image/jpeg' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', togglePlay);
      navigator.mediaSession.setActionHandler('pause', togglePlay);
      navigator.mediaSession.setActionHandler('previoustrack', playPrev);
      navigator.mediaSession.setActionHandler('nexttrack', playNext);
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (audioRef.current) {
          audioRef.current.currentTime = details.seekTime;
          setCurrentTime(details.seekTime);
        }
      });
    }
  }, [current, togglePlay, playNext, playPrev]);

  return (
    <div className={`app ${miniMode ? 'mini-active' : ''} ${mode === 'video' ? 'video-mode' : ''}`}>
      {/* Dynamic blurred background from album art */}
      {current?.thumbnail && (
        <div
          className="app-bg-blur"
          style={{ backgroundImage: `url(${current.thumbnail})` }}
        />
      )}

      {splash && (
        <div className="loading-screen">
          <div className="loading-logo">
            <img src={logoImg} alt="Frog Music Logo" className="loading-logo-img" />
            <span className="loading-logo-text">FROG MUSIC</span>
          </div>
        </div>
      )}

      <TopBar doSearch={doSearch} mode={mode} />
      
      <Sidebar view={view} setView={setView} mode={mode} setMode={setMode} activePlaylist={activePlaylist} setActivePlaylist={setActivePlaylist} />
      
      <MainContent 
        view={view}
        mode={mode}
        results={results}
        loading={loading}
        error={error}
        searchQuery={searchQuery}
        channelName={channelName}
        current={current}
        playlists={playlists}
        setPlaylists={setPlaylists}
        queue={queue}
        playSong={playSong}
        toggleLike={toggleLike}
        addToQueue={addToQueue}
        playNext={playNext}
        addToPlaylist={addToPlaylist}
        doSearch={doSearch}
        doChannelSearch={doChannelSearch}
        setView={setView}
        themeColor={themeColor}
        setThemeColor={setThemeColor}
        quality={quality}
        setQuality={setQuality}
        autoPlay={autoPlay}
        setAutoPlay={setAutoPlay}
        bgGradient={bgGradient}
        setBgGradient={setBgGradient}
        autoTheme={autoTheme}
        setAutoTheme={setAutoTheme}
        onPlayVideo={setActiveVideo}
        savedVideos={savedVideos}
        toggleSaveVideo={toggleSaveVideo}
        activePlaylist={activePlaylist}
        setActivePlaylist={setActivePlaylist}
      />
      
      {mode !== 'video' && (
        <PlayerBar 
          current={current}
          isPlaying={isPlaying}
          togglePlay={togglePlay}
          playNext={playNext}
          playPrev={playPrev}
          shuffle={shuffle}
          toggleShuffle={toggleShuffle}
          repeat={repeat}
          toggleRepeat={toggleRepeat}
          showQueue={() => setView('queue')}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          setVolume={setVolume}
          seek={seek}
          playlists={playlists}
          toggleLikeCurrent={toggleLikeCurrent}
          openNowPlaying={() => setNowPlaying(true)}
          themeColor={themeColor}
          miniMode={miniMode}
          setMiniMode={setMiniMode}
        />
      )}

      {activeVideo && (
        <VideoPlayer
          video={activeVideo}
          onClose={() => setActiveVideo(null)}
          onVideoEnded={playNextVideo}
          autoPlay={autoPlay}
        />
      )}

      {nowPlaying && (
        <NowPlaying 
          current={current}
          isPlaying={isPlaying}
          togglePlay={togglePlay}
          playNext={playNext}
          playPrev={playPrev}
          currentTime={currentTime}
          duration={duration}
          seek={seek}
          close={() => setNowPlaying(false)}
          audioRef={audioRef}
          themeColor={themeColor}
          eqSettings={eqSettings}
          setEqSettings={setEqSettings}
          sleepTimer={sleepTimer}
          setSleepTimer={setSleepTimer}
          lyrics={lyrics}
        />
      )}

      <div className={`toast ${toastMsg ? 'show' : ''}`} id="toast">
        {toastMsg}
      </div>
      
      <audio ref={audioRef} preload="auto"></audio>
    </div>
  );
}
