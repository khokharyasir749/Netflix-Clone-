import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  ChevronDown,
  Menu,
  X,
  User,
  Film,
  HelpCircle,
  Settings,
  LogOut,
  Check,
} from 'lucide-react';
import { useMovieContext } from '../context/MovieContext';

export default function Navbar() {
  const {
    user,
    logout,
    profiles,
    activeProfile,
    selectProfile,
  } = useMovieContext();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const searchInputRef = useRef(null);
  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Scroll listener for dynamic background change
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync search input with URL search params when on search page
  useEffect(() => {
    if (location.pathname === '/search') {
      const params = new URLSearchParams(location.search);
      const q = params.get('q') || '';
      setSearchQuery(q);
      if (q) {
        setIsSearchOpen(true);
      }
    }
  }, [location.pathname, location.search]);

  // Auto-focus search input when expanded
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // If on login page, render simplified minimal header
  if (location.pathname === '/login') {
    return null;
  }

  // Live search as the user types
  const handleSearchChange = (val) => {
    setSearchQuery(val);
    if (val.trim()) {
      navigate(`/search?q=${encodeURIComponent(val.trim())}`);
    } else if (location.pathname === '/search') {
      navigate('/search');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const handleSignOut = () => {
    logout();
    setIsProfileOpen(false);
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'TV Shows', path: '/?filter=tv' },
    { name: 'Movies', path: '/?filter=movies' },
    { name: 'New & Popular', path: '/?filter=popular' },
    { name: 'My List', path: '/my-list' },
  ];

  const isActiveLink = (path) => {
    if (path === '/') {
      return location.pathname === '/' && !location.search;
    }
    if (path.startsWith('/?filter=')) {
      return location.pathname === '/' && location.search === path.replace('/', '');
    }
    return location.pathname === path;
  };

  const notifications = [
    {
      id: 1,
      title: 'New Arrival: Stranger Things Season 5',
      time: '2 hours ago',
      image: 'https://image.tmdb.org/t/p/w200/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
    },
    {
      id: 2,
      title: 'Continue watching Wednesday',
      time: '1 day ago',
      image: 'https://image.tmdb.org/t/p/w200/9PFonBhy4cQy7Jz20NpMygczOkv.jpg',
    },
    {
      id: 3,
      title: 'Top 10 Movie: Interstellar is trending',
      time: '3 days ago',
      image: 'https://image.tmdb.org/t/p/w200/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    },
  ];

  const currentAvatarColor = activeProfile?.color || 'from-[#E50914] via-red-800 to-blue-700';
  const currentAvatarInitial = activeProfile?.initial || 'Y';

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-500 ${
          isScrolled
            ? 'bg-[#141414] shadow-md'
            : 'bg-gradient-to-b from-black/90 via-black/40 to-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-18 flex items-center justify-between gap-4">
          {/* Left: Hamburger (mobile) + Brand Logo + Nav Links */}
          <div className="flex items-center gap-4 md:gap-8">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 text-gray-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Netflix Brand Wordmark */}
            <Link
              to="/"
              className="flex items-center tracking-tighter select-none font-black text-2xl md:text-3xl text-[#E50914] hover:opacity-90 transition-opacity"
            >
              NETFLIX
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-5 text-sm font-normal">
              {navLinks.map((link) => {
                const active = isActiveLink(link.path);
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`transition-colors duration-200 ${
                      active
                        ? 'text-white font-bold'
                        : 'text-gray-300 hover:text-gray-400'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Actions: Search + Notifications + Profile */}
          <div className="flex items-center gap-3 sm:gap-5 text-white">
            {/* Expandable Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center relative"
            >
              <div
                className={`flex items-center transition-all duration-300 ease-in-out ${
                  isSearchOpen
                    ? 'w-48 sm:w-64 bg-black/80 border border-white/30 px-2.5 py-1 rounded'
                    : 'w-8 bg-transparent border-transparent'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (!isSearchOpen) {
                      setIsSearchOpen(true);
                    } else if (!searchQuery) {
                      setIsSearchOpen(false);
                    } else {
                      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                    }
                  }}
                  className="text-white hover:text-gray-300 transition-colors p-1 shrink-0 cursor-pointer"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>

                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Titles, people, genres"
                  className={`bg-transparent text-white text-xs sm:text-sm placeholder-gray-400 focus:outline-none transition-all duration-300 ${
                    isSearchOpen ? 'w-full ml-2 opacity-100' : 'w-0 opacity-0 pointer-events-none'
                  }`}
                  onBlur={() => {
                    if (!searchQuery && location.pathname !== '/search') {
                      setIsSearchOpen(false);
                    }
                  }}
                />

                {isSearchOpen && searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      handleSearchChange('');
                      searchInputRef.current?.focus();
                    }}
                    className="text-gray-400 hover:text-white p-0.5 shrink-0 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </form>

            {/* Notification Bell with Badge & Dropdown */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsProfileOpen(false);
                }}
                className="p-1 text-gray-200 hover:text-white transition-colors relative cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-[#E50914] rounded-full ring-2 ring-[#141414]" />
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-[#181818] border border-white/10 rounded-md shadow-2xl py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Notifications
                    </span>
                    <span className="text-[10px] text-[#E50914] cursor-pointer hover:underline">
                      Mark all as read
                    </span>
                  </div>

                  <div className="divide-y divide-white/5 max-h-72 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="px-4 py-3 flex items-center gap-3 hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <img
                          src={notif.image}
                          alt=""
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://image.tmdb.org/t/p/w200/56v2KjBlU4XaOv9rVYEQypROD7P.jpg';
                          }}
                          className="w-12 h-8 object-cover rounded shrink-0 bg-neutral-800"
                        />
                        <div className="overflow-hidden">
                          <p className="text-xs font-medium text-white truncate">
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-gray-400">{notif.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Avatar with Hover / Click Dropdown */}
            <div
              className="relative"
              ref={profileRef}
              onMouseEnter={() => setIsProfileOpen(true)}
              onMouseLeave={() => setIsProfileOpen(false)}
            >
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-1.5 focus:outline-none group cursor-pointer"
                aria-label="User Profile"
              >
                {/* Active Netflix Profile Avatar */}
                <div
                  className={`w-8 h-8 rounded bg-gradient-to-tr ${currentAvatarColor} flex items-center justify-center ring-1 ring-white/20 group-hover:ring-white transition-all shadow-md`}
                >
                  <span className="text-xs font-bold text-white">
                    {currentAvatarInitial}
                  </span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-transform duration-200 ${
                    isProfileOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 top-full pt-2 w-56 z-50">
                  <div className="bg-[#181818]/95 backdrop-blur-md border border-white/10 rounded-md shadow-2xl py-2 text-sm text-gray-200 divide-y divide-white/10">
                    {/* Switch Profiles List */}
                    <div className="py-1 px-1 space-y-1">
                      {profiles.map((p) => {
                        const isActive = activeProfile?.id === p.id;
                        return (
                          <div
                            key={p.id}
                            onClick={() => {
                              selectProfile(p);
                              setIsProfileOpen(false);
                            }}
                            className={`flex items-center justify-between px-3 py-1.5 hover:bg-white/10 rounded cursor-pointer transition-colors ${
                              isActive ? 'bg-white/5' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-6 h-6 rounded bg-gradient-to-tr ${p.color} flex items-center justify-center text-xs font-bold text-white shadow`}
                              >
                                {p.initial}
                              </div>
                              <span className="text-xs font-medium text-white">{p.name}</span>
                            </div>
                            {isActive && <Check className="w-3.5 h-3.5 text-green-400" />}
                          </div>
                        );
                      })}

                      <Link
                        to="/profiles"
                        onClick={() => setIsProfileOpen(false)}
                        className="block px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                      >
                        Manage Profiles
                      </Link>
                    </div>

                    {/* Account Links */}
                    <div className="py-1.5 px-1 space-y-0.5">
                      <Link
                        to="/#account"
                        className="flex items-center gap-2.5 px-3 py-1.5 text-xs hover:bg-white/10 rounded transition-colors text-gray-300 hover:text-white"
                      >
                        <Settings className="w-3.5 h-3.5 text-gray-400" />
                        Account
                      </Link>
                      <Link
                        to="/#help"
                        className="flex items-center gap-2.5 px-3 py-1.5 text-xs hover:bg-white/10 rounded transition-colors text-gray-300 hover:text-white"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
                        Help Center
                      </Link>
                    </div>

                    {/* Sign Out Action */}
                    <div className="py-1 px-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-white/10 rounded transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out of Netflix
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden animate-fadeIn">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="absolute top-16 left-0 right-0 bg-[#141414] border-b border-white/10 px-6 py-6 space-y-4 shadow-2xl">
            <nav className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-base font-medium py-1.5 border-b border-white/5 transition-colors ${
                    isActiveLink(link.path)
                      ? 'text-[#E50914] font-bold'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-sm text-gray-400">
              <Link
                to="/profiles"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-white"
              >
                Switch Profile
              </Link>
              <button
                onClick={handleSignOut}
                className="text-red-500 hover:text-red-400 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
