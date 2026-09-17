import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, User, Shield } from 'lucide-react';
import { useMovieContext, DEFAULT_PROFILES } from '../context/MovieContext';

export default function Profiles() {
  const { selectProfile, activeProfile } = useMovieContext();
  const navigate = useNavigate();

  const handleSelect = (profile) => {
    selectProfile(profile);
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full bg-[#141414] text-white flex flex-col items-center justify-center px-4 py-16 select-none animate-fadeIn">
      <div className="max-w-3xl w-full text-center space-y-8">
        <h1 className="text-3xl sm:text-5xl font-medium tracking-wide">
          Who's watching?
        </h1>

        {/* Profiles Grid */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 pt-4">
          {DEFAULT_PROFILES.map((profile) => {
            const isSelected = activeProfile?.id === profile.id;

            return (
              <div
                key={profile.id}
                onClick={() => handleSelect(profile)}
                className="group flex flex-col items-center gap-3 cursor-pointer"
              >
                {/* Avatar Box */}
                <div
                  className={`w-24 h-24 sm:w-36 sm:h-36 rounded-md bg-gradient-to-tr ${profile.color} flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-105 group-hover:ring-4 group-hover:ring-white relative overflow-hidden`}
                >
                  <span className="text-4xl sm:text-6xl font-black text-white drop-shadow-md">
                    {profile.initial}
                  </span>

                  {profile.isKids && (
                    <span className="absolute bottom-1 right-1 text-[10px] uppercase font-bold bg-black/70 px-1.5 py-0.5 rounded text-yellow-300">
                      Kids
                    </span>
                  )}
                </div>

                {/* Profile Name */}
                <span
                  className={`text-sm sm:text-lg font-medium transition-colors ${
                    isSelected
                      ? 'text-white font-bold'
                      : 'text-gray-400 group-hover:text-white'
                  }`}
                >
                  {profile.name}
                </span>
              </div>
            );
          })}

          {/* Add Profile Card */}
          <div
            onClick={() => alert('Add Profile: Feature enabled in full version.')}
            className="group flex flex-col items-center gap-3 cursor-pointer"
          >
            <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-md border-2 border-gray-600 group-hover:border-white group-hover:bg-white/10 flex items-center justify-center transition-all duration-300 group-hover:scale-105">
              <Plus className="w-12 h-12 text-gray-500 group-hover:text-white transition-colors" />
            </div>
            <span className="text-sm sm:text-lg text-gray-400 group-hover:text-white font-medium transition-colors">
              Add Profile
            </span>
          </div>
        </div>

        {/* Manage Profiles Button */}
        <div className="pt-8">
          <button
            onClick={() => alert('Profile Management: You can configure avatars and age restrictions here.')}
            className="border border-gray-500 text-gray-400 hover:text-white hover:border-white px-7 py-2 text-sm sm:text-base tracking-widest uppercase font-semibold transition-colors cursor-pointer"
          >
            Manage Profiles
          </button>
        </div>
      </div>
    </div>
  );
}
