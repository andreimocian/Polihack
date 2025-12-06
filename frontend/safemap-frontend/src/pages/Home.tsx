import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ padding: 16 }}>
      <h1>SafeMap</h1>
      <p>Real-time disaster lifeline web app</p>
      <div style={{ display: "flex", gap: 8 }}>
        <Link to="/citizen"><button>Citizen</button></Link>
        <Link to="/authority"><button>Authority</button></Link>
        <Link to="/map"><button>Open Map</button></Link>
      </div>
    </div>
  );
}
