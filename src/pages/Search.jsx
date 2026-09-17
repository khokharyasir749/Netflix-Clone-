import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Film, X, Play, Plus, Star } from 'lucide-react';
import { searchMovies, getImageUrl, MOCK_MOVIES, DEFAULT_FALLBACK_IMAGE } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import { useMovieContext } from '../context/MovieContext';

export default function Search() {
  const { openDetailModal } = useMovieContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sync state if URL query param changes
  useEffect(() => {
    const urlQuery = searchParams.get('q') || '';
    if (urlQuery !== query) {
      setQuery(urlQuery);
    }
  }, [searchParams]);

  // Perform search when debouncedQuery changes
  useEffect(() => {
    let isCancelled = false;

    const executeSearch = async () => {
      if (!debouncedQuery.trim()) {
        // If empty, show trending items as recommendation
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

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim()) {
      setSearchParams({ q: val.trim() });
    } else {
      setSearchParams({});
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSearchParams({});
  };

  return (
    <div className="pt-24 px-4 md:px-12 pb-16 min-h-screen">
      {/* Search Input Bar */}
      <div className="max-w-2xl mx-auto mb-10">
        <div className="relative flex items-center bg-[#181818] border border-white/20 rounded-full px-4 py-3 focus-within:border-[#E50914] focus-within:ring-1 focus-within:ring-[#E50914] transition-all shadow-lg">
          <SearchIcon className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search titles, characters, genres..."
            className="w-full bg-transparent text-white text-sm focus:outline-none placeholder-gray-500"
            autoFocus={Boolean(initialQuery)}
          />
          {query && (
            <button
              onClick={clearSearch}
              className="text-gray-400 hover:text-white p-1 ml-2 transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide">
          {query ? `Search Results for "${query}"` : 'Explore Popular Titles'}
        </h1>
        <span className="text-xs text-gray-400">
          {loading ? 'Searching...' : `${results.length} titles found`}
        </span>
      </div>

      {/* Results Grid */}
      {results.length === 0 && !loading ? (
        <div className="text-center py-24 text-gray-500">
          <Film className="w-14 h-14 mx-auto mb-3 opacity-30 text-gray-400" />
          <p className="text-base text-gray-400 font-medium">No matches found for "{query}"</p>
          <p className="text-xs text-gray-500 mt-1">Try searching for TV series, movies, or genres like Action, Sci-Fi, or Drama.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {results.map((item) => {
            const title = item.title || item.name;
            const posterImg = getImageUrl(item.poster_path, 'w500');
            const backdropImg = getImageUrl(item.backdrop_path, 'w500');
            const displayImg = posterImg || backdropImg;

            return (
              <div
                key={item.id}
                onClick={() => openDetailModal(item)}
                className="group aspect-[2/3] rounded-md bg-[#181818] border border-white/10 overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col justify-end p-3 relative shadow-md"
              >
                {displayImg ? (
                  <img
                    src={displayImg}
                    alt={title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = DEFAULT_FALLBACK_IMAGE;
                    }}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[#181818] flex items-center justify-center text-gray-600">
                    <Film className="w-8 h-8 opacity-30" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent flex flex-col justify-end p-3 opacity-90 group-hover:opacity-100 transition-opacity">
                  {item.isOriginal && (
                    <span className="text-[10px] uppercase font-bold text-[#E50914] tracking-wider mb-1">
                      Netflix
                    </span>
                  )}
                  <p className="text-xs font-bold text-white leading-snug line-clamp-2">{title}</p>
                  <div className="flex items-center justify-between text-[11px] text-gray-300 mt-1">
                    <span className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {item.vote_average ? Number(item.vote_average).toFixed(1) : '8.5'}
                    </span>
                    <span className="text-[10px] border border-gray-600 px-1 rounded text-gray-300">
                      {item.media_type === 'tv' ? 'TV' : 'HD'}
                    </span>
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
