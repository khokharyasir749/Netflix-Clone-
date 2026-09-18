import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchMovies } from '../services/api';
import MovieCard from './MovieCard';

export default function Row({
  title,
  fetchCategory,
  isLargeRow = false,
  isTop10 = false,
}) {
  const [movies, setMovies] = useState([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const rowRef = useRef(null);

  // Check if row is Top 10 or Trending
  const isTop10Row = Boolean(
    isTop10 ||
    title?.toLowerCase().includes('top 10') ||
    title?.toLowerCase().includes('top-10') ||
    title?.toLowerCase().includes('trending')
  );

  useEffect(() => {
    let isCancelled = false;

    async function loadCategoryMovies() {
      try {
        const data = await fetchMovies(fetchCategory);
        if (!isCancelled) {
          setMovies(data);
        }
      } catch (err) {
        console.error(`Error loading row for ${fetchCategory}:`, err);
      }
    }

    loadCategoryMovies();

    return () => {
      isCancelled = true;
    };
  }, [fetchCategory]);

  const updateScrollButtons = useCallback(() => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  // Recalculate scroll buttons when movies load or on window resize
  useEffect(() => {
    updateScrollButtons();
    window.addEventListener('resize', updateScrollButtons);
    return () => window.removeEventListener('resize', updateScrollButtons);
  }, [movies, updateScrollButtons]);

  const handleScroll = (direction) => {
    if (rowRef.current) {
      const { clientWidth } = rowRef.current;
      // Scroll roughly 75% of viewport width
      const scrollOffset = clientWidth * 0.75;
      rowRef.current.scrollBy({
        left: direction === 'left' ? -scrollOffset : scrollOffset,
        behavior: 'smooth',
      });
      // Recheck after animation completes
      setTimeout(updateScrollButtons, 350);
    }
  };

  if (!movies || movies.length === 0) return null;

  const displayMovies = isTop10Row ? movies.slice(0, 10) : movies;

  return (
    <div className="space-y-1 relative select-none my-4 sm:my-6">
      {/* Row Title & Explore Action */}
      <div className="px-4 md:px-12 flex items-baseline justify-between group/header">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-wide hover:text-gray-200 transition-colors inline-flex items-center gap-2 cursor-pointer">
          <span>{title}</span>
          <span className="text-xs font-semibold text-[#E50914] opacity-0 group-hover/header:opacity-100 transition-opacity duration-300">
            Explore All &gt;
          </span>
        </h2>
      </div>

      {/* Row Wrapper with Navigation Chevrons */}
      <div className="relative group/row">
        {/* Left Slider Chevron Button */}
        {canScrollLeft && (
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-0 top-0 bottom-0 z-40 w-10 sm:w-12 md:w-14 bg-black/60 hover:bg-black/85 text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all duration-300 backdrop-blur-xs cursor-pointer shadow-2xl group/btn"
            aria-label={`Scroll ${title} left`}
          >
            <ChevronLeft className="w-8 h-8 sm:w-10 sm:h-10 transition-transform group-hover/btn:scale-125" />
          </button>
        )}

        {/* Scrollable Movie Container */}
        <div
          ref={rowRef}
          onScroll={updateScrollButtons}
          className="flex items-start gap-2.5 sm:gap-4 px-4 md:px-12 overflow-x-auto overflow-y-visible py-8 -my-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth"
        >
          {displayMovies.map((movie, index) => (
            <MovieCard
              key={`${fetchCategory}-${movie.id}-${index}`}
              movie={movie}
              isLargeRow={isLargeRow}
              top10Rank={isTop10Row ? index + 1 : null}
            />
          ))}
        </div>

        {/* Right Slider Chevron Button */}
        {canScrollRight && (
          <button
            onClick={() => handleScroll('right')}
            className="absolute right-0 top-0 bottom-0 z-40 w-10 sm:w-12 md:w-14 bg-black/60 hover:bg-black/85 text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all duration-300 backdrop-blur-xs cursor-pointer shadow-2xl group/btn"
            aria-label={`Scroll ${title} right`}
          >
            <ChevronRight className="w-8 h-8 sm:w-10 sm:h-10 transition-transform group-hover/btn:scale-125" />
          </button>
        )}
      </div>
    </div>
  );
}
