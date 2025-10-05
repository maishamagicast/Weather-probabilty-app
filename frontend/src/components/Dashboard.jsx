// src/components/Dashboard.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Satellite, MapPin, RefreshCw, Map, X, BarChart3, LineChart, Thermometer, CloudRain, Wind, Droplets } from 'lucide-react';
import { weatherAPI } from '../services/api';
import WeatherAnalysisPanel from './WeatherAnalysisPanel';
import LeafletMap from './LeafletMap';
import SatelliteMap from './SatelliteMap';

function Dashboard({ user }) {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [graphModal, setGraphModal] = useState(false);
  const [graphType, setGraphType] = useState('bar');
  const [currentWeather, setCurrentWeather] = useState(null);
  const mapRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => { 
    loadWeatherData(); 
  }, [user]);

  // Load weather data when selected location changes
  useEffect(() => {
    if (selectedLocation) {
      loadLocationWeather(selectedLocation);
    }
  }, [selectedLocation]);

  const loadWeatherData = async () => {
    setLoading(true);
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      );
      const dataPromise = Promise.all([
        weatherAPI.getWeatherData(user?.location), 
        weatherAPI.getHistoricalData(user?.location)
      ]);
      const [weatherResult] = await Promise.race([dataPromise, timeoutPromise]);
      if (weatherResult?.success) setWeatherData(weatherResult.data);
    } catch (err) {
      console.error('Error loading weather data:', err);
      setWeatherData({ 
        temperature: "20-28°C", 
        rainfall: "Moderate probability", 
        soilMoisture: "Optimal", 
        recommendation: "Good conditions for planting", 
        alert: "None" 
      });
    } finally { 
      setLoading(false); 
    }
  };

  // Load weather data for specific location
  const loadLocationWeather = async (location) => {
    try {
      // Simulate API call to get weather data based on coordinates
      // In a real app, you would use a weather API like OpenWeatherMap
      const mockWeatherData = generateMockWeatherData(location);
      setCurrentWeather(mockWeatherData);
    } catch (err) {
      console.error('Error loading location weather:', err);
      // Fallback to generated data
      const fallbackData = generateMockWeatherData(location);
      setCurrentWeather(fallbackData);
    }
  };

  // Generate realistic mock weather data based on location
  const generateMockWeatherData = (location) => {
    // Use coordinates to generate somewhat realistic variations
    const lat = location.lat;
    const lon = location.lon;
    
    // Temperature varies with latitude (colder near poles, warmer near equator)
    const baseTemp = 20 + (Math.abs(lat) - 30) * -0.5; // Base temp around 20°C at 30° latitude
    
    // Add some randomness and daily variation
    const tempVariation = Math.sin(Date.now() * 0.0001) * 8;
    const temperature = Math.round(baseTemp + tempVariation);
    
    // Precipitation probability (higher near coasts and specific longitudes)
    const isCoastal = Math.abs(lon % 90) < 10; // Simulate coastal areas
    const precipitation = isCoastal ? 
      Math.max(10, Math.min(90, 50 + (Math.sin(lon * 0.1) * 20))) :
      Math.max(5, Math.min(80, 30 + (Math.cos(lat * 0.1) * 25)));
    
    // Humidity (generally higher near equator and coasts)
    const humidity = Math.max(30, Math.min(95, 60 + (Math.abs(lat) - 30) * -0.8 + (isCoastal ? 15 : 0)));
    
    // Wind speed (generally higher in certain regions)
    const windSpeed = Math.max(1, Math.min(25, 8 + Math.sin(lon * 0.05) * 6 + Math.cos(lat * 0.05) * 4));

    return {
      temperature: `${temperature}°C`,
      precipitation: `${Math.round(precipitation)}%`,
      humidity: `${Math.round(humidity)}%`,
      windSpeed: `${windSpeed.toFixed(1)} km/h`,
      condition: getWeatherCondition(temperature, precipitation),
      feelsLike: `${Math.round(temperature - (windSpeed * 0.1))}°C`
    };
  };

  const getWeatherCondition = (temp, precip) => {
    if (precip > 70) return 'Heavy Rain';
    if (precip > 40) return 'Light Rain';
    if (precip > 20) return 'Cloudy';
    if (temp > 30) return 'Sunny';
    if (temp > 20) return 'Partly Cloudy';
    return 'Clear';
  };

  const handleLocationSelect = useCallback((loc) => { 
    setSelectedLocation(loc);
    loadLocationWeather(loc);
  }, []);

  // Optimized search with debouncing
  const onSearchSubmit = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(searchQuery)}&limit=5`;
      const res = await fetch(url, { 
        headers: { 
          "Accept-Language": "en",
          "User-Agent": "FarmWeatherApp/1.0"
        } 
      });
      
      if (!res.ok) throw new Error('Search failed');
      
      const data = await res.json();
      
      if (data && data.length > 0) {
        const results = data.map(d => {
          const addr = d.address || {};
          const placeName = addr.city || addr.town || addr.village || d.display_name.split(",")[0];
          return {
            lat: parseFloat(d.lat),
            lon: parseFloat(d.lon),
            placeName,
            ward: addr.ward || addr.neighbourhood || "",
            townOrCity: addr.city || addr.town || addr.village || "",
            county: addr.county || addr.state_district || addr.region || addr.state || "",
            country: addr.country || "",
            display_name: d.display_name,
            raw: addr
          };
        });
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error("Search failed", err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, [searchQuery]);

  // Debounced search
  useEffect(() => {
    if (searchQuery.trim()) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      searchTimeoutRef.current = setTimeout(() => {
        onSearchSubmit();
      }, 300);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, onSearchSubmit]);

  const handleSearchResultClick = useCallback((loc) => {
    setSelectedLocation(loc);
    setSearchResults([]);
    setSearchQuery(loc.display_name || loc.placeName);
    setShowSearch(false);
    // Weather data will load automatically due to useEffect
  }, []);

  // Close modal when clicking backdrop
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      setActiveModal(null);
      setGraphModal(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-400">Loading farm data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white font-orbitron overflow-x-hidden relative">
      {/* Satellite Modal - Highest z-index */}
      {activeModal === 'satellite' && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          <div className="w-full max-w-7xl h-[90vh] bg-gray-900/95 rounded-2xl border-2 border-cyan-500/30 overflow-hidden shadow-2xl backdrop-blur-sm transform transition-all duration-300 scale-100">
            <div className="flex items-center justify-between p-4 border-b border-cyan-500/30 bg-gray-800/50">
              <div className="text-xl font-bold text-cyan-400 flex items-center gap-3">
                <Satellite className="w-6 h-6" />
                NASA Satellite Imagery
                {selectedLocation && (
                  <span className="text-sm text-cyan-300/70 font-normal">
                    - {selectedLocation.placeName || selectedLocation.display_name}
                  </span>
                )}
              </div>
              <button 
                onClick={() => setActiveModal(null)} 
                className="text-cyan-400 hover:text-cyan-300 p-2 transition-colors rounded-lg hover:bg-cyan-400/10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="h-full w-full">
              <SatelliteMap location={selectedLocation} />
            </div>
          </div>
        </div>
      )}

      {/* Graph Modal - Same high z-index but only one modal shows at a time */}
      {graphModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          <div className="w-full max-w-6xl bg-gray-900/95 rounded-2xl border-2 border-cyan-500/30 p-6 shadow-2xl backdrop-blur-sm transform transition-all duration-300 scale-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-cyan-400 font-bold text-xl flex items-center gap-3">
                {graphType === 'bar' ? <BarChart3 className="w-6 h-6" /> : <LineChart className="w-6 h-6" />}
                {graphType === 'bar' ? 'Weather Analytics - Bar Chart' : 'Weather Analytics - Line Chart'} 
                <span className="text-sm text-cyan-300/70">(10-Year Data)</span>
              </h2>
              <button 
                onClick={() => setGraphModal(false)} 
                className="text-cyan-400 hover:text-cyan-300 p-2 transition-colors rounded-lg hover:bg-cyan-400/10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex items-center gap-3 mb-6">
              <button 
                onClick={() => setGraphType('bar')} 
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  graphType === 'bar' 
                    ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-400/25' 
                    : 'bg-gray-800 text-cyan-300 hover:bg-gray-700'
                }`}
              >
                Bar Chart
              </button>
              <button 
                onClick={() => setGraphType('line')} 
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  graphType === 'line' 
                    ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-400/25' 
                    : 'bg-gray-800 text-cyan-300 hover:bg-gray-700'
                }`}
              >
                Line Chart
              </button>
            </div>
            
            <div className="h-96 bg-gray-800/50 rounded-xl border-2 border-cyan-500/20 flex items-center justify-center text-cyan-300">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Interactive {graphType === 'bar' ? 'Bar' : 'Line'} Chart Visualization</p>
                <p className="text-sm text-cyan-300/70 mt-2">Weather data analytics will be rendered here</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Lower z-index */}
      <div className="container mx-auto px-4 py-8 space-y-8 relative z-10">
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">
              Welcome back,{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {user?.name || 'Farmer'}!
              </span>
            </h1>
            <div className="flex items-center gap-2 text-cyan-300/80">
              <MapPin className="w-5 h-5" />
              <span className="text-lg">{user?.location || 'Your Farm Location'}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={loadWeatherData}
              className="px-4 py-3 bg-gradient-to-r from-cyan-400 to-blue-400 text-black font-bold rounded-xl flex items-center gap-2 transition-transform hover:scale-105 shadow-lg"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh Data
            </button>
            
            <button 
              onClick={() => setShowSearch(s => !s)}
              className="px-4 py-3 bg-gradient-to-r from-cyan-400 to-blue-400 text-black font-bold rounded-xl flex items-center gap-2 transition-transform hover:scale-105 shadow-lg"
            >
              <Map className="w-5 h-5" />
              {showSearch ? 'Close Search' : 'Search Location'}
            </button>
            
            <button 
              onClick={() => setActiveModal('satellite')}
              className="px-4 py-3 bg-gradient-to-r from-purple-400 to-pink-500 text-black font-bold rounded-xl flex items-center gap-2 transition-transform hover:scale-105 shadow-lg"
            >
              <Satellite className="w-5 h-5" />
              Satellite View
            </button>
            
            <button 
              onClick={() => setGraphModal(true)}
              className="px-4 py-3 bg-cyan-400 text-black font-bold rounded-xl flex items-center gap-2 transition-transform hover:scale-105 shadow-lg"
            >
              <BarChart3 className="w-5 h-5" />
              Analytics
            </button>
          </div>
        </header>

        {/* Search Section */}
        {showSearch && (
          <section className="max-w-2xl space-y-3 relative z-20">
            <div className="relative">
              <div className="flex gap-3">
                <input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter place name, address, or coordinates..."
                  className="flex-1 p-4 rounded-xl bg-gray-800/70 border-2 border-cyan-500/30 text-white placeholder-cyan-300/50 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                  onKeyPress={(e) => e.key === 'Enter' && onSearchSubmit()}
                />
                <button 
                  onClick={onSearchSubmit}
                  disabled={searchLoading}
                  className="px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-400 text-black font-bold disabled:opacity-50 transition-transform hover:scale-105"
                >
                  {searchLoading ? 'Searching...' : 'Search'}
                </button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 rounded-xl border-2 border-cyan-500/30 overflow-hidden shadow-2xl backdrop-blur-sm z-30 max-h-80 overflow-y-auto">
                  {searchResults.map((loc, idx) => (
                    <button
                      key={`${loc.lat}-${loc.lon}-${idx}`}
                      className="w-full text-left p-4 hover:bg-cyan-500/20 hover:text-white transition-all border-b border-cyan-500/10 last:border-none group"
                      onClick={() => handleSearchResultClick(loc)}
                    >
                      <div className="font-semibold text-cyan-300 group-hover:text-white">
                        {loc.placeName}
                      </div>
                      <div className="text-sm text-cyan-300/70 group-hover:text-cyan-200 mt-1">
                        {[loc.townOrCity, loc.county, loc.country].filter(Boolean).join(', ')}
                      </div>
                      <div className="text-xs text-cyan-300/50 mt-1">
                        {loc.lat?.toFixed(4)}, {loc.lon?.toFixed(4)}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Main Content Grid - Updated Layout */}
        <section className="space-y-8">
          {/* Top Row: Map and Location Details */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Map Container - Taller but same width */}
            <div className="xl:col-span-3 bg-gray-800/50 rounded-2xl border-2 border-cyan-500/20 p-4 h-[700px] shadow-xl relative z-0">
              <LeafletMap 
                selectedLocation={selectedLocation} 
                onLocationSelect={handleLocationSelect} 
              />
            </div>

            {/* Location Details Sidebar */}
            <div className="bg-gray-800/50 rounded-2xl border-2 border-cyan-500/20 p-6 shadow-xl h-[700px] flex flex-col">
              <h2 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Selected Location
              </h2>
              
              {!selectedLocation ? (
                <div className="text-center py-8 flex-1 flex flex-col items-center justify-center">
                  <MapPin className="w-16 h-16 text-cyan-300/50 mx-auto mb-4" />
                  <p className="text-cyan-300/70">Click on the map or search for a location to see details</p>
                </div>
              ) : (
                <div className="space-y-6 flex-1">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {selectedLocation.placeName || selectedLocation.display_name}
                    </h3>
                    <p className="text-sm text-cyan-300/80 font-mono bg-gray-900/50 p-2 rounded-lg">
                      {selectedLocation.lat?.toFixed(6)}, {selectedLocation.lon?.toFixed(6)}
                    </p>
                  </div>
                  
                  {/* Current Weather Data */}
                  {currentWeather && (
                    <div className="bg-gray-900/30 rounded-xl p-4 border border-cyan-500/20">
                      <h4 className="text-cyan-300 font-semibold mb-3 flex items-center gap-2">
                        <Thermometer className="w-4 h-4" />
                        Current Weather
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <Thermometer className="w-4 h-4 text-cyan-400" />
                          <div>
                            <div className="text-xs text-cyan-300/70">Temperature</div>
                            <div className="text-white font-semibold">{currentWeather.temperature}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CloudRain className="w-4 h-4 text-blue-400" />
                          <div>
                            <div className="text-xs text-cyan-300/70">Precipitation</div>
                            <div className="text-white font-semibold">{currentWeather.precipitation}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-blue-300" />
                          <div>
                            <div className="text-xs text-cyan-300/70">Humidity</div>
                            <div className="text-white font-semibold">{currentWeather.humidity}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Wind className="w-4 h-4 text-green-400" />
                          <div>
                            <div className="text-xs text-cyan-300/70">Wind Speed</div>
                            <div className="text-white font-semibold">{currentWeather.windSpeed}</div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-cyan-500/20">
                        <div className="text-sm">
                          <span className="text-cyan-300/70">Condition: </span>
                          <span className="text-white font-medium">{currentWeather.condition}</span>
                        </div>
                        <div className="text-xs text-cyan-300/50 mt-1">
                          Feels like {currentWeather.feelsLike}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between items-center py-3 border-b border-cyan-500/20">
                      <span className="text-cyan-300/80">Ward:</span>
                      <span className="text-white font-medium">{selectedLocation.ward || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-cyan-500/20">
                      <span className="text-cyan-300/80">Town / City:</span>
                      <span className="text-white font-medium">{selectedLocation.townOrCity || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-cyan-500/20">
                      <span className="text-cyan-300/80">County / District:</span>
                      <span className="text-white font-medium">{selectedLocation.county || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-cyan-300/80">Country:</span>
                      <span className="text-white font-medium">{selectedLocation.country || '—'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Middle Row: Weather Analysis Panel - Full Width */}
          <div className="w-full">
            <WeatherAnalysisPanel 
              user={user} 
              onViewSatellite={() => setActiveModal('satellite')} 
            />
          </div>
        </section>

        {/* Quick Actions Footer */}
        <footer className="flex flex-wrap gap-4 justify-center pt-8 border-t border-cyan-500/20">
          <button 
            onClick={() => setActiveModal('satellite')}
            className="px-6 py-3 bg-cyan-400 text-black font-bold rounded-xl transition-transform hover:scale-105 shadow-lg"
          >
            Open Satellite Map
          </button>
          <button 
            onClick={() => alert('Export functionality will be implemented soon')}
            className="px-6 py-3 bg-purple-400 text-black font-bold rounded-xl transition-transform hover:scale-105 shadow-lg"
          >
            Export Weather Data
          </button>
          <button 
            onClick={() => setGraphModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-400 text-black font-bold rounded-xl transition-transform hover:scale-105 shadow-lg"
          >
            View Analytics
          </button>
        </footer>
      </div>
    </div>
  );
}

export default Dashboard;