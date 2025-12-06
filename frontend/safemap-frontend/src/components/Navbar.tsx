import { Link } from "react-router-dom";
import { fetchCurrentUser, logout } from "../services/loginService";
import { Button } from "@mui/material";
import { useEffect, useState } from "react";

export function useCurrentUser() {
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    fetchCurrentUser().then(setUser);
  }, []);

  return user;
}

const Navbar = () => {
  const user = useCurrentUser();
  const role = user?.role;

  return (
    <nav style={{ display: "flex", gap: "20px", padding: "10px" }}>
      <Link to="/">Home</Link>
      {role === "autoritate" && (
        <Link to="/authority">Authority</Link>
      )}

      {role === "voluntar" && (
        <Link to="/map">Map</Link>
      )}
      <Button variant="outlined" onClick={logout}>Logout</Button>
    </nav>
  );
};

export default Navbar;
