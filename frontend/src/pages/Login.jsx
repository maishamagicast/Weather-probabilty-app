// src/pages/Login.jsx
import React, { useState } from 'react';
import { ArrowLeft, Satellite, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../services/requests';

function Login({ onLogin, onNavigateHome, onNavigateSignup, darkMode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await authAPI.login(email, password);
      if (result.success) {
        onLogin(result.user);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await authAPI.demoLogin();
      if (result.success) {
        onLogin(result.user);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Demo login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getBackgroundClass = () => {
    return darkMode 
      ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900'
      : 'bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50';
  };

  const getCardClass = () => {
    return darkMode 
      ? 'bg-gray-900/60 backdrop-blur-xl border-cyan-500/20'
      : 'bg-white/80 backdrop-blur-xl border-blue-500/20';
  };

  const getTextClass = () => {
    return darkMode ? 'text-cyan-300' : 'text-blue-600';
  };

  const getInputClass = () => {
    return darkMode 
      ? 'bg-black/40 border-cyan-500/30 text-white placeholder-cyan-300/50'
      : 'bg-white/90 border-blue-500/30 text-gray-800 placeholder-blue-400/50';
  };

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${getBackgroundClass()}`}>
      {/* Background animations */}
      <div className="absolute inset-0">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl animate-pulse ${
          darkMode ? 'bg-cyan-500/10' : 'bg-cyan-500/20'
        }`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl animate-pulse ${
          darkMode ? 'bg-purple-500/10' : 'bg-purple-500/20'
        }`}></div>
      </div>

      <div className="relative container mx-auto px-4 py-12">
        <button
          onClick={onNavigateHome}
          className={`flex items-center gap-2 transition-colors mb-8 group ${
            darkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-blue-600 hover:text-blue-500'
          }`}
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>

        <div className="max-w-md mx-auto">
          <div className={`rounded-2xl border shadow-2xl overflow-hidden backdrop-blur-xl ${getCardClass()} ${
            darkMode ? 'shadow-cyan-500/10' : 'shadow-blue-500/10'
          }`}>
            {/* Header */}
            <div className={`p-8 border-b ${
              darkMode ? 'border-cyan-500/20' : 'border-blue-500/20'
            }`}>
              <div className="text-center mb-2">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg">
                    <Satellite className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    AGRI-SPACE
                  </h2>
                </div>
                <h3 className={`text-3xl font-bold mb-2 ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>Welcome Back</h3>
                <p className={getTextClass()}>Sign in to access your farm dashboard</p>
              </div>
            </div>

            {/* Form */}
            <div className="p-8">
              <form onSubmit={handleLogin} className="space-y-6">
                {error && (
                  <div className={`p-3 rounded-lg text-sm animate-fade-in ${
                    darkMode 
                      ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                      : 'bg-red-500/20 border border-red-500/40 text-red-600'
                  }`}>
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className={`block text-sm font-medium mb-2 ${getTextClass()}`}
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 ${getInputClass()}`}
                    placeholder="farmer@example.com"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className={`block text-sm font-medium mb-2 ${getTextClass()}`}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent pr-12 transition-all duration-300 ${getInputClass()}`}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                        darkMode ? 'text-cyan-300/50 hover:text-cyan-400' : 'text-blue-500/50 hover:text-blue-600'
                      }`}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold text-white hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/25"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Signing In...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              {/* Demo Login */}
              <div className={`mt-8 pt-6 border-t ${
                darkMode ? 'border-cyan-500/20' : 'border-blue-500/20'
              }`}>
                <p className={`text-sm text-center mb-4 ${getTextClass()}`}>
                  Or try a demo account:
                </p>
                <button
                  onClick={handleDemoLogin}
                  disabled={loading}
                  className={`w-full px-4 py-3 border rounded-lg transition-all duration-300 disabled:opacity-50 ${
                    darkMode 
                      ? 'bg-white/5 border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/10 hover:text-cyan-400'
                      : 'bg-gray-800/5 border-blue-500/20 text-blue-600 hover:bg-blue-500/10 hover:text-blue-700'
                  }`}
                >
                  🌱 Demo Farmer Login
                </button>
              </div>
            </div>
          </div>

          {/* Signup Link */}
          <div className="mt-6 text-center">
            <p className={`text-sm ${
              darkMode ? 'text-cyan-300/50' : 'text-blue-600/50'
            }`}>
              Don't have an account?{' '}
              <button
                onClick={onNavigateSignup}
                className={`underline transition-colors ${
                  darkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-blue-600 hover:text-blue-500'
                }`}
              >
                Create account
              </button>
            </p>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(-4px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out;
          }
        `}
      </style>
    </div>
  );
}

export default Login;