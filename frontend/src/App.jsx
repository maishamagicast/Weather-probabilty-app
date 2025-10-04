import React, { useState } from 'react';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './components/Dashboard';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogin = async (userData) => {
    setUser(userData);
    setIsSignedIn(true);
    setCurrentPage('dashboard');
  };

  const handleSignUp = async (userData) => {
    setUser(userData);
    setIsSignedIn(true);
    setCurrentPage('dashboard');
  };

  const handleSignOut = () => {
    setIsSignedIn(false);
    setUser(null);
    setCurrentPage('home');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return (
          <Login 
            onLogin={handleLogin} 
            onNavigateHome={() => setCurrentPage('home')}
            onNavigateSignup={() => setCurrentPage('signup')}
          />
        );
      case 'signup':
        return (
          <Signup 
            onSignUp={handleSignUp} 
            onNavigateHome={() => setCurrentPage('home')}
            onNavigateLogin={() => setCurrentPage('login')}
          />
        );
      case 'dashboard':
        return <Dashboard user={user} />;
      default:
        return (
          <HomePage
            onNavigateLogin={() => setCurrentPage('login')}
            onNavigateSignUp={() => setCurrentPage('signup')}
            isSignedIn={isSignedIn}
            user={user}
          />
        );
    }
  };

  const showNavAndFooter = currentPage !== 'login' && currentPage !== 'signup';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {showNavAndFooter && (
        <NavBar
          isSignedIn={isSignedIn}
          user={user}
          onSignOut={handleSignOut}
          onNavigateHome={() => setCurrentPage('home')}
          onNavigateDashboard={() => setCurrentPage('dashboard')}
          currentPage={currentPage}
        />
      )}
      
      <main className="flex-grow">
        {renderPage()}
      </main>
      
      {showNavAndFooter && <Footer />}
    </div>
  );
}