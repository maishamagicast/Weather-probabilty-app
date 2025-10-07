import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('agrispace_darkMode');
    if (stored !== null) {
      setDarkMode(stored === 'true');
    } else {
      // default is true (your current theme)
      setDarkMode(true);
    }
  }, []);

  // Persist whenever darkMode changes
  useEffect(() => {
    localStorage.setItem('agrispace_darkMode', darkMode);
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
