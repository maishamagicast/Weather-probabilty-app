// src/components/SatelliteMap.jsx
import React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Fly-to helper
function FlyToLocation({ location }) {
  const map = useMap();
  React.useEffect(() => {
    if (location?.lat && location?.lon) {
      map.flyTo([location.lat, location.lon], 10, { duration: 1.5 });
    }
  }, [location, map]);
  return null;
}

const SatelliteMap = ({ location }) => {
  const center = location ? [location.lat, location.lon] : [0, 0];
  
  // NASA GIBS requires specific configuration and may not work directly
  // Using alternative satellite tile sources
  const satelliteTiles = [
    {
      name: "ESRI World Imagery",
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'
    },
    {
      name: "OpenStreetMap",
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
  ];

  const [activeTile, setActiveTile] = React.useState(0);

  return (
    <div className="h-full w-full flex flex-col">
      {/* Tile Source Selector */}
      <div className="flex gap-2 p-3 bg-gray-800/80 border-b border-cyan-500/30">
        <button
          onClick={() => setActiveTile(0)}
          className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
            activeTile === 0 
              ? 'bg-cyan-500 text-white' 
              : 'bg-gray-700 text-cyan-300 hover:bg-gray-600'
          }`}
        >
          Satellite
        </button>
        <button
          onClick={() => setActiveTile(1)}
          className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
            activeTile === 1 
              ? 'bg-cyan-500 text-white' 
              : 'bg-gray-700 text-cyan-300 hover:bg-gray-600'
          }`}
        >
          Street Map
        </button>
        <div className="flex-1"></div>
        <div className="text-cyan-300 text-sm flex items-center">
          {satelliteTiles[activeTile].name}
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1">
        <MapContainer 
          center={center} 
          zoom={location ? 10 : 2} 
          className="h-full w-full"
          scrollWheelZoom={true}
        >
          <TileLayer
            url={satelliteTiles[activeTile].url}
            attribution={satelliteTiles[activeTile].attribution}
            maxZoom={19}
          />
          
          {location && (
            <Marker position={[location.lat, location.lon]} icon={markerIcon}>
              <Popup className="custom-popup" minWidth={200}>
                <div className="text-sm space-y-1">
                  <div className="font-bold text-cyan-700">
                    {location.placeName || location.display_name}
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    {location.ward && <div><strong>Ward:</strong> {location.ward}</div>}
                    {location.townOrCity && <div><strong>Town/City:</strong> {location.townOrCity}</div>}
                    {location.county && <div><strong>County:</strong> {location.county}</div>}
                    {location.country && <div><strong>Country:</strong> {location.country}</div>}
                    <div className="border-t border-gray-200 mt-2 pt-2">
                      <div><strong>Latitude:</strong> {location.lat.toFixed(6)}</div>
                      <div><strong>Longitude:</strong> {location.lon.toFixed(6)}</div>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
          
          <FlyToLocation location={location} />
        </MapContainer>
      </div>

      {/* Map Controls Info */}
      <div className="p-2 bg-gray-800/50 border-t border-cyan-500/20">
        <div className="text-xs text-cyan-300/70 text-center">
          Use mouse wheel to zoom • Click and drag to pan • Click marker for details
        </div>
      </div>
    </div>
  );
};

export default SatelliteMap;