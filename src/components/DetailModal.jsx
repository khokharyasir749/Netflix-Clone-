import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Plus,
  Check,
  ThumbsUp,
  Volume2,
  VolumeX,
  Star,
  Film,
} from 'lucide-react';
import { useMovieContext } from '../context/MovieContext';
import { getImageUrl, MOCK_MOVIES, DEFAULT_FALLBACK_IMAGE } from '../services/api';

export default function DetailModal() {
  const {
    detailModalMovie,
    closeDetailModal,
    playMovie,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    openDetailModal,
  } = useMovieContext();

  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeDetailModal();
      }
    };

    if (detailModalMovie) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [detailModalMovie, closeDetailModal]);

  if (!detailModalMovie) return null;

  const movie = detailModalMovie;
  const title = movie.title || movie.name;
  const inList = isInWatchlist(movie.id);
  const releaseYear = (movie.first_air_date || movie.release_date || '2023').substring(0, 4);

  // Curate related movies from mock catalog
  const allPool = [
    ...MOCK_MOVIES.trending,
    ...MOCK_MOVIES.netflixOriginals,
    ...MOCK_MOVIES.topRated,
    ...MOCK_MOVIES.actionMovies,
    ...MOCK_MOVIES.comedyMovies,
  ];
  const relatedMovies = Array.from(new Map(allPool.map((m) => [m.id, m])).values())
    .filter((m) => m.id !== movie.id)
    .slice(0, 6);

  // Curated dummy cast and credits
  const castList = movie.media_type === 'tv'
    ? 'Millie Bobby Brown, Winona Ryder, David Harbour, Finn Wolfhard'
    : 'Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page, Tom Hardy';
  const creators = movie.media_type === 'tv' ? 'The Duffer Brothers' : 'Christopher Nolan';
  const genres = ['Sci-Fi', 'Suspenseful Thriller', 'Mind-Bending', 'Drama'];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn"
      onClick={closeDetailModal}
    >
      {/* Modal Container */}
      <div
        className="bg-[#181818] max-w-4xl w-full rounded-lg overflow-hidden shadow-2xl relative my-8 border border-white/10 text-white select-none transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Media Section */}
        <div className="relative aspect-[16/9] w-full bg-black overflow-hidden">
          <img
            src={getImageUrl(movie.backdrop_path || movie.poster_path, 'original')}
            alt={title}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = DEFAULT_FALLBACK_IMAGE;
            }}
            className="w-full h-full object-cover object-center"
          />

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" />

          {/* Close X Button */}
          <button
            onClick={closeDetailModal}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#181818]/90 hover:bg-[#181818] border border-white/20 text-white flex items-center justify-center transition-all z-20 cursor-pointer shadow-lg hover:scale-105"
            title="Close"
            aria-label="Close detail modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Quick Action Floating Bar on Backdrop */}
          <div className="absolute bottom-8 left-6 sm:left-10 right-6 sm:right-10 flex items-end justify-between z-10">
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white drop-shadow-xl">
                {title}
              </h2>

              <div className="flex items-center gap-3">
                {/* Play Button */}
                <button
                  onClick={() => {
                    closeDetailModal();
                    playMovie(movie);
                  }}
                  className="flex items-center gap-2 bg-white text-black px-6 sm:px-8 py-2.5 rounded font-bold text-sm sm:text-base hover:bg-white/80 active:scale-95 transition-all shadow-xl cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-black" />
                  Play
                </button>

                {/* Add to My List Toggle */}
                <button
                  onClick={() => {
                    if (inList) {
                      removeFromWatchlist(movie.id);
                    } else {
                      addToWatchlist(movie);
                    }
                  }}
                  className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer shadow-md ${
                    inList
                      ? 'bg-[#E50914] border-[#E50914] text-white'
                      : 'border-gray-400 bg-neutral-900/80 hover:border-white text-white'
                  }`}
                  title={inList ? 'Remove from My List' : 'Add to My List'}
                >
                  {inList ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </button>

                {/* Thumbs Up Like */}
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer shadow-md ${
                    isLiked
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-400 bg-neutral-900/80 hover:border-white text-white'
                  }`}
                  title={isLiked ? 'Liked' : 'Rate this'}
                >
                  <ThumbsUp className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Volume Toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-10 h-10 rounded-full border border-white/40 bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all shadow cursor-pointer shrink-0"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-gray-300" /> : <Volume2 className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="px-6 sm:px-10 py-6 space-y-8">
          {/* Metadata & Storyline Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left 2 Cols: Details & Overview */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold text-gray-300">
                <span>{releaseYear}</span>
                <span className="border border-gray-500/80 px-1.5 py-0.5 rounded text-[11px] text-gray-200 font-bold">
                  {movie.rating || '16+'}
                </span>
                <span>{movie.duration || 'TV Series'}</span>
                <span className="border border-gray-500/80 px-1.5 py-0.5 rounded text-[10px] text-gray-300">
                  Ultra HD 4K
                </span>
                <span className="border border-gray-500/80 px-1.5 py-0.5 rounded text-[10px] text-gray-300">
                  Spatial Audio
                </span>
              </div>

              <p className="text-sm sm:text-base text-gray-200 leading-relaxed font-normal">
                {movie.overview}
              </p>
            </div>

            {/* Right Col: Credits & Tags */}
            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <span className="text-gray-400">Cast: </span>
                <span className="text-gray-200">{castList}</span>
              </div>
              <div>
                <span className="text-gray-400">Genres: </span>
                <span className="text-gray-200">{genres.join(', ')}</span>
              </div>
              <div>
                <span className="text-gray-400">This show is: </span>
                <span className="text-gray-200">Suspenseful, Mind-Bending, Exciting</span>
              </div>
            </div>
          </div>

          {/* 'More Like This' Section */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <h3 className="text-lg sm:text-xl font-bold text-white">More Like This</h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {relatedMovies.map((item) => {
                const relTitle = item.title || item.name;
                const inRelList = isInWatchlist(item.id);

                return (
                  <div
                    key={item.id}
                    className="bg-[#242424] rounded-md overflow-hidden border border-white/5 hover:border-white/20 transition-all flex flex-col justify-between group shadow-md"
                  >
                    <div
                      className="relative aspect-[16/9] cursor-pointer overflow-hidden"
                      onClick={() => openDetailModal(item)}
                    >
                      <img
                        src={getImageUrl(item.backdrop_path || item.poster_path, 'w500')}
                        alt={relTitle}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = DEFAULT_FALLBACK_IMAGE;
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <span className="absolute top-2 right-2 text-[10px] font-bold bg-black/70 px-1.5 py-0.5 rounded text-gray-200">
                        {item.duration || '2h 10m'}
                      </span>
                    </div>

                    <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[11px] text-gray-300 font-bold">
                          <span className="border border-gray-600 px-1 rounded text-[9px]">
                            {item.rating || '16+'}
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (inRelList) {
                              removeFromWatchlist(item.id);
                            } else {
                              addToWatchlist(item);
                            }
                          }}
                          className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                            inRelList
                              ? 'bg-[#E50914] border-[#E50914] text-white'
                              : 'border-gray-500 hover:border-white text-white'
                          }`}
                          title={inRelList ? 'Remove from My List' : 'Add to My List'}
                        >
                          {inRelList ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <p className="text-xs text-gray-300 line-clamp-3 leading-relaxed">
                        {item.overview}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* About Section */}
          <div className="pt-6 border-t border-white/10 space-y-3 text-xs sm:text-sm text-gray-300">
            <h4 className="text-base sm:text-lg font-bold text-white">
              About <span className="text-[#E50914]">{title}</span>
            </h4>
            <div className="space-y-1.5 text-xs text-gray-400">
              <p>
                <span className="text-gray-500 font-medium">Creators: </span>
                <span className="text-gray-300">{creators}</span>
              </p>
              <p>
                <span className="text-gray-500 font-medium">Cast: </span>
                <span className="text-gray-300">{castList}</span>
              </p>
              <p>
                <span className="text-gray-500 font-medium">Audio: </span>
                <span className="text-gray-300">English [Original], Spanish, French, German, Japanese</span>
              </p>
              <p>
                <span className="text-gray-500 font-medium">Subtitles: </span>
                <span className="text-gray-300">English, Spanish, French, German, Simplified Chinese</span>
              </p>
              <p>
                <span className="text-gray-500 font-medium">Maturity Rating: </span>
                <span className="border border-gray-600 px-1 py-0.5 rounded text-[10px] text-gray-200">
                  {movie.rating || '16+'}
                </span>
                <span className="text-gray-400 ml-2">Recommended for ages 16 and up. Contains violence, dark themes, and language.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
