// src/components/SatelliteMap.jsx
import React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [35, 55],
  iconAnchor: [17, 55],
  popupAnchor: [0, -45],
});

// fly-to helper
function FlyToLocation({ location }) {
  const map = useMap();
  React.useEffect(() => {
    if (location?.lat && location?.lon) {
      map.flyTo([location.lat, location.lon], 8, { duration: 1.2 });
    }
  }, [location, map]);
  return null;
}

const SatelliteMap = ({ location }) => {
  const time = new Date().toISOString().split("T")[0];
  const url = `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${time}/{z}/{y}/{x}.jpg`;

  const center = location ? [location.lat, location.lon] : [-1.2921, 36.8219];

  return (
    <div className="h-[56vh] md:h-[64vh] w-full rounded-2xl border border-cyan-500/50 overflow-hidden shadow-2xl">
      <MapContainer center={center} zoom={6} className="h-full w-full">
        <TileLayer url={url} attribution="Imagery © NASA GIBS" maxZoom={9} tileSize={256} />
        {location && (
          <Marker position={[location.lat, location.lon]} icon={markerIcon}>
            <Popup minWidth={200}>
              <div className="text-sm">
                <strong>{location.placeName || location.display_name}</strong>
                <div className="mt-1 text-xs text-gray-300">
                  {location.ward ? <div>Ward: {location.ward}</div> : null}
                  {location.townOrCity ? <div>Town/City: {location.townOrCity}</div> : null}
                  {location.county ? <div>County: {location.county}</div> : null}
                  {location.country ? <div>Country: {location.country}</div> : null}
                  <div className="mt-1">Lat: {location.lat.toFixed(6)}</div>
                  <div>Lon: {location.lon.toFixed(6)}</div>
                </div>
              </div>
            </Popup>
          </Marker>
        )}
        <FlyToLocation location={location} />
      </MapContainer>
    </div>
  );
};

export default SatelliteMap;