import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  Volume1,
  VolumeX,
  SkipForward,
  ListOrdered,
  MessageSquare,
  Gauge,
  Settings,
  Maximize,
  Minimize,
  Check,
  X,
  Sparkles,
  RefreshCw,
  Tv,
} from 'lucide-react';
import { useMovieContext } from '../context/MovieContext';
import { fetchStreamUrl } from '../services/api';

// Trailer fallback mapping for iconic Netflix & featured titles
const TRAILER_MAP = {
  66732: 'b9EkMc79ZSU', // Stranger Things
  119051: 'Di310BC87gk', // Wednesday
  157336: 'zSWdZVtXT7E', // Interstellar
  27205: 'YoHD9XEInc0', // Inception
  71912: 'ndl1W4QKZas', // The Witcher
  1396: 'HhesaQh8bTE', // Breaking Bad
  70523: 'rrwycJ08PSA', // Dark
  105248: 'JtqIas3bYhg', // Cyberpunk: Edgerunners
  93405: 'oqxAJKy0ii4', // Squid Game
  71446: 'gFZri2YbFUxgNxQTggSXQBsY2IO', // Money Heist
  155: 'EXeTwQWrcwY', // The Dark Knight
  361743: 'qSqVVswa420', // Top Gun: Maverick
  569094: 'cqGjhVJWtEg', // Spider-Man: Across the Spider-Verse
  87739: 'oZn3qSgmLqI', // The Queen's Gambit
  94605: 'fXmAurh012s', // Arcane
  83880: 'aETNYyrqNYE', // Our Planet
};

// Rich TV Show episode lists with authentic synopses & durations
const EPISODES_DB = {
  // Stranger Things
  66732: [
    { ep: 1, title: 'Chapter One: The Vanishing of Will Byers', duration: '48m', overview: 'On his way home from a friend\'s house, young Will sees something terrifying. Nearby, a sinister secret lurks in the depths of a government lab.' },
    { ep: 2, title: 'Chapter Two: The Weirdo on Maple Street', duration: '55m', overview: 'Lucas, Mike and Dustin try to talk to the girl they found in the woods. Hopper questions an anxious Joyce about an unsettling phone call.' },
    { ep: 3, title: 'Chapter Three: Holly, Jolly', duration: '51m', overview: 'An increasingly frantic Joyce tries to make contact with Will. Nancy questions what Barbara was doing at Steve\'s party.' },
    { ep: 4, title: 'Chapter Four: The Body', duration: '50m', overview: 'Refusing to believe Will is dead, Joyce tries to connect with her son. The boys give Eleven a makeover with a blonde wig and dress.' },
    { ep: 5, title: 'Chapter Five: The Flea and the Acrobat', duration: '53m', overview: 'Hopper breaks into the lab while Nancy and Jonathan confront the supernatural entity that took Will in the woods.' },
    { ep: 6, title: 'Chapter Six: The Monster', duration: '47m', overview: 'A frantic Jonathan looks for Nancy in the darkness, but Steve\'s looking for her too. Joyce and Hopper find out about the lab tests.' },
    { ep: 7, title: 'Chapter Seven: The Bathtub', duration: '42m', overview: 'Eleven struggles to reach Will telepathically through a makeshift sensory deprivation tank, while the bad men close in.' },
    { ep: 8, title: 'Chapter Eight: The Upside Down', duration: '55m', overview: 'Hopper and Joyce are interrogated at the lab. The boys wait with Eleven in the school gym as the Demogorgon approaches.' },
  ],
  // Wednesday
  119051: [
    { ep: 1, title: 'Wednesday\'s Child is Full of Woe', duration: '59m', overview: 'When a deliciously wicked prank gets Wednesday expelled, her parents ship her off to Nevermore Academy.' },
    { ep: 2, title: 'Woe is the Loneliest Number', duration: '48m', overview: 'The sheriff questions Wednesday about the strange happenings. Later, she enters the fiercely competitive Poe Cup race.' },
    { ep: 3, title: 'Friend or Woe', duration: '48m', overview: 'Wednesday stumbles upon a secret society during Outreach Day. Things take a dark turn in Pilgrim World.' },
    { ep: 4, title: 'Woe What a Night', duration: '49m', overview: 'Wednesday asks Xavier to the Rave\'N dance, sparking Tyler\'s jealousy. Thing has something sneaky up his sleeve.' },
    { ep: 5, title: 'You Reap What You Woe', duration: '52m', overview: 'During Parents\' Weekend, Wednesday digs into her family\'s past — and accidentally leads to an arrest.' },
    { ep: 6, title: 'Quid Pro Woe', duration: '50m', overview: 'Wednesday\'s friends throw her a surprise birthday party. They mean well, but she\'d rather mark the miserable occasion solving murders.' },
    { ep: 7, title: 'If You Don\'t Woe Me by Now', duration: '47m', overview: 'Eccentric Uncle Fester pays a visit and shares his theory about the monster. Wednesday begrudgingly agrees to a date with Tyler.' },
    { ep: 8, title: 'A Murder of Woes', duration: '52m', overview: 'Wednesday runs into trouble with Principal Weems, but that\'s just the start of her woes. To fight an ancient evil, she\'ll need all her friends.' },
  ],
  // Breaking Bad
  1396: [
    { ep: 1, title: 'Pilot', duration: '58m', overview: 'When an unassuming chemistry teacher is diagnosed with terminal lung cancer, he decides to break bad to secure his family\'s financial future.' },
    { ep: 2, title: 'Cat\'s in the Bag...', duration: '48m', overview: 'Walt and Jesse attempt to dispose of two bodies, which turns out to be trickier than they anticipated.' },
    { ep: 3, title: '...And the Bag\'s in the River', duration: '48m', overview: 'Walt wrestles with a life-or-death moral decision regarding Krazy-8 in Jesse\'s basement.' },
    { ep: 4, title: 'Cancer Man', duration: '48m', overview: 'Walt is forced to tell his family about his cancer diagnosis at a tense backyard barbecue.' },
    { ep: 5, title: 'Gray Matter', duration: '48m', overview: 'Walt rejects financial aid from an old friend and former business partner, prioritizing his fierce pride.' },
    { ep: 6, title: 'Crazy Handful of Nothin\'', duration: '48m', overview: 'Walt adopts the moniker \'Heisenberg\' and confronts a dangerous distributor named Tuco Salamanca.' },
    { ep: 7, title: 'A No-Rough-Stuff-Type Deal', duration: '48m', overview: 'Walt and Jesse negotiate a massive deal with Tuco, but procuring the chemical ingredients presents an explosive problem.' },
  ],
};

