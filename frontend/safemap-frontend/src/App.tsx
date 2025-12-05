import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Citizen from "./pages/Citizen";
import Authority from "./pages/Authority";
import MapView from "./pages/MapView";
import Navbar from "./components/Navbar";

const App = () => {
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/citizen" element={<Citizen />} />
          <Route path="/authority" element={<Authority />} />
          <Route path="/map" element={<MapView />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
