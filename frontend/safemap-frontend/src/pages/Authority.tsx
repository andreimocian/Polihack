import React, { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { socket } from "../services/socket"; 
import { getReportsApi, patchReportApi, getHazardsApi } from "../services/api";

type ReportStatus = "pending" | "provisional_closed" | "closed" | "rejected";

interface Report {
  id: string;
  type: string;
  description?: string;
  latitude: number;
  longitude: number;
  status: ReportStatus;
  createdAt: string;
  reporterId?: string;
  // optional severity score you can compute server-side
  severity?: number;
}

interface Hazard {
  id: string;
  name?: string;
  polygonGeoJson?: any;
  status?: "provisional" | "confirmed" | "cleared";
}

export default function Authority() {
  const [reports, setReports] = useState<Report[]>([]);
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // load reports from backend
  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getReportsApi();
      setReports(data || []);
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

    // Poll fallback
    const id = setInterval(loadReports, 10000);
    return () => clearInterval(id);
  }, [loadReports, loadHazards]);

  // socket updates (if your backend emits events)
  useEffect(() => {
    socket.on("reportCreated", (r: Report) => {
      setReports((prev) => [r, ...prev]);
    });
    socket.on("reportUpdated", (r: Report) => {
      setReports((prev) => prev.map(p => p.id === r.id ? r : p));
    });
    socket.on("hazardsUpdated", () => loadHazards());

    return () => {
      socket.off("reportCreated");
      socket.off("reportUpdated");
      socket.off("hazardsUpdated");
    };
  }, [loadHazards]);

  // report actions
  async function updateReportStatus(reportId: string, status: ReportStatus) {
    try {
      const updated = await patchReportApi(reportId, { status });
      setReports((prev) => prev.map(r => r.id === reportId ? updated : r));
      if (status === "closed") {
        // optionally create or update a hazard on confirm
        // POST /api/hazards with coordinates — implementation depends on backend
      }
    } catch (err) {
      console.error("Failed to update report:", err);
      alert("Failed to update report (see console).");
    }
  }

  // quick helpers
  const pendingCount = reports.filter(r => r.status === "pending").length;
  const provCount = reports.filter(r => r.status === "provisional_closed").length;

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Left: controls & list */}
      <div style={{ width: 420, borderRight: "1px solid #eee", padding: 16, overflowY: "auto" }}>
        <h2>Authority Dashboard</h2>
        <p style={{ marginTop: 4, marginBottom: 12 }}>
          Incoming reports: <strong>{reports.length}</strong> — pending: <strong>{pendingCount}</strong>, provisional: <strong>{provCount}</strong>
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
              <li key={r.id} style={reportItem}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <strong>{r.type}</strong>
                    <div style={{ fontSize: 12, color: "#555" }}>{new Date(r.createdAt).toLocaleString()}</div>
                    <div style={{ marginTop: 6 }}>{r.description}</div>
                    <div style={{ fontSize: 12, marginTop: 6, color: "#333" }}>
                      {r.latitude.toFixed(5)}, {r.longitude.toFixed(5)}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ marginBottom: 8 }}>
                      <span style={statusBadge(r.status)}>{r.status}</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <button style={smallBtn} onClick={() => { setSelectedReport(r); }}>View on map</button>
                      <button style={actionBtn} onClick={() => updateReportStatus(r.id, "provisional_closed")}>Mark provisional</button>
                      <button style={{ ...actionBtn, backgroundColor: "#28a745" }} onClick={() => updateReportStatus(r.id, "closed")}>Confirm (close)</button>
                      <button style={{ ...actionBtn, backgroundColor: "#d9534f" }} onClick={() => updateReportStatus(r.id, "rejected")}>Reject</button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Right: Map */}
      <div style={{ flex: 1 }}>
        <MapContainer center={[46.77, 23.6]} zoom={10} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {/* Render report markers */}
          {reports.map((r) => (
            <Marker key={r.id} position={[r.latitude, r.longitude]}>
              <Popup>
                <div style={{ minWidth: 220 }}>
                  <strong>{r.type}</strong>
                  <div style={{ fontSize: 12 }}>{new Date(r.createdAt).toLocaleString()}</div>
                  <div style={{ marginTop: 6 }}>{r.description}</div>
                  <div style={{ marginTop: 8 }}>
                    <button style={smallBtn} onClick={() => updateReportStatus(r.id, "provisional_closed")}>Provisional</button>
                    <button style={{ ...smallBtn, marginLeft: 6 }} onClick={() => updateReportStatus(r.id, "closed")}>Confirm</button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Optionally render hazards - placeholder: no polygon rendering code here
              If you have GeoJSON hazards, you can use GeoJSON component from react-leaflet */}
        </MapContainer>
      </div>
    </div>
  );
}

/* ---------------- styles ---------------- */
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
