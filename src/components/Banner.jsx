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
      <div className="relative h-[70vh] md:h-[85vh] w-full bg-[#141414] animate-pulse flex items-end pb-24 px-4 md:px-12" />
    );
  }

  const title = movie.title || movie.name;
  const releaseYear = (movie.first_air_date || movie.release_date || '2023').substring(0, 4);
  const inList = isInWatchlist(movie.id);
  const backdropSource = getImageUrl(movie.backdrop_path || movie.poster_path, 'original') || DEFAULT_BANNER_BACKDROP;

  return (
    <div className="relative h-[75vh] md:h-[88vh] w-full select-none overflow-hidden">
      {/* Full-Bleed High-Res Backdrop Image Container */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={backdropSource}
          alt={title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = DEFAULT_BANNER_BACKDROP;
          }}
          className="w-full h-full object-cover object-[center_25%] scale-105 transition-transform duration-1000 ease-out"
        />

        {/* Subtle Multi-Directional Netflix Overlays */}
        {/* Left Vignette for Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/30 to-transparent w-full md:w-3/5 z-1" />
        {/* Top Vignette for Navbar Blending */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-transparent h-32 z-1" />
        {/* Bottom Fade Smoothly Blending into Movie Rows */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/30 to-transparent z-1" />
      </div>

      {/* Content Layer */}
      <div className="h-full flex flex-col justify-end pb-24 md:pb-32 px-4 sm:px-8 md:px-12 max-w-2xl lg:max-w-3xl space-y-3.5 relative z-10">
        {/* Netflix Brand & Type Badge */}
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center bg-[#E50914] text-white font-black text-xs px-1.5 py-0.5 rounded-sm tracking-tighter">
            N
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-300">
            {movie.media_type === 'tv' ? 'Series' : 'Film'}
          </span>
        </div>

        {/* Billboard Title */}
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-white tracking-tight drop-shadow-2xl leading-tight">
          {title}
        </h1>

        {/* Metadata Badges */}
        <div className="flex items-center gap-3 text-xs md:text-sm font-semibold text-gray-300">
          <span className="text-[#46d369] font-bold">
            {movie.matchRate || 98}% Match
          </span>
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
        <p className="text-sm md:text-base text-gray-200 font-normal leading-relaxed line-clamp-3 drop-shadow max-w-xl">
          {movie.overview}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          {/* Play Button */}
          <button
            onClick={() => playMovie(movie)}
            className="flex items-center gap-2.5 bg-white text-black px-6 sm:px-8 py-2.5 sm:py-3 rounded font-bold text-sm sm:text-base hover:bg-white/80 active:scale-95 transition-all shadow-lg cursor-pointer"
          >
            <Play className="w-5 h-5 fill-black" />
            Play
          </button>

          {/* More Info Button */}
          <button
            onClick={() => openDetailModal(movie)}
            className="flex items-center gap-2 bg-gray-500/70 hover:bg-gray-500/50 text-white px-5 sm:px-7 py-2.5 sm:py-3 rounded font-semibold text-sm sm:text-base backdrop-blur-sm active:scale-95 transition-all cursor-pointer"
          >
            <Info className="w-5 h-5" />
            More Info
          </button>

          {/* Add to My List shortcut */}
          <button
            onClick={() => {
              if (inList) {
                removeFromWatchlist(movie.id);
              } else {
                addToWatchlist(movie);
              }
            }}
            className="sm:hidden flex items-center justify-center p-2.5 rounded-full bg-black/60 border border-white/30 text-white hover:bg-white/20 transition-all"
            title={inList ? 'In My List' : 'Add to My List'}
          >
            {inList ? <Check className="w-5 h-5 text-green-400" /> : <Plus className="w-5 h-5" />}
          </button>
        </div>
      </div>


    </div>
  );
}
