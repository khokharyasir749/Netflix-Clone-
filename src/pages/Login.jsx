import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Film, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { useMovieContext } from '../context/MovieContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');

  const { login } = useMovieContext();
  const navigate = useNavigate();

  const handleSignIn = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 4) {
      setError('Your password must contain between 4 and 60 characters.');
      return;
    }

    const userName = email.split('@')[0];
    login(email, userName.charAt(0).toUpperCase() + userName.slice(1));
    navigate('/profiles');
  };

  const handleDemoAccess = () => {
    setEmail('yasir@netflix.com');
    setPassword('demopass123');
    login('yasir@netflix.com', 'Yasir');
    navigate('/profiles');
  };

  return (
    <div className="relative min-h-screen w-full bg-black select-none overflow-x-hidden flex flex-col justify-between">
      {/* Background Poster Collage with Gradient Tint */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center opacity-40 scale-105"
          style={{
            backgroundImage: `url('https://assets.nflxext.com/ffe/siteui/vlv3/d80f8335-5026-47b2-8c10-0994f71a4805/0d8e9ecb-d249-43c3-8884-25e2272e272a/US-en-20240108-popsignuptwoweeks-perspective_alpha_website_large.jpg')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/80" />
      </div>

      {/* Top Header with Brand Logo */}
      <header className="relative z-20 px-6 sm:px-12 py-6 flex items-center justify-between">
        <Link to="/" className="text-[#E50914] font-black text-3xl sm:text-4xl tracking-tighter">
          NETFLIX
        </Link>
      </header>

      {/* Centered Glassmorphic Sign-In Box */}
      <main className="relative z-20 flex items-center justify-center px-4 py-8">
        <div className="bg-black/75 backdrop-blur-md p-8 sm:p-14 max-w-md w-full rounded-md shadow-2xl border border-white/10 text-white">
          <h1 className="text-3xl font-bold mb-7">
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </h1>

          {/* Quick One-Click Demo Access Banner */}
          <button
            type="button"
            onClick={handleDemoAccess}
            className="w-full mb-6 bg-gradient-to-r from-amber-500/20 to-red-500/20 border border-amber-500/50 hover:border-amber-400 p-3 rounded flex items-center justify-center gap-2.5 text-xs sm:text-sm font-semibold text-amber-300 hover:text-amber-200 transition-all cursor-pointer shadow"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>One-Click Demo Access (Bypass Login)</span>
          </button>

          {error && (
            <div className="mb-4 bg-[#E50914]/20 border border-[#E50914] text-xs text-red-200 p-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="Email or phone number"
                className="w-full bg-[#333333] text-white text-sm px-4 py-3.5 rounded focus:outline-none focus:ring-2 focus:ring-white/40 border border-transparent focus:bg-[#454545] transition-all placeholder-gray-400"
              />
            </div>

            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Password"
                className="w-full bg-[#333333] text-white text-sm px-4 py-3.5 rounded focus:outline-none focus:ring-2 focus:ring-white/40 border border-transparent focus:bg-[#454545] transition-all placeholder-gray-400"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#E50914] hover:bg-red-700 text-white font-bold py-3.5 rounded text-sm transition-colors shadow-lg active:scale-98 cursor-pointer mt-2"
            >
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </button>

            <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-neutral-800 border-gray-600 text-[#E50914] focus:ring-0"
                />
                <span>Remember me</span>
              </label>

              <span className="hover:underline cursor-pointer">Need help?</span>
            </div>
          </form>

          {/* New to Netflix toggle */}
          <div className="mt-10 space-y-3 text-sm">
            <p className="text-gray-400">
              {isSignUp ? 'Already have an account?' : 'New to Netflix?'}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
                className="text-white hover:underline font-semibold ml-1 cursor-pointer"
              >
                {isSignUp ? 'Sign in now.' : 'Sign up now.'}
              </button>
            </p>

            <p className="text-[11px] text-gray-500 leading-normal">
              This page is protected by Google reCAPTCHA to ensure you're not a bot.{' '}
              <span className="text-blue-500 hover:underline cursor-pointer">Learn more.</span>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 border-t border-white/10 bg-black/80 px-6 sm:px-12 py-8 text-xs text-gray-500">
        <div className="max-w-4xl mx-auto space-y-4">
          <p>Questions? Call 1-800-000-0000</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-gray-400">
            <span className="hover:underline cursor-pointer">FAQ</span>
            <span className="hover:underline cursor-pointer">Help Center</span>
            <span className="hover:underline cursor-pointer">Terms of Use</span>
            <span className="hover:underline cursor-pointer">Privacy</span>
            <span className="hover:underline cursor-pointer">Cookie Preferences</span>
            <span className="hover:underline cursor-pointer">Corporate Information</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
