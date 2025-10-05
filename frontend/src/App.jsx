import React, { useState, useEffect } from 'react';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './components/Dashboard';
import LeafletMap from "./components/LeafletMap";

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Check for existing session on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('agrispace_user');
    const savedToken = localStorage.getItem('agrispace_token');
    
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setIsSignedIn(true);
      setCurrentPage('dashboard');
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsSignedIn(true);
    setCurrentPage('dashboard');
    localStorage.setItem('agrispace_user', JSON.stringify(userData));
    localStorage.setItem('agrispace_token', 'mock-jwt-token');
  };

  const handleSignUp = (userData) => {
    setUser(userData);
    setIsSignedIn(true);
    setCurrentPage('dashboard');
    localStorage.setItem('agrispace_user', JSON.stringify(userData));
    localStorage.setItem('agrispace_token', 'mock-jwt-token');
  };

  const handleSignOut = () => {
    setUser(null);
    setIsSignedIn(false);
    setCurrentPage('home');
    localStorage.removeItem('agrispace_user');
    localStorage.removeItem('agrispace_token');
  };

  const handleNavigateHome = () => {
    setCurrentPage('home');
  };

  const handleNavigateLogin = () => {
    setCurrentPage('login');
  };

  const handleNavigateSignup = () => {
    setCurrentPage('signup');
  };

  const handleNavigateDashboard = () => {
    if (isSignedIn) {
      setCurrentPage('dashboard');
    }
  };

  const handleDemoAccess = () => {
    const demoUser = {
      id: 3,
      email: "demo@nasa.earth",
      name: "Demo Farmer",
      location: "Nairobi, Kenya",
      farmSize: "10 acres",
      crops: ["Maize", "Beans", "Coffee"]
    };
    handleLogin(demoUser);
  };
 const handleLocationSelect = (loc) => {
    console.log("Location selected:", loc);
  }; 
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {currentPage !== 'login' && currentPage !== 'signup' && (
        <NavBar
          isSignedIn={isSignedIn}
          user={user}
          onSignOut={handleSignOut}
          onNavigateHome={handleNavigateHome}
          onNavigateDashboard={handleNavigateDashboard}
          currentPage={currentPage === 'home' ? 'home' : 'dashboard'}
        />
      )}

      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onNavigateLogin={handleNavigateLogin}
            onNavigateSignup={handleNavigateSignup}
            isSignedIn={isSignedIn}
            user={user}
            onDemoAccess={handleDemoAccess}
          />
        )}
        {currentPage === 'login' && (
          <Login
            onLogin={handleLogin}
            onNavigateHome={handleNavigateHome}
            onNavigateSignup={handleNavigateSignup}
          />
        )}
        {currentPage === 'signup' && (
          <Signup
            onSignUp={handleSignUp}
            onNavigateHome={handleNavigateHome}
            onNavigateLogin={handleNavigateLogin}
          />
        )}
        {currentPage === 'dashboard' && <Dashboard user={user} />}
      </main>

      {currentPage !== 'login' && currentPage !== 'signup' && <Footer />}
    </div>
  );
}
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {currentPage !== 'login' && currentPage !== 'signup' && (
        <NavBar
          isSignedIn={isSignedIn}
          user={user}
          onSignOut={handleSignOut}
          onNavigateHome={handleNavigateHome}
          onNavigateDashboard={handleNavigateDashboard}
          currentPage={currentPage === 'home' ? 'home' : 'dashboard'}
        />
      )}

      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onNavigateLogin={handleNavigateLogin}
            onNavigateSignup={handleNavigateSignup}
            isSignedIn={isSignedIn}
            user={user}
            onDemoAccess={handleDemoAccess}
          />
        )}
        {currentPage === 'login' && (
          <Login
            onLogin={handleLogin}
            onNavigateHome={handleNavigateHome}
            onNavigateSignup={handleNavigateSignup}
          />
        )}
        {currentPage === 'signup' && (
          <Signup
            onSignUp={handleSignUp}
            onNavigateHome={handleNavigateHome}
            onNavigateLogin={handleNavigateLogin}
          />
        )}
        {currentPage === 'dashboard' && <Dashboard user={user} />}
      </main>

      {currentPage !== 'login' && currentPage !== 'signup' && <Footer />}
    </div>
  );
}