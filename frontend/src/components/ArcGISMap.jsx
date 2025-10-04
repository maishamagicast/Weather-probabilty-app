import React, { useState, useEffect, useRef } from 'react';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';

const ArcGISMap = ({ location, onLocationSelect, className = '' }) => {
  const mapRef = useRef(null);
  const viewRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [environmentalData, setEnvironmentalData] = useState(null);
  const [mapError, setMapError] = useState(null);

  // Fast environmental data generation
  const generateEnvironmentalData = (lat, lon) => {
    const seed = Math.abs(Math.sin(lat * 12.9898 + lon * 78.233) * 43758.5453);
    const latFactor = Math.cos(lat * Math.PI / 180);
    
    return {
      temperature: Math.floor(25 - (Math.abs(lat) * 0.5) + (seed * 1000 % 15)),
      precipitation: Math.floor((latFactor * 50) + (seed * 1000 % 150)),
      soilMoisture: Math.floor(40 + (latFactor * 30) + (seed * 1000 % 20)),
      vegetationIndex: (0.4 + (latFactor * 0.3) + (seed * 1000 % 0.2)).toFixed(2),
      cloudCoverage: Math.floor(20 + (seed * 1000 % 70)),
      ndvi: (0.3 + (latFactor * 0.4) + (seed * 1000 % 0.2)).toFixed(2),
    };
  };

  // Fast geocoding with timeout
  const getLocationName = async (lat, lon) => {
    try {
      setIsGeocoding(true);
      
      // Fast timeout - don't wait too long for geocoding
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 3000)
      );

      const geocodingPromise = fetch(
        `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?location=${lon},${lat}&f=json&langCode=en`
      );

      const response = await Promise.race([geocodingPromise, timeoutPromise]);
      
      if (response.ok) {
        const data = await response.json();
        const address = data.address || {};
        
        return {
          name: address.LongLabel || address.ShortLabel || 'Selected Location',
          fullAddress: address.LongLabel || `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
        };
      }
      
      throw new Error('Geocoding failed');
      
    } catch (error) {
      console.log('Using fallback location name');
      return {
        name: 'Selected Location',
        fullAddress: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
      };
    } finally {
      setIsGeocoding(false);
    }
  };

  // Fast map initialization
  useEffect(() => {
    if (!mapRef.current) return;

    let view = null;

    const initializeMap = async () => {
      try {
        setMapError(null);

        // Use LIGHT basemap for faster loading (instead of satellite)
        const map = new Map({
          basemap: 'streets-vector', // Much faster than satellite
        });

        // Optimized view with lower resolution for faster loading
        view = new MapView({
          container: mapRef.current,
          map: map,
          center: [36.8219, -1.2921],
          zoom: 6,
          constraints: {
            minZoom: 3,
            maxZoom: 15 // Lower max zoom for performance
          },
          ui: {
            components: [] // Remove UI components for faster load
          },
          popup: {
            dockEnabled: false,
            autoOpenEnabled: false
          }
        });

        // Handle map clicks
        view.on('click', async (event) => {
          const { latitude, longitude } = event.mapPoint;
          
          // Generate environmental data immediately
          const envData = generateEnvironmentalData(latitude, longitude);
          setEnvironmentalData(envData);
          
          // Create immediate location object
          const immediateLocation = {
            name: 'Analyzing...',
            lat: latitude,
            lon: longitude,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            coordinates: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            environmental: envData,
            isLoading: true,
            selectionType: 'point'
          };

          if (onLocationSelect) {
            onLocationSelect(immediateLocation);
          }

          // Add marker immediately
          addMarkerToMap(latitude, longitude, view);

          // Get location name in background (don't wait for it)
          getLocationName(latitude, longitude).then(locationInfo => {
            const finalLocation = {
              name: locationInfo.name,
              lat: latitude,
              lon: longitude,
              address: locationInfo.fullAddress,
              coordinates: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
              environmental: envData,
              isLoading: false,
              selectionType: 'point'
            };

            if (onLocationSelect) {
              onLocationSelect(finalLocation);
            }
          }).catch(() => {
            // If geocoding fails, just use the coordinates
            const fallbackLocation = {
              name: 'Selected Location',
              lat: latitude,
              lon: longitude,
              address: `${latitude.toFixed(6)}, ${lon.toFixed(6)}`,
              coordinates: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
              environmental: envData,
              isLoading: false,
              selectionType: 'point'
            };

            if (onLocationSelect) {
              onLocationSelect(fallbackLocation);
            }
          });
        });

        // Fast load - don't wait for everything to be ready
        view.when(() => {
          setMapLoaded(true);
        }, (error) => {
          console.error('Map view error:', error);
          setMapLoaded(true); // Still mark as loaded to show the map
        });

        viewRef.current = view;

      } catch (error) {
        console.error('Error initializing ArcGIS map:', error);
        setMapError('Failed to load map. Please refresh the page.');
        setMapLoaded(true);
      }
    };

    // Initialize with slight delay to prevent blocking
    const timer = setTimeout(() => {
      initializeMap();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (view) {
        view.destroy();
      }
    };
  }, [onLocationSelect]);

  // Fast marker function
  const addMarkerToMap = (lat, lon, view) => {
    view.graphics.removeAll();

    const point = new Point({
      longitude: lon,
      latitude: lat
    });

    const markerSymbol = new SimpleMarkerSymbol({
      color: [239, 68, 68, 0.9],
      outline: {
        color: [255, 255, 255, 0.9],
        width: 2
      },
      size: 12
    });

    const pointGraphic = new Graphic({
      geometry: point,
      symbol: markerSymbol
    });

    view.graphics.add(pointGraphic);
    
    // Smooth zoom without animation for faster response
    view.goTo({
      center: [lon, lat],
      zoom: 10
    });
  };

  // Update map when location changes
  useEffect(() => {
    if (viewRef.current && location && !location.isLoading) {
      const { lat, lon } = location;
      addMarkerToMap(lat, lon, viewRef.current);
    }
  }, [location]);

  return (
    <div className={`relative rounded-xl overflow-hidden border-2 border-cyan-500/30 ${className}`}>
      <div
        ref={mapRef}
        className="w-full h-96 bg-gray-800"
        style={{ minHeight: '384px' }}
      />
      
      {/* Loading Overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/95 z-10">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-cyan-400 font-semibold">Loading Interactive Map</p>
            <p className="text-gray-400 text-sm mt-2">This will just take a moment...</p>
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/95 z-10">
          <div className="text-center">
            <div className="text-red-400 text-lg mb-4">{mapError}</div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg text-white transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}

      {/* Geocoding Indicator */}
      {isGeocoding && (
        <div className="absolute top-20 left-4 bg-cyan-500/20 backdrop-blur-sm text-cyan-400 px-4 py-2 rounded-lg text-sm z-20 shadow-lg border border-cyan-500/30">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <span>Getting location details...</span>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm z-20 shadow-lg">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Click anywhere to select location</span>
        </div>
      </div>

      {/* Environmental Data Display */}
      {environmentalData && (
        <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-sm text-white p-3 rounded-lg z-20 shadow-lg border border-cyan-500/30">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 bg-cyan-500/10 rounded">
              <div className="text-cyan-300 font-semibold">Temperature</div>
              <div className="text-white">{environmentalData.temperature}°C</div>
            </div>
            <div className="text-center p-2 bg-green-500/10 rounded">
              <div className="text-green-300 font-semibold">Vegetation</div>
              <div className="text-white">{environmentalData.vegetationIndex}</div>
            </div>
            <div className="text-center p-2 bg-blue-500/10 rounded">
              <div className="text-blue-300 font-semibold">Soil Moisture</div>
              <div className="text-white">{environmentalData.soilMoisture}%</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArcGISMap;