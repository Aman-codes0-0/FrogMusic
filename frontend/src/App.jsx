import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import MainContent from './components/MainContent';
import PlayerBar from './components/PlayerBar';
import NowPlaying from './components/NowPlaying';
import VideoPlayer from './components/VideoPlayer';
import { api } from './api';
import { fmt } from './utils';
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

  // doChannelSearch is defined later (after doSearch) as a useCallback
  // BUG-19 FIX: moved below doSearch to avoid calling doSearch internally

  const [currentTime, setCurrentTime] = useState(() => parseFloat(getStorageItem('currentTime', '0')) || 0);
  const lastSavedTimeRef = useRef(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => parseFloat(getStorageItem('volume', '0.8')) || 0.8);

  const audioRef = useRef(null);
  const toastTimeoutRef = useRef(null);
  // BUG-11 FIX: Use refs for quality and autoTheme so playSong never needs
  // them in its dependency array, eliminating expensive callback re-creations.
  const qualityRef = useRef(quality);
  const autoThemeRef = useRef(autoTheme);
  // BUG-13 FIX: volumeRef so playSong can reset volume before next song
  const volumeRef = useRef(volume);

  const currentRef = useRef(current);
  const queueRef = useRef(queue);
  const historyRef = useRef(history);
  const shuffleRef = useRef(shuffle);
  const repeatRef = useRef(repeat);
  const autoPlayRef = useRef(autoPlay);
  const resultsRef = useRef(results);
  const currentTimeRef = useRef(currentTime);
  const activePlaylistRef = useRef(activePlaylist);
  const playlistsRef = useRef(playlists);

  useEffect(() => {
    setStorageJSON('playlists', playlists);
  }, [playlists]);

  // BUG-11 FIX: Keep refs in sync with state so playSong reads latest values
  useEffect(() => { qualityRef.current = quality; }, [quality]);
  useEffect(() => { autoThemeRef.current = autoTheme; }, [autoTheme]);
  // BUG-13 FIX: Keep volumeRef in sync
  useEffect(() => { volumeRef.current = volume; }, [volume]);

  // Sync state refs to prevent stale closures in stable callback handlers (BUG-11, BUG-14, BUG-16)
  useEffect(() => { currentRef.current = current; }, [current]);
  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { historyRef.current = history; }, [history]);
  useEffect(() => { shuffleRef.current = shuffle; }, [shuffle]);
  useEffect(() => { repeatRef.current = repeat; }, [repeat]);
  useEffect(() => { autoPlayRef.current = autoPlay; }, [autoPlay]);
  useEffect(() => { resultsRef.current = results; }, [results]);
  useEffect(() => { currentTimeRef.current = currentTime; }, [currentTime]);
  useEffect(() => { activePlaylistRef.current = activePlaylist; }, [activePlaylist]);
  useEffect(() => { playlistsRef.current = playlists; }, [playlists]);

  useEffect(() => {
    // BUG-22 FIX: Always write current (even null) so clearing current is persisted
    setStorageJSON('current', current);
    setStorageJSON('queue', queue);
    setStorageJSON('history', history);
  }, [current, queue, history]);

  // BUG-54 FIX: Update browser tab title to reflect currently playing song
  useEffect(() => {
    document.title = current ? `${current.title} – Frog Music` : 'Frog Music';
  }, [current]);

  useEffect(() => {
    // Throttle: localStorage sirf har 5 seconds mein save karo
    if (Math.abs(currentTime - lastSavedTimeRef.current) > 5) {
      setStorageItem('currentTime', currentTime.toString());
      lastSavedTimeRef.current = currentTime;
    }
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

  // BUG-21 FIX: Clean up toast timeout on unmount to prevent setState on
  // unmounted component (especially triggered by React StrictMode double-invoke)
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

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

  // BUG-19 FIX: doChannelSearch no longer calls doSearch (which resets view to
  // 'search'). It fetches data directly and sets view to 'channel' properly.
  const doChannelSearch = useCallback(async (channel) => {
    setChannelName(channel);
    setSearchQuery(channel);
    setView('channel');
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(api.search(channel));
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
        try {
          ctx.drawImage(img, 0, 0);
          // BUG-15 FIX: getImageData throws SecurityError when YouTube's CDN
          // doesn't return CORS headers. Catch it and fall back to default color.
          const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
          let r=0, g=0, b=0;
          for (let i=0; i<data.length; i+=40) { // sample every 10th pixel
            r += data[i]; g += data[i+1]; b += data[i+2];
          }
          const count = data.length / 40;
          const hex = "#" + ((1 << 24) + (Math.round(r/count) << 16) + (Math.round(g/count) << 8) + Math.round(b/count)).toString(16).slice(1);
          resolve(hex);
        } catch (e) {
          // CORS / SecurityError — use default accent colour
          resolve('#4E9F3D');
        }
      };
      img.onerror = () => resolve('#4E9F3D');
    });
  };

  const playSong = useCallback(async (song) => {
    // Reset play progress metrics to prevent visual jumps from the previous song
    setCurrentTime(0);
    setDuration(0);

    const prevSong = currentRef.current;
    if (prevSong) setHistory(prev => [...prev, prevSong]);
    setCurrent(song);

    // Track play count for Smart Playlists
    setPlaylists(prev => {
      const updatedPlaylists = { ...prev };
      const p = [...(updatedPlaylists["Most Played"] || [])];
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
      return updatedPlaylists;
    });

    // BUG-11 FIX: Read from refs so this callback is stable (no quality/autoTheme deps)
    if (autoThemeRef.current) {
      getDominantColor(song.thumbnail).then(color => setThemeColor(color));
    }

    try {
      const [streamRes, lyricsRes] = await Promise.all([
        fetch(api.stream(song.id, qualityRef.current)),
        fetch(api.lyrics(song.id))
      ]);
      const [data, ldata] = await Promise.all([
        streamRes.json(),
        lyricsRes.json()
      ]);

      if (data.error) throw new Error(data.error);
      setLyrics(ldata.lyrics || null);

      const audio = audioRef.current;
      // BUG-13 FIX: Reset volume to current level before playing a new song
      // so the fade-out from the previous track doesn't carry over.
      audio.volume = volumeRef.current;
      audio.src = data.stream_url;
      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      showToast('❌ ' + err.message);
      setIsPlaying(false);
    }
  // Stable callback dependency array — zero re-registrations
  }, []);

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
    const currentSong = currentRef.current;
    if (!currentSong) return;
    const audio = audioRef.current;

    if (!audio.src || audio.src === window.location.href) {
      try {
        const res = await fetch(api.stream(currentSong.id));
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        audio.src = data.stream_url;
        // BUG-12 FIX: Wait for canplay before seeking.
        // BUG-18 FIX: Add upper-bound check against duration to prevent seeking beyond end.
        audio.addEventListener('canplay', () => {
          const storedTime = currentTimeRef.current;
          if (audio.duration && storedTime >= audio.duration) {
            audio.currentTime = 0;
          } else if (storedTime > 0) {
            audio.currentTime = storedTime;
          }
        }, { once: true });
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
  // Stable callback dependency array — zero re-registrations
  }, []);

  // BUG-10 FIX: Shuffle now actually randomizes song selection, and plays next from active list/search results if manual queue is empty
  const playNext = useCallback(() => {
    const currentQueue = queueRef.current;
    const currentRepeat = repeatRef.current;
    const currentResults = resultsRef.current;
    const currentSong = currentRef.current;
    const currentShuffle = shuffleRef.current;
    const currentActivePlaylist = activePlaylistRef.current;
    const currentPlaylists = playlistsRef.current;

    // 1. Play from manual queue first if songs are queued
    if (currentQueue.length > 0) {
      let next, rest;
      if (currentShuffle) {
        const idx = Math.floor(Math.random() * currentQueue.length);
        next = currentQueue[idx];
        rest = currentQueue.filter((_, i) => i !== idx);
      } else {
        [next, ...rest] = currentQueue;
      }
      setQueue(rest);
      playSong(next);
      return;
    }

    // 2. Otherwise, find the active list (playlist or search results)
    let songList = currentResults || [];
    if (currentActivePlaylist && currentPlaylists[currentActivePlaylist]) {
      songList = currentPlaylists[currentActivePlaylist];
    }

    if (songList.length > 0) {
      const idx = songList.findIndex(s => s.id === currentSong?.id);
      if (currentShuffle) {
        const nextIdx = Math.floor(Math.random() * songList.length);
        playSong(songList[nextIdx]);
      } else if (idx !== -1) {
        if (idx < songList.length - 1) {
          // Play the next song in the list
          playSong(songList[idx + 1]);
        } else if (currentRepeat === 'all') {
          // Loop back to the start of the list
          playSong(songList[0]);
        } else {
          showToast("End of list");
        }
      } else {
        // Fallback: play first song
        playSong(songList[0]);
      }
    } else {
      showToast("No more songs in list");
    }
  // Stable callback dependency array — zero re-registrations
  }, [playSong]);

  const playPrev = useCallback(() => {
    const audio = audioRef.current;
    const currentHistory = historyRef.current;

    if (audio.currentTime > 3) {
      audio.currentTime = 0;
    } else if (currentHistory.length > 0) {
      const prevHistory = [...currentHistory];
      const prev = prevHistory.pop();
      setHistory(prevHistory);
      playSong(prev);
    } else {
      // BUG-20 FIX: When history is empty, restart current song instead of
      // doing nothing (which gives the user no feedback)
      audio.currentTime = 0;
      if (audio.paused) audio.play().catch(() => {});
    }
  // Stable callback dependency array — zero re-registrations
  }, [playSong]);

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

  // Register audio handlers once on mount and keep them synchronized via refs (BUG-13, BUG-14)
  useEffect(() => {
    const audio = audioRef.current;
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);

      // Simple Fade-out at end (last 2 seconds)
      const currentVolume = volumeRef.current;
      if (audio.duration && audio.duration - audio.currentTime < 2) {
        const fadeRatio = (audio.duration - audio.currentTime) / 2;
        audio.volume = currentVolume * fadeRatio;
      } else {
        audio.volume = currentVolume;
      }
    };
    const handleEnded = async () => {
      const currentRepeat = repeatRef.current;
      const currentQueue = queueRef.current;
      const currentSong = currentRef.current;
      const currentAutoPlay = autoPlayRef.current;

      if (currentRepeat === 'one') {
        audio.play();
      } else if (currentQueue.length > 0) {
        playNext();
      } else if (currentAutoPlay && currentSong) {
        const startedRadio = await fetchMusicRadio(currentSong);
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
  // Only register once — handlers will dynamically read the latest state from refs
  }, [playNext, fetchMusicRadio]);

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

      <TopBar doSearch={doSearch} mode={mode} setMode={setMode} setView={setView} />
      
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
