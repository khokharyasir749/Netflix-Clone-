import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MyList from './pages/MyList';
import Search from './pages/Search';
import Login from './pages/Login';
import Profiles from './pages/Profiles';
import DetailModal from './components/DetailModal';
import VideoPlayer from './components/VideoPlayer';
import { MovieProvider, useMovieContext } from './context/MovieContext';

function ProtectedRoute({ children }) {
  const { user, activeProfile } = useMovieContext();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!activeProfile && location.pathname !== '/profiles') {
    return <Navigate to="/profiles" replace />;
  }

  return children;
}

function AppContent() {
  const location = useLocation();
  const isAuthOrProfile = location.pathname === '/login' || location.pathname === '/profiles';

  return (
    <div className="min-h-screen bg-[#141414] text-white flex flex-col font-sans selection:bg-[#E50914] selection:text-white relative">
      <Navbar />

      <main className="flex-grow">
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<Login />} />

          {/* Profile Selection Gate */}
          <Route
            path="/profiles"
            element={
              <ProtectedRoute>
                <Profiles />
              </ProtectedRoute>
            }
          />

          {/* Protected Netflix Experience Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          {/* Category-filtered Home views via dedicated clean URLs */}
          <Route
            path="/tv-shows"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/movies"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/new-popular"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-list"
            element={
              <ProtectedRoute>
                <MyList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <Search />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Interactive Global Modals */}
      <DetailModal />
      <VideoPlayer />

      {/* Netflix Minimal Footer (Hidden on login & profiles for clean look) */}
      {!isAuthOrProfile && (
        <footer className="mt-auto border-t border-white/10 px-4 md:px-12 py-8 text-xs text-gray-500">
          <p className="mb-4">Questions? Call 1-800-000-0000</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl text-gray-400">
            <span className="hover:underline cursor-pointer">FAQ</span>
            <span className="hover:underline cursor-pointer">Help Center</span>
            <span className="hover:underline cursor-pointer">Account</span>
            <span className="hover:underline cursor-pointer">Media Center</span>
            <span className="hover:underline cursor-pointer">Investor Relations</span>
            <span className="hover:underline cursor-pointer">Jobs</span>
            <span className="hover:underline cursor-pointer">Ways to Watch</span>
            <span className="hover:underline cursor-pointer">Terms of Use</span>
          </div>
          <p className="mt-8 text-[11px] text-gray-600">
            Netflix Clone • Built with React, Vite & Tailwind CSS
          </p>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <MovieProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </MovieProvider>
  );
}
