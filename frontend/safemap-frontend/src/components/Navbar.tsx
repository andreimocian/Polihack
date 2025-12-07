import { Link, NavLink } from "react-router-dom";
import { fetchCurrentUser, logout } from "../services/loginService";
import { Box, Button, Typography } from "@mui/material";
import { useEffect, useState } from "react";

export function useCurrentUser() {
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    fetchCurrentUser().then(setUser);
  }, []);

  return user;
}

const NavButton = (props: any) => (
  <Button
    component={NavLink}
    end
    color="inherit"
    variant="text"
    sx={{
      textTransform: 'none',
      mr: 1,
      '&.active': {
        bgcolor: 'primary.dark',
        color: 'primary.contrastText',
        boxShadow: 3,
      },
    }}
    {...props}
  />
);

const Navbar = () => {
  const user = useCurrentUser();
  const role = user?.role;
  const isLoggedIn = !!user;

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
      <Typography
        variant="h6"
        component={Link}
        to={isLoggedIn ? "/home" : "/citizen"}
        sx={{ fontWeight: 600, mr: 2, color: 'inherit', textDecoration: 'none' }}
      >
        SafeMap
      </Typography>

      {!isLoggedIn ? (
        <>
          <NavButton to="/citizen">Citizen Panel</NavButton>
        </>
      ) : (
        <>
          <NavButton to="/home">Home</NavButton>

          {/* autoritate */}
          {role === "autoritate" && <NavButton to="/authority">Authority Panel</NavButton>}

          {/* voluntar */}
          {role === "voluntar" && (
            <>
              <NavButton to="/map">Map</NavButton>
              <NavButton to="/add-shelter">Add Shelter</NavButton>
            </>
          )}

          {role !== "voluntar" && role !== "autoritate" && <NavButton to="/citizen">Crisis panel</NavButton>}
        </>
      )}

      {/* logout aligned right */}
      {isLoggedIn && (
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
      )}
    </Box>
  );
};

export default Navbar;
