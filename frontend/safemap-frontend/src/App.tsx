import Citizen from "./pages/Citizen";
import Authority from "./pages/Authority";
import MapView from "./pages/MapView";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import RedirectHandler from "./services/RedirectHandler";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Home from "./pages/Home";

const App = () => {
  const location = useLocation();

  const hideNavbar = location.pathname === "/login" || location.pathname === "/citizen";

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {!hideNavbar && <Navbar />}
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />

          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/citizen" element={<Citizen />} />
          <Route path="/authority" element={<Authority />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/redirect" element={<RedirectHandler />} />

        </Routes>

      </div>
    </div>
  );
};

export default App;
