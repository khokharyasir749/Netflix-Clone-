import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Play, Plus, Check, ThumbsUp, ChevronDown } from 'lucide-react';
import { searchMovies, getImageUrl, MOCK_MOVIES, DEFAULT_FALLBACK_IMAGE } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import { useMovieContext } from '../context/MovieContext';

function SearchCard({ movie }) {
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
  const title = movie.title || movie.name || '';
  const imageSrc =
    getImageUrl(movie.backdrop_path, 'w500') ||
    getImageUrl(movie.poster_path, 'w500');

  const genres =
    movie.media_type === 'tv'
      ? ['Suspenseful', 'Drama', 'Series']
      : ['Action', 'Thriller', 'Blockbuster'];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => openDetailModal(movie)}
      className={`relative select-none cursor-pointer transition-all duration-300 ${
        isHovered ? 'z-50' : 'z-10'
      }`}
    >
      {/* Floating Card: Scales cleanly on hover */}
      <div
        className={`relative w-full rounded-md overflow-hidden bg-[#181818] transition-all duration-300 ease-out origin-center aspect-[16/9] ${
          isHovered
            ? 'scale-125 z-50 shadow-2xl ring-1 ring-white/20'
            : 'scale-100 shadow-md border-0'
        }`}
      >
        {/* Clean Movie Thumbnail */}
        {imageSrc ? (
          <img
            src={imageSrc}
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
        ) : (
          <div className="w-full h-full bg-[#181818] flex items-center justify-center text-gray-500 text-xs p-2 text-center">
            {title}
          </div>
        )}

        {/* Netflix Brand 'N' Mark on Non-Hover for Originals */}
        {movie.isOriginal && !isHovered && (
          <span className="absolute top-1.5 left-1.5 bg-[#E50914] text-white text-[8px] font-black px-1.5 py-0.2 rounded shadow">
            N
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
              src={imageSrc}
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
                >
                  <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-black ml-0.5" />
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
                >
                  {inList ? (
                    <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  ) : (
                    <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
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
                >
                  <ThumbsUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
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
              >
                <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Metadata Row */}
            <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-semibold mt-1">
              <span className="text-green-400 font-bold">
                {movie.matchRate || 97}% Match
              </span>
              <span className="border border-gray-500 text-gray-300 px-1 py-0.1 rounded text-[8px]">
                {movie.rating || '16+'}
              </span>
              <span className="text-gray-300 truncate">
                {movie.duration || (movie.media_type === 'tv' ? 'TV Series' : 'Movie')}
              </span>
              <span className="border border-gray-500 text-gray-300 px-1 rounded text-[8px]">
                HD
              </span>
            </div>

            {/* Genre Tags */}
            <div className="flex items-center gap-1 text-[8px] sm:text-[9px] text-gray-300 truncate mt-0.5">
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
  );
}

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const debouncedQuery = useDebounce(query, 250);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const executeSearch = async () => {
      if (!debouncedQuery.trim()) {
        // Default to trending catalog when query is empty
        setResults(MOCK_MOVIES.trending);
        return;
      }

      setLoading(true);
      try {
        const data = await searchMovies(debouncedQuery);
        if (!isCancelled) {
          setResults(data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    executeSearch();

    return () => {
      isCancelled = true;
    };
  }, [debouncedQuery]);

  return (
    <div className="pt-28 px-4 md:px-12 pb-16 min-h-screen">
      {/* Subtle Netflix Header */}
      {query ? (
        <p className="text-gray-400 text-sm mb-6">
          Explore titles related to: <span className="text-white font-medium">"{query}"</span>
        </p>
      ) : (
        <p className="text-gray-400 text-sm mb-6">
          Top Searches
        </p>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="flex items-center gap-3 py-8 text-gray-400">
          <div className="w-5 h-5 border-2 border-t-[#E50914] border-white/20 rounded-full animate-spin" />
          <span className="text-xs">Searching Netflix catalog...</span>
        </div>
      )}

      {/* Results Grid or Empty State */}
      {!loading && results.length === 0 && query ? (
        <div className="py-16 text-gray-400 max-w-xl">
          <p className="text-base text-gray-300 font-medium">
            Your search for "{query}" did not have any matches.
          </p>
          <p className="text-xs text-gray-500 mt-4 font-semibold uppercase tracking-wider">
            Suggestions:
          </p>
          <ul className="list-disc list-inside text-xs text-gray-500 mt-2 space-y-1.5">
            <li>Try different keywords</li>
            <li>Looking for a movie or TV show?</li>
            <li>Try using a movie, TV show title, actor, or director</li>
            <li>Try a genre, like comedy, romance, sports, or drama</li>
          </ul>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          {results.map((item) => (
            <SearchCard key={item.id} movie={item} />
          ))}
        </div>
      )}
    </div>
  );
}
