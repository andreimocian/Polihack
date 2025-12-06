import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Citizen from "./pages/Citizen";
import Authority from "./pages/Authority";
import MapView from "./pages/MapView";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";

const App = () => {
  const location = useLocation();

  const hideNavbar = location.pathname === "/login";

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {!hideNavbar && <Navbar />}
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
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
