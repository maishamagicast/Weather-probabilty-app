import React, { useState } from 'react';
import { ArrowLeft, Satellite, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../services/requests';

function Signup({ onSignUp, onNavigateHome, onNavigateLogin }) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
      <div className="max-w-md w-full bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-8">
        <button onClick={onNavigateHome} className="flex items-center gap-2 text-cyan-400 mb-4">
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        <div className="text-center mb-6">
          <Satellite className="w-10 h-10 mx-auto text-cyan-400 mb-2" />
          <h2 className="text-2xl font-bold text-white mb-1">AGRI-SPACE</h2>
          <p className="text-cyan-200 text-sm">Create your account</p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block text-sm text-cyan-300 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg bg-black/40 border ${validationErrors.name ? 'border-red-500' : 'border-cyan-500/30'} text-white`}
              placeholder="John Doe"
            />
            {validationErrors.name && <p className="text-red-400 text-xs mt-1">{validationErrors.name}</p>}
          </div>

          <div>
            <label className="block text-sm text-cyan-300 mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg bg-black/40 border ${validationErrors.username ? 'border-red-500' : 'border-cyan-500/30'} text-white`}
              placeholder="john123"
            />
            {validationErrors.username && <p className="text-red-400 text-xs mt-1">{validationErrors.username}</p>}
          </div>

          <div>
            <label className="block text-sm text-cyan-300 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg bg-black/40 border ${validationErrors.password ? 'border-red-500' : 'border-cyan-500/30'} text-white pr-10`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-300"
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
            className="text-cyan-400 hover:text-cyan-300 underline"
          >
            Continue as Demo User
          </button>
        </div>

        <p className="mt-4 text-center text-cyan-300 text-sm">
          Already have an account?{' '}
          <button onClick={onNavigateLogin} className="text-cyan-400 hover:text-cyan-300 underline">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

export default Signup;
