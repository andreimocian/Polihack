import React, { useCallback, useEffect, useRef, useState, type JSX } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import type { Map as LeafletMap, LatLng } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { socket } from "../services/socket";
import { getReportsApi, patchReportApi, getHazardsApi, postSafePlaceApi } from "../services/api"; // Added postSafePlaceApi
import { fetchCurrentUser } from "../services/loginService";
import type { SafePlace } from "../types"; // Assuming you have this in a types file

// --- Types ---
type ReportStatus = "pending" | "provisional_closed" | "approved" | "rejected";

interface Report {
  _id: string;
  type: string;
  description?: string;
  lat: number;
  lng: number;
  status: ReportStatus;
  createdAt: string;
  reporterId?: string;
  severity?: number;
}

interface Hazard {
  id: string;
  name?: string;
  polygonGeoJson?: any;
  status?: "provisional" | "confirmed" | "cleared";
}

// --- Icons ---
// Green icon for the new Safe Place selection
const newPlaceIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// --- Helper Components ---

function MapSetter({ mapRef }: { mapRef: React.MutableRefObject<LeafletMap | null> }) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);
  return null;
}

// NEW: Component to handle clicking on the map
function MapClickEvents({ 
  isActive, 
  onLocationSelect 
}: { 
  isActive: boolean; 
  onLocationSelect: (latlng: LatLng) => void 
}) {
  useMapEvents({
    click(e) {
      if (isActive) {
        onLocationSelect(e.latlng);
      }
    },
  });
  return null;
}

// --- Main Component ---

