import React, { useState, useEffect } from 'react';
import { Play, Info, Check, Plus } from 'lucide-react';
import { fetchMovies, getImageUrl } from '../services/api';
import { useMovieContext } from '../context/MovieContext';

const DEFAULT_BANNER_BACKDROP =
  'https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg';

export default function Banner() {
  const [movie, setMovie] = useState(null);
  const { isInWatchlist, addToWatchlist, removeFromWatchlist, playMovie, openDetailModal } = useMovieContext();

  useEffect(() => {
    async function loadBannerMovie() {
      try {
        const originals = await fetchMovies('netflixOriginals');
        const candidates = originals.length > 0 ? originals : await fetchMovies('trending');
        if (candidates.length > 0) {
          const randomChoice = candidates[Math.floor(Math.random() * candidates.length)];
          setMovie(randomChoice);
        }
      } catch (err) {
        console.error('Failed to load banner movie:', err);
      }
    }

    loadBannerMovie();
  }, []);

  if (!movie) {
    return (
      <div className="relative h-[75vh] md:h-[88vh] w-full bg-[#141414] animate-pulse flex items-end pb-24 px-4 md:px-12" />
    );
  }

  const title = movie.title || movie.name;
  const isTv = Boolean(
    movie.media_type === 'tv' ||
    movie.first_air_date ||
    movie.seasons ||
    (movie.duration && movie.duration.includes('Season'))
  );
  const releaseYear = (movie.first_air_date || movie.release_date || '2023').substring(0, 4);
  const inList = isInWatchlist(movie.id);
  const backdropSource = getImageUrl(movie.backdrop_path || movie.poster_path, 'original') || DEFAULT_BANNER_BACKDROP;

  return (
    <div className="relative h-[78vh] md:h-[90vh] w-full select-none overflow-hidden bg-[#141414]">
      {/* Full-Bleed High-Res Backdrop Image Container */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={backdropSource}
          alt={title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = DEFAULT_BANNER_BACKDROP;
          }}
          className="w-full h-full object-cover object-[center_20%] scale-105 transition-transform duration-1000 ease-out"
        />

        {/* Multi-Directional Netflix Overlays */}
        {/* 1. Left Vignette for Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/40 to-transparent w-full md:w-3/5 z-1" />

        {/* 2. Top Vignette for Navbar Blending */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/80 via-black/30 to-transparent z-1" />

        {/* 3. Bottom Multi-Stop Vignette Gradient Fading Seamlessly into Catalog Rows */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-black/40 to-transparent z-1" />
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#141414] to-transparent z-2" />
      </div>

      {/* Content Layer */}
      <div className="h-full flex flex-col justify-end pb-28 sm:pb-32 md:pb-36 px-4 sm:px-8 md:px-12 max-w-2xl lg:max-w-3xl space-y-3 sm:space-y-4 relative z-10">
        {/* Signature Red 'N SERIES' or 'NETFLIX FILM' Badge */}
        <div className="flex items-center gap-2 select-none drop-shadow-md">
          <span className="text-[#E50914] font-black text-2xl sm:text-3xl tracking-tighter leading-none">
            N
          </span>
          <span className="text-white font-black text-xs sm:text-sm tracking-[0.25em] uppercase">
            {isTv ? 'SERIES' : 'NETFLIX FILM'}
          </span>
        </div>

        {/* Billboard Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight drop-shadow-2xl leading-none md:leading-tight">
          {title}
        </h1>

        {/* Metadata Badges */}
        <div className="flex items-center gap-3 text-xs md:text-sm font-semibold text-gray-300 drop-shadow">
          <span>{releaseYear}</span>
          <span className="border border-gray-500/80 px-1.5 py-0.2 rounded text-[11px] text-gray-200">
            {movie.rating || 'TV-MA'}
          </span>
          {movie.duration && (
            <span className="text-gray-300">{movie.duration}</span>
          )}
          <span className="border border-gray-500/80 px-1 rounded text-[10px] text-gray-300">
            Ultra HD 4K
          </span>
        </div>

        {/* Truncated Overview (max 3 lines) */}
        <p className="text-xs sm:text-sm md:text-base text-gray-200 font-normal leading-relaxed line-clamp-3 drop-shadow max-w-xl">
          {movie.overview}
        </p>

        {/* Action Buttons: Solid White Play + Translucent Gray More Info */}
        <div className="flex items-center gap-3 pt-2">
          {/* Play Button (Solid White) */}
          <button
            onClick={() => playMovie(movie)}
            className="flex items-center gap-2.5 bg-white text-black font-bold text-sm sm:text-base px-6 sm:px-8 py-2.5 sm:py-3 rounded hover:bg-white/80 active:scale-95 transition-all shadow-md cursor-pointer"
            aria-label="Play movie"
          >
            <Play className="w-5 h-5 fill-black" />
            <span>Play</span>
          </button>

          {/* More Info Button (Translucent Gray with Info Icon) */}
          <button
            onClick={() => openDetailModal(movie)}
            className="flex items-center gap-2.5 bg-[rgba(109,109,110,0.7)] hover:bg-[rgba(109,109,110,0.4)] text-white font-bold text-sm sm:text-base px-6 sm:px-8 py-2.5 sm:py-3 rounded backdrop-blur-xs active:scale-95 transition-all shadow-md cursor-pointer"
            aria-label="More information"
          >
            <Info className="w-5 h-5 text-white" />
            <span>More Info</span>
          </button>

          {/* Add to My List shortcut for mobile */}
          <button
            onClick={() => {
              if (inList) {
                removeFromWatchlist(movie.id);
              } else {
                addToWatchlist(movie);
              }
            }}
            className="sm:hidden flex items-center justify-center p-3 rounded-full bg-black/60 border border-white/30 text-white hover:bg-white/20 transition-all"
            title={inList ? 'In My List' : 'Add to My List'}
            aria-label={inList ? 'In My List' : 'Add to My List'}
          >
            {inList ? <Check className="w-5 h-5 text-green-400" /> : <Plus className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
