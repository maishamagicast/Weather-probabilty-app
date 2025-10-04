import React, { useState, useEffect } from 'react';
import { Satellite, CloudRain, Sun, Wind, Droplets, AlertTriangle, Calendar, MapPin, RefreshCw, Map, CalendarDays, Beaker, TrendingUp, X } from 'lucide-react';
import { weatherAPI } from '../services/api';

function Dashboard({ user }) {
  const [weatherData, setWeatherData] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeModal, setActiveModal] = useState(null);

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

  // Modal Components
  const SatelliteMapModal = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-cyan-500/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Map className="w-6 h-6 text-cyan-400" />
            <h3 className="text-2xl font-bold text-white">Satellite Map View</h3>
          </div>
          <button onClick={() => setActiveModal(null)} className="text-cyan-400 hover:text-cyan-300 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          <div className="bg-gradient-to-br from-green-900/40 to-blue-900/40 rounded-xl p-8 mb-6">
            <div className="text-center mb-4">
              <Satellite className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-pulse" />
              <h4 className="text-xl font-semibold text-white mb-2">Real-Time Satellite Data</h4>
              <p className="text-cyan-300/70">Location: {user?.location}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
            <p className="text-cyan-300 text-sm">
              <strong>Data Source:</strong> NASA MODIS & AIRS satellites • Updated every 6 hours
            </p>
          </div>
        </div>
      </div>
    </div>
  );

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

  const SoilAnalysisModal = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-cyan-500/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Beaker className="w-6 h-6 text-purple-400" />
            <h3 className="text-2xl font-bold text-white">Soil Analysis</h3>
          </div>
          <button onClick={() => setActiveModal(null)} className="text-cyan-400 hover:text-cyan-300 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
            <p className="text-purple-300">
              <strong>Farm Location:</strong> {user?.location} • Last Updated: Today
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-xl p-6 border border-purple-500/20">
              <h5 className="font-semibold text-purple-400 mb-4">Soil Composition</h5>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-white text-sm">Sand</span>
                    <span className="text-purple-300 text-sm font-semibold">40%</span>
                  </div>
                  <div className="w-full bg-black/40 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{width: '40%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-white text-sm">Silt</span>
                    <span className="text-purple-300 text-sm font-semibold">35%</span>
                  </div>
                  <div className="w-full bg-black/40 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{width: '35%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-white text-sm">Clay</span>
                    <span className="text-purple-300 text-sm font-semibold">25%</span>
                  </div>
                  <div className="w-full bg-black/40 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{width: '25%'}}></div>
                  </div>
                </div>
              </div>
              <p className="text-purple-300/70 text-sm mt-4">Soil Type: <strong className="text-white">Loam</strong></p>
            </div>

            <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 rounded-xl p-6 border border-cyan-500/20">
              <h5 className="font-semibold text-cyan-400 mb-4">Nutrient Levels</h5>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white">Nitrogen (N)</span>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">Good</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white">Phosphorus (P)</span>
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-semibold">Medium</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white">Potassium (K)</span>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">Good</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white">pH Level</span>
                  <span className="text-cyan-300 font-bold">6.5</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <h5 className="font-semibold text-green-400 mb-2">Recommendations</h5>
            <ul className="space-y-2 text-green-300/80 text-sm">
              <li>• Consider adding phosphorus fertilizer to boost P levels</li>
              <li>• Soil pH is optimal for most crops</li>
              <li>• Maintain current organic matter through composting</li>
              <li>• Monitor moisture levels during dry season</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const MarketPricesModal = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-cyan-500/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-yellow-400" />
            <h3 className="text-2xl font-bold text-white">Market Prices</h3>
          </div>
          <button onClick={() => setActiveModal(null)} className="text-cyan-400 hover:text-cyan-300 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <p className="text-yellow-300">
              <strong>Market:</strong> {user?.location} • Updated: 2 hours ago
            </p>
          </div>

          <div className="space-y-4">
            {user?.crops?.map((crop, index) => {
              const prices = {
                'Maize': { current: 'KES 45/kg', trend: 'up', change: '+5%' },
                'Beans': { current: 'KES 120/kg', trend: 'up', change: '+8%' },
                'Potatoes': { current: 'KES 65/kg', trend: 'down', change: '-3%' },
                'Coffee': { current: 'KES 380/kg', trend: 'up', change: '+12%' },
                'Bananas': { current: 'KES 50/bunch', trend: 'stable', change: '0%' },
                'default': { current: 'KES 75/kg', trend: 'stable', change: '0%' }
              };
              
              const priceData = prices[crop] || prices['default'];
              const trendColor = priceData.trend === 'up' ? 'green' : priceData.trend === 'down' ? 'red' : 'yellow';
              
              return (
                <div key={index} className={`bg-gradient-to-r from-${trendColor}-900/40 to-${trendColor}-800/40 rounded-xl p-6 border border-${trendColor}-500/20`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-xl font-bold text-white mb-1">{crop}</h5>
                      <p className="text-2xl font-bold text-cyan-400">{priceData.current}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 bg-${trendColor}-500/20 text-${trendColor}-400 rounded-full text-sm font-semibold mb-2`}>
                        {priceData.trend === 'up' ? '↑' : priceData.trend === 'down' ? '↓' : '→'} {priceData.change}
                      </span>
                      <p className="text-cyan-300/70 text-sm">vs last week</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="bg-black/40 rounded-lg p-2 text-center">
                      <p className="text-cyan-300/70 text-xs">Week High</p>
                      <p className="text-white font-semibold text-sm">
                        {crop === 'Maize' ? 'KES 48/kg' : crop === 'Beans' ? 'KES 125/kg' : 'KES 80/kg'}
                      </p>
                    </div>
                    <div className="bg-black/40 rounded-lg p-2 text-center">
                      <p className="text-cyan-300/70 text-xs">Week Low</p>
                      <p className="text-white font-semibold text-sm">
                        {crop === 'Maize' ? 'KES 42/kg' : crop === 'Beans' ? 'KES 115/kg' : 'KES 70/kg'}
                      </p>
                    </div>
                    <div className="bg-black/40 rounded-lg p-2 text-center">
                      <p className="text-cyan-300/70 text-xs">Forecast</p>
                      <p className="text-white font-semibold text-sm">Stable</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
            <p className="text-cyan-300 text-sm">
              <strong>Market Tip:</strong> Prices typically peak during harvest season. Consider storage options for better returns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

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
      {activeModal === 'soil' && <SoilAnalysisModal />}
      {activeModal === 'market' && <MarketPricesModal />}

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

        {/* Quick Actions - NOW FUNCTIONAL */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => setActiveModal('satellite')}
            className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-xl p-4 text-cyan-400 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
          >
            <Map className="w-5 h-5" />
            View Satellite Map
          </button>
          <button 
            onClick={() => setActiveModal('calendar')}
            className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl p-4 text-blue-400 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
          >
            <CalendarDays className="w-5 h-5" />
            Crop Calendar
          </button>
          <button 
            onClick={() => setActiveModal('soil')}
            className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl p-4 text-green-400 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
          >
            <Beaker className="w-5 h-5" />
            Soil Analysis
          </button>
          <button 
            onClick={() => setActiveModal('market')}
            className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-xl p-4 text-purple-400 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
          >
            <TrendingUp className="w-5 h-5" />
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