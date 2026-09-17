import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Subtitles,
  HelpCircle,
  Film,
  Info,
} from 'lucide-react';
import { useMovieContext } from '../context/MovieContext';

// Mapped official HD YouTube trailers for top Netflix & featured titles
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

  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(12); // Simulated initial progress (percentage)
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showTrailerVideo, setShowTrailerVideo] = useState(true);

  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closePlayer();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };

    if (playingMovie) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playingMovie, closePlayer]);

  // Auto-hide controls after inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3500);
  };

  // Simulated playback time increment
  useEffect(() => {
    let interval = null;
    if (isPlaying && playingMovie) {
      interval = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 0.2));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, playingMovie]);

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

  if (!playingMovie) return null;

  const title = playingMovie.title || playingMovie.name;
  const youtubeTrailerId = TRAILER_MAP[playingMovie.id] || 'b9EkMc79ZSU';

  // Format simulated timestamps
  const totalSeconds = 2700; // 45:00
  const currentSeconds = Math.floor((progress / 100) * totalSeconds);
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-50 bg-black flex flex-col justify-between select-none text-white overflow-hidden cursor-default"
    >
      {/* Background Video / Trailer Embed or Simulator Screen */}
      <div className="absolute inset-0 z-0 bg-black flex items-center justify-center">
        {showTrailerVideo ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeTrailerId}?autoplay=1&mute=${
              isMuted ? 1 : 0
            }&controls=0&modestbranding=1&rel=0&loop=1&playlist=${youtubeTrailerId}`}
            title={`${title} Official Trailer`}
            className="w-full h-full pointer-events-none scale-105"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-t-[#E50914] border-white/20 rounded-full animate-spin mx-auto" />
            <p className="text-gray-400 text-sm font-medium">Streaming Simulation Active</p>
          </div>
        )}

        {/* Demo Watermark Banner */}
        <div className="absolute top-20 right-6 bg-black/70 border border-white/20 px-3 py-1.5 rounded text-[11px] font-semibold text-gray-300 backdrop-blur-sm shadow-lg pointer-events-none flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#E50914] animate-pulse" />
          <span>Preview Mode • Full Movie Streaming Disabled</span>
        </div>
      </div>

      {/* Top Header Bar */}
      <div
        className={`relative z-30 px-6 py-6 bg-gradient-to-b from-black/90 via-black/40 to-transparent transition-opacity duration-300 flex items-center justify-between ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={closePlayer}
            className="p-2 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
            title="Back to Browse"
            aria-label="Back to Browse"
          >
            <ArrowLeft className="w-7 h-7" />
          </button>

          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white drop-shadow">
              {title}
            </h1>
            <p className="text-xs text-gray-400">
              {playingMovie.media_type === 'tv' ? 'Season 1 : Episode 1' : 'Feature Presentation'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowTrailerVideo(!showTrailerVideo)}
          className="text-xs border border-white/30 px-3 py-1.5 rounded hover:bg-white/10 transition-colors text-gray-300"
        >
          {showTrailerVideo ? 'Switch to Cinema Player' : 'Switch to Official Trailer'}
        </button>
      </div>

      {/* Bottom Controls Bar */}
      <div
        className={`relative z-30 px-6 pb-6 pt-12 bg-gradient-to-t from-black via-black/70 to-transparent transition-opacity duration-300 space-y-3 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Scrub Bar */}
        <div className="relative group/scrub flex items-center cursor-pointer">
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-[#E50914] group-hover/scrub:h-2.5 transition-all"
          />
        </div>

        {/* Action Controls & Timestamps */}
        <div className="flex items-center justify-between pt-1">
          {/* Left Controls: Play/Pause, Rewind, FastForward, Volume */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Play / Pause */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 hover:text-[#E50914] transition-colors cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-white" />
              ) : (
                <Play className="w-6 h-6 fill-white" />
              )}
            </button>

            {/* Skip 10s Backward */}
            <button
              onClick={() => setProgress((prev) => Math.max(0, prev - 4))}
              className="p-1.5 hover:text-gray-300 transition-colors cursor-pointer"
              title="Rewind 10 seconds"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* Skip 10s Forward */}
            <button
              onClick={() => setProgress((prev) => Math.min(100, prev + 4))}
              className="p-1.5 hover:text-gray-300 transition-colors cursor-pointer"
              title="Forward 10 seconds"
            >
              <RotateCw className="w-5 h-5" />
            </button>

            {/* Volume & Slider */}
            <div className="flex items-center gap-2 group/volume">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1.5 hover:text-gray-300 transition-colors cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>

              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(Number(e.target.value));
                  setIsMuted(false);
                }}
                className="w-16 sm:w-24 h-1 bg-gray-600 rounded appearance-none cursor-pointer accent-[#E50914]"
              />
            </div>

            {/* Time Stamp */}
            <span className="text-xs text-gray-400 font-mono hidden sm:inline-block">
              {formatTime(currentSeconds)} / {formatTime(totalSeconds)}
            </span>
          </div>

          {/* Center: Title (Hidden on small mobile) */}
          <div className="hidden md:block text-xs font-semibold text-gray-300">
            {title}
          </div>

          {/* Right Controls: Subtitles, Speed, Fullscreen */}
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Subtitles Toggle */}
            <button
              onClick={() => setSubtitlesEnabled(!subtitlesEnabled)}
              className={`p-1.5 transition-colors cursor-pointer ${
                subtitlesEnabled ? 'text-[#E50914]' : 'text-gray-400 hover:text-white'
              }`}
              title="Subtitles / Audio"
            >
              <Subtitles className="w-5 h-5" />
            </button>

            {/* Speed Indicator */}
            <span className="text-xs font-bold border border-gray-600 px-1.5 py-0.5 rounded text-gray-300 cursor-pointer hover:border-white">
              1x
            </span>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 hover:text-gray-300 transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
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
