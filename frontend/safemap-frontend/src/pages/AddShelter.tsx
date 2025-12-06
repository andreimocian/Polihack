import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  Button,
  Divider,
  Alert,
  CardHeader,
  Paper,
  Snackbar,
} from "@mui/material";
import safeSpaceService from "../services/safeSpaceService";

interface ShelterData {
  address: string;
  capacity: number | "";
  location: { lat: number; lng: number } | null;
}

const AddShelterPanel = () => {
  const [newShelter, setNewShelter] = useState<ShelterData>({
    address: "",
    capacity: "",
    location: null,
  });

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  const getLocation = () => {
    if (!navigator.geolocation)
      return alert("Geolocation not supported on this device.");

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

  const isFormValid =
    newShelter.address && newShelter.capacity && newShelter.location !== null;

  return (
    <Box sx={{ maxWidth: 520, mx: "auto", mt: 6, px: 2 }}>
      <Paper
        elevation={6}
        sx={{
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <CardHeader
          title="🏡 Add New Shelter"
          subheader="Register a safe evacuation point for citizens"
          sx={{
            textAlign: "center",
            bgcolor: "primary.main",
            color: "primary.contrastText",
            py: 3,
            ".MuiCardHeader-title": { fontSize: 24, fontWeight: 700 },
          }}
        />

        <Divider />

        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 3, p: 4 }}>
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
            sx={{
              fontWeight: 700,
              py: 1.2,
              borderRadius: 2,
              letterSpacing: 0.5,
            }}
          >
            📍 Get My Location
          </Button>

          {newShelter.location && (
            <Alert
              severity="success"
              sx={{
                borderRadius: 2,
                fontSize: 15,
              }}
            >
              Location captured:
              <br />
              <strong>
                {newShelter.location.lat.toFixed(5)},{" "}
                {newShelter.location.lng.toFixed(5)}
              </strong>
            </Alert>
          )}

          <Button
            onClick={async () => {
              try {
                const res = await safeSpaceService.createSafeSpace(
                  newShelter.address,
                  newShelter.capacity as number,
                  newShelter.location!.lat,
                  newShelter.location!.lng
                );
                // backend returns { status: 'success', data: ... } or similar
                if (res && (res.status === "success" || res.id || res._id)) {
                  setSnackbarMsg("Shelter saved successfully.");
                  setSnackbarSeverity("success");
                  setSnackbarOpen(true);
                  // Optionally clear form
                  setNewShelter({ address: "", capacity: "", location: null });
                } else {
                  throw new Error(res?.message || "Failed to save shelter");
                }
              } catch (err: any) {
                console.error("createSafeSpace error", err);
                setSnackbarMsg(err?.message || "Failed to save shelter");
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
              }
            }}
            variant="contained"
            color="success"
            fullWidth
            disabled={!isFormValid}
            sx={{
              mt: 1,
              py: 1.3,
              fontWeight: 700,
              fontSize: 16,
              borderRadius: 2,
              boxShadow: 3,
            }}
          >
            Save Shelter
          </Button>
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={4000}
            onClose={() => setSnackbarOpen(false)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
              {snackbarMsg}
            </Alert>
          </Snackbar>
        </CardContent>
      </Paper>
    </Box>
  );
};

export default AddShelterPanel;
