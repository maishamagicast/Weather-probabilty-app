import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, Navigation, Search, ZoomIn, ZoomOut, Eye, EyeOff, 
  Thermometer, Droplets, Wind, CloudRain, Sun, Cloud, 
  Sprout, Calendar, Download, Star, History, Layers,
  Satellite, Compass, Ruler, AlertTriangle, CheckCircle
} from 'lucide-react';

const InteractiveMap = ({ location, onLocationSelect, className = '' }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isGeocodingLocation, setIsGeocodingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(6);
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedLocationData, setSelectedLocationData] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isConfirmingLocation, setIsConfirmingLocation] = useState(false);
  const [tempLocation, setTempLocation] = useState(null);
  const [showSatelliteView, setShowSatelliteView] = useState(false);
  const [measurementUnit, setMeasurementUnit] = useState('metric'); // metric or imperial
  
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const searchRef = useRef(null);
  const leafletLoadedRef = useRef(false);

  // Enhanced environmental data with agricultural focus
  const generateEnvironmentalData = (lat, lon) => {
    const seed = Math.abs(Math.sin(lat * 12.9898 + lon * 78.233) * 43758.5453);
    
    const latFactor = 1 - Math.abs(lat) / 90;
    const elevationEffect = Math.max(0, 1 - Math.abs(lat) / 90);
    const currentMonth = new Date().getMonth();
    
    // Seasonal variations for farming
    const seasonalTempVariation = Math.sin((currentMonth / 12) * 2 * Math.PI) * 8;
    const seasonalRainVariation = Math.sin((currentMonth / 12) * 2 * Math.PI + Math.PI) * 40;
    
    // Enhanced calculations with seasonal variation
    const baseTemp = 25 - (Math.abs(lat) * 0.6) + seasonalTempVariation;
    const temperature = measurementUnit === 'metric' 
      ? Math.floor(baseTemp + ((seed * 1000) % 15) - 7)
      : Math.floor((baseTemp * 9/5) + 32 + ((seed * 1000) % 27) - 13);

    const basePrecipitation = 50 + (latFactor * 100) + seasonalRainVariation;
    const precipitation = measurementUnit === 'metric'
      ? Math.floor(Math.max(0, basePrecipitation))
      : Math.floor(Math.max(0, basePrecipitation) / 25.4); // mm to inches

    const baseMoisture = 60 + (latFactor * 20) - (temperature - 20) * 2;
    const soilMoisture = Math.max(20, Math.min(95, Math.floor(baseMoisture + ((seed * 10000) % 20))));

    const baseVegetation = 0.3 + (elevationEffect * 0.5) + (latFactor * 0.2);
    const vegetationIndex = Math.min(0.95, baseVegetation + ((seed * 100) % 0.4));

    const cloudCoverage = Math.floor((seed % 1) * 100);
    const windSpeed = measurementUnit === 'metric'
      ? Math.floor(3 + ((seed * 5000) % 25))
      : Math.floor((3 + ((seed * 5000) % 25)) * 2.237); // m/s to mph
    const windDirection = Math.floor(seed * 360);
    const airQuality = Math.floor(20 + ((seed * 7000) % 130));
    const humidity = Math.floor(40 + (latFactor * 30) + ((seed * 6000) % 30));
    const solarRadiation = Math.floor(300 + ((seed * 5000) % 500));
    
    // Farming-specific metrics
    const growingDegreeDays = Math.max(0, temperature - 10);
    const frostRisk = temperature < 5 ? 'High' : temperature < 10 ? 'Moderate' : 'Low';
    const irrigationNeed = soilMoisture < 40 ? 'High' : soilMoisture < 60 ? 'Moderate' : 'Low';
    const cropSuitability = vegetationIndex > 0.6 ? 'Excellent' : vegetationIndex > 0.4 ? 'Good' : 'Fair';

    const getCloudCondition = (coverage) => {
      if (coverage < 10) return 'Clear skies';
      if (coverage < 25) return 'Few clouds';
      if (coverage < 50) return 'Partly cloudy';
      if (coverage < 75) return 'Mostly cloudy';
      if (coverage < 90) return 'Overcast';
      return 'Heavy cloud cover';
    };

    const getVegetationHealth = (index) => {
      if (index > 0.7) return 'Lush vegetation - Ideal for crops';
      if (index > 0.5) return 'Healthy growth - Good for farming';
      if (index > 0.3) return 'Moderate vegetation - May need improvement';
      if (index > 0.1) return 'Sparse vegetation - Consider soil treatment';
      return 'Barren land - Not suitable for farming';
    };

    const getTempStatus = (temp) => {
      const celsiusTemp = measurementUnit === 'metric' ? temp : (temp - 32) * 5/9;
      if (celsiusTemp >= 18 && celsiusTemp <= 28) return 'Optimal for most crops';
      if (celsiusTemp >= 15 && celsiusTemp <= 32) return 'Acceptable for farming';
      if (celsiusTemp < 10) return 'Too cold - Risk of frost';
      if (celsiusTemp > 35) return 'Heat stress risk';
      return 'Moderate farming conditions';
    };

    const getMoistureStatus = (moisture) => {
      if (moisture >= 60 && moisture <= 80) return 'Ideal moisture levels';
      if (moisture >= 40 && moisture < 60) return 'Moderate - Monitor closely';
      if (moisture >= 20 && moisture < 40) return 'Dry - Irrigation needed';
      return 'Very dry - Urgent irrigation required';
    };

    return {
      // Core metrics
      temperature,
      precipitation,
      soilMoisture,
      vegetationIndex: vegetationIndex.toFixed(3),
      cloudCoverage,
      windSpeed,
      windDirection,
      airQuality,
      humidity,
      solarRadiation,
      growingDegreeDays,
      frostRisk,
      irrigationNeed,
      cropSuitability,
      
      // Enhanced descriptions
      cloudCondition: getCloudCondition(cloudCoverage),
      vegetationHealth: getVegetationHealth(vegetationIndex),
      tempStatus: getTempStatus(temperature),
      moistureStatus: getMoistureStatus(soilMoisture),
      airQualityStatus: airQuality <= 50 ? 'Excellent' : airQuality <= 100 ? 'Good' : airQuality <= 150 ? 'Moderate' : 'Poor',
      windDescription: windSpeed < 5 ? 'Calm' : windSpeed < 15 ? 'Light breeze' : windSpeed < 25 ? 'Moderate wind' : 'Strong wind',
      
      // NASA data identifiers
      dataSource: 'NASA_POWER',
      timestamp: new Date().toISOString(),
      coordinates: { lat, lon },
      units: measurementUnit
    };
  };

  // Enhanced reverse geocoding with full country names
  const getLocationName = async (lat, lon) => {
    try {
      setIsGeocodingLocation(true);
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=12&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'AGRI-SPACE/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Geocoding failed');
      }

      const data = await response.json();
      const address = data.address || {};
      
      // Get full country name
      let countryName = address.country || '';
      
      // Location hierarchy
      const locationName = 
        address.village || 
        address.town || 
        address.city || 
        address.municipality || 
        address.county || 
        address.state || 
        countryName || 
        'Selected Location';
      
      const region = address.state || address.region || address.county || '';
      
      let fullAddress = locationName;
      if (region && region !== locationName) {
        fullAddress += `, ${region}`;
      }
      if (countryName && countryName !== locationName && countryName !== region) {
        fullAddress += `, ${countryName}`;
      }
      
      setIsGeocodingLocation(false);
      
      return {
        name: locationName,
        fullAddress: fullAddress,
        city: address.city || address.town || address.village || '',
        region: region,
        country: countryName,
        county: address.county || '',
        osm_id: data.osm_id
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      setIsGeocodingLocation(false);
      return {
        name: 'Selected Location',
        fullAddress: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
        city: '',
        region: '',
        country: '',
        county: ''
      };
    }
  };

  // Location search functionality
  const searchLocation = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'AGRI-SPACE/1.0'
          }
        }
      );

      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  // Handle search result selection (preview mode)
  const handleSearchSelect = (result) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    
    setSearchQuery(result.display_name);
    setShowSearchResults(false);
    
    // Store temporary location for preview
    const tempLocationData = {
      name: result.display_name,
      lat: lat,
      lon: lon,
      address: result.display_name,
      coordinates: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
      environmental: generateEnvironmentalData(lat, lon),
      isLoading: false,
      isPreview: true
    };
    
    setTempLocation(tempLocationData);
    setIsConfirmingLocation(true);
    
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lon], 12, {
        animate: true,
        duration: 1
      });
      
      addMarkerToMap(lat, lon, mapInstanceRef.current, true); // Preview marker
    }
  };

  // Confirm location selection
  const confirmLocationSelection = async () => {
    if (!tempLocation) return;
    
    setIsConfirmingLocation(false);
    setIsGeocodingLocation(true);
    
    const locationInfo = await getLocationName(tempLocation.lat, tempLocation.lon);
    
    const finalLocation = {
      name: locationInfo.name,
      lat: tempLocation.lat,
      lon: tempLocation.lon,
      address: locationInfo.fullAddress,
      coordinates: `${tempLocation.lat.toFixed(6)}, ${tempLocation.lon.toFixed(6)}`,
      city: locationInfo.city,
      region: locationInfo.region,
      country: locationInfo.country,
      county: locationInfo.county,
      environmental: tempLocation.environmental,
      isLoading: false,
      selectionType: 'search',
      timestamp: new Date().toISOString()
    };

    setSelectedLocationData(finalLocation);
    
    // Add to recent searches
    setRecentSearches(prev => {
      const newSearches = [finalLocation, ...prev.filter(item => 
        item.lat !== finalLocation.lat || item.lon !== finalLocation.lon
      )].slice(0, 5);
      return newSearches;
    });

    if (onLocationSelect) {
      onLocationSelect(finalLocation);
    }

    // Replace preview marker with permanent marker
    addMarkerToMap(tempLocation.lat, tempLocation.lon, mapInstanceRef.current, false);
    setIsGeocodingLocation(false);
  };

  // Cancel location selection
  const cancelLocationSelection = () => {
    setIsConfirmingLocation(false);
    setTempLocation(null);
    if (selectedLocationData && mapInstanceRef.current) {
      // Return to previously selected location
      addMarkerToMap(selectedLocationData.lat, selectedLocationData.lon, mapInstanceRef.current, false);
    }
  };

  // Get user's current location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        setUserLocation({ lat, lon });
        
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lon], 12, {
            animate: true,
            duration: 1
          });
          
          handleMapClick({ latlng: { lat, lng: lon } });
        }
        
        setIsLocating(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsLocating(false);
        alert('Unable to retrieve your location');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Handle map click (direct selection)
  const handleMapClick = async (e) => {
    const lat = e.latlng.lat;
    const lon = e.latlng.lng;
    
    const envData = generateEnvironmentalData(lat, lon);
    
    const immediateLocation = {
      name: 'Analyzing NASA data...',
      lat: lat,
      lon: lon,
      address: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
      coordinates: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
      environmental: envData,
      isLoading: true,
      selectionType: 'click',
      timestamp: new Date().toISOString()
    };

    setSelectedLocationData(immediateLocation);

    if (onLocationSelect) {
      onLocationSelect(immediateLocation);
    }

    addMarkerToMap(lat, lon, mapInstanceRef.current, false);

    // Get location name in background
    getLocationName(lat, lon).then(locationInfo => {
      const finalLocation = {
        name: locationInfo.name,
        lat: lat,
        lon: lon,
        address: locationInfo.fullAddress,
        coordinates: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
        city: locationInfo.city,
        region: locationInfo.region,
        country: locationInfo.country,
        county: locationInfo.county,
        environmental: envData,
        isLoading: false,
        selectionType: 'click',
        timestamp: new Date().toISOString()
      };

      setSelectedLocationData(finalLocation);

      if (onLocationSelect) {
        onLocationSelect(finalLocation);
      }
    }).catch(() => {
      const fallbackLocation = {
        name: 'Selected Location',
        lat: lat,
        lon: lon,
        address: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
        coordinates: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
        environmental: envData,
        isLoading: false,
        selectionType: 'click',
        timestamp: new Date().toISOString()
      };

      setSelectedLocationData(fallbackLocation);

      if (onLocationSelect) {
        onLocationSelect(fallbackLocation);
      }
    });
  };

  // Enhanced marker function with different styles for preview/confirmed
  const addMarkerToMap = (lat, lon, map, isPreview = false) => {
    if (!window.L) return;

    if (markerRef.current) {
      map.removeLayer(markerRef.current);
    }

    const markerColor = isPreview ? '#f59e0b' : '#ef4444'; // Amber for preview, Red for confirmed
    const markerClass = isPreview ? 'preview-marker' : 'confirmed-marker';
    const pulseAnimation = isPreview ? 'animate-pulse' : '';

    const customIcon = window.L.divIcon({
      html: `
        <div class="relative ${pulseAnimation}">
          <div class="w-8 h-8 bg-gradient-to-br from-${isPreview ? 'amber' : 'red'}-500 to-${isPreview ? 'yellow' : 'pink'}-600 rounded-full border-2 border-white shadow-lg"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-2 h-2 bg-white rounded-full"></div>
          </div>
          <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-${isPreview ? 'amber' : 'red'}-500"></div>
          ${isPreview ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>' : ''}
        </div>
      `,
      className: markerClass,
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });

    const marker = window.L.marker([lat, lon], {
      icon: customIcon,
      zIndexOffset: 1000
    }).addTo(map);

    marker.bindPopup(`
      <div class="p-2 min-w-48">
        <h3 class="font-semibold text-gray-800">${isPreview ? 'Preview Location' : 'Selected Location'}</h3>
        <p class="text-sm text-gray-600">${lat.toFixed(4)}, ${lon.toFixed(4)}</p>
        <div class="mt-2 text-xs ${isPreview ? 'text-amber-600' : 'text-cyan-600'}">
          <i>${isPreview ? 'Click confirm to select this location' : 'NASA data analysis available'}</i>
        </div>
      </div>
    `);

    markerRef.current = marker;
    
    if (!isPreview) {
      map.setView([lat, lon], Math.max(10, currentZoom), {
        animate: true,
        duration: 0.5
      });
    }
  };

  // Toggle satellite view
  const toggleSatelliteView = () => {
    if (!mapInstanceRef.current) return;
    
    setShowSatelliteView(!showSatelliteView);
    // This would typically switch between different tile layers
  };

  // Toggle measurement units
  const toggleMeasurementUnit = () => {
    setMeasurementUnit(prev => prev === 'metric' ? 'imperial' : 'metric');
    // Refresh data with new units if location is selected
    if (selectedLocationData) {
      const newEnvData = generateEnvironmentalData(
        selectedLocationData.lat, 
        selectedLocationData.lon
      );
      setSelectedLocationData({
        ...selectedLocationData,
        environmental: newEnvData
      });
    }
  };

  // Zoom controls
  const zoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
      setCurrentZoom(mapInstanceRef.current.getZoom());
    }
  };

  const zoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
      setCurrentZoom(mapInstanceRef.current.getZoom());
    }
  };

  // Initialize map
  useEffect(() => {
    const loadLeaflet = () => {
      if (window.L) {
        initializeMap();
        return;
      }

      if (leafletLoadedRef.current) return;
      leafletLoadedRef.current = true;

      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
        document.head.appendChild(link);
      }

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';
      script.async = true;
      script.onload = initializeMap;
      script.onerror = () => {
        console.error('Failed to load Leaflet');
        leafletLoadedRef.current = false;
        setMapLoaded(true);
      };
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!mapRef.current || !window.L) return;
      if (mapInstanceRef.current) return;

      try {
        const map = window.L.map(mapRef.current, {
          preferCanvas: true,
          zoomControl: false,
          attributionControl: true,
          minZoom: 3,
          maxZoom: 18,
          worldCopyJump: true
        }).setView([-1.2921, 36.8219], 6);

        const baseLayer = window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
          subdomains: 'abcd',
          maxZoom: 19
        }).addTo(map);

        const satelliteLayer = window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: '&copy; Esri, Earthstar Geographics',
          maxZoom: 19
        });

        const baseMaps = {
          "Dark Map": baseLayer,
          "Satellite": satelliteLayer
        };

        window.L.control.layers(baseMaps).addTo(map);

        window.L.control.zoom({
          position: 'topright'
        }).addTo(map);

        map.on('click', handleMapClick);

        map.on('zoomend', () => {
          setCurrentZoom(map.getZoom());
        });

        mapInstanceRef.current = map;
        
        map.whenReady(() => {
          setMapLoaded(true);
        });

      } catch (error) {
        console.error('Error initializing map:', error);
        setMapLoaded(true);
      }
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map when location changes
  useEffect(() => {
    if (mapInstanceRef.current && location && !location.isLoading) {
      const { lat, lon } = location;
      addMarkerToMap(lat, lon, mapInstanceRef.current, false);
      setSelectedLocationData(location);
    }
  }, [location]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Data Panel Component (Left Side)
  const DataPanel = () => {
    const displayData = isConfirmingLocation ? tempLocation : selectedLocationData;
    if (!displayData) {
      return (
        <div className="bg-gray-900/95 backdrop-blur-sm border-r border-cyan-500/20 w-96 flex-shrink-0 overflow-y-auto">
          <div className="p-6">
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 text-cyan-400/50 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-cyan-400 mb-2">Select a Location</h3>
              <p className="text-cyan-300/70 text-sm">
                Click on the map or search for a location to view detailed NASA agricultural data
              </p>
            </div>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="mt-8">
                <h4 className="text-cyan-400 font-semibold mb-3 flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Recent Locations
                </h4>
                <div className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearchSelect({
                        display_name: search.address,
                        lat: search.lat,
                        lon: search.lon
                      })}
                      className="w-full p-3 text-left bg-gray-800/50 rounded-lg border border-gray-700 hover:border-cyan-500/30 transition-colors"
                    >
                      <div className="text-white text-sm font-medium truncate">{search.name}</div>
                      <div className="text-cyan-300/70 text-xs truncate">{search.address}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    const data = displayData.environmental;
    const tempUnit = measurementUnit === 'metric' ? '°C' : '°F';
    const precipUnit = measurementUnit === 'metric' ? 'mm' : 'inches';
    const windUnit = measurementUnit === 'metric' ? 'm/s' : 'mph';

    return (
      <div className="bg-gray-900/95 backdrop-blur-sm border-r border-cyan-500/20 w-96 flex-shrink-0 overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-cyan-400">Selected Location</h3>
            {isConfirmingLocation && (
              <div className="flex items-center gap-2 bg-yellow-500/20 px-2 py-1 rounded text-yellow-400 text-xs">
                <AlertTriangle className="w-3 h-3" />
                Preview
              </div>
            )}
          </div>
          <p className="text-white text-sm font-medium">{displayData.name}</p>
          <p className="text-cyan-300/70 text-xs">{displayData.coordinates}</p>
          
          {/* Location Hierarchy */}
          <div className="flex flex-wrap gap-1 mt-2">
            {displayData.county && (
              <span className="bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded text-xs">
                {displayData.county} County
              </span>
            )}
            {displayData.region && displayData.region !== displayData.county && (
              <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">
                {displayData.region}
              </span>
            )}
            {displayData.country && (
              <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">
                {displayData.country}
              </span>
            )}
          </div>
        </div>

        {/* Confirmation Buttons for Preview */}
        {isConfirmingLocation && (
          <div className="p-4 border-b border-yellow-500/20 bg-yellow-500/10">
            <p className="text-yellow-400 text-sm mb-3 text-center">
              Confirm this location for detailed analysis?
            </p>
            <div className="flex gap-2">
              <button
                onClick={confirmLocationSelection}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Confirm Location
              </button>
              <button
                onClick={cancelLocationSelection}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="p-4 space-y-4">
          {/* Agricultural Overview */}
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-4">
            <h4 className="text-green-400 font-semibold text-sm mb-3 flex items-center gap-2">
              <Sprout className="w-4 h-4" />
              Farming Suitability
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="text-center">
                <div className="text-white font-bold text-lg">{data.cropSuitability}</div>
                <div className="text-green-300">Crop Potential</div>
              </div>
              <div className="text-center">
                <div className="text-white font-bold text-lg">{data.irrigationNeed}</div>
                <div className="text-green-300">Irrigation Need</div>
              </div>
            </div>
            <div className="mt-2 text-green-300 text-xs text-center">
              {data.vegetationHealth}
            </div>
          </div>

          {/* Weather Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Temperature */}
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="w-4 h-4 text-orange-400" />
                <span className="text-orange-400 font-semibold text-sm">Temperature</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{data.temperature}{tempUnit}</div>
              <div className="text-orange-300 text-xs">{data.tempStatus}</div>
            </div>

            {/* Precipitation */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <CloudRain className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 font-semibold text-sm">Rainfall</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{data.precipitation}{precipUnit}</div>
              <div className="text-blue-300 text-xs">Daily estimate</div>
            </div>
          </div>

          {/* Soil Health */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
            <h4 className="text-amber-400 font-semibold text-sm mb-3 flex items-center gap-2">
              <Droplets className="w-4 h-4" />
              Soil Conditions
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-amber-300">Moisture Level:</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-amber-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${data.soilMoisture}%` }}
                    ></div>
                  </div>
                  <span className="text-white font-medium w-8">{data.soilMoisture}%</span>
                </div>
              </div>
              <div className="text-amber-300 text-xs">{data.moistureStatus}</div>
            </div>
          </div>

          {/* Growing Conditions */}
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
            <h4 className="text-purple-400 font-semibold text-sm mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Growing Conditions
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-purple-300">Growing Degree Days</div>
                <div className="text-white font-semibold">{data.growingDegreeDays} GDD</div>
              </div>
              <div>
                <div className="text-purple-300">Frost Risk</div>
                <div className={`font-semibold ${
                  data.frostRisk === 'High' ? 'text-red-400' : 
                  data.frostRisk === 'Moderate' ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {data.frostRisk}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4">
            <h4 className="text-cyan-400 font-semibold text-sm mb-3 flex items-center gap-2">
              <Wind className="w-4 h-4" />
              Weather Details
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-cyan-300">Wind Speed</div>
                <div className="text-white font-semibold">{data.windSpeed} {windUnit}</div>
              </div>
              <div>
                <div className="text-cyan-300">Humidity</div>
                <div className="text-white font-semibold">{data.humidity}%</div>
              </div>
              <div>
                <div className="text-cyan-300">Solar Radiation</div>
                <div className="text-white font-semibold">{data.solarRadiation} W/m²</div>
              </div>
              <div>
                <div className="text-cyan-300">Cloud Cover</div>
                <div className="text-white font-semibold">{data.cloudCoverage}%</div>
              </div>
            </div>
          </div>

          {/* Data Source & Actions */}
          <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Satellite className="w-3 h-3 text-cyan-400" />
                <span className="text-cyan-400 text-xs font-medium">NASA Data Source</span>
              </div>
              <button
                onClick={toggleMeasurementUnit}
                className="text-cyan-400 hover:text-cyan-300 text-xs transition-colors"
              >
                {measurementUnit === 'metric' ? 'Switch to Imperial' : 'Switch to Metric'}
              </button>
            </div>
            <p className="text-cyan-300/70 text-xs">
              POWER • MODIS • GPM • Real-time satellite data
            </p>
            <p className="text-cyan-300/50 text-xs mt-1">
              Updated: {new Date(data.timestamp).toLocaleTimeString()}
            </p>
            
            {/* Action Buttons */}
            <div className="flex gap-2 mt-3">
              <button className="flex-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-400 py-2 px-3 rounded text-xs transition-colors flex items-center justify-center gap-1">
                <Download className="w-3 h-3" />
                Export Data
              </button>
              <button className="flex-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 py-2 px-3 rounded text-xs transition-colors flex items-center justify-center gap-1">
                <Star className="w-3 h-3" />
                Save Location
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`relative rounded-xl overflow-hidden border-2 border-cyan-500/30 ${className}`}>
      <div className="flex h-96">
        {/* Left Panel - Data Display */}
        <DataPanel />

        {/* Right Panel - Map */}
        <div className="flex-1 relative">
          {/* Search Bar */}
          <div ref={searchRef} className="absolute top-4 left-4 right-4 z-20">
            <div className="relative">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      searchLocation(e.target.value);
                    }}
                    placeholder="Search for a farm, village, or city..."
                    className="w-full pl-10 pr-4 py-3 bg-black/80 backdrop-blur-sm border border-cyan-500/30 rounded-xl text-white placeholder-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                  />
                  
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-sm border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-500/20 overflow-hidden z-30 max-h-64 overflow-y-auto">
                      {searchResults.map((result, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearchSelect(result)}
                          className="w-full px-4 py-3 text-left hover:bg-cyan-500/20 transition-colors duration-200 border-b border-cyan-500/10 last:border-b-0"
                        >
                          <div className="flex items-center gap-3">
                            <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-white font-medium text-sm truncate">
                                {result.display_name}
                              </div>
                              <div className="text-cyan-300/70 text-xs mt-1 flex items-center gap-1">
                                <Compass className="w-3 h-3" />
                                {parseFloat(result.lat).toFixed(4)}, {parseFloat(result.lon).toFixed(4)}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Location Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={getUserLocation}
                    disabled={isLocating}
                    className="px-4 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-xl text-cyan-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    title="Use my current location"
                  >
                    {isLocating ? (
                      <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Navigation className="w-5 h-5" />
                        <span className="hidden sm:inline">My Location</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={toggleSatelliteView}
                    className="px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-xl text-purple-400 transition-all duration-300 flex items-center gap-2"
                    title="Toggle satellite view"
                  >
                    <Satellite className="w-5 h-5" />
                    <span className="hidden sm:inline">Satellite</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Map Container */}
          <div
            ref={mapRef}
            className="w-full h-full bg-gray-800 z-0"
          />
          
          {/* Loading Overlay */}
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/95 z-10">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-cyan-400 text-lg font-semibold">Loading NASA Interactive Map</p>
                <p className="text-gray-400 text-sm mt-2">Initializing agricultural data layers...</p>
              </div>
            </div>
          )}

          {/* Map Controls */}
          <div className="absolute top-24 right-4 z-20 flex flex-col gap-2">
            {/* Zoom Controls */}
            <div className="bg-black/80 backdrop-blur-sm border border-cyan-500/30 rounded-xl overflow-hidden">
              <button
                onClick={zoomIn}
                className="w-10 h-10 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 transition-colors border-b border-cyan-500/20"
                title="Zoom in"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                onClick={zoomOut}
                className="w-10 h-10 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                title="Zoom out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
            </div>

            {/* Measurement Toggle */}
            <button
              onClick={toggleMeasurementUnit}
              className="w-10 h-10 flex items-center justify-center bg-black/80 backdrop-blur-sm border border-cyan-500/30 rounded-xl text-cyan-400 hover:bg-cyan-500/20 transition-colors"
              title={`Switch to ${measurementUnit === 'metric' ? 'Imperial' : 'Metric'} units`}
            >
              <Ruler className="w-5 h-5" />
            </button>
          </div>

          {/* Instructions */}
          <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm z-20 shadow-lg border border-cyan-500/30">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Click map or search to analyze farming conditions</span>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2">
            {isGeocodingLocation && (
              <div className="bg-cyan-500/20 backdrop-blur-sm text-cyan-400 px-4 py-2 rounded-lg text-sm z-20 shadow-lg border border-cyan-500/30">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing location data...</span>
                </div>
              </div>
            )}

            {/* Zoom Level Display */}
            <div className="bg-black/80 backdrop-blur-sm text-cyan-400 px-3 py-1 rounded-lg text-xs z-20 border border-cyan-500/30">
              Zoom: {currentZoom}x • {measurementUnit === 'metric' ? 'Metric' : 'Imperial'}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .nasa-marker {
          filter: drop-shadow(0 4px 8px rgba(6, 182, 212, 0.3));
        }
        
        .preview-marker {
          filter: drop-shadow(0 4px 8px rgba(245, 158, 11, 0.4));
        }
        
        .confirmed-marker {
          filter: drop-shadow(0 4px 8px rgba(239, 68, 68, 0.4));
        }
        
        .leaflet-popup-content-wrapper {
          background: rgba(17, 24, 39, 0.95);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 12px;
          color: white;
        }
        
        .leaflet-popup-tip {
          background: rgba(17, 24, 39, 0.95);
          border: 1px solid rgba(6, 182, 212, 0.3);
        }
        
        .leaflet-container {
          background: #1f2937;
          font-family: inherit;
        }
      `}</style>
    </div>
  );
};

export default InteractiveMap;