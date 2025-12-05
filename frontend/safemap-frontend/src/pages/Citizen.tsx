import { useNavigate } from "react-router-dom";

export default function Citizen() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: 16 }}>
      <h2>Citizen Dashboard</h2>
      <p>Report hazards, request help, or start self-evacuation.</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => navigate("/map")}>Open Real-Time Map</button>
        <button onClick={() => alert("Report form: implement POST /reports")}>Report Hazard</button>
        <button onClick={() => alert("Request help: implement POST /help")}>Request Help</button>
      </div>
    </div>
  );
}
