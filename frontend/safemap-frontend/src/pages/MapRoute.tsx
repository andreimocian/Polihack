import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LatLng, type LeafletMouseEvent } from 'leaflet';
import type { FeatureCollection } from 'geojson';

// Fix for default marker icons in React Leaflet with Webpack/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// 1. Interface for the Helper Component Props
interface LocationSelectorProps {
    onLocationSelect: (latlng: LatLng) => void;
}

// Helper Component to handle map clicks
const LocationSelector: React.FC<LocationSelectorProps> = ({ onLocationSelect }) => {
    useMapEvents({
        click(e: LeafletMouseEvent) {
            onLocationSelect(e.latlng);
        },
    });
    return null;
};

const MapRoute: React.FC = () => {
    // 2. Strongly Typed State
    const [startPoint, setStartPoint] = useState<LatLng | null>(null);
    const [endPoint, setEndPoint] = useState<LatLng | null>(null);
    // Use FeatureCollection type from 'geojson' package
    const [routeData, setRouteData] = useState<FeatureCollection | null>(null);

    const handleMapClick = (latlng: LatLng) => {
        if (!startPoint) {
            setStartPoint(latlng);
            setRouteData(null); 
        } else if (!endPoint) {
            setEndPoint(latlng);
            fetchRoute(startPoint, latlng);
        } else {
            // Reset sequence
            setStartPoint(latlng);
            setEndPoint(null);
            setRouteData(null);
        }
    };

    const fetchRoute = async (start: LatLng, end: LatLng) => {
        try {
            // OSRM requires format: Longitude,Latitude
            const startCoords = `${start.lng},${start.lat}`;
            const endCoords = `${end.lng},${end.lat}`;

            const response = await fetch(`http://localhost:3000/api/v1/nav?start=${startCoords}&end=${endCoords}`);
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            // Cast the response to FeatureCollection
            const data: FeatureCollection = await response.json();

            if (data.features && data.features.length > 0) {
                setRouteData(data);
            }
        } catch (error) {
            console.error("Error fetching route:", error);
        }
    };

    return (
        <div style={{ height: "100vh", width: "100%" }}>
            {/* Instruction Overlay */}
            <div style={{ 
                position: 'absolute', 
                top: 10, 
                left: 50, 
                zIndex: 1000, 
                background: 'white', 
                padding: '10px', 
                borderRadius: '5px', 
                boxShadow: '0 0 10px rgba(0,0,0,0.2)',
                fontFamily: 'Arial, sans-serif'
            }}>
                {!startPoint ? "Click to set Start Point" : 
                 !endPoint ? "Click to set Destination" : 
                 "Route Calculated!"}
            </div>

            <MapContainer 
                center={[46.7712, 23.6236]} 
                zoom={13} 
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <LocationSelector onLocationSelect={handleMapClick} />

                {startPoint && (
                    <Marker position={startPoint}>
                        <Popup>Start</Popup>
                    </Marker>
                )}
                
                {endPoint && (
                    <Marker position={endPoint}>
                        <Popup>End</Popup>
                    </Marker>
                )}

                {routeData && (
                    <GeoJSON 
                        key={JSON.stringify(routeData)} 
                        data={routeData} 
                        style={{ color: "blue", weight: 5, opacity: 0.7 }} 
                    />
                )}
            </MapContainer>
        </div>
    );
};

export default MapRoute;