import React from 'react';
import { Bookmark, Play, Trash2, Plus } from 'lucide-react';
import { useMovieContext } from '../context/MovieContext';
import { getImageUrl, DEFAULT_FALLBACK_IMAGE } from '../services/api';
import { Link } from 'react-router-dom';

export default function MyList() {
  const { watchlist, removeFromWatchlist, openDetailModal, playMovie } = useMovieContext();

  return (
    <div className="pt-24 px-4 md:px-12 pb-16 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <Bookmark className="w-7 h-7 text-[#E50914]" />
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">My List</h1>
        <span className="text-xs text-gray-400 font-medium">({watchlist.length} titles)</span>
      </div>

      {watchlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 text-center text-gray-500">
          <Bookmark className="w-12 h-12 mb-4 opacity-30 text-gray-400" />
          <p className="text-lg font-semibold text-gray-300">Your watchlist is currently empty.</p>
          <p className="text-xs text-gray-500 mt-1 max-w-sm">
            Explore movies and TV shows and click "+ My List" to bookmark your favorite titles here.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 bg-[#E50914] text-white px-5 py-2 rounded text-xs font-bold hover:bg-red-700 transition-colors"
          >
            Browse Titles
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {watchlist.map((item) => {
            const title = item.title || item.name;
            const imageSrc =
              getImageUrl(item.backdrop_path, 'w500') ||
              getImageUrl(item.poster_path, 'w500');

            return (
              <div
                key={item.id}
                onClick={() => openDetailModal(item)}
                className="group relative aspect-[16/9] rounded-md bg-[#181818] border border-white/10 overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg"
              >
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = DEFAULT_FALLBACK_IMAGE;
                    }}
                    className="w-full h-full object-cover group-hover:brightness-105 transition-all"
                  />
                ) : (
                  <div className="w-full h-full bg-[#181818] flex items-center justify-center text-gray-600 text-xs">
                    {title}
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-between p-3 opacity-90 group-hover:opacity-100 transition-opacity">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#E50914] bg-black/60 px-2 py-0.5 rounded">
                      Saved
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWatchlist(item.id);
                      }}
                      className="p-1 rounded-full bg-black/80 hover:bg-[#E50914] text-white transition-colors"
                      title="Remove from My List"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-xs text-white truncate">{title}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playMovie(item);
                        }}
                        className="p-1 rounded-full hover:bg-white/20 transition-colors"
                        title="Play"
                      >
                        <Play className="w-3.5 h-3.5 fill-white text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {item.duration || item.rating || ''}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
