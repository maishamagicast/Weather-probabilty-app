import React, { useState, useEffect, useRef } from 'react';

const InteractiveMap = ({ location, onLocationSelect, className = '' }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isGeocodingLocation, setIsGeocodingLocation] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const leafletLoadedRef = useRef(false);

  // Generate realistic environmental data based on coordinates
  const generateEnvironmentalData = (lat, lon) => {
    const seed = Math.abs(Math.sin(lat * 12.9898 + lon * 78.233) * 43758.5453);
    
    const cloudCoverage = Math.floor((seed % 1) * 100);
    
    const latFactor = 1 - Math.abs(lat) / 90;
    const baseVegetation = 0.3 + (latFactor * 0.5);
    const vegetationIndex = Math.min(0.95, baseVegetation + ((seed * 100) % 0.4));
    
    const baseTemp = 30 - (Math.abs(lat) * 0.5);
    const temperature = Math.floor(baseTemp + ((seed * 1000) % 15) - 5);
    
    const baseMoisture = 70 - (temperature - 20);
    const soilMoisture = Math.max(20, Math.min(90, Math.floor(baseMoisture + ((seed * 10000) % 20))));

    const getCloudCondition = (coverage) => {
      if (coverage < 20) return 'Clear skies';
      if (coverage < 40) return 'Partly cloudy';
      if (coverage < 60) return 'Mostly cloudy';
      if (coverage < 80) return 'Overcast';
      return 'Heavy cloud cover';
    };

    const getVegetationHealth = (index) => {
      if (index > 0.7) return 'Healthy vegetation';
      if (index > 0.5) return 'Moderate vegetation';
      if (index > 0.3) return 'Sparse vegetation';
      return 'Low vegetation';
    };

    const getTempStatus = (temp) => {
      if (temp >= 20 && temp <= 28) return 'Optimal range';
      if (temp >= 15 && temp <= 32) return 'Acceptable range';
      if (temp < 15) return 'Cool conditions';
      return 'Warm conditions';
    };

    const getMoistureStatus = (moisture) => {
      if (moisture >= 60 && moisture <= 80) return 'Good moisture levels';
      if (moisture >= 40 && moisture < 60) return 'Moderate moisture';
      if (moisture < 40) return 'Dry conditions';
      return 'High moisture levels';
    };

    return {
      cloudCoverage,
      cloudCondition: getCloudCondition(cloudCoverage),
      vegetationIndex: vegetationIndex.toFixed(2),
      vegetationHealth: getVegetationHealth(vegetationIndex),
      temperature,
      tempStatus: getTempStatus(temperature),
      soilMoisture,
      moistureStatus: getMoistureStatus(soilMoisture)
    };
  };

  // Reverse geocode to get location name
  const getLocationName = async (lat, lon) => {
    try {
      setIsGeocodingLocation(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Geocoding failed');
      }

      const data = await response.json();
      
      // Extract relevant location information
      const address = data.address || {};
      
      // Priority order for location name
      const locationName = 
        address.city || 
        address.town || 
        address.village || 
        address.county || 
        address.state || 
        address.country || 
        'Unknown Location';
      
      const region = address.state || address.county || '';
      const country = address.country || '';
      
      // Build full address
      let fullAddress = locationName;
      if (region && region !== locationName) {
        fullAddress += `, ${region}`;
      }
      if (country && country !== locationName) {
        fullAddress += `, ${country}`;
      }
      
      setIsGeocodingLocation(false);
      
      return {
        name: locationName,
        fullAddress: fullAddress,
        city: address.city || address.town || address.village || '',
        region: region,
        country: country
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      setIsGeocodingLocation(false);
      return {
        name: 'Unknown Location',
        fullAddress: `Coordinates: ${lat.toFixed(6)}, ${lon.toFixed(6)}`,
        city: '',
        region: '',
        country: ''
      };
    }
  };

  useEffect(() => {
    const loadLeaflet = () => {
      if (window.L) {
        initializeMap();
        return;
      }

      if (leafletLoadedRef.current) return;
      leafletLoadedRef.current = true;

      // Load Leaflet CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
        document.head.appendChild(link);
      }

      // Load Leaflet JS
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';
      script.async = true;
      script.onload = initializeMap;
      script.onerror = () => {
        console.error('Failed to load Leaflet');
        leafletLoadedRef.current = false;
      };
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!mapRef.current || !window.L) return;
      if (mapInstanceRef.current) return;

      try {
        const map = window.L.map(mapRef.current, {
          preferCanvas: true,
          zoomControl: true
        }).setView([-1.2921, 36.8219], 6);

        window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
          subdomains: 'abcd',
          maxZoom: 19,
          minZoom: 3
        }).addTo(map);

        const customIcon = window.L.divIcon({
          html: `
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 2C11.58 2 8 5.58 8 10C8 17 16 30 16 30C16 30 24 17 24 10C24 5.58 20.42 2 16 2Z" fill="#EF4444"/>
              <circle cx="16" cy="10" r="3" fill="white"/>
            </svg>
          `,
          className: 'custom-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 32]
        });

        map.on('click', async (e) => {
          const lat = e.latlng.lat;
          const lon = e.latlng.lng;
          
          // Get environmental data immediately
          const envData = generateEnvironmentalData(lat, lon);
          
          // Send initial data with coordinates
          const initialLocation = {
            name: 'Locating...',
            lat: lat,
            lon: lon,
            address: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
            coordinates: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
            city: '',
            region: '',
            country: '',
            environmental: envData,
            isLoading: true
          };

          if (markerRef.current) {
            map.removeLayer(markerRef.current);
          }

          const marker = window.L.marker([lat, lon], {
            icon: customIcon
          }).addTo(map);

          markerRef.current = marker;

          if (onLocationSelect) {
            onLocationSelect(initialLocation);
          }

          // Get location name asynchronously
          const locationInfo = await getLocationName(lat, lon);
          
          const finalLocation = {
            name: locationInfo.name,
            lat: lat,
            lon: lon,
            address: locationInfo.fullAddress,
            coordinates: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
            city: locationInfo.city,
            region: locationInfo.region,
            country: locationInfo.country,
            environmental: envData,
            isLoading: false
          };

          if (onLocationSelect) {
            onLocationSelect(finalLocation);
          }
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
  }, [onLocationSelect]);

  useEffect(() => {
    if (mapInstanceRef.current && location) {
      mapInstanceRef.current.setView([location.lat, location.lon], 12, {
        animate: true,
        duration: 1
      });
      
      if (markerRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current);
      }

      if (window.L) {
        const customIcon = window.L.divIcon({
          html: `
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 2C11.58 2 8 5.58 8 10C8 17 16 30 16 30C16 30 24 17 24 10C24 5.58 20.42 2 16 2Z" fill="#EF4444"/>
              <circle cx="16" cy="10" r="3" fill="white"/>
            </svg>
          `,
          className: 'custom-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 32]
        });

        const marker = window.L.marker([location.lat, location.lon], {
          icon: customIcon
        }).addTo(mapInstanceRef.current);
        
        markerRef.current = marker;
      }
    }
  }, [location]);

  return (
    <div className={`relative rounded-xl overflow-hidden border-2 border-cyan-500/30 ${className}`}>
      <div
        ref={mapRef}
        className="w-full h-96 bg-gray-800 z-0"
        style={{ minHeight: '384px' }}
      />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/95 z-10">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-cyan-400 text-lg font-semibold">Loading map...</p>
            <p className="text-gray-400 text-sm mt-2">Initializing interactive view</p>
          </div>
        </div>
      )}
      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm z-20 shadow-lg">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Click anywhere to select location & view data</span>
        </div>
      </div>
      {isGeocodingLocation && (
        <div className="absolute top-20 left-4 bg-cyan-500/20 backdrop-blur-sm text-cyan-400 px-4 py-2 rounded-lg text-sm z-20 shadow-lg border border-cyan-500/30">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <span>Getting location name...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;