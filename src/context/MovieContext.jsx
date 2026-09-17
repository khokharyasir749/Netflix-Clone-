import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_MOVIES } from '../services/api';

const MovieContext = createContext();

export const DEFAULT_PROFILES = [
  {
    id: 'p1',
    name: 'Yasir',
    color: 'from-[#E50914] via-red-800 to-blue-700',
    initial: 'Y',
    isKids: false,
  },
  {
    id: 'p2',
    name: 'Guest',
    color: 'from-blue-600 via-indigo-700 to-purple-800',
    initial: 'G',
    isKids: false,
  },
  {
    id: 'p3',
    name: 'Kids',
    color: 'from-amber-400 via-yellow-500 to-emerald-500',
    initial: 'K',
    isKids: true,
  },
];

export function MovieProvider({ children }) {
  // User Authentication State with LocalStorage
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('netflix_user');
      return savedUser ? JSON.parse(savedUser) : { email: 'yasir@netflix.com', name: 'Yasir' };
    } catch {
      return { email: 'yasir@netflix.com', name: 'Yasir' };
    }
  });

  // Active Profile State with LocalStorage
  const [activeProfile, setActiveProfile] = useState(() => {
    try {
      const savedProfile = localStorage.getItem('netflix_profile');
      return savedProfile ? JSON.parse(savedProfile) : DEFAULT_PROFILES[0];
    } catch {
      return DEFAULT_PROFILES[0];
    }
  });

  // Watchlist State with LocalStorage
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const savedList = localStorage.getItem('netflix_watchlist');
      if (savedList) {
        return JSON.parse(savedList);
      }
    } catch (e) {
      console.warn('Could not read watchlist from localStorage:', e);
    }
    // Seed default list
    return [
      MOCK_MOVIES.netflixOriginals[2], // Dark
      MOCK_MOVIES.netflixOriginals[3], // Money Heist
      MOCK_MOVIES.netflixOriginals[4], // Cyberpunk: Edgerunners
      MOCK_MOVIES.netflixOriginals[5], // The Queen's Gambit
    ].filter(Boolean);
  });

  // Save Watchlist to LocalStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('netflix_watchlist', JSON.stringify(watchlist));
    } catch (e) {
      console.warn('Could not save watchlist to localStorage:', e);
    }
  }, [watchlist]);

  // Detail Modal state
  const [detailModalMovie, setDetailModalMovie] = useState(null);

  // Fullscreen video playback state
  const [playingMovie, setPlayingMovie] = useState(null);

  // Authentication methods
  const login = (email = 'yasir@netflix.com', name = 'Yasir') => {
    const newUser = { email, name };
    setUser(newUser);
    localStorage.setItem('netflix_user', JSON.stringify(newUser));
    if (!activeProfile) {
      selectProfile(DEFAULT_PROFILES[0]);
    }
  };

  const logout = () => {
    setUser(null);
    setActiveProfile(null);
    localStorage.removeItem('netflix_user');
    localStorage.removeItem('netflix_profile');
  };

  const selectProfile = (profile) => {
    setActiveProfile(profile);
    localStorage.setItem('netflix_profile', JSON.stringify(profile));
  };

  // Watchlist helpers
  const addToWatchlist = (movie) => {
    setWatchlist((prev) => {
      if (prev.some((item) => item.id === movie.id)) return prev;
      return [movie, ...prev];
    });
  };

  const removeFromWatchlist = (movieId) => {
    setWatchlist((prev) => prev.filter((item) => item.id !== movieId));
  };

  const isInWatchlist = (movieId) => {
    return watchlist.some((item) => item.id === movieId);
  };

  // Modal helpers
  const openDetailModal = (movie) => {
    setDetailModalMovie(movie);
  };

  const closeDetailModal = () => {
    setDetailModalMovie(null);
  };

  const playMovie = (movie) => {
    setPlayingMovie(movie);
  };

  const closePlayer = () => {
    setPlayingMovie(null);
  };

  // Prevent background scrolling when either modal is active
  useEffect(() => {
    if (detailModalMovie || playingMovie) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [detailModalMovie, playingMovie]);

  return (
    <MovieContext.Provider
      value={{
        user,
        login,
        logout,
        profiles: DEFAULT_PROFILES,
        activeProfile,
        selectProfile,
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        detailModalMovie,
        setDetailModalMovie,
        openDetailModal,
        closeDetailModal,
        playingMovie,
        setPlayingMovie,
        playMovie,
        closePlayer,
      }}
    >
      {children}
    </MovieContext.Provider>
  );
}

export function useMovieContext() {
  const context = useContext(MovieContext);
  if (!context) {
    throw new Error('useMovieContext must be used within a MovieProvider');
  }
  return context;
}
