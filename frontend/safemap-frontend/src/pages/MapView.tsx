import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON } from "react-leaflet";
import L from "leaflet";
import type { FeatureCollection } from "geojson";
import type { LatLng, SafePlace } from "../types";
import { getSafePlacesApi } from "../services/api";
import { findClosestSafePlace } from "../utils/geoUtils";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const selectedIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function Recenter({ position }: { position: LatLng | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 14);
  }, [position, map]);
  return null;
}

export default function MapView() {
  const [position, setPosition] = useState<LatLng | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [safePlaces, setSafePlaces] = useState<SafePlace[]>([]);
  const [selectedSafePlace, setSelectedSafePlace] = useState<SafePlace | null>(null);

  const [routeData, setRouteData] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getSafePlacesApi();
        setSafePlaces(data.data || []);
        console.log(data);
      } catch (err) {
        console.error("Failed to fetch safe places:", err);
      }
    };
    fetchData();
  }, []);

  // useEffect(() => {
  //   if (!navigator.geolocation) {
  //     setError("Geolocation not supported.");
  //     return;
  //   }

  //   navigator.geolocation.getCurrentPosition(
  //     (pos) => {
  //       const coords: LatLng = [pos.coords.latitude, pos.coords.longitude];
  //       setPosition(coords);
  //     },
  //     (err) => setError(err.message),
  //     { enableHighAccuracy: true, timeout: 10000 }
  //   );
  // }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported.");
      return;
    }

    const watcher = navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Leaflet expects [lat, lng]
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    if (position && safePlaces.length > 0) {
      const closest = findClosestSafePlace(
        position[0], // Latitude
        position[1], // Longitude
        safePlaces
      );
      setSelectedSafePlace(closest);
      
      if(closest) {
          fetchRouteToSafePlace(position, closest);
      }
    }
  }, [position, safePlaces]);

  const fetchRouteToSafePlace = async (userPos: LatLng, destination: SafePlace) => {
    try {
      // OSRM requires Longitude,Latitude (Leaflet gives Latitude,Longitude)
      // userPos is [lat, lon]
      const startParam = `${userPos[1]},${userPos[0]}`; 
      const endParam = `${destination.lng},${destination.lat}`;

      // Call the Node.js Controller we built earlier
      const url = `http://localhost:3000/api/v1/nav?start=${startParam}&end=${endParam}`;
      
      const res = await fetch(url);
      const data = await res.json();

      if (data.features) {
        setRouteData(data);
      }
    } catch (err) {
      console.error("Failed to calculate route:", err);
    }
  };

  if (error) return <div style={{ padding: 20 }}>Geolocation error: {error}</div>;
  if (!position) return <div style={{ padding: 20 }}>Locating you…</div>;

  return (
    <MapContainer
      center={position}
      zoom={14}
      style={{ height: "90vh", width: "100%" }}
    >
      <Recenter position={position} />
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <Marker position={position}>
        <Popup>You are here</Popup>
      </Marker>

      {/* Render All Safe Places */}
      {safePlaces.map((place, index) => {
        // Check if this specific place is the closest one
        const isSelected = selectedSafePlace && 
                          selectedSafePlace.lat === place.lat && 
                          selectedSafePlace.lng === place.lng;

        return (
            <Marker 
                key={index} 
                position={[place.lat, place.lng]}
                icon={isSelected ? selectedIcon : defaultIcon} // Highlight selected
            >
                <Popup>
                    <strong>{place.name || "Safe Place"}</strong> <br />
                    {isSelected ? " (Closest to you!)" : ""}
                </Popup>
            </Marker>
        );
      })}

      {routeData && (
        <GeoJSON 
            key={JSON.stringify(routeData)} // Forces update when route changes
            data={routeData} 
            style={{ color: 'blue', weight: 4, opacity: 0.6 }} 
        />
      )}
    </MapContainer>
  );
}