// Generates fallback realistic episodes for any show/season
function getEpisodesList(movieId, showTitle, seasonNum) {
  if (EPISODES_DB[movieId] && seasonNum === 1) {
    return EPISODES_DB[movieId];
  }
  return Array.from({ length: 8 }, (_, idx) => {
    const epNum = idx + 1;
    return {
      ep: epNum,
      title: `Chapter ${epNum}: ${showTitle || 'Episode'} Part ${epNum}`,
      duration: `${44 + ((epNum * 3) % 15)}m`,
      overview: `Episode ${epNum} of Season ${seasonNum}. Unexpected complications force the characters to make difficult decisions as tensions escalate.`,
    };
  });
}

// Audio options
const AUDIO_OPTIONS = [
  { id: 'en-orig', label: 'English [Original]', badge: '5.1' },
  { id: 'en-desc', label: 'English - Audio Description', badge: '' },
  { id: 'es', label: 'Spanish', badge: '5.1' },
  { id: 'hi', label: 'Hindi / Urdu', badge: '' },
  { id: 'fr', label: 'French', badge: '5.1' },
  { id: 'de', label: 'German', badge: '5.1' },
];

// Subtitle options
const SUBTITLE_OPTIONS = [
  { id: 'off', label: 'Off' },
  { id: 'en-cc', label: 'English [CC]' },
  { id: 'es', label: 'Spanish' },
  { id: 'ar', label: 'Arabic' },
  { id: 'fr', label: 'French' },
  { id: 'de', label: 'German' },
];

// Playback speeds
const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5];

// Stream Qualities
const QUALITY_OPTIONS = ['Auto', '1080p (HD)', '720p', '480p'];

