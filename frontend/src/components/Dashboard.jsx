import React, { useState, useEffect } from 'react';
import { Satellite, CloudRain, Sun, Wind, Droplets, AlertTriangle, Calendar, MapPin, RefreshCw } from 'lucide-react';
import { weatherAPI } from '../services/api';

function Dashboard({ user }) {
  const [weatherData, setWeatherData] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadWeatherData();
  }, [user]);

  const loadWeatherData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [weatherResult, historicalResult] = await Promise.all([
        weatherAPI.getWeatherData(user?.location),
        weatherAPI.getHistoricalData(user?.location)
      ]);
      
      if (weatherResult.success) {
        setWeatherData(weatherResult.data);
      } else {
        setError('Failed to load weather data');
      }
      
      if (historicalResult.success) {
        setHistoricalData(historicalResult.data);
      } else {
        setError('Failed to load historical data');
      }
    } catch (error) {
      console.error('Error loading weather data:', error);
      setError('Failed to load farm data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    loadWeatherData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-400 text-lg">Loading your farm data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">{error}</div>
          <button
            onClick={refreshData}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-semibold text-white transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Default data in case API returns undefined
  const defaultWeatherData = {
    temperature: "20-28°C",
    rainfall: "Moderate probability",
    soilMoisture: "Optimal",
    recommendation: "Good conditions for planting",
    alert: "None"
  };

  const defaultHistoricalData = {
    averageTemp: "22°C",
    totalRainfall: "45mm",
    soilTrend: "Stable",
    prediction: "Favorable conditions for next 2 weeks"
  };

  const currentWeather = weatherData || defaultWeatherData;
  const currentHistorical = historicalData?.data || defaultHistoricalData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{user?.name || 'Farmer'}!</span>
            </h1>
            <div className="flex items-center gap-2 text-cyan-300/70">
              <MapPin className="w-4 h-4" />
              <span>{user?.location || 'Your Farm Location'}</span>
              <span className="mx-2">•</span>
              <span>{user?.farmSize || 'Farm Size'}</span>
              <span className="mx-2">•</span>
              <span>{user?.crops?.join(', ') || 'Your Crops'}</span>
            </div>
          </div>
          
          <button
            onClick={refreshData}
            className="mt-4 lg:mt-0 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-cyan-400 transition-all duration-300 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </button>
        </div>

        {/* Weather Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Current Conditions */}
          <div className="lg:col-span-2 bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Satellite className="w-6 h-6 text-cyan-400" />
              Current Conditions
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-black/40 rounded-xl p-4 border border-cyan-500/20">
                <Sun className="w-8 h-8 text-yellow-400 mb-2" />
                <div className="text-2xl font-bold text-white">{currentWeather.temperature}</div>
                <div className="text-cyan-300/70 text-sm">Temperature</div>
              </div>
              
              <div className="bg-black/40 rounded-xl p-4 border border-cyan-500/20">
                <CloudRain className="w-8 h-8 text-blue-400 mb-2" />
                <div className="text-2xl font-bold text-white">High</div>
                <div className="text-cyan-300/70 text-sm">Rain Probability</div>
              </div>
              
              <div className="bg-black/40 rounded-xl p-4 border border-cyan-500/20">
                <Droplets className="w-8 h-8 text-cyan-400 mb-2" />
                <div className="text-2xl font-bold text-white">{currentWeather.soilMoisture}</div>
                <div className="text-cyan-300/70 text-sm">Soil Moisture</div>
              </div>
              
              <div className="bg-black/40 rounded-xl p-4 border border-cyan-500/20">
                <Wind className="w-8 h-8 text-green-400 mb-2" />
                <div className="text-2xl font-bold text-white">5-15</div>
                <div className="text-cyan-300/70 text-sm">Wind (km/h)</div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Calendar className="w-6 h-6 text-green-400" />
              Farm Advice
            </h2>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4">
                <h3 className="font-semibold text-green-400 mb-2">🌱 Planting</h3>
                <p className="text-green-300/80 text-sm">{currentWeather.recommendation}</p>
              </div>
              
              {currentWeather.alert !== 'None' && (
                <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-xl p-4">
                  <h3 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Alert
                  </h3>
                  <p className="text-red-300/80 text-sm">{currentWeather.alert}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Historical Data */}
        <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Historical Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400">{currentHistorical.averageTemp}</div>
              <div className="text-cyan-300/70 text-sm">Avg Temperature</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">{currentHistorical.totalRainfall}</div>
              <div className="text-cyan-300/70 text-sm">Total Rainfall</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{currentHistorical.soilTrend}</div>
              <div className="text-cyan-300/70 text-sm">Soil Trend</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-400">Favorable</div>
              <div className="text-cyan-300/70 text-sm">2-week Outlook</div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-black/40 rounded-xl border border-cyan-500/20">
            <p className="text-cyan-300 text-center">
              <strong>Prediction:</strong> {currentHistorical.prediction}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-xl p-4 text-cyan-400 transition-all duration-300 hover:scale-105">
            View Satellite Map
          </button>
          <button className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl p-4 text-blue-400 transition-all duration-300 hover:scale-105">
            Crop Calendar
          </button>
          <button className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl p-4 text-green-400 transition-all duration-300 hover:scale-105">
            Soil Analysis
          </button>
          <button className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-xl p-4 text-purple-400 transition-all duration-300 hover:scale-105">
            Market Prices
          </button>
        </div>

        {/* Farm Summary */}
        <div className="mt-8 bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-6">
          <h2 className="text-2xl font-bold mb-6">Your Farm Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="text-4xl font-bold text-cyan-400 mb-2">🌾</div>
              <div className="text-lg font-semibold text-white">{user?.crops?.length || 0} Crops</div>
              <div className="text-cyan-300/70 text-sm">Currently Growing</div>
            </div>
            <div className="text-center p-4">
              <div className="text-4xl font-bold text-green-400 mb-2">📅</div>
              <div className="text-lg font-semibold text-white">Optimal</div>
              <div className="text-cyan-300/70 text-sm">Planting Conditions</div>
            </div>
            <div className="text-center p-4">
              <div className="text-4xl font-bold text-blue-400 mb-2">💧</div>
              <div className="text-lg font-semibold text-white">{currentWeather.soilMoisture}</div>
              <div className="text-cyan-300/70 text-sm">Soil Status</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;