import React, { useState, useEffect } from 'react';
import { Satellite, CloudRain, Sun, Wind, Droplets, ArrowRight, Sparkles } from 'lucide-react';

function HomePage({ onNavigateLogin, onNavigateSignUp, isSignedIn, user }) {
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      icon: Satellite,
      title: "Live Satellite Data",
      description: "Real-time NASA satellite imagery for precise weather monitoring",
      color: "from-cyan-500 to-blue-500"
    },
    {
      icon: CloudRain,
      title: "Rainfall Prediction",
      description: "Accurate rainfall forecasts for optimal planting and harvesting",
      color: "from-blue-500 to-purple-500"
    },
    {
      icon: Sun,
      title: "Temperature Analysis",
      description: "Detailed temperature trends for crop health monitoring",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Wind,
      title: "Wind Patterns",
      description: "Wind speed and direction analysis for crop protection",
      color: "from-green-500 to-teal-500"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto text-center space-y-8">
          {/* Animated Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-cyan-500/10 border border-cyan-500/30 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-sm font-medium text-cyan-400">Powered by NASA Earth Data</span>
          </div>
          
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Smart Farming
            </span>
            <br />
            <span className="text-white">with Space Technology</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-cyan-100/80 max-w-3xl mx-auto leading-relaxed">
            Transform your farming with real-time satellite data, AI-powered predictions, 
            and weather insights from NASA's advanced Earth observation systems.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 justify-center pt-8">
            {!isSignedIn ? (
              <>
                <button
                  onClick={onNavigateSignUp}
                  className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-semibold text-lg hover:scale-105 transition-all duration-300 shadow-2xl shadow-cyan-500/25 flex items-center gap-3"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={onNavigateLogin}
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-300"
                >
                  Sign In
                </button>
              </>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-2xl text-cyan-100">Welcome back, {user?.name}! 🚀</p>
                <p className="text-cyan-100/70">Ready to check your farm's weather insights?</p>
              </div>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-32 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className={`group p-6 rounded-2xl backdrop-blur-sm border transition-all duration-500 hover:scale-105 cursor-pointer ${
                    index === currentFeature
                      ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/40 shadow-2xl shadow-cyan-500/25'
                      : 'bg-white/5 border-white/10 hover:border-cyan-500/30'
                  }`}
                  onMouseEnter={() => setCurrentFeature(index)}
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                  <p className="text-cyan-100/70 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">98%</div>
            <div className="text-cyan-100/70 text-sm mt-2">Accuracy Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">24/7</div>
            <div className="text-cyan-100/70 text-sm mt-2">Real-time Monitoring</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">10K+</div>
            <div className="text-cyan-100/70 text-sm mt-2">Farmers Served</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">50+</div>
            <div className="text-cyan-100/70 text-sm mt-2">Countries Covered</div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;