// RegionLayer.jsx
import { useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";

/**
 * RegionLayer
 * - Renders sample polygons (replace with GeoJSON if you have it)
 * - When a polygon is clicked, we flyToBounds and call onRegionSelect with center coords & name.
 */
export default function RegionLayer({ onRegionSelect }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Replace or extend these sample regions with your real polygons / GeoJSON.
    const regions = [
      {
        name: "Nairobi",
        coordinates: [
          [-1.3100, 36.7800],
          [-1.2500, 36.9200],
          [-1.2000, 36.8800],
          [-1.2600, 36.7600],
        ],
      },
      {
        name: "Mombasa",
        coordinates: [
          [-4.1000, 39.6500],
          [-4.0800, 39.7300],
          [-3.9800, 39.7200],
          [-4.0000, 39.6400],
        ],
      },
      {
        name: "Kisumu",
        coordinates: [
          [-0.1500, 34.7000],
          [-0.0500, 34.7600],
          [-0.0200, 34.7300],
          [-0.1000, 34.6800],
        ],
      },
    ];

    const layerGroup = L.layerGroup().addTo(map);

    regions.forEach((region) => {
      const polygon = L.polygon(region.coordinates, {
        color: "#8A2BE2",
        weight: 2,
        fillColor: "#7B68EE",
        fillOpacity: 0.25,
      }).addTo(layerGroup);

      polygon.on("click", async () => {
        const bounds = polygon.getBounds();
        // Smoothly zoom to show the whole region:
        map.flyToBounds(bounds, { padding: [40, 40], duration: 1.2 });

        // Prevent excessive over-zoom for very small polygons
        const MAX_ZOOM = 14;
        map.once("zoomend", () => {
          if (map.getZoom() > MAX_ZOOM) map.setZoom(MAX_ZOOM);
        });

        // Notify parent with region center coords & name
        const center = bounds.getCenter();
        onRegionSelect?.({
          lat: center.lat,
          lon: center.lng,
          name: region.name,
          selectionType: "region",
        });
      });

      polygon.bindTooltip(region.name, {
        permanent: false,
        direction: "center",
        className: "text-cyan-400 bg-black/60 rounded px-2 py-1",
      });
    });

    return () => {
      if (map && layerGroup) map.removeLayer(layerGroup);
    };
  }, [map, onRegionSelect]);

  return null;
}
