import { fetchCurrentUser } from "../services/loginService";
import { useEffect, useState } from "react";
import { Box, Container, Paper, Typography } from "@mui/material";

export function useCurrentUser() {
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    fetchCurrentUser().then(setUser);
  }, []);

  return user;
}

export default function Home() {
  const user = useCurrentUser();

  const roleMessage =
    user?.role === "autoritate"
      ? "Rolul tău: autoritate — gestionezi rapoartele și coordonezi intervențiile."
      : user?.role === "voluntar"
      ? "Rolul tău: voluntar — ajuți la evaluarea situațiilor și sprijini echipele din teren."
      : null;

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="md">
        <Paper elevation={2} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main' }}>
              SafeMap
            </Typography>

            {user ? (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Bine ai venit, {user.name}!
                </Typography>
                {roleMessage && (
                  <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    {roleMessage}
                  </Typography>
                )}
              </Box>
            ) : (
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Te rugăm să te autentifici pentru a accesa toate funcționalitățile.
              </Typography>
            )}

            {user ? (
              <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
                  <strong>Nume:</strong> {user.name}
                </Typography>
                {user.email && (
                  <Typography variant="subtitle1" sx={{ mb: 0.5, color: 'text.secondary' }}>
                    <strong>Email:</strong> {user.email}
                  </Typography>
                )}
                <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                  <strong>Rol:</strong> {user.role ?? '—'}
                </Typography>
              </Paper>
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                Te rugăm să te autentifici pentru a vedea informațiile tale.
              </Typography>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
