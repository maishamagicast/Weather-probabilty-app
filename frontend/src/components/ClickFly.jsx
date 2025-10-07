import { useMapEvents } from "react-leaflet";

export default function ClickFly({ onClick }) {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onClick(lat, lng);
      map.flyTo([lat, lng], 10, { duration: 1.5 });
    },
  });
  return null;
}
