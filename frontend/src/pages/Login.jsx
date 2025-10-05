import React, { useState } from 'react';
import { ArrowLeft, Satellite, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../services/requests';

function Login({ onLogin, onNavigateHome, onNavigateSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Regular email/password login
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

  // Demo login using centralized API
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Background animations */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative container mx-auto px-4 py-12">
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>

        <div className="max-w-md mx-auto">
          <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-cyan-500/20 shadow-2xl shadow-cyan-500/10 overflow-hidden">
            {/* Header */}
            <div className="p-8 border-b border-cyan-500/20">
              <div className="text-center mb-2">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg">
                    <Satellite className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    AGRI-SPACE
                  </h2>
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">Welcome Back</h3>
                <p className="text-cyan-100/70">Sign in to access your farm dashboard</p>
              </div>
            </div>

            {/* Form */}
            <div className="p-8">
              <form onSubmit={handleLogin} className="space-y-6">
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm animate-fade-in">
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-cyan-300 mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-black/40 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-cyan-300/50 transition-all duration-300"
                    placeholder="farmer@example.com"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-cyan-300 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-black/40 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-cyan-300/50 pr-12 transition-all duration-300"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-300/50 hover:text-cyan-400 transition-colors"
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
              <div className="mt-8 pt-6 border-t border-cyan-500/20">
                <p className="text-sm text-cyan-300/70 text-center mb-4">
                  Or try a demo account:
                </p>
                <button
                  onClick={handleDemoLogin}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-white/5 border border-cyan-500/20 rounded-lg text-cyan-300 hover:bg-cyan-500/10 hover:text-cyan-400 transition-all duration-300 disabled:opacity-50"
                >
                  🌱 Demo Farmer Login
                </button>
              </div>
            </div>
          </div>

          {/* Signup Link */}
          <div className="mt-6 text-center">
            <p className="text-cyan-300/50 text-sm">
              Don't have an account?{' '}
              <button
                onClick={onNavigateSignup}
                className="text-cyan-400 hover:text-cyan-300 underline transition-colors"
              >
                Create account
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Subtle error fade animation */}
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
