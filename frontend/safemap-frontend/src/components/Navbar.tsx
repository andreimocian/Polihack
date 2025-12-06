import { Link } from "react-router-dom";
import { fetchCurrentUser, logout } from "../services/loginService";
import { Box, Button } from "@mui/material";
import { useEffect, useState } from "react";
import {Typography} from "@mui/material";

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
    <Box
      component="nav"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        px: 3,
        py: 1.5,
        bgcolor: "primary.main",
        color: "primary.contrastText",
        boxShadow: 2,
        position: "sticky",
        top: 0,
        zIndex: 1100,
      }}
    >
      {/* App title / logo placeholder (clickable) */}
      <Typography
        variant="h6"
        component={Link}
        to="/home"
        sx={{ fontWeight: 600, mr: 2, color: 'inherit', textDecoration: 'none' }}
      >
        SafeMap
      </Typography>

      {/* autoritate: Home + Authority */}
      {role === "autoritate" && (
        <Button
          component={Link}
          to="/authority"
          color="inherit"
          variant="text"
          sx={{ textTransform: "none" }}
        >
          Authority Panel
        </Button>
      )}

      {/* voluntar: Home + Map */}
      {role === "voluntar" && (
        <Button
          component={Link}
          to="/map"
          color="inherit"
          variant="text"
          sx={{ textTransform: "none" }}
        >
          Map
        </Button>
      )}

      {/* push logout to the right */}
      <Box sx={{ ml: "auto" }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={logout}
          sx={{ textTransform: "none" }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
};

export default Navbar;
