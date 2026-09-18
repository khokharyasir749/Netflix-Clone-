import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { searchMovies, MOCK_MOVIES } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';

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
            <MovieCard key={item.id} movie={item} isGrid={true} />
          ))}
        </div>
      )}
    </div>
  );
}
