import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Server,
  ChevronDown,
  Maximize,
  Minimize,
  Film,
  Tv,
  Layers,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useMovieContext } from '../context/MovieContext';
import { fetchStreamUrl } from '../services/api';

// Fallback trailer mapping if needed
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

export default function VideoPlayer() {
  const { playingMovie, closePlayer } = useMovieContext();

  const [streamData, setStreamData] = useState(null);
  const [selectedSourceIndex, setSelectedSourceIndex] = useState(0);
  const [isTrailerMode, setIsTrailerMode] = useState(false);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [serverDropdownOpen, setServerDropdownOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // Determine if playing item is TV show
  const isTv = Boolean(
    playingMovie?.media_type === 'tv' ||
    playingMovie?.first_air_date ||
    playingMovie?.seasons ||
    (playingMovie?.duration && playingMovie.duration.includes('Season'))
  );

  // Total seasons (default 4 if unknown for TV)
  const totalSeasons = playingMovie?.seasons || 4;
  const totalEpisodes = 12;

  const prevMovieIdRef = useRef(null);

  // Fetch streaming source URLs from backend & handle movie changes
  useEffect(() => {
    let isCancelled = false;

    if (playingMovie) {
      if (prevMovieIdRef.current !== playingMovie.id) {
        prevMovieIdRef.current = playingMovie.id;
        setSeason(1);
        setEpisode(1);
        setSelectedSourceIndex(0);
        setIsTrailerMode(false);
        setShowControls(true);
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

  // Handle keyboard events (Escape to exit)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (serverDropdownOpen) {
          setServerDropdownOpen(false);
        } else {
          closePlayer();
        }
      }
    };

    if (playingMovie) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playingMovie, closePlayer, serverDropdownOpen]);

  // Auto-hide controls overlay on mouse inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (!serverDropdownOpen) {
        setShowControls(false);
      }
    }, 4000);
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

  if (!playingMovie) return null;

  const title = playingMovie.title || playingMovie.name || 'Movie';
  const trailerKey =
    streamData?.trailerKey ||
    TRAILER_MAP[playingMovie.id] ||
    'b9EkMc79ZSU';
  const trailerEmbedUrl = `https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`;

  // Get active stream URL
  const sources = streamData?.sources || [];
  const currentSource = sources[selectedSourceIndex] || sources[0];

  const activeStreamUrl = isTrailerMode
    ? trailerEmbedUrl
    : currentSource?.url ||
      streamData?.playableUrl ||
      `https://vidsrc.to/embed/movie/${playingMovie.id}`;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-50 bg-black flex flex-col justify-between select-none text-white overflow-hidden cursor-default"
    >
      {/* 1. Main Streaming Video Player (Responsive Iframe) */}
      <div className="absolute inset-0 z-0 bg-black flex items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-14 h-14 border-4 border-t-[#E50914] border-white/20 rounded-full animate-spin" />
            <p className="text-gray-300 font-medium text-sm animate-pulse tracking-wide">
              Connecting to secure streaming server...
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

      {/* 2. Top Header Navigation Overlay Bar */}
      <div
        className={`relative z-40 px-4 sm:px-8 py-4 bg-gradient-to-b from-black/95 via-black/70 to-transparent transition-opacity duration-300 flex flex-wrap items-center justify-between gap-4 ${
          showControls || serverDropdownOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Left Section: Back Button & Title */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={closePlayer}
            className="p-2.5 rounded-full bg-black/60 hover:bg-[#E50914] border border-white/20 transition-all text-white cursor-pointer shadow-lg group"
            title="Back to Browse (Esc)"
            aria-label="Back to Browse"
          >
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-xl font-black text-white drop-shadow-md">
                {title}
              </h1>
              {isTrailerMode ? (
                <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded">
                  Trailer Preview
                </span>
              ) : (
                <span className="text-[10px] uppercase font-bold bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Full Stream
                </span>
              )}
            </div>

            <p className="text-xs text-gray-300 flex items-center gap-2 mt-0.5">
              {isTv ? (
                <span className="flex items-center gap-1 text-gray-300 font-medium">
                  <Tv className="w-3.5 h-3.5 text-[#E50914]" />
                  Season {season} : Episode {episode}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-gray-400">
                  <Film className="w-3.5 h-3.5 text-[#E50914]" />
                  Feature Movie
                </span>
              )}
              <span>•</span>
              <span className="text-gray-400">
                {playingMovie.release_date?.slice(0, 4) ||
                  playingMovie.first_air_date?.slice(0, 4) ||
                  'HD'}
              </span>
            </p>
          </div>
        </div>

        {/* Center / Right Section: TV Controls, Server Switcher, and Mode Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* TV Season & Episode Selectors */}
          {isTv && !isTrailerMode && (
            <div className="flex items-center gap-2 bg-black/70 border border-white/20 rounded-lg p-1 backdrop-blur-md">
              <div className="flex items-center gap-1 px-2 text-xs text-gray-400">
                <Layers className="w-3.5 h-3.5 text-gray-400" />
                <span className="hidden sm:inline">Season</span>
              </div>
              <select
                value={season}
                onChange={(e) => {
                  setSeason(Number(e.target.value));
                  setEpisode(1);
                }}
                className="bg-[#1f1f1f] text-white text-xs font-semibold py-1 px-2 rounded border border-white/10 outline-none cursor-pointer hover:border-white/40"
              >
                {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
                  <option key={s} value={s}>
                    S{s}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1 px-1 text-xs text-gray-400">
                <span className="hidden sm:inline">Ep</span>
              </div>
              <select
                value={episode}
                onChange={(e) => setEpisode(Number(e.target.value))}
                className="bg-[#1f1f1f] text-white text-xs font-semibold py-1 px-2 rounded border border-white/10 outline-none cursor-pointer hover:border-white/40"
              >
                {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((ep) => (
                  <option key={ep} value={ep}>
                    E{ep}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Server Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setServerDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 bg-black/70 hover:bg-black/90 border border-white/20 hover:border-white/40 px-3 py-1.5 rounded-lg text-xs font-semibold text-white backdrop-blur-md transition-all shadow-md cursor-pointer"
            >
              <Server className="w-3.5 h-3.5 text-[#E50914]" />
              <span className="max-w-[130px] sm:max-w-[180px] truncate">
                {isTrailerMode ? 'Official Trailer' : currentSource?.provider || 'Server 1 (VidSrc)'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1" />
            </button>

            {serverDropdownOpen && (
              <div
                onMouseLeave={() => setServerDropdownOpen(false)}
                className="absolute right-0 mt-2 w-64 bg-[#181818] border border-white/20 rounded-xl shadow-2xl p-2 z-50 text-xs backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-white/10 mb-1 flex items-center justify-between">
                  <span>Select Stream Server</span>
                  <span className="text-green-400 font-mono text-[10px]">Online</span>
                </div>

                {/* Available Streaming Servers */}
                <div className="space-y-1">
                  {sources.map((source, index) => {
                    const isSelected = !isTrailerMode && selectedSourceIndex === index;
                    return (
                      <button
                        key={source.provider}
                        onClick={() => {
                          setSelectedSourceIndex(index);
                          setIsTrailerMode(false);
                          setServerDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#E50914] text-white font-bold'
                            : 'hover:bg-white/10 text-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-400" />
                          <span>{source.provider}</span>
                        </div>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                            isSelected ? 'bg-black/40 text-white' : 'bg-white/10 text-gray-300'
                          }`}
                        >
                          {source.quality || 'HD'}
                        </span>
                      </button>
                    );
                  })}

                  {/* Trailer Option */}
                  <div className="border-t border-white/10 pt-1 mt-1">
                    <button
                      onClick={() => {
                        setIsTrailerMode(true);
                        setServerDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                        isTrailerMode
                          ? 'bg-[#E50914] text-white font-bold'
                          : 'hover:bg-white/10 text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Official HD Trailer</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 font-mono text-gray-300">
                        YouTube
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Reload Stream button */}
          <button
            onClick={() => {
              setLoading(true);
              fetchStreamUrl(playingMovie, { season, episode }).then((data) => {
                setStreamData(data);
                setLoading(false);
              });
            }}
            className="p-2 rounded-lg bg-black/70 hover:bg-white/10 border border-white/20 text-gray-300 hover:text-white transition-colors cursor-pointer"
            title="Reload Stream"
            aria-label="Reload Stream"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#E50914]' : ''}`} />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-black/70 hover:bg-white/10 border border-white/20 text-gray-300 hover:text-white transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            aria-label="Fullscreen"
          >
            {isFullscreen ? (
              <Minimize className="w-3.5 h-3.5" />
            ) : (
              <Maximize className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* 3. Bottom Subtle Stream Server Indicator Overlay */}
      <div
        className={`relative z-30 px-6 py-3 bg-gradient-to-t from-black/90 to-transparent transition-opacity duration-300 flex items-center justify-between text-xs text-gray-400 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#E50914] animate-pulse" />
          <span className="text-gray-300 font-medium">
            Active Provider: {isTrailerMode ? 'YouTube Trailer' : currentSource?.provider || 'VidSrc'}
          </span>
          <span className="text-gray-500 hidden sm:inline">• Free Streaming Enabled</span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-gray-400">
          <span>Press <kbd className="bg-white/10 px-1 py-0.5 rounded text-white font-mono">Esc</kbd> to exit</span>
        </div>
      </div>
    </div>
  );
}
