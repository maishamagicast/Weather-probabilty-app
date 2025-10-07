import React, { useState, useEffect, useContext } from 'react';
import { Satellite, Menu, X, CloudRain, Sun } from 'lucide-react';
import { ThemeContext } from '../theme/ThemeContext';
function NavBar({ isSignedIn, user, onSignOut, onNavigateHome, onNavigateDashboard, currentPage }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { darkMode, toggleTheme } = useContext(ThemeContext);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  useEffect(() => {
    setIsMenuOpen(false);
  }, [currentPage]);

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

  const navBgClass = darkMode
    ? 'bg-black/80 backdrop-blur-xl border-b border-cyan-500/20'
    : 'bg-white/90 backdrop-blur-xl border-b border-gray-200';
  const textClass = darkMode ? 'text-cyan-400' : 'text-gray-700';
  const hoverTextClass = darkMode ? 'hover:text-cyan-300' : 'hover:text-gray-900';
  const btnBgActive = darkMode
    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
    : 'bg-green-200 text-green-700 border border-green-300';
  const btnText = darkMode ? 'text-cyan-300/70' : 'text-gray-600';

  return (
    <nav className={`${navBgClass} sticky top-0 z-50 transition-colors duration-300`}>
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
              <p className={`${textClass} text-xs`}>
                NASA Powered Farming
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors ${textClass} ${hoverTextClass}`}
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <CloudRain className="w-5 h-enter5" />}
            </button>

            {/* Mobile Menu Button */}
            <button
              className={`${textClass} ${hoverTextClass} lg:hidden p-2 transition-colors`}
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
                      ? btnBgActive
                      : `${btnText} ${hoverTextClass} hover:bg-green-100`
                  }`}
                  onClick={onNavigateHome}
                >
                  Home
                </button>
                <button
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    currentPage === 'dashboard'
                      ? 'bg-gradient-to-r from-green-400 to-blue-400 text-white shadow-lg'
                      : `${btnText} ${hoverTextClass} hover:bg-green-100`
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
                  <div className={`absolute right-0 mt-2 w-64 backdrop-blur-xl rounded-xl shadow-2xl border transition-all duration-300 ${
                    darkMode ? 'bg-gray-900/95 border-cyan-500/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible'
                             : 'bg-white border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible'
                  }`}>
                    <div className={`p-4 border-b ${darkMode ? 'border-cyan-500/20' : 'border-gray-200'}`}>
                      <p className={`${darkMode ? 'text-white' : 'text-gray-800'} text-sm font-semibold`}>
                        {user?.name}
                      </p>
                      <p className={`${darkMode ? 'text-cyan-300/70' : 'text-gray-600'} text-xs`}>
                        {user?.email}
                      </p>
                      <p className={`${darkMode ? 'text-cyan-400' : 'text-gray-500'} text-xs mt-1`}>
                        {user?.location}
                      </p>
                    </div>
                    <button
                      onClick={onSignOut}
                      className={`w-full px-4 py-3 text-left text-sm transition-colors rounded-b-xl ${
                        darkMode
                          ? 'text-cyan-300/70 hover:text-cyan-400 hover:bg-cyan-500/10'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                      }`}
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && isSignedIn && (
          <div className={`lg:hidden mt-4 pb-4 pt-4 animate-in slide-in-from-top duration-300 border-t ${
            darkMode ? 'border-cyan-500/20' : 'border-gray-200'
          }`}>
            <div className="flex flex-col gap-3">
              <button
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  currentPage === 'home'
                    ? btnBgActive
                    : `${btnText} ${hoverTextClass} hover:bg-green-100`
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
                    ? 'bg-gradient-to-r from-green-400 to-blue-400 text-white'
                    : `${btnText} ${hoverTextClass} hover:bg-green-100`
                }`}
                onClick={() => {
                  onNavigateDashboard();
                  setIsMenuOpen(false);
                }}
              >
                My Farm
              </button>
              <div className={`px-4 py-3 mt-2 border-t ${
                darkMode ? 'border-cyan-500/20' : 'border-gray-200'
              }`}>
                <p className={`${darkMode ? 'text-white' : 'text-gray-800'} text-sm font-semibold`}>
                  {user?.name}
                </p>
                <p className={`${darkMode ? 'text-cyan-300/70' : 'text-gray-600'} text-xs`}>
                  {user?.email}
                </p>
                <button
                  onClick={() => {
                    onSignOut();
                    setIsMenuOpen(false);
                  }}
                  className={`w-full mt-3 px-4 py-2 text-center text-sm transition-colors rounded-lg border ${
                    darkMode
                      ? 'text-cyan-300/70 hover:text-cyan-400 hover:bg-cyan-500/10 border-cyan-500/20'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 border-gray-200'
                  }`}
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
