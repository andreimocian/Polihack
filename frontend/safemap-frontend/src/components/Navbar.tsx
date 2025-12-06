import { Link } from "react-router-dom";
import { logout } from "../services/loginService";
import { Button } from "@mui/material";

const Navbar = () => {
  return (
    <nav style={{ display: "flex", gap: "20px", padding: "10px" }}>
      <Link to="/">Home</Link>
      <Link to="/citizen">Citizen</Link>
      <Link to="/authority">Authority</Link>
      <Link to="/map">Map</Link>
      <Button variant="outlined" onClick={logout}>Logout</Button>
    </nav>
  );
};

export default Navbar;
