// src/components/Dashboard.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Satellite, MapPin, RefreshCw, Map, X } from 'lucide-react';
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
  const mapRef = useRef(null);

  useEffect(() => { loadWeatherData(); }, [user]);

  const loadWeatherData = async () => {
    setLoading(true);
    try {
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 5000));
      const dataPromise = Promise.all([weatherAPI.getWeatherData(user?.location), weatherAPI.getHistoricalData(user?.location)]);
      const [weatherResult, historicalResult] = await Promise.race([dataPromise, timeoutPromise]);
      if (weatherResult?.success) setWeatherData(weatherResult.data);
    } catch (err) {
      console.error('Error loading weather data:', err);
      setWeatherData({ temperature: "20-28°C", rainfall: "Moderate probability", soilMoisture: "Optimal", recommendation: "Good conditions for planting", alert: "None" });
    } finally { setLoading(false); }
  };

  const handleLocationSelect = (loc) => {
    setSelectedLocation(loc);
  };

  // Simple search that uses Nominatim, but Dashboard does not need to search — we rely on InteractiveMap for advanced search.
  const onSearchSubmit = async () => {
    if (!searchQuery.trim()) return;
    try {
      // quick search using Nominatim (limit 1)
      const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(searchQuery)}&limit=1`;
      const res = await fetch(url, { headers: { "Accept-Language": "en" } });
      const data = await res.json();
      if (data && data.length > 0) {
        const d = data[0];
        const addr = d.address || {};
        const placeName = addr.city || addr.town || addr.village || d.display_name.split(",")[0];
        const loc = { lat: parseFloat(d.lat), lon: parseFloat(d.lon), placeName, ward: addr.ward || addr.neighbourhood || "", townOrCity: addr.city || addr.town || addr.village || "", county: addr.county || addr.state_district || addr.region || addr.state || "", country: addr.country || "", display_name: d.display_name, raw: addr };
        setSelectedLocation(loc);
      } else {
        alert("Location not found from Dashboard search.");
      }
    } catch (err) {
      console.error("Search failed", err);
      alert("Search failed.");
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* Satellite modal */}
      {activeModal === 'satellite' && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="w-full max-w-5xl bg-gray-900/95 rounded-2xl border border-cyan-500/20 overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-cyan-500/20">
              <div className="text-lg font-bold text-cyan-400 flex items-center gap-2"><Map className="w-5 h-5" />NASA Satellite</div>
              <button onClick={() => setActiveModal(null)} className="text-cyan-400 hover:text-cyan-300 p-1"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-4">
              <SatelliteMap location={selectedLocation} />
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{user?.name || 'Farmer'}!</span>
            </h1>
            <div className="flex items-center gap-2 text-cyan-300/70 text-sm"><MapPin className="w-4 h-4" /><span>{user?.location || 'Your Farm Location'}</span></div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={loadWeatherData} className="px-3 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded text-cyan-400"><RefreshCw className="w-4 h-4" /> Refresh</button>
            <button onClick={() => setShowSearch(s => !s)} className="px-3 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded text-cyan-400"><Map className="w-4 h-4" /> {showSearch ? 'Close search' : 'Search location'}</button>
            <button onClick={() => setActiveModal('satellite')} className="px-3 py-2 bg-purple-500/20 border border-purple-500/30 rounded text-purple-400"><Satellite className="w-4 h-4" /> Satellite</button>
          </div>
        </div>

        {showSearch && (
          <div className="mb-4 flex gap-2 max-w-xl">
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Type a place name, address, or coordinates (lat, lon)" className="flex-1 p-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white" />
            <button onClick={onSearchSubmit} className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600">Go</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <LeafletMap selectedLocation={selectedLocation} onLocationSelect={handleLocationSelect} />
          </div>

          <div className="space-y-4">
            <div className="bg-gray-800/60 backdrop-blur-xl rounded-xl border border-cyan-500/20 p-4">
              <h2 className="text-lg font-semibold text-cyan-400 mb-2">Selected Location</h2>
              {!selectedLocation ? (
                <p className="text-gray-400 text-sm">Click on the map or search a location to see details here.</p>
              ) : (
                <>
                  <p className="text-sm text-white font-semibold">{selectedLocation.placeName || selectedLocation.display_name}</p>
                  <p className="text-xs text-cyan-300/80 mb-2">{selectedLocation.lat?.toFixed?.(6)}, {selectedLocation.lon?.toFixed?.(6)}</p>

                  <div className="text-sm space-y-1">
                    <div><span className="text-cyan-300/80">Ward:</span> <span className="text-white">{selectedLocation.ward || '—'}</span></div>
                    <div><span className="text-cyan-300/80">Town / City:</span> <span className="text-white">{selectedLocation.townOrCity || '—'}</span></div>
                    <div><span className="text-cyan-300/80">County / District:</span> <span className="text-white">{selectedLocation.county || '—'}</span></div>
                    <div><span className="text-cyan-300/80">Country:</span> <span className="text-white">{selectedLocation.country || '—'}</span></div>
                  </div>
                </>
              )}
            </div>

              <WeatherAnalysisPanel
                  user={user}
                  latitude={selectedLocation?.lat}
                  longitude={selectedLocation?.lon}
                  onViewSatellite={() => setActiveModal('satellite')}
                />
            <div className="bg-gray-800/60 p-3 rounded-xl border border-cyan-500/20">
              <h3 className="text-cyan-400 font-semibold mb-2">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setActiveModal('satellite')} className="p-2 bg-black/40 rounded border border-cyan-500/10 text-cyan-300">Open Satellite Map</button>
                <button onClick={() => alert('Export not implemented in demo')} className="p-2 bg-black/40 rounded border border-cyan-500/10 text-cyan-300">Export Data</button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
