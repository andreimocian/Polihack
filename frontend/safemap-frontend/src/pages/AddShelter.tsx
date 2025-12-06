import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  Button,
  Divider,
  Alert
} from "@mui/material";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface ShelterData {
  address: string;
  capacity: number | "";
  location: { lat: number; lng: number } | null;
}

export default function AddShelterPanel() {
  const [newShelter, setNewShelter] = useState<ShelterData>({
    address: "",
    capacity: "",
    location: null,
  });

  const getLocation = () => {
    if (!navigator.geolocation)
      return alert("Geolocation not supported.");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setNewShelter((prev) => ({
          ...prev,
          location: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          },
        }));
      },
      (err) => alert("Location error: " + err.message)
    );
  };

  const openInGoogleMaps = () => {
    if (!newShelter.location) return;
    const { lat, lng } = newShelter.location;
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, "_blank");
  };

  const isFormValid =
    newShelter.address &&
    newShelter.capacity &&
    newShelter.location !== null;

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 3, px: 2 }}>
      <Card sx={{ borderRadius: 4, p: 2, boxShadow: 4 }}>
        <Typography variant="h5" fontWeight="bold" textAlign="center" mb={2}>
          🏡 Add New Shelter
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Shelter Address"
            variant="outlined"
            fullWidth
            value={newShelter.address}
            onChange={(e) =>
              setNewShelter({ ...newShelter, address: e.target.value })
            }
          />

          <TextField
            label="Capacity (people)"
            type="number"
            variant="outlined"
            fullWidth
            value={newShelter.capacity}
            onChange={(e) =>
              setNewShelter({ ...newShelter, capacity: Number(e.target.value) })
            }
          />

          <Button
            onClick={getLocation}
            variant="contained"
            color="warning"
            fullWidth
          >
            📍 Get My Location
          </Button>

          {newShelter.location && (
            <Alert severity="success">
              Location captured:<br />
              <strong>{newShelter.location.lat.toFixed(5)}, {newShelter.location.lng.toFixed(5)}</strong>
            </Alert>
          )}

          {/* MAP SECTION */}
          <Box sx={{ height: 350, width: "100%", borderRadius: 3, overflow: "hidden" }}>
            <MapContainer
              center={newShelter.location || { lat: 45.9432, lng: 24.9668 }}
              zoom={newShelter.location ? 16 : 6}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {newShelter.location && (
                <Marker
                  position={newShelter.location}
                  icon={markerIcon}
                  eventHandlers={{
                    click: () => openInGoogleMaps(),
                  }}
                >
                  <Popup>
                    <strong>Open in Google Maps</strong><br />
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      sx={{ mt: 1 }}
                      onClick={openInGoogleMaps}
                    >
                      Navigate
                    </Button>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </Box>

          <Button
            variant="contained"
            color="success"
            fullWidth
            disabled={!isFormValid}
          >
            Save Shelter
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
