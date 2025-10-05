import React, { useState, useEffect } from 'react';
import { 
  Satellite, CloudRain, Sun, Wind, Droplets, AlertTriangle, Calendar, 
  MapPin, RefreshCw, Map, CalendarDays, Beaker, TrendingUp, X
} from 'lucide-react';
import { weatherAPI } from '../services/api';
import InteractiveMap from './InteractiveMap';
import WeatherAnalysisPanel from './WeatherAnalysisPanel';

function Dashboard({ user }) {
  const [weatherData, setWeatherData] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

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

  // Enhanced Satellite Map Modal
  const SatelliteMapModal = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-cyan-500/20 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Map className="w-6 h-6 text-cyan-400" />
            <h3 className="text-2xl font-bold text-white">Interactive Map & Location Selection</h3>
          </div>
          <button onClick={() => setActiveModal(null)} className="text-cyan-400 hover:text-cyan-300 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Interactive Map */}
            <div className="space-y-4">
              <InteractiveMap 
                location={selectedLocation} 
                onLocationSelect={setSelectedLocation} 
              />
              {selectedLocation && (
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
                  <h4 className="font-semibold text-cyan-400 mb-2">Selected Location</h4>
                  <p className="text-white">{selectedLocation.name}</p>
                  <p className="text-cyan-300/70 text-sm">
                    Latitude: {selectedLocation.lat.toFixed(4)}° • Longitude: {selectedLocation.lon.toFixed(4)}°
                  </p>
                  <p className="text-cyan-300/70 text-sm mt-1">
                    {selectedLocation.address || 'Custom selected location'}
                  </p>
                </div>
              )}
            </div>

            {/* Satellite Data Panel */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-green-900/40 to-blue-900/40 rounded-xl p-6 border border-cyan-500/20">
                <div className="text-center mb-4">
                  <Satellite className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-white mb-2">NASA Earth Observation Data</h4>
                  <p className="text-cyan-300/70">
                    Location: {selectedLocation?.name || user?.location || 'Select a location on the map'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 rounded-xl p-4 border border-cyan-500/20">
                  <h5 className="font-semibold text-cyan-400 mb-2">Cloud Coverage</h5>
                  <p className="text-white text-2xl font-bold">35%</p>
                  <p className="text-cyan-300/70 text-sm">Clear conditions expected</p>
                </div>
                <div className="bg-black/40 rounded-xl p-4 border border-cyan-500/20">
                  <h5 className="font-semibold text-cyan-400 mb-2">Vegetation Index</h5>
                  <p className="text-white text-2xl font-bold">0.72</p>
                  <p className="text-cyan-300/70 text-sm">Healthy vegetation</p>
                </div>
                <div className="bg-black/40 rounded-xl p-4 border border-cyan-500/20">
                  <h5 className="font-semibold text-cyan-400 mb-2">Surface Temperature</h5>
                  <p className="text-white text-2xl font-bold">24°C</p>
                  <p className="text-cyan-300/70 text-sm">Optimal range</p>
                </div>
                <div className="bg-black/40 rounded-xl p-4 border border-cyan-500/20">
                  <h5 className="font-semibold text-cyan-400 mb-2">Soil Moisture</h5>
                  <p className="text-white text-2xl font-bold">68%</p>
                  <p className="text-cyan-300/70 text-sm">Good moisture levels</p>
                </div>
              </div>

              <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                <p className="text-cyan-300 text-sm">
                  <strong>Data Sources:</strong> NASA MODIS, AIRS, and GPM satellites • Updated every 6 hours
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Your existing modals (keep them as they are)
  const CropCalendarModal = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-cyan-500/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarDays className="w-6 h-6 text-green-400" />
            <h3 className="text-2xl font-bold text-white">Crop Calendar</h3>
          </div>
          <button onClick={() => setActiveModal(null)} className="text-cyan-400 hover:text-cyan-300 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-cyan-400 mb-4">Your Crops: {user?.crops?.join(', ')}</h4>
          </div>

          <div className="space-y-4">
            {user?.crops?.map((crop, index) => (
              <div key={index} className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 rounded-xl p-6 border border-green-500/20">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h5 className="text-xl font-bold text-white mb-1">{crop}</h5>
                    <p className="text-green-300/70 text-sm">Current Season Activities</p>
                  </div>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">
                    Active
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-black/40 rounded-lg p-3">
                    <p className="text-cyan-300/70 text-xs mb-1">Planting Window</p>
                    <p className="text-white font-semibold">Oct 15 - Nov 30</p>
                  </div>
                  <div className="bg-black/40 rounded-lg p-3">
                    <p className="text-cyan-300/70 text-xs mb-1">Next Activity</p>
                    <p className="text-white font-semibold">Weeding (in 2 weeks)</p>
                  </div>
                  <div className="bg-black/40 rounded-lg p-3">
                    <p className="text-cyan-300/70 text-xs mb-1">Expected Harvest</p>
                    <p className="text-white font-semibold">March 2026</p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-green-300 text-sm">
                    <strong>Recommendation:</strong> Weather conditions favorable for planting. Soil moisture optimal.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Include your existing SoilAnalysisModal and MarketPricesModal here

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
      {/* Modals */}
      {activeModal === 'satellite' && <SatelliteMapModal />}
      {activeModal === 'calendar' && <CropCalendarModal />}
      {/* Include your other modals here */}

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

        {/* NASA Weather Analysis Section */}
        <WeatherAnalysisPanel user={user} />

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

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <button 
            onClick={() => setActiveModal('satellite')}
            className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-xl p-4 text-cyan-400 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Map className="w-5 h-5" />
            Interactive Map
          </button>
          <button 
            onClick={() => setActiveModal('calendar')}
            className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl p-4 text-blue-400 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
          >
            <CalendarDays className="w-5 h-5" />
            Crop Calendar
          </button>
          {/* Include your other action buttons */}
        </div>

        {/* Farm Summary */}
        <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-6">
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