export default function Authority(): JSX.Element {
  const [reports, setReports] = useState<Report[]>([]);
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // NEW STATES for Safe Place Creation
  const [isAddingSafePlace, setIsAddingSafePlace] = useState(false);
  const [newPlaceLoc, setNewPlaceLoc] = useState<LatLng | null>(null);
  const [newPlaceName, setNewPlaceName] = useState("");

  const mapRef = useRef<LeafletMap | null>(null);

  const pendingCount = reports.filter((r) => r.status === "pending").length;
  const provCount = reports.filter((r) => r.status === "provisional_closed").length;

  // --- Data Loading ---
  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getReportsApi();
      setReports(data.data || []);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHazards = useCallback(async () => {
    try {
      const data = await getHazardsApi();
      setHazards(data || []);
    } catch (err) {
      console.error("Failed to fetch hazards:", err);
    }
  }, []);

  useEffect(() => {
    loadReports();
    loadHazards();
    const id = setInterval(loadReports, 10000);
    return () => clearInterval(id);
  }, [loadReports, loadHazards]);

  useEffect(() => {
    fetchCurrentUser().then((user) => {
      console.log("Current user:", user);
    });
  }, []);

  useEffect(() => {
    socket.on("reportCreated", (r: any) => {
      const report = r.data || r;
      setReports((prev) => [report, ...prev]);
    });
    socket.on("reportUpdated", (r: any) => {
      const report = r.data || r;
      setReports((prev) => prev.map((p) => (p._id === report._id ? report : p)));
    });
    socket.on("hazardsUpdated", () => loadHazards());

    return () => {
      socket.off("reportCreated");
      socket.off("reportUpdated");
      socket.off("hazardsUpdated");
    };
  }, [loadHazards]);

  // --- Actions ---

  async function updateReportStatus(reportId: string, status: ReportStatus) {
    try {
      const res = await patchReportApi(reportId, { status });
      const updated = res.data || res;
      setReports((prev) => prev.map((r) => (r._id === reportId ? updated : r)));
    } catch (err) {
      console.error("Failed to update report:", err);
      alert("Failed to update report (see console).");
    }
  }

  function focusOnReport(r: Report) {
    setSelectedReport(r);
    const map = mapRef.current;
    if (!map) return;
    map.flyTo([r.lat, r.lng], 15, { duration: 0.9 });
  }

  // NEW: Handle Saving the Safe Place
  const handleSaveSafePlace = async () => {
    if (!newPlaceLoc) {
      alert("Please select a location on the map first.");
      return;
    }
    if (!newPlaceName.trim()) {
      alert("Please enter a name for this Safe Place.");
      return;
    }

    try {
      await postSafePlaceApi({
        lat: newPlaceLoc.lat,
        lng: newPlaceLoc.lng,
        name: newPlaceName
      });
      
      alert("Safe Place saved successfully!");
      
      // Reset state
      setIsAddingSafePlace(false);
      setNewPlaceLoc(null);
      setNewPlaceName("");
    } catch (error) {
      console.error("Failed to save safe place", error);
      alert("Failed to save safe place.");
    }
  };

  const handleCancelSafePlace = () => {
    setIsAddingSafePlace(false);
    setNewPlaceLoc(null);
    setNewPlaceName("");
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* LEFT PANEL */}
      <div style={{ width: 420, borderRight: "1px solid #eee", padding: 16, overflowY: "auto" }}>
        <h2>Authority Dashboard</h2>

        {/* --- NEW: Safe Place Controls --- */}
        <div style={{ 
          marginBottom: 20, 
          padding: 15, 
          backgroundColor: isAddingSafePlace ? "#e8f5e9" : "#f8f9fa", 
          borderRadius: 8, 
          border: isAddingSafePlace ? "1px solid #4caf50" : "1px solid #eee"
        }}>
          {!isAddingSafePlace ? (
            <button 
              onClick={() => setIsAddingSafePlace(true)} 
              style={{ ...btn, width: '100%', backgroundColor: '#28a745', color: 'white', border: 'none' }}
            >
              + Add New Safe Place
            </button>
          ) : (
            <div>
              <h4 style={{marginTop: 0}}>Adding Safe Place</h4>
              <p style={{fontSize: 13, color: '#555'}}>1. Click on the map to set location.</p>
              
              <input 
                type="text" 
                placeholder="Safe Place Name (e.g. City Hospital)"
                value={newPlaceName}
                onChange={(e) => setNewPlaceName(e.target.value)}
                style={{ width: '100%', padding: 8, marginBottom: 10, boxSizing: 'border-box' }}
              />

              {newPlaceLoc && (
                 <div style={{fontSize: 12, marginBottom: 10}}>
                   Selected: {newPlaceLoc.lat.toFixed(4)}, {newPlaceLoc.lng.toFixed(4)}
                 </div>
              )}

              <div style={{display: 'flex', gap: 10}}>
                <button onClick={handleSaveSafePlace} style={{...actionBtn, backgroundColor: '#28a745', flex: 1}}>
                  Confirm
                </button>
                <button onClick={handleCancelSafePlace} style={{...actionBtn, backgroundColor: '#6c757d', flex: 1}}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        {/* -------------------------------- */}

        <p style={{ marginTop: 4, marginBottom: 12 }}>
          Incoming reports: <strong>{reports.length}</strong> — pending: <strong>{pendingCount}</strong>, provisional:{" "}
          <strong>{provCount}</strong>
        </p>

        <div style={{ marginBottom: 12 }}>
          <button onClick={loadReports} style={btn}>Refresh</button>
          <button onClick={loadHazards} style={{ ...btn, marginLeft: 8 }}>Reload hazards</button>
        </div>

        <section>
          <h3>Reports (newest first)</h3>
          {loading && <div>Loading…</div>}
          {!loading && reports.length === 0 && <div>No reports yet.</div>}

          <ul style={{ listStyle: "none", padding: 0 }}>
            {reports.map((r) => (
              <li key={r._id} style={reportItem}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <strong>{r.type}</strong>
                    <div style={{ fontSize: 12, color: "#555" }}>{new Date(r.createdAt).toLocaleString()}</div>
                    <div style={{ marginTop: 6 }}>{r.description}</div>
                    <div style={{ fontSize: 12, marginTop: 6, color: "#333" }}>
                      {r.lat.toFixed(5)}, {r.lng.toFixed(5)}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ marginBottom: 8 }}>
                      <span style={statusBadge(r.status)}>{statusLabel(r.status)}</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <button style={smallBtn} onClick={() => focusOnReport(r)}>View on map</button>
                      <button style={actionBtn} onClick={() => updateReportStatus(r._id, "provisional_closed")}>Mark resolved</button>
                      <button style={{ ...actionBtn, backgroundColor: "#28a745" }} onClick={() => updateReportStatus(r._id, "approved")}>Confirm</button>
                      <button style={{ ...actionBtn, backgroundColor: "#d9534f" }} onClick={() => updateReportStatus(r._id, "rejected")}>Reject</button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* RIGHT: MAP */}
      <div style={{ flex: 1 }}>
        <MapContainer 
          center={[46.77, 23.6]} 
          zoom={10} 
          style={{ height: "100%", width: "100%", cursor: isAddingSafePlace ? "crosshair" : "grab" }}
        >
          <MapSetter mapRef={mapRef} />
          
          {/* Listens for clicks only when adding safe place */}
          <MapClickEvents 
            isActive={isAddingSafePlace} 
            onLocationSelect={(latlng) => setNewPlaceLoc(latlng)} 
          />

          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Existing Reports */}
          {reports.map((r) => (
            <Marker key={r._id} position={[r.lat, r.lng]}>
              <Popup>
                <div style={{ minWidth: 220 }}>
                  <strong>{r.type}</strong>
                  <div style={{ fontSize: 12 }}>{new Date(r.createdAt).toLocaleString()}</div>
                  <div style={{ marginTop: 6 }}>{r.description}</div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* NEW: Temporary Marker for the Safe Place being added */}
          {isAddingSafePlace && newPlaceLoc && (
            <Marker position={newPlaceLoc} icon={newPlaceIcon}>
              <Popup>New Safe Place Location</Popup>
            </Marker>
          )}

        </MapContainer>
      </div>
    </div>
  );
}

// --- Styles (Same as before) ---
const reportItem: React.CSSProperties = {
  padding: "12px",
  marginBottom: "10px",
  backgroundColor: "#fff",
  borderRadius: 8,
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
};

const btn: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
};

const smallBtn: React.CSSProperties = {
  padding: "6px 8px",
  borderRadius: 6,
  border: "none",
  background: "#1e90ff",
  color: "#fff",
  cursor: "pointer",
  fontSize: 12,
};

const actionBtn: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 8,
  border: "none",
  background: "#ff9900",
  color: "#fff",
  cursor: "pointer",
  fontSize: 13,
};

const statusBadge = (status: ReportStatus): React.CSSProperties => {
  const base: React.CSSProperties = {
    padding: "6px 8px",
    borderRadius: 6,
    color: "#fff",
    fontSize: 12,
  };
  if (status === "pending") return { ...base, backgroundColor: "#6c757d" };
  if (status === "provisional_closed") return { ...base, backgroundColor: "#f0ad4e" };
  if (status === "approved") return { ...base, backgroundColor: "#28a745" };
  if (status === "rejected") return { ...base, backgroundColor: "#d9534f" };
  return base;
};

const statusLabel = (status: ReportStatus) => {
  if (status === "provisional_closed") return "resolved";
  return status;
};