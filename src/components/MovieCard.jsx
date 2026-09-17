import React, { useState } from 'react';
import { Play, Plus, Check, ThumbsUp, ChevronDown } from 'lucide-react';
import { getImageUrl, DEFAULT_FALLBACK_IMAGE } from '../services/api';
import { useMovieContext } from '../context/MovieContext';

export default function MovieCard({ movie, isLargeRow = false }) {
  const [isLiked, setIsLiked] = useState(false);
  const {
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    openDetailModal,
    playMovie,
  } = useMovieContext();

  if (!movie) return null;

  const inList = isInWatchlist(movie.id);
  const title = movie.title || movie.name;
  const releaseYear = (movie.first_air_date || movie.release_date || '2023').substring(0, 4);

  // Use poster for large rows (Netflix Originals), backdrop for standard rows
  const imagePath = isLargeRow
    ? movie.poster_path || movie.backdrop_path
    : movie.backdrop_path || movie.poster_path;

  const imageUrl = getImageUrl(imagePath, 'w500');

  // Compute genre tags based on properties
  const genres = movie.media_type === 'tv'
    ? ['Suspenseful', 'Mind-Bending', 'Drama']
    : ['Action', 'Thriller', 'Blockbuster'];

  return (
    <div
      onClick={() => openDetailModal(movie)}
      className={`group relative shrink-0 flex flex-col transition-all duration-300 ease-out cursor-pointer select-none ${
        isLargeRow
          ? 'w-[140px] sm:w-[170px] md:w-[200px]'
          : 'w-[200px] sm:w-[250px] md:w-[280px]'
      }`}
    >
      {/* Poster / Backdrop Image Container with Hover Scaling */}
      <div
        className={`relative w-full rounded-md overflow-hidden bg-[#181818] shadow-md border border-white/5 transition-all duration-300 ease-out group-hover:scale-105 md:group-hover:scale-110 group-hover:z-30 group-hover:shadow-2xl group-hover:border-white/20 ${
          isLargeRow ? 'aspect-[2/3]' : 'aspect-[16/9]'
        }`}
      >
        <img
          src={imageUrl}
          alt={title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = DEFAULT_FALLBACK_IMAGE;
          }}
          className="w-full h-full object-cover group-hover:brightness-105 transition-all duration-300"
          loading="lazy"
        />

        {/* Brand Tag on Non-Hover for Originals */}
        {movie.isOriginal && !isLargeRow && (
          <span className="absolute top-2 left-2 bg-[#E50914] text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
            N
          </span>
        )}

        {/* On-Hover Mini-Card Detail Overlay */}
        <div className="absolute inset-0 bg-[#181818] rounded-md shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto flex flex-col justify-between p-3 border border-white/20">
          {/* Top thumbnail representation */}
          <div className="relative w-full h-[55%] rounded overflow-hidden">
            <img
              src={imageUrl}
              alt={title}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = DEFAULT_FALLBACK_IMAGE;
              }}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent" />
            <span className="absolute bottom-1 left-1.5 text-[11px] font-bold text-white drop-shadow truncate max-w-[90%]">
              {title}
            </span>
          </div>

          {/* Bottom Details Section */}
          <div className="flex-1 flex flex-col justify-between pt-1.5">
            {/* Quick Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {/* Play Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playMovie(movie);
                  }}
                  className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center hover:bg-white/80 active:scale-95 transition-all shadow cursor-pointer"
                  title="Play"
                >
                  <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
                </button>

                {/* Add / Remove from My List */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (inList) {
                      removeFromWatchlist(movie.id);
                    } else {
                      addToWatchlist(movie);
                    }
                  }}
                  className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                    inList
                      ? 'bg-[#E50914] border-[#E50914] text-white'
                      : 'border-gray-400/80 bg-neutral-800/80 hover:border-white text-white'
                  }`}
                  title={inList ? 'Remove from My List' : 'Add to My List'}
                >
                  {inList ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                </button>

                {/* Thumbs Up Like */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLiked(!isLiked);
                  }}
                  className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                    isLiked
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-400/80 bg-neutral-800/80 hover:border-white text-white'
                  }`}
                  title={isLiked ? 'Liked' : 'Rate this'}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Expand / Details Chevron */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openDetailModal(movie);
                }}
                className="w-7 h-7 rounded-full border border-gray-400/80 bg-neutral-800/80 hover:border-white text-white flex items-center justify-center transition-colors cursor-pointer"
                title="More info"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Metadata Row */}
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold mt-1">
              <span className="text-[#46d369]">
                {movie.matchRate || 98}% Match
              </span>
              <span className="border border-gray-500 text-gray-300 px-1 py-0.1 rounded text-[9px]">
                {movie.rating || '16+'}
              </span>
              <span className="text-gray-300">
                {movie.duration || 'TV Series'}
              </span>
              <span className="border border-gray-500 text-gray-300 px-1 rounded text-[8px]">
                HD
              </span>
            </div>

            {/* Genre Tags */}
            <div className="flex items-center gap-1 text-[9px] text-gray-300 truncate mt-0.5">
              {genres.map((genre, idx) => (
                <span key={genre} className="flex items-center gap-1">
                  {genre}
                  {idx < genres.length - 1 && <span className="text-gray-600">•</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Always Visible Movie Name & Info Below Every Card */}
      <div className="px-0.5">
        <p className="mt-2 text-sm font-semibold text-white truncate">
          {movie.title || movie.name}
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
          <span className="text-green-400 font-medium">
            {movie.matchRate || 98}% Match
          </span>
          <span>•</span>
          <span>{releaseYear}</span>
          {movie.rating && (
            <>
              <span>•</span>
              <span className="border border-gray-600 px-1 py-0.1 rounded text-[10px] text-gray-300">
                {movie.rating}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
