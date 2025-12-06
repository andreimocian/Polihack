import { useState } from "react";
import { useNavigate } from "react-router-dom";
import citizenService from "../services/citizenService";

interface ReportData {
  type: string;
  description: string;
  location: { lat: number; lng: number } | null;
}

const Citizen = () => {
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ReportData>({
    type: "",
    description: "",
    location: null,
  });

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          location: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          },
        }));
        alert("Location captured successfully!");
      },
      (err) => alert("Location error: " + err.message),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const submitReport = async () => {
  if (!form.type) return alert("Select a hazard type.");
  if (!form.location) return alert("Please get your location first.");

<<<<<<< HEAD
    const payload = {
      type: form.type,
      description: form.description,
      latt: form.location.lat,
      lng: form.location.lng,
    };
=======
 const payload = {
  type: form.type,
  description: form.description,
  lat: form.location.lat,
  lng: form.location.lng,
};
>>>>>>> 954738acee23c748abcf5987b25736a8c795ec8d


<<<<<<< HEAD
    try {
      await citizenService.createReport(payload);
    } catch (error: any) {
      alert("Failed to submit report: " + error.message);
      return;
    }
=======
>>>>>>> 954738acee23c748abcf5987b25736a8c795ec8d


  try {
    const response = await fetch("http://localhost:3000/api/v1/reports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to submit report");
    }

    alert("Report submitted successfully!");

    setShowForm(false);
    setForm({ type: "", description: "", location: null });

  } catch (err) {
    alert("Error sending report: " + err);
  }
};


  return (
    <div style={{ padding: "20px" }}>
      <h1>Citizen Panel</h1>
      <p>Your safety companion during emergencies</p>

      {/* Main Buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>

        <button
          style={bigButton}
          onClick={() => setShowForm(true)}
        >
          🚨 Report Hazard
        </button>

        <button
          style={bigButton}
          onClick={() => navigate("/map")}
        >
          🧭 Evacuate Safely
        </button>

        <button
          style={bigButton}
          onClick={() => navigate("/map")}
        >
          📍 View Live Map
        </button>
      </div>

      {/* Report Form */}
      {showForm && (
        <div style={formBox}>
          <h2>Report a Hazard</h2>

          <label>Hazard type:</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            style={input}
          >
            <option value="">Select...</option>
            <option value="flood">Flood</option>
            <option value="landslide">Landslide</option>
            <option value="blocked_road">Blocked Road</option>
            <option value="wildfire">Fire</option>
            <option value="other">Injury / SOS</option>
          </select>

          <label>Description (optional):</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            style={{ ...input, height: "80px" }}
            placeholder="Additional details..."
          />

          <button style={smallButton} onClick={getLocation}>
            📍 Get My Location
          </button>

          {form.location && (
            <p>
              Location captured:
              <br />
              <strong>{form.location.lat.toFixed(5)}, {form.location.lng.toFixed(5)}</strong>
            </p>
          )}

          <button style={submitButton} onClick={submitReport}>
            Submit Report
          </button>

          <button style={cancelButton} onClick={() => setShowForm(false)}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

/* -------- STYLES -------- */

const bigButton: React.CSSProperties = {
  fontSize: "18px",
  padding: "16px",
  borderRadius: "12px",
  border: "none",
  cursor: "pointer",
  backgroundColor: "#1e90ff",
  color: "white",
  fontWeight: "bold",
};

const smallButton: React.CSSProperties = {
  padding: "10px",
  borderRadius: "8px",
  backgroundColor: "#ffaa00",
  color: "white",
  border: "none",
  cursor: "pointer",
  fontWeight: "bold",
  marginTop: "10px",
};

const submitButton: React.CSSProperties = {
  padding: "12px",
  borderRadius: "8px",
  backgroundColor: "#28a745",
  color: "white",
  border: "none",
  cursor: "pointer",
  fontWeight: "bold",
  width: "100%",
  marginTop: "15px",
};

const cancelButton: React.CSSProperties = {
  padding: "12px",
  borderRadius: "8px",
  backgroundColor: "#d9534f",
  color: "white",
  border: "none",
  cursor: "pointer",
  fontWeight: "bold",
  width: "100%",
  marginTop: "10px",
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "8px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

const formBox: React.CSSProperties = {
  marginTop: "20px",
  padding: "16px",
  backgroundColor: "white",
  borderRadius: "12px",
  boxShadow: "0 0 10px rgba(0,0,0,0.1)",
};

export default Citizen;
