// src/pages/Signup.jsx
import React, { useState } from 'react';
import { ArrowLeft, Satellite, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../services/requests';

function Signup({ onSignUp, onNavigateHome, onNavigateLogin, darkMode }) {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.username.trim()) errors.username = 'Username is required';
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await authAPI.register(formData);

      if (result.success) {
        onSignUp(result.user || result);
      } else {
        setError(result.error || 'Signup failed. Please try again.');
      }
    } catch (err) {
      setError('Signup failed. Please try again.');
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
        onSignUp(result.user || result);
      } else {
        setError(result.error || 'Demo login failed');
      }
    } catch (err) {
      setError('Demo login failed');
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
    return darkMode ? 'text-cyan-200' : 'text-blue-600';
  };

  const getInputClass = () => {
    return darkMode 
      ? 'bg-black/40 border-cyan-500/30 text-white'
      : 'bg-white/90 border-blue-500/30 text-gray-800';
  };

  const getErrorClass = () => {
    return darkMode 
      ? 'bg-red-500/10 border-red-500/30 text-red-400'
      : 'bg-red-500/20 border-red-500/40 text-red-600';
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${getBackgroundClass()}`}>
      <div className={`max-w-md w-full rounded-2xl border p-8 backdrop-blur-xl ${getCardClass()} ${
        darkMode ? 'shadow-2xl shadow-cyan-500/10' : 'shadow-2xl shadow-blue-500/10'
      }`}>
        <button onClick={onNavigateHome} className={`flex items-center gap-2 mb-4 ${
          darkMode ? 'text-cyan-400' : 'text-blue-600'
        }`}>
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        <div className="text-center mb-6">
          <Satellite className="w-10 h-10 mx-auto text-cyan-400 mb-2" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-1">AGRI-SPACE</h2>
          <p className={getTextClass()}>Create your account</p>
        </div>

        {error && (
          <div className={`p-3 rounded-lg text-sm mb-4 ${getErrorClass()}`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className={`block text-sm mb-1 ${getTextClass()}`}>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg ${getInputClass()} ${
                validationErrors.name ? 'border-red-500' : ''
              }`}
              placeholder="John Doe"
            />
            {validationErrors.name && <p className="text-red-400 text-xs mt-1">{validationErrors.name}</p>}
          </div>

          <div>
            <label className={`block text-sm mb-1 ${getTextClass()}`}>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg ${getInputClass()} ${
                validationErrors.username ? 'border-red-500' : ''
              }`}
              placeholder="john123"
            />
            {validationErrors.username && <p className="text-red-400 text-xs mt-1">{validationErrors.username}</p>}
          </div>

          <div>
            <label className={`block text-sm mb-1 ${getTextClass()}`}>Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg pr-10 ${getInputClass()} ${
                  validationErrors.password ? 'border-red-500' : ''
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                  darkMode ? 'text-cyan-300' : 'text-blue-600'
                }`}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {validationErrors.password && <p className="text-red-400 text-xs mt-1">{validationErrors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className={`underline transition-colors ${
              darkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-blue-600 hover:text-blue-500'
            }`}
          >
            Continue as Demo User
          </button>
        </div>

        <p className={`mt-4 text-center text-sm ${
          darkMode ? 'text-cyan-300' : 'text-blue-600'
        }`}>
          Already have an account?{' '}
          <button onClick={onNavigateLogin} className={`underline transition-colors ${
            darkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-blue-600 hover:text-blue-500'
          }`}>
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

export default Signup;