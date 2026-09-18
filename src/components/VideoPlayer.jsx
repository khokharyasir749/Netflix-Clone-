import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  ArrowLeft,
  Play,
  X,
  RefreshCw,
  Tv,
  ChevronDown,
  Check,
  Maximize,
  Minimize,
  Sparkles,
  Server,
  Layers,
} from 'lucide-react';
import { useMovieContext } from '../context/MovieContext';
import { getImageUrl, DEFAULT_FALLBACK_IMAGE } from '../services/api';

const TMDB_API_KEY = '4e44d9029b1270a757cddc766a1bcb63';

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
  111110: 'l34h7tOQe5M', // One Piece
};

// Fallback episode generator if TMDB is offline
function getFallbackEpisodes(showTitle, seasonNum) {
  return Array.from({ length: 8 }, (_, idx) => {
    const epNum = idx + 1;
    return {
      ep: epNum,
      title: `Chapter ${epNum}: ${showTitle || 'Episode'} Part ${epNum}`,
      duration: `${44 + ((epNum * 3) % 15)}m`,
      overview: `Episode ${epNum} of Season ${seasonNum}. Unexpected complications force the characters to make difficult decisions as tensions escalate.`,
      stillPath: null,
    };
  });
}

// 4 Top Reliable Stream Engines
const STREAM_ENGINES = [
  {
    id: 'vidsrc',
    name: 'VidSrc VIP',
    badge: 'Primary 1080p',
    isPrimary: true,
    getUrl: (id, isTv, season, episode) =>
      isTv
        ? `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`
        : `https://vidsrc.to/embed/movie/${id}`,
  },
  {
    id: 'autoembed',
    name: 'AutoEmbed',
    badge: 'Backup 1',
    getUrl: (id, isTv, season, episode) =>
      isTv
        ? `https://player.autoembed.cc/embed/tv/${id}/${season}/${episode}`
        : `https://player.autoembed.cc/embed/movie/${id}`,
  },
  {
    id: 'superembed',
    name: 'SuperEmbed',
    badge: 'Backup 2',
    getUrl: (id, isTv, season, episode) =>
      `https://multiembed.mov/?video_id=${id}&tmdb=1${isTv ? `&s=${season}&e=${episode}` : ''}`,
  },
  {
    id: '2embed',
    name: '2Embed',
    badge: 'Backup 3',
    getUrl: (id, isTv, season, episode) =>
      isTv
        ? `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`
        : `https://www.2embed.cc/embed/${id}`,
  },
];