export default function VideoPlayer() {
  const { playingMovie, closePlayer } = useMovieContext();

  // Core stream states
  const [streamData, setStreamData] = useState(null);
  const [selectedSourceIndex, setSelectedSourceIndex] = useState(0);
  const [isTrailerMode, setIsTrailerMode] = useState(false);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [loading, setLoading] = useState(true);

  // Playback & Timeline simulation states
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(14.5); // Percentage
  const [totalDurationSec] = useState(2820); // 47:00
  const [hoverPos, setHoverPos] = useState(null); // Timeline hover percentage

  // Audio / Volume
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState('en-orig');
  const [selectedSubtitle, setSelectedSubtitle] = useState('en-cc');

  // Playback Speed & Quality
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [selectedQuality, setSelectedQuality] = useState('1080p (HD)');

  // UI overlays & popups: 'episodes' | 'audio' | 'speed' | 'settings' | null
  const [activePopup, setActivePopup] = useState(null);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const scrubberRef = useRef(null);
  const popupRef = useRef(null);
  const prevMovieIdRef = useRef(null);

  // Check if current title is TV Show
  const isTv = Boolean(
    playingMovie?.media_type === 'tv' ||
    playingMovie?.first_air_date ||
    playingMovie?.seasons ||
    (playingMovie?.duration && playingMovie.duration.includes('Season'))
  );

  const totalSeasons = playingMovie?.seasons || 4;
  const title = playingMovie?.title || playingMovie?.name || 'Movie';

  // Available episodes for current season
  const episodesList = useMemo(() => {
    if (!playingMovie) return [];
    return getEpisodesList(playingMovie.id, title, season);
  }, [playingMovie, title, season]);

  const currentEpisodeObj = episodesList.find((e) => e.ep === episode) || episodesList[0];

  // Rewind & Fast Forward 10s
  const handleRewind10 = () => {
    const deltaPercent = (10 / totalDurationSec) * 100;
    setProgress((prev) => Math.max(0, prev - deltaPercent));
  };

  const handleForward10 = () => {
    const deltaPercent = (10 / totalDurationSec) * 100;
    setProgress((prev) => Math.min(100, prev + deltaPercent));
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Fetch streaming source URLs from backend on movie / episode change
  useEffect(() => {
    let isCancelled = false;

    if (playingMovie) {
      if (prevMovieIdRef.current !== playingMovie.id) {
        prevMovieIdRef.current = playingMovie.id;
        setSeason(1);
        setEpisode(1);
        setSelectedSourceIndex(0);
        setIsTrailerMode(false);
        setProgress(12.0);
        setIsPlaying(true);
        setActivePopup(null);
      }

      setLoading(true);
      fetchStreamUrl(playingMovie, { season, episode })
        .then((data) => {
          if (!isCancelled) {
            setStreamData(data);
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error('Failed to load stream:', err);
          if (!isCancelled) {
            setLoading(false);
          }
        });
    }

    return () => {
      isCancelled = true;
    };
  }, [playingMovie, season, episode]);

  // Simulated timeline playback increment
  useEffect(() => {
    let interval = null;
    if (isPlaying && !loading) {
      interval = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 0.08));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, loading]);

  // Auto-hide controls overlay after 3.5s of mouse inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    // Do not auto-hide if a modal popup or drawer is active
    if (!activePopup) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3500);
    }
  };

  // Keyboard shortcut handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (activePopup) {
          setActivePopup(null);
        } else {
          closePlayer();
        }
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMuted((prev) => !prev);
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'ArrowLeft') {
        handleRewind10();
      } else if (e.key === 'ArrowRight') {
        handleForward10();
      }
    };

    if (playingMovie) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playingMovie, closePlayer, activePopup]);

  // Click outside popup to close it
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (activePopup && popupRef.current && !popupRef.current.contains(e.target)) {
        // Only close if click wasn't on the toggle trigger buttons
        if (!e.target.closest('[data-popup-trigger]')) {
          setActivePopup(null);
        }
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [activePopup]);

  // Next Episode handler for TV
  const handleNextEpisode = () => {
    if (!isTv) return;
    if (episode < episodesList.length) {
      setEpisode((prev) => prev + 1);
    } else if (season < totalSeasons) {
      setSeason((prev) => prev + 1);
      setEpisode(1);
    }
  };

  // Format seconds to MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentSec = Math.floor((progress / 100) * totalDurationSec);
  const remainingSec = Math.max(0, totalDurationSec - currentSec);

  // Scrubber mouse click and hover calculations
  const handleScrubberClick = (e) => {
    if (!scrubberRef.current) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const newPercent = (clickX / rect.width) * 100;
    setProgress(newPercent);
  };

  const handleScrubberMouseMove = (e) => {
    if (!scrubberRef.current) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const hoverX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const hoverPercent = (hoverX / rect.width) * 100;
    setHoverPos(hoverPercent);
  };

  if (!playingMovie) return null;

  // Active streaming source URLs
  const sources = streamData?.sources || [];
  const currentSource = sources[selectedSourceIndex] || sources[0];
  const trailerKey =
    streamData?.trailerKey ||
    TRAILER_MAP[playingMovie.id] ||
    'b9EkMc79ZSU';
  const trailerEmbedUrl = `https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`;

  const activeStreamUrl = isTrailerMode
    ? trailerEmbedUrl
    : currentSource?.url ||
      streamData?.playableUrl ||
      `https://vidsrc.to/embed/movie/${playingMovie.id}`;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-50 bg-black flex flex-col justify-between select-none text-white overflow-hidden font-sans cursor-default"
    >
      {/* 1. Fullscreen Video Stream Iframe Container */}
      <div className="absolute inset-0 z-0 bg-black flex items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-16 h-16 border-4 border-t-[#E50914] border-white/20 rounded-full animate-spin" />
            <p className="text-gray-300 font-medium text-sm animate-pulse tracking-wide">
              Loading Netflix Cinema Stream...
            </p>
          </div>
        ) : (
          <iframe
            key={`${activeStreamUrl}-${isTrailerMode}-${season}-${episode}`}
            src={activeStreamUrl}
            title={`${title} Player`}
            className="w-full h-full border-0"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>

      {/* 2. Top Header Overlay (Back Button, Title & Episode Info) */}
      <div
        className={`relative z-40 px-6 sm:px-10 py-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent transition-opacity duration-300 flex items-center justify-between ${
          showControls || activePopup ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-5">
          <button
            onClick={closePlayer}
            className="p-2 rounded-full hover:bg-white/20 transition-all text-white cursor-pointer group"
            title="Back to Browse (Esc)"
            aria-label="Back to Browse"
          >
            <ArrowLeft className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
          </button>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide drop-shadow-md">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 flex items-center gap-2 mt-0.5">
              {isTv ? (
                <>
                  <span className="font-semibold text-white">S{season}:E{episode}</span>
                  <span>"{currentEpisodeObj?.title || `Episode ${episode}`}"</span>
                </>
              ) : (
                <span>Feature Presentation</span>
              )}
            </p>
          </div>
        </div>

        {/* Live Streaming Badge */}
        <div className="hidden sm:flex items-center gap-2 bg-black/60 border border-white/20 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-[#E50914] animate-pulse" />
          <span className="text-gray-200">
            {isTrailerMode ? 'Official Trailer' : currentSource?.provider || 'VidSrc HD'}
          </span>
        </div>
      </div>

      {/* 3. Floating Popups Container (Episodes Tray, Audio/Subs, Speed, Quality/Server) */}
      {activePopup && (
        <div ref={popupRef} className="relative z-50">
          {/* A. Episodes Tray Drawer (Authentic Netflix Slide-in Drawer) */}
          {activePopup === 'episodes' && isTv && (
            <div className="absolute bottom-24 right-4 sm:right-12 w-[92vw] sm:w-[480px] max-h-[75vh] bg-[#181818]/95 border border-white/20 rounded-2xl shadow-2xl p-5 backdrop-blur-xl flex flex-col z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Tv className="w-5 h-5 text-[#E50914]" />
                  <h2 className="text-base font-bold text-white">Episodes</h2>
                </div>
                <button
                  onClick={() => setActivePopup(null)}
                  className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Seasons Selector Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
                {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSeason(s);
                      setEpisode(1);
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                      season === s
                        ? 'bg-[#E50914] text-white shadow-lg'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    Season {s}
                  </button>
                ))}
              </div>

              {/* Episode Cards List */}
              <div className="space-y-2 overflow-y-auto max-h-[50vh] pr-1 scrollbar-thin scrollbar-thumb-white/20">
                {episodesList.map((epItem) => {
                  const isCurrent = epItem.ep === episode;
                  return (
                    <div
                      key={epItem.ep}
                      onClick={() => {
                        setEpisode(epItem.ep);
                        setActivePopup(null);
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex gap-3.5 ${
                        isCurrent
                          ? 'border-[#E50914] bg-[#E50914]/15'
                          : 'border-white/5 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      {/* Ep Number / Play Badge */}
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-black/60 text-white font-bold text-sm shrink-0">
                        {isCurrent ? (
                          <Play className="w-4 h-4 fill-[#E50914] text-[#E50914]" />
                        ) : (
                          epItem.ep
                        )}
                      </div>

                      {/* Info & Synopsis */}
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className={`text-xs sm:text-sm font-bold truncate ${isCurrent ? 'text-[#E50914]' : 'text-white'}`}>
                            {epItem.title}
                          </h3>
                          <span className="text-[11px] font-mono text-gray-400 shrink-0">
                            {epItem.duration}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                          {epItem.overview}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* B. Audio & Subtitles 2-Column Popup Menu */}
          {activePopup === 'audio' && (
            <div className="absolute bottom-24 right-4 sm:right-28 w-[92vw] sm:w-[460px] bg-[#141414]/95 border border-white/20 rounded-2xl shadow-2xl p-6 backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#E50914]" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Audio & Subtitles
                  </h3>
                </div>
                <button
                  onClick={() => setActivePopup(null)}
                  className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Column 1: Audio */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Audio
                  </h4>
                  <div className="space-y-1">
                    {AUDIO_OPTIONS.map((opt) => {
                      const isSelected = selectedAudio === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setSelectedAudio(opt.id)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                            isSelected ? 'text-white font-bold bg-white/10' : 'text-gray-300 hover:text-white'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#E50914]" />}
                            <span className={isSelected ? '' : 'pl-5'}>{opt.label}</span>
                          </span>
                          {opt.badge && (
                            <span className="text-[9px] border border-white/30 px-1 py-0.2 rounded font-mono text-gray-400">
                              {opt.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Column 2: Subtitles */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Subtitles
                  </h4>
                  <div className="space-y-1">
                    {SUBTITLE_OPTIONS.map((opt) => {
                      const isSelected = selectedSubtitle === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setSelectedSubtitle(opt.id)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                            isSelected ? 'text-white font-bold bg-white/10' : 'text-gray-300 hover:text-white'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#E50914]" />}
                            <span className={isSelected ? '' : 'pl-5'}>{opt.label}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* C. Playback Speed Dropdown */}
          {activePopup === 'speed' && (
            <div className="absolute bottom-24 right-4 sm:right-24 w-44 bg-[#141414]/95 border border-white/20 rounded-xl shadow-2xl p-2 backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-white/10 mb-1">
                Playback Speed
              </div>
              <div className="space-y-1">
                {SPEED_OPTIONS.map((spd) => {
                  const isSelected = playbackSpeed === spd;
                  return (
                    <button
                      key={spd}
                      onClick={() => {
                        setPlaybackSpeed(spd);
                        setActivePopup(null);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#E50914] text-white font-bold'
                          : 'hover:bg-white/10 text-gray-200'
                      }`}
                    >
                      <span>{spd === 1.0 ? '1x (Normal)' : `${spd}x`}</span>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* D. Quality / Stream Server Settings Dropdown */}
          {activePopup === 'settings' && (
            <div className="absolute bottom-24 right-4 sm:right-16 w-64 bg-[#141414]/95 border border-white/20 rounded-2xl shadow-2xl p-3 backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* Stream Servers Section */}
              <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-white/10 mb-1 flex items-center justify-between">
                <span>Stream Server</span>
                <span className="text-green-400 font-mono text-[10px]">Online</span>
              </div>
              <div className="space-y-1 mb-3">
                {sources.map((source, index) => {
                  const isSelected = !isTrailerMode && selectedSourceIndex === index;
                  return (
                    <button
                      key={source.provider}
                      onClick={() => {
                        setSelectedSourceIndex(index);
                        setIsTrailerMode(false);
                        setActivePopup(null);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#E50914] text-white font-bold'
                          : 'hover:bg-white/10 text-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-400" />
                        <span className="truncate max-w-[140px]">{source.provider}</span>
                      </div>
                      <span className="text-[10px] font-mono px-1 rounded bg-black/30 text-gray-300">
                        {source.quality || 'HD'}
                      </span>
                    </button>
                  );
                })}

                {/* Trailer Switch Option */}
                <button
                  onClick={() => {
                    setIsTrailerMode(true);
                    setActivePopup(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                    isTrailerMode
                      ? 'bg-[#E50914] text-white font-bold'
                      : 'hover:bg-white/10 text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Official Trailer</span>
                  </div>
                  <span className="text-[10px] font-mono px-1 rounded bg-black/30 text-gray-300">
                    YouTube
                  </span>
                </button>
              </div>

              {/* Quality Selection Section */}
              <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-white/10 mb-1">
                Video Quality
              </div>
              <div className="grid grid-cols-2 gap-1">
                {QUALITY_OPTIONS.map((q) => {
                  const isSelected = selectedQuality === q;
                  return (
                    <button
                      key={q}
                      onClick={() => setSelectedQuality(q)}
                      className={`px-2 py-1.5 rounded-md text-xs text-center transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-white/20 text-white font-bold'
                          : 'hover:bg-white/10 text-gray-400'
                      }`}
                    >
                      {q}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Bottom Anchored Netflix Control Bar (Pixel-Perfect Authentic Clone) */}
      <div
        className={`relative z-40 px-6 sm:px-10 pb-6 pt-16 bg-gradient-to-t from-black via-black/80 to-transparent transition-opacity duration-300 space-y-3 ${
          showControls || activePopup ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* A. Netflix Scrubber Timeline with Hover Preview */}
        <div
          ref={scrubberRef}
          onClick={handleScrubberClick}
          onMouseMove={handleScrubberMouseMove}
          onMouseLeave={() => setHoverPos(null)}
          className="relative group/scrub py-2 flex items-center cursor-pointer select-none"
        >
          {/* Hover Time Tooltip */}
          {hoverPos !== null && (
            <div
              className="absolute -top-7 px-2 py-0.5 rounded bg-black/90 border border-white/20 text-[11px] font-mono text-white pointer-events-none -translate-x-1/2 shadow-lg"
              style={{ left: `${hoverPos}%` }}
            >
              {formatTime(Math.floor((hoverPos / 100) * totalDurationSec))}
            </div>
          )}

          {/* Background Track */}
          <div className="w-full h-1 group-hover/scrub:h-2 bg-white/20 rounded-full relative transition-all duration-200 overflow-visible">
            {/* Simulated Buffered Track */}
            <div
              className="absolute top-0 left-0 bottom-0 bg-white/40 rounded-full"
              style={{ width: `${Math.min(100, progress + 28)}%` }}
            />

            {/* Red Active Progress Track */}
            <div
              className="absolute top-0 left-0 bottom-0 bg-[#E50914] rounded-full flex items-center justify-end"
              style={{ width: `${progress}%` }}
            >
              {/* Circular Red Scrub Thumb */}
              <div className="w-3.5 h-3.5 rounded-full bg-[#E50914] shadow-md border border-white/20 scale-0 group-hover/scrub:scale-100 transition-transform -mr-1.5 cursor-pointer" />
            </div>
          </div>
        </div>

        {/* B. Action Clusters Bar */}
        <div className="flex items-center justify-between pt-1">
          {/* Left-Hand Control Cluster */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Play / Pause Toggle Icon (28px) */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-white hover:text-white/80 transition-transform active:scale-95 cursor-pointer"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 fill-white" />
              ) : (
                <Play className="w-7 h-7 fill-white" />
              )}
            </button>

            {/* Rewind 10s */}
            <button
              onClick={handleRewind10}
              className="relative text-white hover:text-white/80 transition-colors p-1 cursor-pointer flex items-center justify-center group"
              title="Rewind 10 seconds (Left Arrow)"
              aria-label="Rewind 10 seconds"
            >
              <RotateCcw className="w-6 h-6" />
              <span className="absolute text-[8px] font-bold font-mono text-white mt-0.5">
                10
              </span>
            </button>

            {/* Forward 10s */}
            <button
              onClick={handleForward10}
              className="relative text-white hover:text-white/80 transition-colors p-1 cursor-pointer flex items-center justify-center group"
              title="Forward 10 seconds (Right Arrow)"
              aria-label="Forward 10 seconds"
            >
              <RotateCw className="w-6 h-6" />
              <span className="absolute text-[8px] font-bold font-mono text-white mt-0.5">
                10
              </span>
            </button>

            {/* Volume / Mute with Expandable Slider */}
            <div className="flex items-center gap-2 group/vol">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-white hover:text-white/80 transition-colors p-1 cursor-pointer"
                title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-6 h-6 text-[#E50914]" />
                ) : volume < 50 ? (
                  <Volume1 className="w-6 h-6" />
                ) : (
                  <Volume2 className="w-6 h-6" />
                )}
              </button>

              <div className="w-0 group-hover/vol:w-20 sm:group-hover/vol:w-24 transition-all duration-300 overflow-hidden flex items-center">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(Number(e.target.value));
                    setIsMuted(false);
                  }}
                  className="w-20 sm:w-24 h-1 bg-white/30 rounded appearance-none cursor-pointer accent-[#E50914]"
                />
              </div>
            </div>

            {/* Current Playing Title & Episode Name */}
            <div className="hidden md:flex flex-col ml-2">
              <span className="text-sm font-bold text-white leading-tight">
                {title}
              </span>
              {isTv && (
                <span className="text-xs text-gray-300 font-medium">
                  S{season}:E{episode} "{currentEpisodeObj?.title || `Episode ${episode}`}"
                </span>
              )}
            </div>
          </div>

          {/* Right-Hand Netflix Action Cluster */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Remaining Time Display */}
            <span className="text-xs font-mono text-gray-300 select-none mr-1">
              -{formatTime(remainingSec)}
            </span>

            {/* Next Episode Icon (for TV Shows) */}
            {isTv && (
              <button
                onClick={handleNextEpisode}
                className="text-white hover:text-white/80 transition-colors p-1 cursor-pointer"
                title={`Next Episode (S${season}:E${episode + 1})`}
                aria-label="Next Episode"
              >
                <SkipForward className="w-5 h-5 fill-white" />
              </button>
            )}

            {/* Episodes Tray Icon (TV Shows) */}
            {isTv && (
              <button
                data-popup-trigger="episodes"
                onClick={() =>
                  setActivePopup((prev) => (prev === 'episodes' ? null : 'episodes'))
                }
                className={`transition-colors p-1 cursor-pointer ${
                  activePopup === 'episodes' ? 'text-[#E50914]' : 'text-white hover:text-white/80'
                }`}
                title="Episodes Tray"
                aria-label="Episodes Tray"
              >
                <ListOrdered className="w-5 h-5" />
              </button>
            )}

            {/* Audio & Subtitles Icon (Speech Bubble) */}
            <button
              data-popup-trigger="audio"
              onClick={() =>
                setActivePopup((prev) => (prev === 'audio' ? null : 'audio'))
              }
              className={`transition-colors p-1 cursor-pointer ${
                activePopup === 'audio' ? 'text-[#E50914]' : 'text-white hover:text-white/80'
              }`}
              title="Audio & Subtitles"
              aria-label="Audio & Subtitles"
            >
              <MessageSquare className="w-5 h-5" />
            </button>

            {/* Playback Speed Icon */}
            <button
              data-popup-trigger="speed"
              onClick={() =>
                setActivePopup((prev) => (prev === 'speed' ? null : 'speed'))
              }
              className={`transition-colors p-1 cursor-pointer flex items-center gap-0.5 text-xs font-bold ${
                activePopup === 'speed' ? 'text-[#E50914]' : 'text-white hover:text-white/80'
              }`}
              title="Playback Speed"
              aria-label="Playback Speed"
            >
              <Gauge className="w-5 h-5" />
              <span className="hidden lg:inline text-[11px] font-mono">{playbackSpeed}x</span>
            </button>

            {/* Quality / Stream Server Gear Icon */}
            <button
              data-popup-trigger="settings"
              onClick={() =>
                setActivePopup((prev) => (prev === 'settings' ? null : 'settings'))
              }
              className={`transition-colors p-1 cursor-pointer ${
                activePopup === 'settings' ? 'text-[#E50914]' : 'text-white hover:text-white/80'
              }`}
              title="Stream Server & Quality Settings"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Reload Stream button */}
            <button
              onClick={() => {
                setLoading(true);
                fetchStreamUrl(playingMovie, { season, episode }).then((data) => {
                  setStreamData(data);
                  setLoading(false);
                });
              }}
              className="text-white hover:text-white/80 transition-colors p-1 cursor-pointer"
              title="Refresh Stream"
              aria-label="Refresh Stream"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#E50914]' : ''}`} />
            </button>

            {/* Fullscreen Icon (Maximize / Minimize) */}
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-white/80 transition-colors p-1 cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen (F)' : 'Enter Fullscreen (F)'}
              aria-label="Fullscreen"
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
