import React, { useState, useEffect } from 'react';
import { Satellite, Menu, X, CloudRain, Sun } from 'lucide-react';

function NavBar({ isSignedIn, user, onSignOut, onNavigateHome, onNavigateDashboard, currentPage }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  // Close mobile menu when page changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [currentPage]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('nav')) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <nav className="bg-black/80 backdrop-blur-xl border-b border-cyan-500/20 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={onNavigateHome}
          >
            <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Satellite className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                AGRI-SPACE
              </h2>
              <p className="text-xs text-cyan-300/70">NASA Powered Farming</p>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2 text-cyan-400 hover:text-cyan-300 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Desktop Navigation */}
          {isSignedIn && (
            <div className="hidden lg:flex items-center gap-6">
              <button
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  currentPage === 'home' 
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                    : 'text-cyan-300/70 hover:text-cyan-400 hover:bg-cyan-500/10'
                }`}
                onClick={onNavigateHome}
              >
                Home
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  currentPage === 'dashboard' 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25' 
                    : 'text-cyan-300/70 hover:text-cyan-400 hover:bg-cyan-500/10'
                }`}
                onClick={onNavigateDashboard}
              >
                My Farm
              </button>
              
              {/* User Menu */}
              <div className="relative group">
                <button className="h-10 w-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-110 transition-transform duration-300 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                  <span className="text-sm font-semibold text-white">{initials}</span>
                </button>
                <div className="absolute right-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-cyan-500/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  <div className="p-4 border-b border-cyan-500/20">
                    <p className="text-sm font-semibold text-white">{user?.name}</p>
                    <p className="text-xs text-cyan-300/70">{user?.email}</p>
                    <p className="text-xs text-cyan-400 mt-1">{user?.location}</p>
                  </div>
                  <button 
                    onClick={onSignOut}
                    className="w-full px-4 py-3 text-left text-sm text-cyan-300/70 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors rounded-b-xl"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && isSignedIn && (
          <div className="lg:hidden mt-4 pb-4 border-t border-cyan-500/20 pt-4 animate-in slide-in-from-top duration-300">
            <div className="flex flex-col gap-3">
              <button
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  currentPage === 'home' 
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                    : 'text-cyan-300/70 hover:text-cyan-400 hover:bg-cyan-500/10'
                }`}
                onClick={() => {
                  onNavigateHome();
                  setIsMenuOpen(false);
                }}
              >
                Home
              </button>
              <button
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  currentPage === 'dashboard' 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' 
                    : 'text-cyan-300/70 hover:text-cyan-400 hover:bg-cyan-500/10'
                }`}
                onClick={() => {
                  onNavigateDashboard();
                  setIsMenuOpen(false);
                }}
              >
                My Farm
              </button>
              <div className="px-4 py-3 border-t border-cyan-500/20 mt-2">
                <p className="text-sm font-semibold text-white">{user?.name}</p>
                <p className="text-xs text-cyan-300/70">{user?.email}</p>
                <button 
                  onClick={() => {
                    onSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="w-full mt-3 px-4 py-2 text-center text-sm text-cyan-300/70 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors rounded-lg border border-cyan-500/20"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default NavBar;