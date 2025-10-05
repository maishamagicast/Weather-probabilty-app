// src/components/InteractiveMap.jsx
import React, { useState } from "react";
import LeafletMap from "./LeafletMap";
import SatelliteMap from "./SatelliteMap";

export default function InteractiveMap() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]); // array of candidate places
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [viewMode, setViewMode] = useState("map"); // 'map' | 'satellite'
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    const s = query.trim();
    if (!s) return;

    setIsSearching(true);
    setResults([]);
    setSelectedLocation(null);

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(
        s
      )}&limit=6`;
      const res = await fetch(url, { headers: { "Accept-Language": "en" } });
      const data = await res.json();

      if (!data || data.length === 0) {
        setResults([]);
        setSelectedLocation(null);
        alert("No matches found. Try a broader query (country, region).");
        return;
      }

      // Map into consistent structure expected by LeafletMap
      const mapped = data.map((d) => {
        const addr = d.address || {};
        const placeName = addr.city || addr.town || addr.village || addr.hamlet || addr.suburb || (d.display_name ? d.display_name.split(",")[0] : d.display_name);
        return {
          lat: parseFloat(d.lat),
          lon: parseFloat(d.lon),
          display_name: d.display_name,
          raw: addr,
          ward: addr.ward || addr.neighbourhood || addr.suburb || addr.city_district || "",
          townOrCity: addr.city || addr.town || addr.village || addr.hamlet || "",
          county: addr.county || addr.state_district || addr.region || addr.state || "",
          country: addr.country || "",
          placeName: placeName || d.display_name,
        };
      });

      setResults(mapped);
      setSelectedLocation(mapped[0]);
      // default to interactive map view
      setViewMode("map");
    } catch (error) {
      console.error("Search error:", error);
      alert("Search failed. Try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleCandidateClick = (candidate) => {
    setSelectedLocation(candidate);
    setResults((prev) => prev); // keep list visible so user can switch
    setViewMode("map");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gray-900/80 p-3 rounded-xl border border-cyan-500/30">
        <div className="flex gap-2 w-full md:w-auto">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search place (city, town or coordinates)..."
            className="w-full md:w-72 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("map")}
            className={`px-3 py-2 rounded-lg ${viewMode === "map" ? "bg-cyan-500 text-white" : "bg-gray-700 text-gray-300"}`}
          >
            Normal Map
          </button>
          <button
            onClick={() => setViewMode("satellite")}
            className={`px-3 py-2 rounded-lg ${viewMode === "satellite" ? "bg-cyan-500 text-white" : "bg-gray-700 text-gray-300"}`}
          >
            Satellite
          </button>
        </div>
      </div>

      {/* multiple results selector */}
      {results.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {results.map((r, idx) => (
            <button
              key={idx}
              onClick={() => handleCandidateClick(r)}
              className={`min-w-[180px] p-3 rounded-xl text-left border ${
                selectedLocation?.lat === r.lat && selectedLocation?.lon === r.lon
                  ? "border-cyan-400 bg-gray-800/70"
                  : "border-gray-700 bg-gray-800/40"
              }`}
            >
              <div className="text-sm font-semibold text-white line-clamp-1">{r.placeName}</div>
              <div className="text-xs text-cyan-300/80 mt-1">{r.display_name}</div>
              <div className="mt-2 text-xs text-gray-300">
                {r.townOrCity ? <div>Town/City: {r.townOrCity}</div> : null}
                {r.county ? <div>County: {r.county}</div> : null}
                {r.country ? <div>Country: {r.country}</div> : null}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {results.length === 0 && query && (
        <div className="text-sm text-gray-400">No matches for "{query}". Try a broader or different term.</div>
      )}

      {/* Map area */}
      <div>
        {viewMode === "map" ? (
          <LeafletMap selectedLocation={selectedLocation} onLocationSelect={setSelectedLocation} />
        ) : (
          <SatelliteMap location={selectedLocation} />
        )}
      </div>
    </div>
  );
}
