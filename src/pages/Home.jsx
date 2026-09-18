import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Banner from '../components/Banner';
import Row from '../components/Row';

export default function Home() {
  const location = useLocation();
  const pathname = location.pathname;

  // Handle anchor scrolling if hash is present
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  // Determine row list based on current route pathname
  let rowCategories = [
    { id: 'top-10', title: 'Top 10 in Your Country Today', category: 'topRated', isTop10: true },
    { id: 'trending', title: 'Trending Now', category: 'trending', isTop10: true },
    { id: 'netflix-originals', title: 'Netflix Originals', category: 'netflixOriginals', isLarge: true },
    { id: 'action', title: 'Action Thrillers', category: 'actionMovies', isLarge: false },
    { id: 'comedy', title: 'Comedy Hits', category: 'comedyMovies', isLarge: false },
    { id: 'horror', title: 'Horror & Suspense', category: 'horrorMovies', isLarge: false },
    { id: 'documentaries', title: 'Award-Winning Documentaries', category: 'documentaries', isLarge: false },
  ];

  if (pathname === '/tv-shows') {
    rowCategories = [
      { id: 'top-10-tv', title: 'Top 10 TV Shows in Your Country Today', category: 'netflixOriginals', isTop10: true },
      { id: 'trending-tv', title: 'Trending TV Shows', category: 'trending', isTop10: true },
      { id: 'netflix-originals', title: 'Netflix Original Series', category: 'netflixOriginals', isLarge: true },
      { id: 'horror-tv', title: 'Suspense & Drama Series', category: 'horrorMovies', isLarge: false },
      { id: 'documentaries-tv', title: 'Docuseries & Real Stories', category: 'documentaries', isLarge: false },
      { id: 'comedy-tv', title: 'Feel-Good Comedy Series', category: 'comedyMovies', isLarge: false },
    ];
  } else if (pathname === '/movies') {
    rowCategories = [
      { id: 'top-10-movies', title: 'Top 10 Movies in Your Country Today', category: 'topRated', isTop10: true },
      { id: 'trending-movies', title: 'Trending Movies', category: 'trending', isTop10: true },
      { id: 'action-movies', title: 'Action & Adventure Movies', category: 'actionMovies', isLarge: false },
      { id: 'comedy-movies', title: 'Comedy Hits & Feel-Good Films', category: 'comedyMovies', isLarge: false },
      { id: 'horror-movies', title: 'Horror & Thrillers', category: 'horrorMovies', isLarge: false },
      { id: 'romance-movies', title: 'Romance Films', category: 'romanceMovies', isLarge: false },
      { id: 'documentaries-movies', title: 'Feature Documentaries', category: 'documentaries', isLarge: false },
    ];
  } else if (pathname === '/new-popular') {
    rowCategories = [
      { id: 'top-10-popular', title: 'Top 10 in Your Country Today', category: 'topRated', isTop10: true },
      { id: 'trending-popular', title: 'Trending This Week', category: 'trending', isTop10: true },
      { id: 'new-releases', title: 'New Netflix Originals', category: 'netflixOriginals', isLarge: true },
      { id: 'action-popular', title: 'High-Octane Fan Favorites', category: 'actionMovies', isLarge: false },
      { id: 'top-rated-popular', title: 'Award-Winning Titles', category: 'topRated', isLarge: false },
    ];
  }

  return (
    <div className="pb-24 overflow-x-hidden bg-[#141414]">
      {/* Cinematic Hero Billboard */}
      <Banner />

      {/* Categorized Movie Rows Stack */}
      <div className="-mt-16 sm:-mt-24 md:-mt-32 relative z-20 space-y-4 sm:space-y-6">
        {rowCategories.map((row) => (
          <div key={row.id + pathname} id={row.id}>
            <Row
              title={row.title}
              fetchCategory={row.category}
              isLargeRow={row.isLarge}
              isTop10={row.isTop10}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
