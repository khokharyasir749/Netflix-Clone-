import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Banner from '../components/Banner';
import Row from '../components/Row';

export default function Home() {
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('filter');

  // Handle anchor scrolling if hash is present
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [window.location.hash]);

  // Determine row list based on navigation link filter
  let rowCategories = [
    { id: 'trending', title: 'Trending Now', category: 'trending', isLarge: false },
    { id: 'netflix-originals', title: 'Netflix Originals', category: 'netflixOriginals', isLarge: true },
    { id: 'top-rated', title: 'Top Rated Movies & Shows', category: 'topRated', isLarge: false },
    { id: 'action', title: 'Action Thrillers', category: 'actionMovies', isLarge: false },
    { id: 'comedy', title: 'Comedy Hits', category: 'comedyMovies', isLarge: false },
    { id: 'horror', title: 'Horror & Suspense', category: 'horrorMovies', isLarge: false },
    { id: 'documentaries', title: 'Award-Winning Documentaries', category: 'documentaries', isLarge: false },
  ];

  if (filter === 'tv') {
    rowCategories = [
      { id: 'netflix-originals', title: 'Netflix Original Series', category: 'netflixOriginals', isLarge: true },
      { id: 'trending', title: 'Trending TV Shows', category: 'trending', isLarge: false },
      { id: 'top-rated', title: 'Critically Acclaimed TV', category: 'topRated', isLarge: false },
      { id: 'horror', title: 'Suspense & Drama Series', category: 'horrorMovies', isLarge: false },
      { id: 'documentaries', title: 'Docuseries & Real Stories', category: 'documentaries', isLarge: false },
    ];
  } else if (filter === 'movies') {
    rowCategories = [
      { id: 'top-rated', title: 'Award-Winning Movies', category: 'topRated', isLarge: true },
      { id: 'trending', title: 'Popular Movies', category: 'trending', isLarge: false },
      { id: 'action', title: 'Action & Adventure Movies', category: 'actionMovies', isLarge: false },
      { id: 'comedy', title: 'Comedy Hits & Feel-Good Films', category: 'comedyMovies', isLarge: false },
      { id: 'horror', title: 'Horror & Thrillers', category: 'horrorMovies', isLarge: false },
      { id: 'documentaries', title: 'Feature Documentaries', category: 'documentaries', isLarge: false },
    ];
  } else if (filter === 'popular') {
    rowCategories = [
      { id: 'trending', title: 'Trending This Week', category: 'trending', isLarge: true },
      { id: 'top-rated', title: 'Top 10 Most-Watched Today', category: 'topRated', isLarge: false },
      { id: 'netflix-originals', title: 'New Netflix Releases', category: 'netflixOriginals', isLarge: false },
      { id: 'action', title: 'High-Octane Fan Favorites', category: 'actionMovies', isLarge: false },
    ];
  }

  return (
    <div className="pb-24 overflow-x-hidden">
      {/* Cinematic Hero Billboard */}
      <Banner />

      {/* Categorized Movie Rows Stack */}
      <div className="-mt-16 sm:-mt-24 md:-mt-32 relative z-20 space-y-4 sm:space-y-6">
        {rowCategories.map((row) => (
          <div key={row.id + (filter || '')} id={row.id}>
            <Row
              title={row.title}
              fetchCategory={row.category}
              isLargeRow={row.isLarge}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
