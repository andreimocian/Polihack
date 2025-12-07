import React, { useCallback, useEffect, useRef, useState, type JSX } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import type { Map as LeafletMap, LatLng } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import safeSpaceService from "../services/safeSpaceService";
import { socket } from "../services/socket";
import { getReportsApi, patchReportApi, getHazardsApi, postSafePlaceApi } from "../services/api";
import { fetchCurrentUser } from "../services/loginService";

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

interface HazardGeometry {
  date: string;
  type: string;
  coordinates: [number, number]; 
  magnitudeValue?: number;
  magnitudeUnit?: string;
}

interface Hazard {
  id: string;
  title: string;
  category: string;
  geometry: HazardGeometry[]; 
}

const createSymbol = (emoji: string) => {
  return L.divIcon({
    html: `<div style="font-size: 30px; line-height: 30px; text-shadow: 0 0 3px #fff;">${emoji}</div>`,
    className: 'hazard-symbol-icon', 
    iconSize: [30, 30],
    iconAnchor: [15, 15], 
    popupAnchor: [0, -15] 
  });
};

const symbols = {
  safePlace: createSymbol("🏥"),    // Hospital/Safe Place
  wildfire: createSymbol("🔥"),     // Fire
  flood: createSymbol("🌊"),        // Water Wave
  landslide: createSymbol("🪨"),    // Rock
  severeStorm: createSymbol("🌪️"),   // Tornado/Cyclone
  earthquake: createSymbol("📉"),    // Chart/Seismic activity
  default: createSymbol("⚠️"),      // Generic Warning
};

const getHazardSymbol = (category?: string) => {
  if (!category) return symbols.default;
  
  const cat = category.toLowerCase();
  
  if (cat === "wildfire") return symbols.wildfire;
  if (cat === "flood") return symbols.flood;
  if (cat === "landslide") return symbols.landslide;
  if (cat === "severestorm") return symbols.severeStorm;
  if (cat === "earthquake") return symbols.earthquake;
  
  return symbols.default;
};

function MapSetter({ mapRef }: { mapRef: React.MutableRefObject<LeafletMap | null> }) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);
  return null;
}

function MapClickEvents({ isActive, onLocationSelect }: { isActive: boolean; onLocationSelect: (latlng: LatLng) => void }) {
  useMapEvents({
    click(e) {
      if (isActive) onLocationSelect(e.latlng);
    },
  });
  return null;
}


