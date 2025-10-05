// src/components/LeafletMap.jsx
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import ClickFly from "./ClickFly";
import RegionLayer from "./RegionLayer";
import "leaflet/dist/leaflet.css";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [35, 55],
  iconAnchor: [17, 55],
  popupAnchor: [0, -45],
});

const generateEnvironmentalData = (lat, lon) => {
  const seed = Math.abs(Math.sin(lat * 12.9898 + lon * 78.233) * 43758.5453);
  const latFactor = Math.cos((lat * Math.PI) / 180);
  return {
    temperature: Math.floor(25 - Math.abs(lat) * 0.5 + (seed * 1000) % 15),
    precipitation: Math.floor(latFactor * 50 + (seed * 1000) % 150),
    soilMoisture: Math.floor(40 + latFactor * 30 + (seed * 1000) % 20),
    vegetationIndex: (0.4 + latFactor * 0.3 + (seed * 1000) % 0.2).toFixed(2),
  };
};

async function reverseGeocode(lat, lon, timeoutMs = 4500) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(url, {
      headers: { "Accept-Language": "en" },
      signal: controller.signal,
    });
    clearTimeout(id);
    if (!res.ok) throw new Error("Reverse geocode failed");
    const json = await res.json();
    const address = json.address || {};

    // Ward/neighbourhood
    const ward = address.ward || address.neighbourhood || address.suburb || address.city_district || "";

    // Town/City
    const townOrCity = address.city || address.town || address.village || address.hamlet || address.locality || "";

    // County / state fallback
    const county = address.county || address.state_district || address.region || address.state || "";

    const country = address.country || "";

    const placeName = json.display_name || `${townOrCity || county || country || `${lat.toFixed(6)}, ${lon.toFixed(6)}`}`;

    return {
      display_name: json.display_name || "",
      ward,
      townOrCity,
      county,
      country,
      placeName,
      raw: address,
    };
  } catch (err) {
    // fallback to coordinates-only
    return {
      display_name: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
      ward: "",
      townOrCity: "",
      county: "",
      country: "",
      placeName: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
      raw: {},
    };
  }
}

const LeafletMap = ({ selectedLocation, onLocationSelect }) => {
  const [marker, setMarker] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);

  // Handle clicks on map
  const handleClick = async (lat, lon) => {
    const env = generateEnvironmentalData(lat, lon);

    // Immediate (fast) payload so UI updates quickly:
    const initial = {
      lat,
      lon,
      placeName: "Locating...",
      ward: "",
      townOrCity: "",
      county: "",
      country: "",
      display_name: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
      environmental: env,
      isLoading: true,
    };
    setMarker(initial);
    onLocationSelect?.(initial);

    // Reverse geocode (non-blocking for UI)
    const rc = await reverseGeocode(lat, lon);
    const final = {
      lat,
      lon,
      placeName: rc.placeName,
      ward: rc.ward,
      townOrCity: rc.townOrCity,
      county: rc.county,
      country: rc.country,
      display_name: rc.display_name,
      environmental: env,
      isLoading: false,
      raw: rc.raw,
    };

    setMarker(final);
    onLocationSelect?.(final);

    // fly to location for detail
    if (mapInstance) {
      mapInstance.flyTo([lat, lon], 12, { duration: 1.0 });
    }
  };

  // If parent sets selectedLocation (e.g. from search), fly and show marker
  useEffect(() => {
    if (!selectedLocation) return;
    setMarker(selectedLocation);

    if (mapInstance && selectedLocation.lat && selectedLocation.lon) {
      mapInstance.flyTo([selectedLocation.lat, selectedLocation.lon], 11, { duration: 1.0 });
    }
  }, [selectedLocation, mapInstance]);

  return (
    <div className="flex flex-col md:flex-row gap-4 bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 rounded-2xl shadow-2xl">
      {/* Map */}
      <div className="relative w-full md:w-2/3 h-[56vh] md:h-[64vh] rounded-xl overflow-hidden border border-cyan-500/40 shadow-inner">
        <MapContainer
          center={[-1.2921, 36.8219]}
          zoom={6}
          scrollWheelZoom
          whenCreated={(map) => setMapInstance(map)}
          className="h-full w-full rounded-xl"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap"
          />
          <ClickFly onClick={handleClick} />
          <RegionLayer />
          {marker && (
            <Marker position={[marker.lat, marker.lon]} icon={markerIcon}>
              <Popup minWidth={180}>
                <div className="text-sm">
                  <strong>{marker.placeName || marker.display_name}</strong>
                  <div className="mt-1 text-xs text-gray-300">
                    {marker.ward ? <div>Ward: {marker.ward}</div> : null}
                    {marker.townOrCity ? <div>Town/City: {marker.townOrCity}</div> : null}
                    {marker.county ? <div>County/District: {marker.county}</div> : null}
                    {marker.country ? <div>Country: {marker.country}</div> : null}
                    <div className="mt-1">Lat: {marker.lat.toFixed(6)}</div>
                    <div>Lon: {marker.lon.toFixed(6)}</div>
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Info panel */}
      <div className="w-full md:w-1/3 bg-gray-800/80 p-4 rounded-xl border border-cyan-500/30 shadow-lg backdrop-blur-md h-[56vh] md:h-[64vh] overflow-auto">
        <h2 className="text-cyan-400 text-lg font-semibold mb-2">Selected Region</h2>

        {!marker ? (
          <p className="text-gray-400 text-sm">Click or search to analyze a location.</p>
        ) : (
          <>
            <p className="text-white font-semibold">{marker.placeName || marker.display_name}</p>
            <p className="text-cyan-300/80 text-xs mb-2">
              {marker.lat.toFixed(6)}, {marker.lon.toFixed(6)}
            </p>

            <div className="space-y-1 text-sm">
              <div><span className="text-cyan-300/80">Ward:</span> <span className="text-white">{marker.ward || '—'}</span></div>
              <div><span className="text-cyan-300/80">Town / City:</span> <span className="text-white">{marker.townOrCity || '—'}</span></div>
              <div><span className="text-cyan-300/80">County / District:</span> <span className="text-white">{marker.county || '—'}</span></div>
              <div><span className="text-cyan-300/80">Country:</span> <span className="text-white">{marker.country || '—'}</span></div>
            </div>

            {marker.environmental && (
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-cyan-500/10 p-2 rounded">
                  <div className="text-cyan-300 font-semibold">Temperature</div>
                  <div className="text-white">{marker.environmental.temperature}°C</div>
                </div>
                <div className="bg-green-500/10 p-2 rounded">
                  <div className="text-green-300 font-semibold">Vegetation</div>
                  <div className="text-white">{marker.environmental.vegetationIndex}</div>
                </div>
                <div className="bg-blue-500/10 p-2 rounded">
                  <div className="text-blue-300 font-semibold">Soil Moisture</div>
                  <div className="text-white">{marker.environmental.soilMoisture}%</div>
                </div>
                <div className="bg-purple-500/10 p-2 rounded">
                  <div className="text-purple-300 font-semibold">Precipitation</div>
                  <div className="text-white">{marker.environmental.precipitation} mm</div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LeafletMap;