export default function VideoPlayer() {
  const { playingMovie, closePlayer } = useMovieContext();

  // Engine selection & mode
  const [selectedEngineId, setSelectedEngineId] = useState('vidsrc');
  const [isTrailerMode, setIsTrailerMode] = useState(false);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  // UI state overlays
  const [isServerMenuOpen, setIsServerMenuOpen] = useState(false);
  const [isEpisodesDrawerOpen, setIsEpisodesDrawerOpen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Dynamic TMDB TV Show & Season data
  const [seasonsData, setSeasonsData] = useState([]);
  const [episodesList, setEpisodesList] = useState([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);

  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const serverMenuRef = useRef(null);
  const prevMovieIdRef = useRef(null);

  // Check if current title is TV Show
  const isTv = Boolean(
    playingMovie?.media_type === 'tv' ||
    playingMovie?.first_air_date ||
    playingMovie?.seasons ||
    (playingMovie?.duration && playingMovie.duration.includes('Season'))
  );

  const title = playingMovie?.title || playingMovie?.name || 'Movie';
  const movieId = playingMovie?.id;

  // Reset season/episode and server choice when a different movie opens
  useEffect(() => {
    if (playingMovie && prevMovieIdRef.current !== playingMovie.id) {
      prevMovieIdRef.current = playingMovie.id;
      setSeason(1);
      setEpisode(1);
      setSelectedEngineId('vidsrc');
      setIsTrailerMode(false);
      setIsServerMenuOpen(false);
      setIsEpisodesDrawerOpen(false);
      setReloadKey(0);
    }
  }, [playingMovie]);

  // Fetch real TV Show Seasons list from TMDB
  useEffect(() => {
    let isCancelled = false;

    if (playingMovie && isTv) {
      fetch(
        `https://api.themoviedb.org/3/tv/${playingMovie.id}?api_key=${TMDB_API_KEY}&language=en-US`
      )
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!isCancelled && data && data.seasons) {
            const validSeasons = data.seasons.filter((s) => s.season_number > 0);
            if (validSeasons.length > 0) {
              setSeasonsData(validSeasons);
              return;
            }
          }
          const count = playingMovie.seasons || 4;
          setSeasonsData(
            Array.from({ length: count }, (_, i) => ({
              season_number: i + 1,
              name: `Season ${i + 1}`,
              episode_count: 8,
            }))
          );
        })
        .catch(() => {
          if (!isCancelled) {
            const count = playingMovie.seasons || 4;
            setSeasonsData(
              Array.from({ length: count }, (_, i) => ({
                season_number: i + 1,
                name: `Season ${i + 1}`,
                episode_count: 8,
              }))
            );
          }
        });
    }

    return () => {
      isCancelled = true;
    };
  }, [playingMovie, isTv]);

  // Fetch real episodes for selected season from TMDB
  useEffect(() => {
    let isCancelled = false;

    if (playingMovie && isTv) {
      setEpisodesLoading(true);
      fetch(
        `https://api.themoviedb.org/3/tv/${playingMovie.id}/season/${season}?api_key=${TMDB_API_KEY}&language=en-US`
      )
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!isCancelled && data && data.episodes && data.episodes.length > 0) {
            const formatted = data.episodes.map((ep) => ({
              ep: ep.episode_number,
              title: ep.name || `Episode ${ep.episode_number}`,
              duration: ep.runtime ? `${ep.runtime}m` : '48m',
              overview: ep.overview || 'No overview available for this episode.',
              stillPath: ep.still_path
                ? `https://image.tmdb.org/t/p/w500${ep.still_path}`
                : getImageUrl(playingMovie.backdrop_path || playingMovie.poster_path, 'w500'),
            }));
            setEpisodesList(formatted);
            setEpisodesLoading(false);
            return;
          }
          if (!isCancelled) {
            setEpisodesList(getFallbackEpisodes(title, season));
            setEpisodesLoading(false);
          }
        })
        .catch(() => {
          if (!isCancelled) {
            setEpisodesList(getFallbackEpisodes(title, season));
            setEpisodesLoading(false);
          }
        });
    }

    return () => {
      isCancelled = true;
    };
  }, [playingMovie, isTv, season, title]);

  const currentEpisodeObj = useMemo(() => {
    return episodesList.find((e) => e.ep === episode) || episodesList[0];
  }, [episodesList, episode]);

  // Compute active stream URL
  const activeEngine =
    STREAM_ENGINES.find((e) => e.id === selectedEngineId) || STREAM_ENGINES[0];

  const trailerKey = TRAILER_MAP[playingMovie?.id] || 'b9EkMc79ZSU';
  const trailerEmbedUrl = `https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`;

  const activeStreamUrl = isTrailerMode
    ? trailerEmbedUrl
    : activeEngine.getUrl(movieId, isTv, season, episode);

  // Auto-hide controls overlay after 3.5s of mouse inactivity
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (!isServerMenuOpen && !isEpisodesDrawerOpen) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3500);
    }
  }, [isServerMenuOpen, isEpisodesDrawerOpen]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  // Click outside Server Dropdown closes it
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        isServerMenuOpen &&
        serverMenuRef.current &&
        !serverMenuRef.current.contains(e.target)
      ) {
        setIsServerMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isServerMenuOpen]);

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isEpisodesDrawerOpen) {
          setIsEpisodesDrawerOpen(false);
        } else if (isServerMenuOpen) {
          setIsServerMenuOpen(false);
        } else {
          closePlayer();
        }
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };

    if (playingMovie) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playingMovie, closePlayer, isEpisodesDrawerOpen, isServerMenuOpen]);

  if (!playingMovie) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black overflow-hidden font-sans select-none pointer-events-none"
    >
      {/* 1. Fullscreen Stream Iframe (Native Controls, Full Pointer Events) */}
      <div className="absolute inset-0 z-0 bg-black flex items-center justify-center pointer-events-auto">
        <iframe
          key={`${activeStreamUrl}-${reloadKey}`}
          src={activeStreamUrl}
          title={`${title} Player`}
          className="w-full h-full border-0 pointer-events-auto"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* 2. Top Bar: Floating Netflix Chrome (Hover Visible, Clean & Unobtrusive) */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 px-4 sm:px-8 py-4 sm:py-6 bg-gradient-to-b from-black/95 via-black/60 to-transparent transition-opacity duration-300 flex items-center justify-between pointer-events-none ${
          showControls || isServerMenuOpen || isEpisodesDrawerOpen
            ? 'opacity-100'
            : 'opacity-0'
        }`}
      >
        {/* Left Side: Back Arrow + Title + S/E Tag */}
        <div className="flex items-center gap-3 sm:gap-5 pointer-events-auto min-w-0">
          <button
            onClick={closePlayer}
            className="p-2 rounded-full hover:bg-white/20 transition-all text-white cursor-pointer group shrink-0"
            title="Back to Browse (Esc)"
            aria-label="Back to Browse"
          >
            <ArrowLeft className="w-6 h-6 sm:w-8 sm:h-8 group-hover:-translate-x-1 transition-transform" />
          </button>

          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-bold text-white tracking-wide drop-shadow-md truncate max-w-[180px] sm:max-w-md md:max-w-xl">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 flex items-center gap-2 mt-0.5 truncate">
              {isTv ? (
                <>
                  <span className="font-semibold text-white">S{season}:E{episode}</span>
                  <span className="text-[#E50914] font-medium">•</span>
                  <span className="truncate text-gray-300">
                    "{currentEpisodeObj?.title || `Episode ${episode}`}"
                  </span>
                </>
              ) : (
                <span className="text-gray-300 font-medium">Feature Presentation • 1080p HD</span>
              )}
            </p>
          </div>
        </div>

        {/* Right Side: Server Switcher Dropdown, Episodes Drawer Trigger, Refresh, Fullscreen */}
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto shrink-0">
          {/* A. Server Switcher Dropdown */}
          <div ref={serverMenuRef} className="relative">
            <button
              onClick={() => setIsServerMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 bg-black/75 hover:bg-[#242424] text-white border border-white/20 hover:border-white/40 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md transition-all cursor-pointer shadow-lg"
              title="Switch Streaming Server"
              aria-label="Switch Streaming Server"
            >
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="hidden xs:inline sm:inline max-w-[110px] truncate">
                {isTrailerMode ? 'Official Trailer' : activeEngine.name}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                  isServerMenuOpen ? 'rotate-180 text-white' : ''
                }`}
              />
            </button>

            {/* Server Menu Dropdown */}
            {isServerMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-[#141414]/98 border border-white/20 rounded-2xl shadow-2xl p-2.5 backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-white/10 mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-[#E50914]" />
                    <span>Stream Servers</span>
                  </div>
                  <span className="text-green-400 font-mono text-[10px]">High Speed</span>
                </div>

                <div className="space-y-1">
                  {STREAM_ENGINES.map((engine) => {
                    const isSelected = !isTrailerMode && selectedEngineId === engine.id;
                    return (
                      <button
                        key={engine.id}
                        onClick={() => {
                          setSelectedEngineId(engine.id);
                          setIsTrailerMode(false);
                          setIsServerMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                          isSelected
                            ? 'bg-[#E50914] text-white font-bold shadow-md'
                            : 'hover:bg-white/10 text-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isSelected ? 'bg-white' : 'bg-green-400'
                            }`}
                          />
                          <span>{engine.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                              isSelected
                                ? 'bg-black/30 text-white'
                                : 'bg-white/10 text-gray-300'
                            }`}
                          >
                            {engine.badge}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                      </button>
                    );
                  })}

                  {/* Official Trailer Fallback */}
                  <div className="border-t border-white/10 my-1" />
                  <button
                    onClick={() => {
                      setIsTrailerMode(true);
                      setIsServerMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                      isTrailerMode
                        ? 'bg-[#E50914] text-white font-bold shadow-md'
                        : 'hover:bg-white/10 text-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Official Trailer</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isTrailerMode ? 'bg-black/30 text-white' : 'bg-white/10 text-gray-300'
                      }`}
                    >
                      YouTube
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* B. Episodes Drawer Button (TV Series Only) */}
          {isTv && (
            <button
              onClick={() => setIsEpisodesDrawerOpen((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md transition-all cursor-pointer shadow-lg border ${
                isEpisodesDrawerOpen
                  ? 'bg-[#E50914] border-[#E50914] text-white'
                  : 'bg-black/75 hover:bg-[#242424] text-white border-white/20 hover:border-white/40'
              }`}
              title="Episodes & Seasons"
              aria-label="Episodes & Seasons"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Episodes</span>
            </button>
          )}

          {/* C. Reload Stream */}
          <button
            onClick={() => setReloadKey((prev) => prev + 1)}
            className="p-2 rounded-full bg-black/75 hover:bg-[#242424] border border-white/20 hover:border-white/40 text-white transition-all cursor-pointer backdrop-blur-md"
            title="Reload Stream"
            aria-label="Reload Stream"
          >
            <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* D. Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full bg-black/75 hover:bg-[#242424] border border-white/20 hover:border-white/40 text-white transition-all cursor-pointer backdrop-blur-md"
            title={isFullscreen ? 'Exit Fullscreen (F)' : 'Enter Fullscreen (F)'}
            aria-label="Fullscreen"
          >
            {isFullscreen ? (
              <Minimize className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            ) : (
              <Maximize className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </button>
        </div>
      </div>

      {/* 3. Slide-Out Episodes Drawer (Authentic Netflix Side Drawer) */}
      {isEpisodesDrawerOpen && isTv && (
        <>
          {/* Backdrop Click Dismiss */}
          <div
            onClick={() => setIsEpisodesDrawerOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs pointer-events-auto transition-opacity"
          />

          {/* Slide-out Drawer Panel */}
          <div className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[460px] md:w-[500px] bg-[#141414]/98 border-l border-white/10 shadow-2xl backdrop-blur-2xl flex flex-col pointer-events-auto animate-in slide-in-from-right duration-300">
            {/* Drawer Header with Season Selector Dropdown & Close */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Tv className="w-5 h-5 text-[#E50914]" />
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Episodes
                </h2>
              </div>

              <div className="flex items-center gap-3">
                {/* Season Dropdown Selector */}
                <div className="relative">
                  <select
                    value={season}
                    onChange={(e) => {
                      setSeason(Number(e.target.value));
                      setEpisode(1);
                    }}
                    className="bg-[#242424] hover:bg-[#2e2e2e] text-white text-xs font-bold py-1.5 px-3 pr-8 rounded-lg border border-white/20 outline-none cursor-pointer appearance-none transition-colors"
                  >
                    {seasonsData.map((s) => (
                      <option
                        key={s.season_number}
                        value={s.season_number}
                        className="bg-[#181818] text-white"
                      >
                        {s.name || `Season ${s.season_number}`}{' '}
                        {s.episode_count ? `(${s.episode_count} Episodes)` : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <button
                  onClick={() => setIsEpisodesDrawerOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  title="Close Episodes"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Episode Cards List */}
            <div className="flex-grow overflow-y-auto p-4 sm:p-5 space-y-3 scrollbar-thin scrollbar-thumb-white/20">
              {episodesLoading ? (
                <div className="flex flex-col items-center justify-center py-24 text-center text-gray-400 space-y-3">
                  <div className="w-8 h-8 border-2 border-t-[#E50914] border-white/20 rounded-full animate-spin" />
                  <p className="text-xs tracking-wide">Loading Season {season} episodes...</p>
                </div>
              ) : (
                episodesList.map((epItem) => {
                  const isCurrent = epItem.ep === episode;
                  return (
                    <div
                      key={epItem.ep}
                      onClick={() => {
                        setEpisode(epItem.ep);
                        setIsEpisodesDrawerOpen(false);
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex gap-3.5 ${
                        isCurrent
                          ? 'border-[#E50914] bg-[#E50914]/15 shadow-xl'
                          : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      {/* Thumbnail with duration badge */}
                      <div className="relative w-28 sm:w-36 aspect-[16/9] rounded-lg overflow-hidden shrink-0 bg-black/70">
                        <img
                          src={epItem.stillPath || DEFAULT_FALLBACK_IMAGE}
                          alt={epItem.title}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = DEFAULT_FALLBACK_IMAGE;
                          }}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <span className="absolute bottom-1 right-1 bg-black/85 px-1.5 py-0.2 rounded text-[10px] font-mono text-gray-300">
                          {epItem.duration}
                        </span>
                        {isCurrent && (
                          <div className="absolute inset-0 bg-[#E50914]/40 flex items-center justify-center">
                            <Play className="w-5 h-5 fill-white text-white drop-shadow" />
                          </div>
                        )}
                      </div>

                      {/* Info & Synopsis */}
                      <div className="flex-grow min-w-0 flex flex-col justify-between py-0.5">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <h3
                              className={`text-xs sm:text-sm font-bold truncate ${
                                isCurrent ? 'text-[#E50914]' : 'text-white'
                              }`}
                            >
                              {epItem.ep}. {epItem.title}
                            </h3>
                            {isCurrent && (
                              <span className="text-[9px] font-bold uppercase tracking-wider bg-[#E50914] text-white px-1.5 py-0.5 rounded shrink-0">
                                Playing
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                            {epItem.overview}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