export default function Authority(): JSX.Element {
  const [reports, setReports] = useState<Report[]>([]);
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showHazards, setShowHazards] = useState(true);

  const [isAddingSafePlace, setIsAddingSafePlace] = useState(false);
  const [newPlaceLoc, setNewPlaceLoc] = useState<LatLng | null>(null);
  const [newPlaceName, setNewPlaceName] = useState("");
  const [newPlaceAddress, setNewPlaceAddress] = useState("");
  const [newPlaceCapacity, setNewPlaceCapacity] = useState("");
  const [newPlaceContact, setNewPlaceContact] = useState("");

  const mapRef = useRef<LeafletMap | null>(null);
  const pendingCount = reports.filter((r) => r.status === "pending").length;
  const provCount = reports.filter((r) => r.status === "provisional_closed").length;

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getReportsApi();
      setReports(data.data || []);
    } catch (err) { console.error("Failed reports", err); } 
    finally { setLoading(false); }
  }, []);

  const loadHazards = useCallback(async () => {
    try {
      const data = await getHazardsApi();
      setHazards(data || []);
    } catch (err) { console.error("Failed hazards", err); }
  }, []);

  useEffect(() => {
    loadReports();
    loadHazards();
    const id = setInterval(loadReports, 10000);
    return () => clearInterval(id);
  }, [loadReports, loadHazards]);

  useEffect(() => {
    socket.on("reportCreated", (r: any) => setReports((prev) => [r.data || r, ...prev]));
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

  async function updateReportStatus(reportId: string, status: ReportStatus) {
    try {
      const res = await patchReportApi(reportId, { status });
      const updated = res.data || res;
      setReports((prev) => prev.map((r) => (r._id === reportId ? updated : r)));
    } catch (err) { alert("Failed update"); }
  }

  function focusOnReport(r: Report) {
    setSelectedReport(r);
    mapRef.current?.flyTo([r.lat, r.lng], 15, { duration: 0.9 });
  }

  const handleSaveSafePlace = async () => {
    if (!newPlaceLoc || !newPlaceAddress.trim() || !newPlaceCapacity.trim()) {
      return alert("Please fill all fields and select a location on the map");
    }
    try {
      await safeSpaceService.createSafeSpace(
        newPlaceAddress,
        parseInt(newPlaceCapacity, 10),
        newPlaceLoc.lat,
        newPlaceLoc.lng,
        newPlaceContact.trim()
      );
      alert("Shelter added successfully!");
      setIsAddingSafePlace(false);
      setNewPlaceLoc(null);
      setNewPlaceName("");
      setNewPlaceAddress("");
      setNewPlaceCapacity("");
    } catch (error) { 
      alert("Failed to add shelter"); 
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* LEFT PANEL */}
      <div style={{ width: 420, borderRight: "1px solid #eee", padding: 16, overflowY: "auto" }}>
        <h2>Authority Dashboard</h2>

        {/* Add Shelter Section */}
        <section style={{ marginBottom: 20, padding: 12, backgroundColor: "#f9f9f9", borderRadius: 8, border: "1px solid #ddd" }}>
          <h3 style={{ marginTop: 0 }}>Add New Shelter</h3>
          
          {!isAddingSafePlace ? (
            <button onClick={() => setIsAddingSafePlace(true)} style={{ ...btn, width: "100%", background: "#4CAF50", color: "white", fontWeight: "bold" }}>
              + Add Shelter
            </button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Address</label>
                <input 
                  type="text" 
                  placeholder="e.g., 123 Main St, City"
                  value={newPlaceAddress}
                  onChange={(e) => setNewPlaceAddress(e.target.value)}
                  style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc", boxSizing: "border-box", fontSize: 14 }}
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Capacity</label>
                <input 
                  type="number" 
                  placeholder="e.g., 100"
                  value={newPlaceCapacity}
                  onChange={(e) => setNewPlaceCapacity(e.target.value)}
                  style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc", boxSizing: "border-box", fontSize: 14 }}
                  min="1"
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Contact Information</label>
                <input 
                  type="text" 
                  placeholder="e.g., +40 123 456 7890"
                  value={newPlaceContact}
                  onChange={(e) => setNewPlaceContact(e.target.value)}
                  style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc", boxSizing: "border-box", fontSize: 14 }}
                />
              </div>

              <div style={{ padding: 10, backgroundColor: "#e3f2fd", borderRadius: 4, fontSize: 13, color: "#1565c0" }}>
                📍 Click on the map to select location
                {newPlaceLoc && <div style={{ marginTop: 8, fontSize: 12 }}>✓ Location selected: {newPlaceLoc.lat.toFixed(4)}, {newPlaceLoc.lng.toFixed(4)}</div>}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button 
                  onClick={handleSaveSafePlace} 
                  style={{ ...btn, flex: 1, background: "#28a745", color: "white", fontWeight: "bold" }}
                >
                  Save Shelter
                </button>
                <button 
                  onClick={() => {
                    setIsAddingSafePlace(false);
                    setNewPlaceLoc(null);
                    setNewPlaceAddress("");
                    setNewPlaceCapacity("");
                    setNewPlaceContact("");
                  }} 
                  style={{ ...btn, flex: 1, background: "#6c757d", color: "white" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Safe Places */}
        

        <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={loadReports} style={btn}>Refresh Reports</button>
            <button onClick={loadHazards} style={btn}>Reload Hazards</button>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '10px', background: '#f0f0f0', borderRadius: '5px' }}>
            <input type="checkbox" checked={showHazards} onChange={(e) => setShowHazards(e.target.checked)} style={{ marginRight: 8, transform: 'scale(1.2)' }} />
            Show Active Hazards ({hazards.length})
          </label>
        </div>

        <section>
          <h3>Reports</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {reports.map((r) => (
              <li key={r._id} style={reportItem}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <strong>{r.type}</strong>
                    <div style={{ fontSize: 12, color: "#555" }}>{new Date(r.createdAt).toLocaleString()}</div>
                    <div>{r.description}</div>
                  </div>
                  <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 5 }}>
                     <span style={statusBadge(r.status)}>{r.status === "provisional_closed" ? "closed" : r.status}</span>
                     <button style={smallBtn} onClick={() => focusOnReport(r)}>View</button>
                     <select onChange={(e) => e.target.value && updateReportStatus(r._id, e.target.value as ReportStatus)} defaultValue="" style={{padding: 4}}>
                        <option value="">Action...</option>
                        <option value="provisional_closed">Resolve</option>
                        <option value="approved">Confirm</option>
                     </select>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* RIGHT: MAP */}
      <div style={{ flex: 1 }}>
        <MapContainer center={[45.9432, 24.9668]} zoom={7} style={{ height: "100%", width: "100%", cursor: isAddingSafePlace ? "crosshair" : "grab" }}>
          <MapSetter mapRef={mapRef} />
          <MapClickEvents isActive={isAddingSafePlace} onLocationSelect={(latlng) => setNewPlaceLoc(latlng)} />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {reports.map((r) => (
            <Marker key={r._id} position={[r.lat, r.lng]}>
              <Popup><strong>{r.type}</strong><br/>{r.description}</Popup>
            </Marker>
          ))}


          {showHazards && hazards.map((h) => {
             const geo = h.geometry && h.geometry[0];
             if (!geo || geo.type !== 'Point' || !geo.coordinates) return null;
             const [lng, lat] = geo.coordinates;

             return (
               <Marker key={h.id} position={[lat, lng]} icon={getHazardSymbol(h.category)}>
                 <Popup>
                   <div style={{textAlign: 'center'}}>
                      <div style={{fontSize: 24}}>{getHazardSymbol(h.category).options.html?.replace(/<[^>]*>?/gm, '')}</div>
                      <strong style={{textTransform: 'capitalize'}}>{h.category}</strong>
                      <br/>
                      {h.title}
                      <br/>
                      <span style={{fontSize: 11, color: '#666'}}>
                        {new Date(geo.date).toLocaleDateString()}
                      </span>
                   </div>
                 </Popup>
               </Marker>
             );
          })}

          {isAddingSafePlace && newPlaceLoc && (
            <Marker position={newPlaceLoc} icon={symbols.safePlace}>
              <Popup>New Safe Place Location</Popup>
            </Marker>
          )}

        </MapContainer>
      </div>
    </div>
  );
}

const reportItem: React.CSSProperties = { padding: "12px", marginBottom: "10px", backgroundColor: "#fff", borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" };
const btn: React.CSSProperties = { padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer" };
const smallBtn: React.CSSProperties = { padding: "6px 8px", borderRadius: 6, border: "none", background: "#1e90ff", color: "#fff", cursor: "pointer", fontSize: 12 };
const actionBtn: React.CSSProperties = { padding: "8px 10px", borderRadius: 8, border: "none", background: "#ff9900", color: "#fff", cursor: "pointer", fontSize: 13 };
const statusBadge = (status: ReportStatus): React.CSSProperties => {
  const base: React.CSSProperties = { padding: "6px 8px", borderRadius: 6, color: "#fff", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: "auto" };
  if (status === "pending") return { ...base, backgroundColor: "#6c757d" };
  if (status === "provisional_closed") return { ...base, backgroundColor: "#f0ad4e" };
  if (status === "approved") return { ...base, backgroundColor: "#28a745" };
  return base;
};