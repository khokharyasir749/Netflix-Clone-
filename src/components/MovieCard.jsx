import React, { useState } from 'react';
import { Play, Plus, Check, ThumbsUp, ChevronDown } from 'lucide-react';
import { getImageUrl, DEFAULT_FALLBACK_IMAGE } from '../services/api';
import { useMovieContext } from '../context/MovieContext';

export default function MovieCard({
  movie,
  isLargeRow = false,
  isGrid = false,
  top10Rank = null,
}) {
  const [isHovered, setIsHovered] = useState(false);
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
  const title = movie.title || movie.name || 'Untitled';

  // For Top 10 rows and Large rows (Originals), use vertical poster
  const useVerticalPoster = Boolean(top10Rank || isLargeRow);
  const imagePath = useVerticalPoster
    ? movie.poster_path || movie.backdrop_path
    : movie.backdrop_path || movie.poster_path;

  const imageUrl = getImageUrl(imagePath, 'w500');

  // Genre tags
  const genres =
    movie.media_type === 'tv'
      ? ['Suspenseful', 'Mind-Bending', 'Drama']
      : ['Action', 'Thriller', 'Blockbuster'];

  // Thumbnail aspect ratio & width sizing
  const cardWidthClass = isGrid
    ? 'w-full'
    : top10Rank
    ? 'w-[140px] sm:w-[170px] md:w-[200px]'
    : isLargeRow
    ? 'w-[140px] sm:w-[170px] md:w-[200px]'
    : 'w-[200px] sm:w-[250px] md:w-[280px]';

  const aspectClass = useVerticalPoster ? 'aspect-[2/3]' : 'aspect-[16/9]';

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => openDetailModal(movie)}
      className={`group relative shrink-0 select-none cursor-pointer transition-all duration-300 flex flex-col ${cardWidthClass} ${
        isHovered ? 'z-50' : 'z-10'
      }`}
    >
      {/* Top Container: thumbnail with rank number absolutely positioned at bottom-left */}
      <div className="relative">
          <div
            className={`relative w-full rounded-md overflow-hidden bg-[#181818] transition-all duration-300 ease-out origin-center ${
              isHovered
                ? 'scale-105 sm:scale-110 z-50 shadow-2xl ring-1 ring-white/20'
                : 'scale-100 shadow-md border-0'
            } ${aspectClass}`}
          >
            {/* Clean Movie Thumbnail */}
            <img
              src={imageUrl}
              alt={title}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = DEFAULT_FALLBACK_IMAGE;
              }}
              className={`w-full h-full object-cover transition-all duration-300 ${
                isHovered ? 'brightness-105' : 'brightness-100'
              }`}
              loading="lazy"
            />

            {/* Netflix Brand 'N' Mark on Non-Hover for Originals */}
            {movie.isOriginal && !isLargeRow && !top10Rank && !isHovered && (
              <span className="absolute top-2 left-2 bg-[#E50914] text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                N
              </span>
            )}

            {/* Compact Top 10 Rank Number — bottom-left corner, subtle outline */}
            {top10Rank && !isHovered && (
              <span
                className="absolute bottom-1 left-1.5 select-none pointer-events-none leading-none"
                style={{
                  fontSize: 'clamp(3rem, 5vw, 4.5rem)',
                  lineHeight: '1',
                  WebkitTextStroke: '2px #595959',
                  WebkitTextFillColor: '#141414',
                  fontFamily: "'Impact', 'Arial Black', sans-serif",
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.85))',
                }}
              >
                {top10Rank}
              </span>
            )}


            {/* Floating Hover Card Detail Overlay */}
            <div
              className={`absolute inset-0 bg-[#181818] rounded-md shadow-2xl transition-opacity duration-300 flex flex-col justify-between p-2.5 sm:p-3 border border-white/20 ${
                isHovered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
            >
              {/* Top thumbnail representation with title */}
              <div className="relative w-full h-[52%] rounded overflow-hidden">
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
                <span className="absolute bottom-1 left-1.5 right-1.5 text-[11px] sm:text-xs font-bold text-white drop-shadow truncate">
                  {title}
                </span>
              </div>

              {/* Bottom Details Section */}
              <div className="flex-1 flex flex-col justify-between pt-1">
                {/* Quick Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {/* Play Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playMovie(movie);
                      }}
                      className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white text-black flex items-center justify-center hover:bg-white/80 active:scale-95 transition-all shadow cursor-pointer"
                      title="Play"
                      aria-label="Play"
                    >
                      <Play className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-black ml-0.5" />
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
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                        inList
                          ? 'bg-[#E50914] border-[#E50914] text-white'
                          : 'border-gray-400/80 bg-neutral-800/80 hover:border-white text-white'
                      }`}
                      title={inList ? 'Remove from My List' : 'Add to My List'}
                      aria-label={inList ? 'Remove from My List' : 'Add to My List'}
                    >
                      {inList ? (
                        <Check className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                      ) : (
                        <Plus className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                      )}
                    </button>

                    {/* Thumbs Up Like */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsLiked(!isLiked);
                      }}
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                        isLiked
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-gray-400/80 bg-neutral-800/80 hover:border-white text-white'
                      }`}
                      title={isLiked ? 'Liked' : 'Rate this'}
                      aria-label="Rate this"
                    >
                      <ThumbsUp className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                    </button>
                  </div>

                  {/* Expand / Details Chevron */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openDetailModal(movie);
                    }}
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-gray-400/80 bg-neutral-800/80 hover:border-white text-white flex items-center justify-center transition-colors cursor-pointer"
                    title="More info"
                    aria-label="More information"
                  >
                    <ChevronDown className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  </button>
                </div>

                {/* Metadata Row */}
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold mt-1">
                  <span className="border border-gray-500 text-gray-300 px-1 py-0.1 rounded text-[9px]">
                    {movie.rating || '16+'}
                  </span>
                  <span className="text-gray-300">
                    {movie.duration || (movie.media_type === 'tv' ? 'TV Series' : 'Movie')}
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
      </div>

      {/* Permanent Movie Title & Metadata Under Card */}
      <div className="mt-2 px-1">
        <h3 className="text-xs sm:text-sm font-semibold text-white tracking-wide truncate group-hover:text-red-500 transition-colors">
          {title}
        </h3>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
          <span>
            {movie?.release_date?.substring(0, 4) ||
              movie?.first_air_date?.substring(0, 4) ||
              '2024'}
          </span>
          <span className="border border-gray-600 px-1 py-0.2 rounded text-[10px] text-gray-300">
            HD
          </span>
        </div>
      </div>
    </div>
  );
}
