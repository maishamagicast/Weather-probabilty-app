import React, { useState } from 'react';
import { ArrowLeft, Satellite, Eye, EyeOff, MapPin, Leaf } from 'lucide-react';
import { authAPI } from '../services/api';

function Signup({ onSignUp, onNavigateHome, onNavigateLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    location: '',
    farmSize: '',
    crops: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.location.trim()) {
      errors.location = 'Location is required';
    }
    
    if (!formData.farmSize.trim()) {
      errors.farmSize = 'Farm size is required';
    }
    
    if (!formData.crops.trim()) {
      errors.crops = 'Please enter at least one crop';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Process crops into an array
      const cropsArray = formData.crops.split(',').map(crop => crop.trim()).filter(crop => crop);
      
      const userData = {
        ...formData,
        crops: cropsArray
      };

      const result = await authAPI.signup(userData);
      
      if (result.success) {
        onSignUp(result.user);
      } else {
        setError(result.error || 'Signup failed. Please try again.');
      }
    } catch (err) {
      setError('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignup = async () => {
    setLoading(true);
    setError('');

    try {
      const demoUser = {
        name: 'Demo User',
        email: 'demo@agrispace.com',
        password: 'demo123',
        location: 'Nairobi, Kenya',
        farmSize: '5 acres',
        crops: ['Maize', 'Beans']
      };

      const result = await authAPI.signup(demoUser);
      
      if (result.success) {
        onSignUp(result.user);
      }
    } catch (err) {
      setError('Demo signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative container mx-auto px-4 py-12">
        {/* Back Button */}
        <button 
          onClick={onNavigateHome}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>

        <div className="max-w-md mx-auto">
          {/* Card */}
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
                <h3 className="text-3xl font-bold text-white mb-2">Create Account</h3>
                <p className="text-cyan-100/70">Join thousands of smart farmers</p>
              </div>
            </div>

            {/* Form */}
            <div className="p-8">
              <form onSubmit={handleSignUp} className="space-y-5">
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-cyan-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-black/40 border ${validationErrors.name ? 'border-red-500/50' : 'border-cyan-500/30'} rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-cyan-300/50 transition-all duration-300`}
                    placeholder="John Kiprop"
                  />
                  {validationErrors.name && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-cyan-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-black/40 border ${validationErrors.email ? 'border-red-500/50' : 'border-cyan-500/30'} rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-cyan-300/50 transition-all duration-300`}
                    placeholder="farmer@example.com"
                  />
                  {validationErrors.email && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-cyan-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-black/40 border ${validationErrors.password ? 'border-red-500/50' : 'border-cyan-500/30'} rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-cyan-300/50 pr-12 transition-all duration-300`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-300/50 hover:text-cyan-400 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.password}</p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-cyan-300 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Farm Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-black/40 border ${validationErrors.location ? 'border-red-500/50' : 'border-cyan-500/30'} rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-cyan-300/50 transition-all duration-300`}
                    placeholder="Nakuru, Kenya"
                  />
                  {validationErrors.location && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.location}</p>
                  )}
                </div>

                {/* Farm Size */}
                <div>
                  <label className="block text-sm font-medium text-cyan-300 mb-2">
                    Farm Size
                  </label>
                  <input
                    type="text"
                    name="farmSize"
                    value={formData.farmSize}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-black/40 border ${validationErrors.farmSize ? 'border-red-500/50' : 'border-cyan-500/30'} rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-cyan-300/50 transition-all duration-300`}
                    placeholder="5 acres"
                  />
                  {validationErrors.farmSize && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.farmSize}</p>
                  )}
                </div>

                {/* Crops */}
                <div>
                  <label className="block text-sm font-medium text-cyan-300 mb-2">
                    <Leaf className="w-4 h-4 inline mr-1" />
                    Crops (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="crops"
                    value={formData.crops}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-black/40 border ${validationErrors.crops ? 'border-red-500/50' : 'border-cyan-500/30'} rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-cyan-300/50 transition-all duration-300`}
                    placeholder="Maize, Beans, Potatoes"
                  />
                  {validationErrors.crops && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.crops}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold text-white hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/25"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating Account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>

              {/* Demo Option */}
              <div className="mt-6 pt-6 border-t border-cyan-500/20">
                <button
                  onClick={handleDemoSignup}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-white/5 border border-cyan-500/20 rounded-lg text-cyan-300 hover:bg-cyan-500/10 hover:text-cyan-400 transition-all duration-300 disabled:opacity-50"
                >
                  Continue as Demo User
                </button>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-cyan-300/50 text-sm">
              Already have an account?{' '}
              <button 
                onClick={onNavigateLogin}
                className="text-cyan-400 hover:text-cyan-300 underline transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;