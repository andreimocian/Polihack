
import React, { useCallback, useEffect, useRef, useState, type JSX } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

import { socket } from "../services/socket";
import { getReportsApi, patchReportApi, getHazardsApi } from "../services/api";
import { fetchCurrentUser } from "../services/loginService";

type ReportStatus = "pending" | "provisional_closed" | "closed" | "rejected";

interface Report {
  id: string;
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

function MapSetter({ mapRef }: { mapRef: React.MutableRefObject<LeafletMap | null> }) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);
  return null;
}
export default function Authority(): JSX.Element {
  const [reports, setReports] = useState<Report[]>([]);
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // store Leaflet map instance here
  const mapRef = useRef<LeafletMap | null>(null);

  const pendingCount = reports.filter((r) => r.status === "pending").length;
  const provCount = reports.filter((r) => r.status === "provisional_closed").length;


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
    socket.on("reportCreated", (r: Report) => setReports((prev) => [r, ...prev]));
    socket.on("reportUpdated", (r: Report) => setReports((prev) => prev.map((p) => (p.id === r.id ? r : p))));
    socket.on("hazardsUpdated", () => loadHazards());

    return () => {
      socket.off("reportCreated");
      socket.off("reportUpdated");
      socket.off("hazardsUpdated");
    };
  }, [loadHazards]);


  async function updateReportStatus(reportId: string, status: ReportStatus) {
    try {
      const updated = await patchReportApi(reportId, { status });
      setReports((prev) => prev.map((r) => (r.id === reportId ? updated : r)));
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


  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* LEFT PANEL */}
      <div style={{ width: 420, borderRight: "1px solid #eee", padding: 16, overflowY: "auto" }}>
        <h2>Authority Dashboard</h2>

        <p style={{ marginTop: 4, marginBottom: 12 }}>
          Incoming reports: <strong>{reports.length}</strong> — pending: <strong>{pendingCount}</strong>, provisional:{" "}
          <strong>{provCount}</strong>
        </p>

        <div style={{ marginBottom: 12 }}>
          <button onClick={loadReports} style={btn}>
            Refresh
          </button>
          <button onClick={loadHazards} style={{ ...btn, marginLeft: 8 }}>
            Reload hazards
          </button>
        </div>

        <section>
          <h3>Reports (newest first)</h3>
          {loading && <div>Loading…</div>}
          {!loading && reports.length === 0 && <div>No reports yet.</div>}

          <ul style={{ listStyle: "none", padding: 0 }}>
            {reports.map((r) => (
              <li key={r.id} style={reportItem}>
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
                      <span style={statusBadge(r.status)}>{r.status}</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <button style={smallBtn} onClick={() => focusOnReport(r)}>
                        View on map
                      </button>
                      <button style={actionBtn} onClick={() => updateReportStatus(r.id, "provisional_closed")}>
                        Mark provisional
                      </button>
                      <button style={{ ...actionBtn, backgroundColor: "#28a745" }} onClick={() => updateReportStatus(r.id, "closed")}>
                        Confirm
                      </button>
                      <button style={{ ...actionBtn, backgroundColor: "#d9534f" }} onClick={() => updateReportStatus(r.id, "rejected")}>
                        Reject
                      </button>
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
        <MapContainer center={[46.77, 23.6]} zoom={10} style={{ height: "100%", width: "100%" }}>
          <MapSetter mapRef={mapRef} />

          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {reports.map((r) => (
            <Marker key={r.id} position={[r.lat, r.lng]}>
              <Popup>
                <div style={{ minWidth: 220 }}>
                  <strong>{r.type}</strong>
                  <div style={{ fontSize: 12 }}>{new Date(r.createdAt).toLocaleString()}</div>
                  <div style={{ marginTop: 6 }}>{r.description}</div>
                </div>
              </Popup>
            </Marker>
          ))}

        </MapContainer>
      </div>
    </div>
  );
}

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
  if (status === "closed") return { ...base, backgroundColor: "#d9534f" };
  if (status === "rejected") return { ...base, backgroundColor: "#5bc0de" };
  return base;
};
