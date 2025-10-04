import React, { useState, useEffect } from 'react';

const InteractiveMap = ({ location, onLocationSelect, className = '' }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) {
        initializeMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      const mapElement = document.getElementById('map');
      if (!mapElement) return;

      const googleMap = new window.google.maps.Map(mapElement, {
        center: { lat: -1.2921, lng: 36.8219 }, // Nairobi coordinates
        zoom: 6,
        styles: [
          {
            featureType: "all",
            elementType: "geometry",
            stylers: [{ color: "#242f3e" }]
          },
          {
            featureType: "all",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#242f3e" }]
          },
          {
            featureType: "all",
            elementType: "labels.text.fill",
            stylers: [{ color: "#746855" }]
          }
        ]
      });

      setMap(googleMap);

      // Add click listener
      googleMap.addListener('click', (e) => {
        const clickedLocation = {
          name: `Selected Location`,
          lat: e.latLng.lat(),
          lon: e.latLng.lng(),
          address: 'Custom location'
        };

        // Add marker
        if (marker) {
          marker.setMap(null);
        }

        const newMarker = new window.google.maps.Marker({
          position: e.latLng,
          map: googleMap,
          title: 'Selected Location',
          icon: {
            url: 'data:image/svg+xml;base64,' + btoa(`
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 2C11.58 2 8 5.58 8 10C8 17 16 30 16 30C16 30 24 17 24 10C24 5.58 20.42 2 16 2Z" fill="#EF4444"/>
                <circle cx="16" cy="10" r="3" fill="white"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(32, 32)
          }
        });

        setMarker(newMarker);
        onLocationSelect(clickedLocation);
      });

      setMapLoaded(true);
    };

    loadGoogleMaps();
  }, []);

  // Update map when location changes
  useEffect(() => {
    if (map && location) {
      map.setCenter({ lat: location.lat, lng: location.lon });
      map.setZoom(12);
    }
  }, [location, map]);

  return (
    <div className={`relative rounded-xl overflow-hidden border-2 border-cyan-500/30 ${className}`}>
      <div 
        id="map" 
        className="w-full h-96 bg-gray-200"
      />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-cyan-400">Loading map...</p>
          </div>
        </div>
      )}
      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm">
        Click anywhere on the map to select location
      </div>
    </div>
  );
};

export default InteractiveMap;